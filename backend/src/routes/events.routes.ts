import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { asyncHandler } from "../middleware/error.js";
import { requireAuth } from "../middleware/auth.js";
import { verifyToken } from "../lib/auth.js";
import { addClient, pushToUser, isOnline } from "../lib/realtime.js";

export const eventsRouter = Router();

// ───────────────────────── SSE-поток ─────────────────────────
// GET /api/events?token=...
// EventSource не умеет слать заголовки, поэтому JWT передаётся в query.
eventsRouter.get("/", (req, res) => {
  let userId: string;
  try {
    userId = verifyToken(String(req.query.token || "")).userId;
  } catch {
    return res.status(401).end();
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders?.();
  res.write("event: ready\ndata: {}\n\n");

  const remove = addClient(userId, res);
  const ping = setInterval(() => {
    try { res.write(": ping\n\n"); } catch { /* ignore */ }
  }, 25_000);

  req.on("close", () => { clearInterval(ping); remove(); });
});

// ───────────────────────── уведомления ─────────────────────────
// GET /api/events/notifications — история + счётчик непрочитанных
eventsRouter.get(
  "/notifications",
  requireAuth,
  asyncHandler(async (req, res) => {
    const [items, unread] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: req.user!.userId },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.notification.count({ where: { userId: req.user!.userId, read: false } }),
    ]);
    res.json({ items, unread });
  })
);

// POST /api/events/notifications/read — пометить прочитанными (одно или все)
eventsRouter.post(
  "/notifications/read",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { id } = z.object({ id: z.string().optional() }).parse(req.body ?? {});
    await prisma.notification.updateMany({
      where: { userId: req.user!.userId, ...(id ? { id } : {}) },
      data: { read: true },
    });
    res.json({ ok: true });
  })
);

// ───────────────────────── звонки: сигналинг ─────────────────────────
// Все сообщения ретранслируются другой стороне через её SSE-поток.

// Реестр активных звонков (в памяти, как и остальной realtime): callId → пара
// участников. Нужен, чтобы никто не мог ретранслировать сигналы/спуфить
// «принято/сигнал» произвольному пользователю, не будучи стороной звонка.
const activeCalls = new Map<string, { a: string; b: string; at: number }>();
const CALL_TTL_MS = 60 * 60 * 1000; // час — страховка от утечки записей
function sweepCalls() {
  const now = Date.now();
  for (const [id, c] of activeCalls) if (now - c.at > CALL_TTL_MS) activeCalls.delete(id);
}
// проверяет, что отправитель и получатель — именно две стороны этого звонка;
// активность продлевает TTL, чтобы звонок длиннее часа не «умирал» на середине
function peersOk(callId: string, from: string, to: string): boolean {
  const c = activeCalls.get(callId);
  if (!c) return false;
  const ok = (c.a === from && c.b === to) || (c.a === to && c.b === from);
  if (ok) c.at = Date.now();
  return ok;
}

// POST /api/events/call/start { cookProfileId } → шлёт повару "call:incoming"
eventsRouter.post(
  "/call/start",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { cookProfileId } = z.object({ cookProfileId: z.string() }).parse(req.body);
    const cook = await prisma.cookProfile.findUnique({
      where: { id: cookProfileId },
      select: { userId: true, kitchenName: true },
    });
    if (!cook) return res.status(404).json({ error: "Повар не найден" });
    if (cook.userId === req.user!.userId) return res.status(400).json({ error: "Нельзя позвонить себе" });

    const me = await prisma.user.findUnique({ where: { id: req.user!.userId }, select: { name: true } });
    const callId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    if (!isOnline(cook.userId)) {
      return res.status(409).json({ error: "Повар сейчас не в сети", offline: true });
    }
    sweepCalls();
    activeCalls.set(callId, { a: req.user!.userId, b: cook.userId, at: Date.now() });
    pushToUser(cook.userId, "call:incoming", {
      callId,
      from: { id: req.user!.userId, name: me?.name || "Гость" },
    });
    res.json({ callId, toUserId: cook.userId, toName: cook.kitchenName });
  })
);

const peerMsg = z.object({ callId: z.string(), toUserId: z.string() });

// принять звонок → caller получает "call:accepted"
eventsRouter.post("/call/accept", requireAuth, asyncHandler(async (req, res) => {
  const { callId, toUserId } = peerMsg.parse(req.body);
  if (!peersOk(callId, req.user!.userId, toUserId)) return res.status(403).json({ error: "Нет доступа к звонку" });
  pushToUser(toUserId, "call:accepted", { callId, from: req.user!.userId });
  res.json({ ok: true });
}));

// отклонить
eventsRouter.post("/call/decline", requireAuth, asyncHandler(async (req, res) => {
  const { callId, toUserId } = peerMsg.parse(req.body);
  if (!peersOk(callId, req.user!.userId, toUserId)) return res.status(403).json({ error: "Нет доступа к звонку" });
  activeCalls.delete(callId);
  pushToUser(toUserId, "call:declined", { callId });
  res.json({ ok: true });
}));

// завершить
eventsRouter.post("/call/hangup", requireAuth, asyncHandler(async (req, res) => {
  const { callId, toUserId } = peerMsg.parse(req.body);
  if (!peersOk(callId, req.user!.userId, toUserId)) return res.status(403).json({ error: "Нет доступа к звонку" });
  activeCalls.delete(callId);
  pushToUser(toUserId, "call:hangup", { callId });
  res.json({ ok: true });
}));

// WebRTC-сигнал (offer / answer / ICE) → ретрансляция второй стороне
eventsRouter.post("/call/signal", requireAuth, asyncHandler(async (req, res) => {
  const { callId, toUserId, signal } = z
    .object({ callId: z.string(), toUserId: z.string(), signal: z.any() })
    .parse(req.body);
  if (!peersOk(callId, req.user!.userId, toUserId)) return res.status(403).json({ error: "Нет доступа к звонку" });
  pushToUser(toUserId, "call:signal", { callId, from: req.user!.userId, signal });
  res.json({ ok: true });
}));

export default eventsRouter;
