import { Router } from "express";
import { notify } from "../lib/notify.js";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { asyncHandler } from "../middleware/error.js";
import { requireAuth, requireVerified, isSessionActive } from "../middleware/auth.js";
import { rateLimit } from "../middleware/rateLimit.js";
import { verifyToken } from "../lib/auth.js";

export const gatheringsRouter = Router();

// мягкая авторизация: если есть валидный токен — вернём userId, иначе null
async function optionalUserId(req: { headers: Record<string, unknown>; query: Record<string, unknown> }): Promise<string | null> {
  const h = String(req.headers["authorization"] || "");
  const token = h.startsWith("Bearer ") ? h.slice(7) : String(req.query.token || "");
  if (!token) return null;
  try {
    const payload = verifyToken(token);
    // Голая проверка подписи игнорировала отзыв сессий: после «выйти везде»
    // или смены пароля старый токен продолжал открывать адреса и списки
    // гостей. Сверяем сессию с базой, как это делает requireAuth.
    if (!(await isSessionActive(payload))) return null;
    return payload.userId;
  } catch {
    return null;
  }
}

/** Сводка по местам + статус. Точный адрес — только хосту и подтверждённым гостям. */
function serializeGathering(g: any, viewerId: string | null) {
  const going = (g.rsvps ?? []).filter((r: any) => r.status === "GOING");
  const seatsTaken = going.reduce((s: number, r: any) => s + r.guests, 0);
  const seatsLeft = Math.max(0, g.maxSeats - seatsTaken);
  const isHost = viewerId === g.hostId;
  const myRsvp = viewerId ? going.find((r: any) => r.userId === viewerId) : null;
  const canSeeAddress = isHost || !!myRsvp;
  const past = new Date(g.startsAt).getTime() < Date.now();
  const status = g.status === "CANCELLED" ? "CANCELLED" : past ? "PAST" : seatsLeft <= 0 ? "FULL" : "OPEN";
  return {
    id: g.id,
    title: g.title,
    description: g.description,
    coverUrl: g.coverUrl,
    city: g.city,
    address: canSeeAddress ? g.address : null,
    // Адрес прятали, а координаты отдавали всем — по ним дом хоста находится
    // за один клик на карте. Точные — только хосту и записавшимся; остальным
    // огрублённые до ~1 км (город/район на карте виден, подъезд — нет).
    lat: canSeeAddress ? g.lat : g.lat == null ? null : Math.round(g.lat * 100) / 100,
    lng: canSeeAddress ? g.lng : g.lng == null ? null : Math.round(g.lng * 100) / 100,
    startsAt: g.startsAt,
    maxSeats: g.maxSeats,
    pricePerGuest: g.pricePerGuest,
    status,
    seatsTaken,
    seatsLeft,
    isHost,
    myGuests: myRsvp?.guests ?? 0,
    host: g.host ? { id: g.host.id, name: g.host.name } : undefined,
    // Полные имена всех гостей отдавались анонимам: список «кто придёт домой
    // к человеку в такой-то день» — не публичные данные. Гостям и хосту —
    // имена, случайному посетителю — только числа мест.
    attendees: viewerId
      ? going.map((r: any) => ({ name: r.user?.name ?? "", guests: r.guests }))
      : [],
    createdAt: g.createdAt,
  };
}

const withRelations = {
  host: { select: { id: true, name: true } },
  rsvps: { include: { user: { select: { id: true, name: true } } } },
};

// GET /api/gatherings — список (фильтры: город, только предстоящие)
gatheringsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const { city, upcoming } = req.query as Record<string, string>;
    const viewerId = await optionalUserId(req as any);
    const gatherings = await prisma.gathering.findMany({
      where: {
        status: { not: "CANCELLED" },
        ...(city ? { city: { contains: city } } : {}),
        ...(upcoming === "true" ? { startsAt: { gte: new Date() } } : {}),
      },
      include: withRelations,
      orderBy: { startsAt: "asc" },
      take: 100,
    });
    res.json({ gatherings: gatherings.map((g) => serializeGathering(g, viewerId)) });
  })
);

// GET /api/gatherings/:id — детали застолья
gatheringsRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const viewerId = await optionalUserId(req as any);
    const g = await prisma.gathering.findUnique({ where: { id: req.params.id }, include: withRelations });
    if (!g) return res.status(404).json({ error: "Застолье не найдено" });
    res.json({ gathering: serializeGathering(g, viewerId) });
  })
);

const createSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().max(2000).optional(),
  coverUrl: z.string().min(1, "Добавьте фото места или хозяина"), // фото обязательно

  city: z.string().max(80).optional(),
  address: z.string().max(300).optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  startsAt: z.string().datetime(),
  maxSeats: z.number().int().min(2).max(50).default(6),
  pricePerGuest: z.number().min(0).max(100000).default(0),
});

