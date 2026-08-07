import { Router } from "express";
import { prisma } from "../prisma.js";
import { asyncHandler } from "../middleware/error.js";
import { requireAuth } from "../middleware/auth.js";
import { ensureReferralCode } from "../lib/referral.js";

export const referralsRouter = Router();

/** Мои данные по рефералам: код и сколько людей пришло по нему. */
referralsRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const code = await ensureReferralCode(req.user!.userId);
    const count = await prisma.user.count({ where: { referredById: req.user!.userId } });
    res.json({ code, count });
  })
);

/** Лидерборд: топ пригласивших (имя + количество). Публичный, без чувствительных данных. */
referralsRouter.get(
  "/leaderboard",
  asyncHandler(async (_req, res) => {
    const top = await prisma.user.findMany({
      where: { referrals: { some: {} } },
      select: { id: true, name: true, _count: { select: { referrals: true } } },
      orderBy: { referrals: { _count: "desc" } },
      take: 10,
    });
    res.json({
      leaders: top.map((u) => ({ name: u.name.split(" ")[0], count: u._count.referrals })),
    });
  })
);
