import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { asyncHandler } from "../middleware/error.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { serializeDish, arrayToCsv, csvToArray } from "../lib/serialize.js";

export const dishesRouter = Router();

// GET /api/dishes — поиск блюд (для ленты покупателя)
dishesRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const { category, q } = req.query as Record<string, string>;
    const dishes = await prisma.dish.findMany({
      where: {
        isAvailable: true,
        // только блюда проверенных поваров
        cookProfile: { user: { isVerified: true } },
        ...(category ? { category } : {}),
        ...(q ? { title: { contains: q } } : {}),
      },
      include: { cookProfile: { select: { id: true, kitchenName: true, rating: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json({ dishes: dishes.map(serializeDish) });
  })
);

// Разумные пределы: без них повар мог сохранить название в 200 символов или
// цену 999999999 — карточка блюда в ленте разъезжается и вытесняет кнопку
// «В корзину» за край. Значения совпадают с maxLength/max в форме меню.
/** Допустимая ссылка на медиа: наша загрузка или обычный http(s)-адрес. */
const mediaUrl = (v: string) => v === "" || v.startsWith("/uploads/") || /^https?:\/\//.test(v);

const dishSchema = z.object({
  title: z.string().min(1).max(80),
  description: z.string().max(500).optional(),
  price: z.number().positive().max(100000),
  // Медиа — только ссылки (свои загрузки /uploads/... или http(s)), с лимитом
  // длины: без него в публичную ленту улетал двухмегабайтный data:-URI.
  photoUrl: z.string().max(300).refine(mediaUrl, "Некорректная ссылка").optional(),
  photos: z.array(z.string().max(300).refine(mediaUrl, "Некорректная ссылка")).max(4).optional(),
  videoUrl: z.string().max(300).refine(mediaUrl, "Некорректная ссылка").nullable().optional(),
  category: z.string().default("горячее"),
  portions: z.number().int().min(0).max(500).default(0),
  prepTimeMin: z.number().int().min(0).max(1440).default(30),
  tags: z.array(z.string()).optional(),
  ingredients: z.string().max(500).nullable().optional(),
  allergens: z.array(z.string()).optional(),
  isAvailable: z.boolean().default(true),
  // время готовки партии («готовлю в четверг к 18:00»); null — готовлю по заказу.
  // Ограничиваем двумя неделями вперёд: дальше это уже не предзаказ, а обещание.
  cookAt: z
    .string()
    .datetime()
    .nullable()
    .optional()
    .refine((v) => !v || new Date(v).getTime() < Date.now() + 14 * 24 * 3600_000, {
      message: "Время готовки — не дальше двух недель вперёд",
    }),
});

async function myCookProfileId(userId: string): Promise<string | null> {
  const cook = await prisma.cookProfile.findUnique({ where: { userId } });
  return cook?.id ?? null;
}

// профиль повара + статус верификации (публиковать блюда можно только проверенным)
async function myVerifiedCook(userId: string): Promise<{ id: string | null; verified: boolean }> {
  const cook = await prisma.cookProfile.findUnique({
    where: { userId },
    include: { user: { select: { isVerified: true } } },
  });
  return { id: cook?.id ?? null, verified: !!cook?.user?.isVerified };
}

function photoCount(data: { photos?: string[]; photoUrl?: string }): number {
  const list = data.photos?.length ? data.photos : data.photoUrl ? [data.photoUrl] : [];
  return list.filter(Boolean).length;
}

// POST /api/dishes — создать блюдо (повар)
dishesRouter.post(
  "/",
  requireAuth,
  requireRole("COOK"),
  asyncHandler(async (req, res) => {
    const data = dishSchema.parse(req.body);
    const { id: cookProfileId, verified } = await myVerifiedCook(req.user!.userId);
    if (!cookProfileId) return res.status(404).json({ error: "Профиль повара не найден" });
    if (!verified) return res.status(403).json({ error: "Опубликовать блюдо можно только после верификации" });
    if (photoCount(data) < 1) return res.status(400).json({ error: "Добавьте хотя бы одно фото блюда" });

    const { tags, photos, allergens, cookAt, ...rest } = data;
    const dish = await prisma.dish.create({
      data: {
        ...rest,
        cookAt: cookAt ? new Date(cookAt) : null,
        tags: arrayToCsv(tags),
        allergens: arrayToCsv(allergens),
        photos: arrayToCsv(photos),
        photoUrl: rest.photoUrl ?? photos?.[0] ?? null,
        cookProfileId,
      },
    });
    res.status(201).json({ dish: serializeDish(dish) });
  })
);

// PUT /api/dishes/:id — редактировать (только владелец)
dishesRouter.put(
  "/:id",
  requireAuth,
  requireRole("COOK"),
  asyncHandler(async (req, res) => {
    const data = dishSchema.partial().parse(req.body);
    const { id: cookProfileId, verified } = await myVerifiedCook(req.user!.userId);
    if (!verified) return res.status(403).json({ error: "Изменять блюда можно только после верификации" });
    const dish = await prisma.dish.findUnique({ where: { id: req.params.id } });
    if (!dish || dish.cookProfileId !== cookProfileId) {
      return res.status(404).json({ error: "Блюдо не найдено" });
    }
    // Нельзя убрать все фото — в карточке всегда должно быть фото.
    // Раньше условие смотрело только на photos, и PUT {photoUrl:""} снимал
    // последнее фото в обход инварианта.
    if (
      (data.photos !== undefined || data.photoUrl !== undefined) &&
      photoCount({
        photos: data.photos ?? csvToArray(dish.photos),
        photoUrl: data.photoUrl ?? dish.photoUrl ?? undefined,
      }) < 1
    ) {
      return res.status(400).json({ error: "Добавьте хотя бы одно фото блюда" });
    }
    const { tags, photos, allergens, cookAt, ...rest } = data;
    const updated = await prisma.dish.update({
      where: { id: req.params.id },
      data: {
        ...rest,
        // не передан — не трогаем; null — повар снял время и готовит по заказу
        ...(cookAt !== undefined ? { cookAt: cookAt ? new Date(cookAt) : null } : {}),
        ...(tags ? { tags: arrayToCsv(tags) } : {}),
        ...(allergens ? { allergens: arrayToCsv(allergens) } : {}),
        ...(photos
          ? { photos: arrayToCsv(photos), photoUrl: rest.photoUrl ?? photos[0] ?? null }
          : {}),
      },
    });
    res.json({ dish: serializeDish(updated) });
  })
);

// DELETE /api/dishes/:id
dishesRouter.delete(
  "/:id",
  requireAuth,
  requireRole("COOK"),
  asyncHandler(async (req, res) => {
    const cookProfileId = await myCookProfileId(req.user!.userId);
    const dish = await prisma.dish.findUnique({ where: { id: req.params.id } });
    if (!dish || dish.cookProfileId !== cookProfileId) {
      return res.status(404).json({ error: "Блюдо не найдено" });
    }
    await prisma.dish.delete({ where: { id: req.params.id } });
    res.status(204).end();
  })
);

export default dishesRouter;