// POST /api/gatherings — создать застолье (нужен вход)
gatheringsRouter.post(
  "/",
  requireAuth,
  requireVerified,
  rateLimit({ windowMs: 10 * 60_000, max: 10 }),
  asyncHandler(async (req, res) => {
    const data = createSchema.parse(req.body);
    if (new Date(data.startsAt).getTime() < Date.now()) {
      return res.status(400).json({ error: "Дата застолья должна быть в будущем" });
    }
    const g = await prisma.gathering.create({
      data: { ...data, startsAt: new Date(data.startsAt), hostId: req.user!.userId },
      include: withRelations,
    });
    res.status(201).json({ gathering: serializeGathering(g, req.user!.userId) });
  })
);

const rsvpSchema = z.object({ guests: z.number().int().min(1).max(10).default(1) });

// POST /api/gatherings/:id/rsvp — присоединиться (с числом гостей)
gatheringsRouter.post(
  "/:id/rsvp",
  requireAuth,
  requireVerified,
  asyncHandler(async (req, res) => {
    const { guests } = rsvpSchema.parse(req.body);
    const g = await prisma.gathering.findUnique({ where: { id: req.params.id }, include: { rsvps: true } });
    if (!g) return res.status(404).json({ error: "Застолье не найдено" });
    if (g.status === "CANCELLED") return res.status(400).json({ error: "Застолье отменено" });
    if (new Date(g.startsAt).getTime() < Date.now()) return res.status(400).json({ error: "Застолье уже прошло" });
    if (g.hostId === req.user!.userId) return res.status(400).json({ error: "Вы организатор этого застолья" });

    const mine = g.rsvps.find((r) => r.status === "GOING" && r.userId === req.user!.userId);
    // проверка мест и запись — в ОДНОЙ транзакции со свежим чтением внутри,
    // иначе два одновременных RSVP читают один снимок и вдвоём перебронируют стол
    try {
      await prisma.$transaction(async (tx) => {
        const fresh = await tx.gatheringRsvp.findMany({
          where: { gatheringId: g.id, status: "GOING", userId: { not: req.user!.userId } },
        });
        const takenByOthers = fresh.reduce((s, r) => s + r.guests, 0);
        if (takenByOthers + guests > g.maxSeats) throw new Error("NO_SEATS");
        await tx.gatheringRsvp.upsert({
          where: { gatheringId_userId: { gatheringId: g.id, userId: req.user!.userId } },
          create: { gatheringId: g.id, userId: req.user!.userId, guests, status: "GOING" },
          update: { guests, status: "GOING" },
        });
      });
    } catch (e) {
      if (e instanceof Error && e.message === "NO_SEATS") {
        return res.status(409).json({ error: "Недостаточно свободных мест" });
      }
      throw e;
    }
    const full = await prisma.gathering.findUnique({ where: { id: g.id }, include: withRelations });
    res.json({ gathering: serializeGathering(full, req.user!.userId), updated: !!mine });
  })
);

// DELETE /api/gatherings/:id/rsvp — отменить участие
gatheringsRouter.delete(
  "/:id/rsvp",
  requireAuth,
  asyncHandler(async (req, res) => {
    await prisma.gatheringRsvp.updateMany({
      where: { gatheringId: req.params.id, userId: req.user!.userId },
      data: { status: "CANCELLED" },
    });
    const full = await prisma.gathering.findUnique({ where: { id: req.params.id }, include: withRelations });
    if (!full) return res.status(404).json({ error: "Застолье не найдено" });
    res.json({ gathering: serializeGathering(full, req.user!.userId) });
  })
);

// DELETE /api/gatherings/:id — организатор отменяет застолье
gatheringsRouter.delete(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const g = await prisma.gathering.findUnique({ where: { id: req.params.id } });
    if (!g) return res.status(404).json({ error: "Застолье не найдено" });
    if (g.hostId !== req.user!.userId) return res.status(403).json({ error: "Только организатор может отменить" });
    await prisma.gathering.update({ where: { id: g.id }, data: { status: "CANCELLED" } });
    // Гости узнавали об отмене, только открыв страницу: у сервиса есть
    // и уведомления, и SSE — просто их здесь не звали. Теперь зовём.
    const going = await prisma.gatheringRsvp.findMany({
      where: { gatheringId: req.params.id, status: "GOING" },
      select: { userId: true },
    });
    await Promise.all(
      going.map((r) =>
        notify(r.userId, { type: "gathering_cancelled", title: g.title, body: "Застолье отменено организатором" }).catch(() => {})
      )
    );
    res.json({ ok: true });
  })
);
