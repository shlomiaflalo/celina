import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { asyncHandler } from "../middleware/error.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { verifyToken } from "../lib/auth.js";
import { serializeCook, arrayToCsv } from "../lib/serialize.js";

export const cooksRouter = Router();

// GET /api/cooks — лента: список поваров (с фильтрами)
cooksRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const { city, cuisine, q, onlineOnly } = req.query as Record<string, string>;
    const cooks = await prisma.cookProfile.findMany({
      where: {
        // в ленте показываем только проверенных поваров (после верификации документов)
        user: { isVerified: true },
        // и только кухни с хотя бы одним блюдом с фото — карточка никогда не пустая
        dishes: { some: { isAvailable: true, photoUrl: { not: null } } },
        ...(city ? { city: { contains: city } } : {}),
        ...(cuisine ? { cuisine: { contains: cuisine } } : {}),
        ...(onlineOnly === "true" ? { isOnline: true } : {}),
        ...(q ? { kitchenName: { contains: q } } : {}),
      },
      include: {
        dishes: { where: { isAvailable: true }, take: 4 },
        user: { select: { name: true, city: true, isVerified: true, lat: true, lng: true } },
      },
      orderBy: [{ isOnline: "desc" }, { rating: "desc" }],
    });
    res.json({ cooks: cooks.map(serializeCook) });
  })
);

// GET /api/cooks/:id — профиль повара + полное меню
cooksRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    // скрытые блюда (isAvailable:false) видит только сам повар (страница «Меню»);
    // публике — только доступные (раньше скрытые «протекали» в публичный профиль)
    let requesterId: string | null = null;
    const header = req.headers.authorization;
    if (header?.startsWith("Bearer ")) {
      try { requesterId = verifyToken(header.slice(7)).userId; } catch { /* гость */ }
    }
    const cook = await prisma.cookProfile.findUnique({
      where: { id: req.params.id },
      include: {
        dishes: { orderBy: { createdAt: "desc" } },
        user: { select: { name: true, city: true, isVerified: true, lat: true, lng: true } },
        reviews: {
          orderBy: { createdAt: "desc" },
          take: 10,
          include: { buyer: { select: { name: true } } },
        },
      },
    });
    if (!cook) return res.status(404).json({ error: "Повар не найден" });
    const isOwner = requesterId != null && requesterId === cook.userId;
    if (!isOwner) cook.dishes = cook.dishes.filter((d) => d.isAvailable);
    res.json({ cook: serializeCook(cook) });
  })
);

const updateSchema = z.object({
  kitchenName: z.string().min(1).optional(),
  bio: z.string().optional(),
  avatarUrl: z.string().optional(),
  coverUrl: z.string().optional(),
  cuisine: z.array(z.string()).optional(),
  deliveryEnabled: z.boolean().optional(),
  pickupEnabled: z.boolean().optional(),
  deliveryFee: z.number().min(0).optional(),
  minOrder: z.number().min(0).optional(),
  city: z.string().optional(),
  dineInEnabled: z.boolean().optional(),
  dineInPrice: z.number().positive().optional(),
  dineInSeats: z.number().int().positive().optional(),
  dineInDesc: z.string().optional(),
});

// PUT /api/cooks/me — редактирование профиля повара
cooksRouter.put(
  "/me",
  requireAuth,
  requireRole("COOK"),
  asyncHandler(async (req, res) => {
    const data = updateSchema.parse(req.body);
    const { cuisine, ...rest } = data;
    const cook = await prisma.cookProfile.update({
      where: { userId: req.user!.userId },
      data: { ...rest, ...(cuisine ? { cuisine: arrayToCsv(cuisine) } : {}) },
    });
    res.json({ cook: serializeCook(cook) });
  })
);

// PATCH /api/cooks/me/status — online / offline
cooksRouter.patch(
  "/me/status",
  requireAuth,
  requireRole("COOK"),
  asyncHandler(async (req, res) => {
    const { isOnline } = z.object({ isOnline: z.boolean() }).parse(req.body);
    // выйти «онлайн» (стать видимым и принимать заказы) можно только после верификации
    if (isOnline) {
      const me = await prisma.user.findUnique({ where: { id: req.user!.userId }, select: { isVerified: true } });
      if (!me?.isVerified) return res.status(403).json({ error: "Сначала пройдите верификацию" });
    }
    const cook = await prisma.cookProfile.update({
      where: { userId: req.user!.userId },
      data: { isOnline },
    });
    res.json({ cook: serializeCook(cook) });
  })
);

// DELETE /api/cooks/me — повар удаляет свою кухню (профиль + блюда каскадом)
cooksRouter.delete(
  "/me",
  requireAuth,
  requireRole("COOK"),
  asyncHandler(async (req, res) => {
    const profile = await prisma.cookProfile.findUnique({ where: { userId: req.user!.userId } });
    if (!profile) return res.status(404).json({ error: "Профиль повара не найден" });
    // защищаем историю заказов: нельзя удалить кухню, по которой уже были заказы
    const orders = await prisma.order.count({ where: { cookProfileId: profile.id } });
    if (orders > 0) return res.status(400).json({ error: "Нельзя удалить кухню, по которой уже есть заказы" });
    await prisma.review.deleteMany({ where: { cookProfileId: profile.id } });
    await prisma.cookProfile.delete({ where: { id: profile.id } }); // блюда удалятся каскадом
    res.json({ ok: true });
  })
);

export default cooksRouter;
