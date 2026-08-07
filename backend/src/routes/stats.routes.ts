import { Router } from "express";
import { prisma } from "../prisma.js";
import { asyncHandler } from "../middleware/error.js";
import { requireAuth } from "../middleware/auth.js";
import { requireFounder } from "../middleware/founder.js";

export const statsRouter = Router();

// «Сегодня» и «неделя» считаем по МОСКОВСКОМУ времени (UTC+3): сервер в контейнере
// работает в UTC, иначе граница суток съезжала бы на 3 часа и «заказы за сегодня»
// были бы неверны для российской аудитории.
const MSK_OFFSET_MS = 3 * 60 * 60 * 1000;
function mskMidnightUtc(): Date {
  const nowMsk = new Date(Date.now() + MSK_OFFSET_MS);
  const y = nowMsk.getUTCFullYear(), mo = nowMsk.getUTCMonth(), d = nowMsk.getUTCDate();
  return new Date(Date.UTC(y, mo, d) - MSK_OFFSET_MS); // полночь МСК в UTC
}

// GET /api/stats/founder — приборная панель пилота (заказы / удержание / GMV / рост).
// Доступ: только основатель с активной 2FA-сессией (requireFounder).
statsRouter.get(
  "/founder",
  requireAuth,
  requireFounder,
  asyncHandler(async (_req, res) => {
    const [orders, cookProfiles, buyerRows, pendingVerifications, verifiedUsers, reviewAgg, dishes,
           gatherings, rsvpGoing, usersTodayCnt, users7dCnt, cooks7dCnt] = await Promise.all([
      prisma.order.findMany({
        select: { total: true, status: true, fulfillment: true, paymentStatus: true, paymentMethod: true, buyerId: true, cookProfileId: true, createdAt: true, cookProfile: { select: { kitchenName: true } } },
      }),
      prisma.cookProfile.findMany({ select: { city: true } }),
      prisma.user.findMany({ where: { role: "BUYER", isFounder: false }, select: { id: true } }),
      prisma.user.count({ where: { verificationStatus: "PENDING" } }),
      prisma.user.count({ where: { isVerified: true } }),
      prisma.review.aggregate({ _count: true, _avg: { rating: true } }),
      prisma.dish.count(),
      prisma.gathering.findMany({ select: { status: true } }),
      prisma.gatheringRsvp.aggregate({ _sum: { guests: true }, where: { status: "GOING" } }),
      prisma.user.count({ where: { createdAt: { gte: mskMidnightUtc() } } }),
      prisma.user.count({ where: { createdAt: { gte: new Date(Date.now() - 7 * 864e5) } } }),
      prisma.cookProfile.count({ where: { createdAt: { gte: new Date(Date.now() - 7 * 864e5) } } }),
    ]);

    const cooks = cookProfiles.length;
    const cities = new Set(cookProfiles.map((c) => c.city).filter(Boolean)).size;
    const buyerIds = new Set(buyerRows.map((b) => b.id)); // только настоящие покупатели
    const buyers = buyerIds.size;

    // ── воронка по статусам заказа ──
    const byStatus = (s: string) => orders.filter((o) => o.status === s).length;
    const funnel = {
      pending: byStatus("PENDING"), accepted: byStatus("ACCEPTED"), cooking: byStatus("COOKING"),
      ready: byStatus("READY"), delivered: byStatus("DELIVERED"), cancelled: byStatus("CANCELLED"),
    };

    const live = orders.filter((o) => o.status !== "CANCELLED");
    const gmv = Math.round(live.reduce((s, o) => s + o.total, 0));
    // оплаченный оборот — без отменённых (отмена не сбрасывает paymentStatus)
    const paidGmv = Math.round(orders.filter((o) => o.paymentStatus === "PAID" && o.status !== "CANCELLED").reduce((s, o) => s + o.total, 0));
    const aov = live.length ? Math.round(gmv / live.length) : 0;

    const startToday = mskMidnightUtc();
    // «сегодня» считаем по «живым» заказам — как и orders7d/liveOrders (без отменённых)
    const todaysLive = live.filter((o) => new Date(o.createdAt) >= startToday);
    const ordersToday = todaysLive.length;
    const gmvToday = Math.round(todaysLive.reduce((s, o) => s + o.total, 0));

    const weekAgo = new Date(Date.now() - 7 * 864e5);
    const live7d = live.filter((o) => new Date(o.createdAt) >= weekAgo);
    const orders7d = live7d.length;
    const gmv7d = Math.round(live7d.reduce((s, o) => s + o.total, 0));

    // удержание: доля НАСТОЯЩИХ покупателей (role BUYER, не основатель/повар)
    // с 2+ УСПЕШНЫМИ (не отменёнными) заказами. Отменённые и чужие роли не считаем,
    // иначе метрики раздувались и конверсия могла превысить 100%.
    const perBuyer = new Map<string, number>();
    live.forEach((o) => { if (buyerIds.has(o.buyerId)) perBuyer.set(o.buyerId, (perBuyer.get(o.buyerId) ?? 0) + 1); });
    const activeBuyers = perBuyer.size;
    const repeatBuyers = [...perBuyer.values()].filter((n) => n >= 2).length;
    const retentionRate = activeBuyers ? Math.round((repeatBuyers / activeBuyers) * 100) : 0;
    const conversionRate = buyers ? Math.round((activeBuyers / buyers) * 100) : 0;

    const delivered = funnel.delivered;
    const cancelRate = orders.length ? Math.round((funnel.cancelled / orders.length) * 100) : 0;
    // доля успешно доставленных среди «живых» (не отменённых)
    const fulfilRate = live.length ? Math.round((delivered / live.length) * 100) : 0;
    const cashOrders = orders.filter((o) => o.paymentMethod === "cash").length;
    const cardOrders = orders.filter((o) => o.paymentMethod === "card").length;
    const dineInBookings = orders.filter((o) => o.fulfillment === "DINE_IN").length;

    // ── топ-повара по обороту (не считая отменённых) ──
    const cookAgg = new Map<string, { name: string; gmv: number; orders: number }>();
    for (const o of live) {
      const key = o.cookProfileId;
      const cur = cookAgg.get(key) ?? { name: o.cookProfile?.kitchenName ?? "—", gmv: 0, orders: 0 };
      cur.gmv += o.total; cur.orders += 1;
      cookAgg.set(key, cur);
    }
    const topCooks = [...cookAgg.values()]
      .sort((a, b) => b.gmv - a.gmv)
      .slice(0, 5)
      .map((c) => ({ name: c.name, gmv: Math.round(c.gmv), orders: c.orders }));

    res.json({
      // деньги
      gmv, paidGmv, aov, gmv7d, gmvToday,
      // заказы
      totalOrders: orders.length, liveOrders: live.length, ordersToday, orders7d, delivered,
      funnel, cancelRate, fulfilRate, dineInBookings,
      // пользователи и рост
      cooks, cooks7d: cooks7dCnt, buyers, activeBuyers, repeatBuyers, retentionRate, conversionRate,
      usersToday: usersTodayCnt, users7d: users7dCnt,
      pendingVerifications, verifiedUsers,
      // каталог и соцслой
      dishes, cities,
      reviews: reviewAgg._count, avgRating: reviewAgg._avg.rating ? Number(reviewAgg._avg.rating.toFixed(2)) : 0,
      gatherings: gatherings.length, gatheringsOpen: gatherings.filter((g) => g.status === "OPEN").length,
      rsvpGoing: rsvpGoing._sum.guests ?? 0,
      // оплата
      cashOrders, cardOrders,
      topCooks,
      updatedAt: new Date().toISOString(),
    });
  })
);

// GET /api/stats — публичная статистика для лендинга
statsRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const [cooks, buyers, dishes, orders, cityRows] = await Promise.all([
      prisma.cookProfile.count(),
      prisma.user.count({ where: { role: "BUYER", isFounder: false } }),
      prisma.dish.count(),
      prisma.order.count(),
      prisma.cookProfile.findMany({ select: { city: true }, distinct: ["city"] }),
    ]);
    const cities = cityRows.map((c) => c.city).filter(Boolean);
    res.json({ cooks, buyers, dishes, orders, cities });
  })
);

export default statsRouter;
