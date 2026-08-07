import type { Request, Response, NextFunction } from "express";
import { prisma } from "../prisma.js";

/**
 * Доступ к панели основателя. Ставится ПОСЛЕ requireAuth.
 *
 * Двойная защита + «невидимость»:
 *  - гость / обычный пользователь / повар  → 404 (эндпоинт как будто не существует,
 *    ровно как и сама страница /founder — никто не должен знать о её наличии);
 *  - основатель без активной 2FA-сессии     → 403 { need2fa: true } (просим код).
 *
 * Один точечный запрос (только нужные поля) — без лишней нагрузки на каждый вызов.
 */
export async function requireFounder(req: Request, res: Response, next: NextFunction) {
  const userId = req.user?.userId;
  if (!userId) return res.status(404).json({ error: "Not found" });

  const u = await prisma.user.findUnique({
    where: { id: userId },
    select: { isFounder: true, founderSessionUntil: true },
  });

  // не основатель → притворяемся, что ресурса нет
  if (!u || !u.isFounder) return res.status(404).json({ error: "Not found" });

  // основатель, но 2FA-сессия истекла/не открыта
  if (!u.founderSessionUntil || new Date(u.founderSessionUntil) < new Date()) {
    return res.status(403).json({ error: "Требуется подтверждение по коду", need2fa: true });
  }

  next();
}
