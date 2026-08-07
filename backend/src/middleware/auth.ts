import type { Request, Response, NextFunction } from "express";
import { verifyToken, type TokenPayload } from "../lib/auth.js";
import { prisma } from "../prisma.js";
import { touchSession } from "../lib/session.js";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

/** Требует валидный JWT + активную сессию (если токен несёт sid). */
/**
 * Активна ли сессия токена: не отозвана ли она и не выпущен ли токен раньше
 * «выйти на всех устройствах» / смены пароля.
 * Вынесено отдельно, потому что маршрут выдачи KYC-документов проверяет токен
 * САМ (принимает его из query — <img>/<video> не умеют слать заголовки) и
 * иначе прошёл бы мимо отзыва сессий: украденная ссылка продолжала бы отдавать
 * паспорт даже после выхода со всех устройств.
 */
export async function isSessionActive(payload: TokenPayload): Promise<boolean> {
  if (payload.sid) {
    const s = await prisma.session.findUnique({
      where: { id: payload.sid },
      select: { revokedAt: true, userId: true },
    });
    return !!s && !s.revokedAt && s.userId === payload.userId;
  }
  if (payload.iat) {
    const u = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { sessionsRevokedAt: true },
    });
    if (u?.sessionsRevokedAt && payload.iat * 1000 < u.sessionsRevokedAt.getTime()) return false;
  }
  return true;
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Не авторизован" });
  }
  let payload: TokenPayload;
  try {
    payload = verifyToken(header.slice(7));
  } catch {
    return res.status(401).json({ error: "Неверный токен" });
  }
  req.user = payload;
  // Управление устройствами: если токен привязан к сессии — проверяем, что она
  // не отозвана (выход с другого устройства). Токены без sid (старые) проходят,
  // НО «выйти везде»/сброс пароля отзывает и их — через sessionsRevokedAt:
  // токен, выданный до этой отметки, считается отозванным.
  if (payload.sid) {
    const s = await prisma.session.findUnique({
      where: { id: payload.sid },
      select: { revokedAt: true, userId: true },
    });
    if (!s || s.revokedAt || s.userId !== payload.userId) {
      return res.status(401).json({ error: "Сессия завершена — войдите снова", sessionRevoked: true });
    }
    touchSession(payload.sid);
  } else if (payload.iat) {
    const u = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { sessionsRevokedAt: true },
    });
    if (u?.sessionsRevokedAt && payload.iat * 1000 < u.sessionsRevokedAt.getTime()) {
      return res.status(401).json({ error: "Сессия завершена — войдите снова", sessionRevoked: true });
    }
  }
  next();
}

/**
 * Требует подтверждённую личность (после requireAuth). Ставится на действия,
 * которые Политика конфиденциальности обещает открывать только верифицированным:
 * заказы, участие/создание застолий. Раньше проверка была только в UI —
 * значит, обходилась прямым запросом к API (несоответствие политике = риск).
 */
export async function requireVerified(req: Request, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).json({ error: "Не авторизован" });
  const u = await prisma.user.findUnique({ where: { id: req.user.userId }, select: { isVerified: true } });
  if (!u?.isVerified) {
    return res.status(403).json({ error: "Сначала пройдите верификацию", needVerify: true });
  }
  next();
}

/** Требует определённую роль (после requireAuth). */
export function requireRole(role: "BUYER" | "COOK") {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.user?.role !== role) {
      return res.status(403).json({ error: "Нет доступа" });
    }
    next();
  };
}
