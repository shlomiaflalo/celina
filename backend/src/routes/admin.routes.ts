import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { asyncHandler } from "../middleware/error.js";
import { requireAuth } from "../middleware/auth.js";
import { requireFounder } from "../middleware/founder.js";
import { pingIndexNow } from "../lib/indexnow.js";

export const adminRouter = Router();

// Весь роутер — только для основателя с активной 2FA-сессией.
// requireFounder: не основатель → 404 (скрываем сам факт существования),
// основатель без кода → 403 { need2fa:true }.
adminRouter.use(requireAuth, requireFounder);

// GET /api/admin/verifications — заявки на проверку (статус PENDING)
adminRouter.get(
  "/verifications",
  asyncHandler(async (_req, res) => {
    const pending = await prisma.user.findMany({
      where: { verificationStatus: "PENDING" },
      select: {
        id: true, name: true, phone: true, city: true, role: true,
        verificationVideoUrl: true, verificationDocUrl: true, createdAt: true,
        cookProfile: { select: { kitchenName: true, kitchenPhotos: true, hygieneAccepted: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ pending });
  })
);

// POST /api/admin/verifications/:id — одобрить / отклонить
adminRouter.post(
  "/verifications/:id",
  asyncHandler(async (req, res) => {
    const { decision } = z.object({ decision: z.enum(["approve", "decline"]) }).parse(req.body);
    const target = await prisma.user.findUnique({ where: { id: req.params.id }, select: { id: true } });
    if (!target) return res.status(404).json({ error: "Пользователь не найден" });

    const approved = decision === "approve";
    await prisma.user.update({
      where: { id: target.id },
      data: approved
        ? { verificationStatus: "VERIFIED", isVerified: true, verifiedAt: new Date() }
        : { verificationStatus: "REJECTED", isVerified: false },
    });
    // одобренный повар → его публичная страница /cooks/:id стала индексируемой:
    // сразу пингуем IndexNow (Яндекс), чтобы попасть в выдачу максимально быстро
    if (approved) {
      const cp = await prisma.cookProfile.findUnique({ where: { userId: target.id }, select: { id: true } });
      if (cp) pingIndexNow([`/cooks/${cp.id}`]).catch(() => {});
    }
    res.json({ ok: true, status: approved ? "VERIFIED" : "REJECTED" });
  })
);

// GET /api/admin/waitlist — карта спроса: где ждут Селину (для набора поваров)
adminRouter.get(
  "/waitlist",
  asyncHandler(async (_req, res) => {
    const rows = await prisma.waitlist.groupBy({
      by: ["city", "role"],
      _count: { _all: true },
    });
    // сворачиваем в { city, eaters, cooks, total } и сортируем по спросу
    const byCity = new Map<string, { city: string; eaters: number; cooks: number; total: number }>();
    for (const r of rows) {
      const e = byCity.get(r.city) ?? { city: r.city, eaters: 0, cooks: 0, total: 0 };
      if (r.role === "COOK") e.cooks += r._count._all; else e.eaters += r._count._all;
      e.total += r._count._all;
      byCity.set(r.city, e);
    }
    const cities = [...byCity.values()].sort((a, b) => b.total - a.total);
    const total = cities.reduce((s, c) => s + c.total, 0);
    const recent = await prisma.waitlist.findMany({
      orderBy: { createdAt: "desc" }, take: 50,
      select: { city: true, district: true, contact: true, role: true, createdAt: true },
    });
    res.json({ total, cities, recent });
  })
);

export default adminRouter;
