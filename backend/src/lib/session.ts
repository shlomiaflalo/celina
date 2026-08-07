import type { Request } from "express";
import { prisma } from "../prisma.js";

/**
 * Управление сессиями (устройствами). Одна строка Session = одно устройство,
 * на котором выполнен вход. Позволяет:
 *  1) ограничить число одновременных устройств (как Netflix/WhatsApp);
 *  2) выйти удалённо с конкретного или всех устройств (JWT stateless — сам по
 *     себе не отзывается, поэтому requireAuth сверяет sid токена с сессией).
 */

// Разумный лимит одновременных устройств (телефон, планшет, ноутбук, работа, …).
export const MAX_DEVICES = 5;

// JWT живёт 30 дней с момента ВЫДАЧИ (lib/auth.ts) → сессия старше 30 дней
// физически мертва (токен просрочен). Не показываем её и не считаем в лимите,
// иначе «призраки» навсегда занимали бы слоты устройств.
const TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;
function aliveWhere(userId: string) {
  return { userId, revokedAt: null, createdAt: { gt: new Date(Date.now() - TOKEN_TTL_MS) } };
}

/** Активные (не отозванные, с ещё живым токеном) сессии пользователя. */
export function activeSessions(userId: string) {
  return prisma.session.findMany({
    where: aliveWhere(userId),
    orderBy: { lastSeenAt: "desc" },
  });
}

export function countActiveSessions(userId: string) {
  return prisma.session.count({ where: aliveWhere(userId) });
}

/** IP клиента за nginx. Берём ПОСЛЕДНИЙ элемент X-Forwarded-For: nginx дописывает
 *  реальный IP в конец, а первый элемент может подделать сам клиент (спуфинг
 *  «своего» местоположения в списке устройств). */
export function clientIp(req: Request): string {
  const parts = (req.headers["x-forwarded-for"] as string | undefined)
    ?.split(",").map((s) => s.trim()).filter(Boolean);
  const xf = parts && parts.length ? parts[parts.length - 1] : "";
  return xf || req.ip || req.socket.remoteAddress || "";
}

/** Человекочитаемое имя устройства из User-Agent: «Chrome · Windows». */
export function deviceLabel(ua?: string | null): string {
  if (!ua) return "Неизвестное устройство";
  const browser =
    /Edg\//.test(ua) ? "Edge"
    : /OPR\/|Opera/.test(ua) ? "Opera"
    : /YaBrowser/.test(ua) ? "Яндекс.Браузер"
    : /Chrome\//.test(ua) && !/Chromium/.test(ua) ? "Chrome"
    : /CriOS/.test(ua) ? "Chrome"
    : /Firefox\//.test(ua) || /FxiOS/.test(ua) ? "Firefox"
    : /Safari\//.test(ua) ? "Safari"
    : "Браузер";
  const os =
    /iPhone/.test(ua) ? "iPhone"
    : /iPad/.test(ua) ? "iPad"
    : /Android/.test(ua) ? "Android"
    : /Windows/.test(ua) ? "Windows"
    : /Mac OS X|Macintosh/.test(ua) ? "Mac"
    : /Linux/.test(ua) ? "Linux"
    : "";
  return os ? `${browser} · ${os}` : browser;
}

/** Приблизительная геолокация по IP (best-effort, короткий таймаут, не блокирует вход). */
async function geoFromIp(ip: string): Promise<string | null> {
  if (!ip || ip === "::1" || ip === "127.0.0.1" || ip.startsWith("192.168.") || ip.startsWith("10.")) return null;
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 3000);
    const r = await fetch(`http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,city,country`, { signal: ctrl.signal });
    clearTimeout(timer);
    if (!r.ok) return null;
    const d = (await r.json()) as { status?: string; city?: string; country?: string };
    if (d.status !== "success") return null;
    return [d.city, d.country].filter(Boolean).join(", ") || null;
  } catch {
    return null;
  }
}

/**
 * Создаёт сессию для нового входа и возвращает её id (кладётся в JWT как sid).
 * Геолокацию подтягиваем в фоне — чтобы не задерживать выдачу токена.
 */
export async function createSession(userId: string, req: Request): Promise<string> {
  const ua = (req.headers["user-agent"] as string | undefined) ?? null;
  const ip = clientIp(req);
  const session = await prisma.session.create({
    data: { userId, userAgent: ua, ip: ip || null, device: deviceLabel(ua) },
    select: { id: true },
  });
  // фоновая геолокация (не await): обновит location, когда/если ответит
  geoFromIp(ip).then((loc) => {
    if (loc) prisma.session.update({ where: { id: session.id }, data: { location: loc } }).catch(() => {});
  }).catch(() => {});
  return session.id;
}

// Отметка «последней активности» — не чаще раза в 5 минут на сессию,
// чтобы не писать в БД на каждый запрос.
const lastTouch = new Map<string, number>();
export function touchSession(sid: string): void {
  const now = Date.now();
  const prev = lastTouch.get(sid) ?? 0;
  if (now - prev < 5 * 60_000) return;
  // страховка от бесконечного роста за жизнь процесса (записи никогда не удаляются)
  if (lastTouch.size > 5000) lastTouch.clear();
  lastTouch.set(sid, now);
  prisma.session.updateMany({ where: { id: sid, revokedAt: null }, data: { lastSeenAt: new Date() } }).catch(() => {});
}
