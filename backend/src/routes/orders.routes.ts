import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { asyncHandler } from "../middleware/error.js";
import { requireAuth, requireVerified } from "../middleware/auth.js";
import { sameCity, verifyAddressInCity } from "../lib/geo.js";
import { rateLimit } from "../middleware/rateLimit.js";
import { notify } from "../lib/notify.js";
import type { OrderStatus } from "../lib/enums.js";

// анти-спам на создание заказов (щедрый лимит — обычный пользователь не упрётся)
const createLimit = rateLimit({ windowMs: 10 * 60_000, max: 40 });

export const ordersRouter = Router();

const createSchema = z.object({
  cookProfileId: z.string(),
  fulfillment: z.enum(["DELIVERY", "PICKUP"]).default("DELIVERY"),
  address: z.string().trim().max(300).optional(),
  note: z.string().trim().max(1000).optional(),
  scheduledFor: z.string().datetime().optional(),
  items: z
    .array(z.object({ dishId: z.string(), qty: z.number().int().positive() }))
    .min(1),
});

// POST /api/orders — создать заказ (покупатель)
ordersRouter.post(
  "/",
  createLimit,
  requireAuth,
  requireVerified,
  asyncHandler(async (req, res) => {
    const data = createSchema.parse(req.body);

    const dishes = await prisma.dish.findMany({
      where: { id: { in: data.items.map((i) => i.dishId) } },
    });
    // все блюда должны принадлежать одному повару
    const fromOneCook = dishes.every((d) => d.cookProfileId === data.cookProfileId);
    if (dishes.length !== data.items.length || !fromOneCook) {
      return res.status(400).json({ error: "Неверный состав заказа" });
    }

    const cook = await prisma.cookProfile.findUnique({
      where: { id: data.cookProfileId },
    });
    if (!cook) return res.status(404).json({ error: "Повар не найден" });

    // антиспам заказов: не более 2 РАЗНЫХ поваров за 30 минут.
    // Повторные заказы у тех же поваров не ограничиваются (кроме общего rate-limit),
    // отменённые заказы слот не занимают. Дублирует клиентский лимит корзины
    // (MAX_COOKS=2) на случай обхода UI.
    const COOKS_WINDOW_MS = 30 * 60_000;
    const recent = await prisma.order.findMany({
      where: {
        buyerId: req.user!.userId,
        createdAt: { gte: new Date(Date.now() - COOKS_WINDOW_MS) },
        status: { not: "CANCELLED" },
      },
      select: { cookProfileId: true },
    });
    const recentCooks = new Set(recent.map((o) => o.cookProfileId));
    if (!recentCooks.has(data.cookProfileId) && recentCooks.size >= 2) {
      return res.status(429).json({ error: "Можно заказывать максимум у 2 поваров за 30 минут — попробуйте чуть позже" });
    }

    // Способ получения обязан быть включён у самого повара: UI кнопку прячет,
    // но прямой POST создавал заказ на доставку у повара, который возит только
    // самовывозом (и наоборот) — повар получал невыполнимый заказ.
    if (data.fulfillment === "DELIVERY" && cook.deliveryEnabled === false) {
      return res.status(400).json({ error: "Повар не доставляет — выберите самовывоз" });
    }
    if (data.fulfillment === "PICKUP" && cook.pickupEnabled === false) {
      return res.status(400).json({ error: "У этого повара нет самовывоза" });
    }

    const deliveryFee = data.fulfillment === "DELIVERY" ? cook.deliveryFee : 0;
    const itemsTotal = data.items.reduce((sum, i) => {
      const dish = dishes.find((d) => d.id === i.dishId)!;
      return sum + dish.price * i.qty;
    }, 0);

    if (itemsTotal < cook.minOrder) {
      return res
        .status(400)
        .json({ error: `Минимальный заказ — ${cook.minOrder} ₽` });
    }

    // блюдо должно быть доступно и порций должно хватать (быстрая проверка до транзакции)
    for (const i of data.items) {
      const dish = dishes.find((d) => d.id === i.dishId)!;
      if (!dish.isAvailable) {
        return res.status(409).json({ error: `«${dish.title}» сейчас недоступно — обновите корзину` });
      }
      if (i.qty > dish.portions) {
        return res.status(409).json({ error: `«${dish.title}» — осталось порций: ${dish.portions}` });
      }
    }

    // ── доставка: адрес обязателен, город покупателя = город повара,
    //    и адрес реально находится в этом городе (серверная проверка —
    //    клиентскую можно обойти прямым запросом к API) ──
    if (data.fulfillment === "DELIVERY") {
      const buyer = await prisma.user.findUnique({
        where: { id: req.user!.userId },
        select: { city: true },
      });
      if (!sameCity(buyer?.city, cook.city)) {
        return res.status(400).json({ error: "Повар из другого города — доставка недоступна" });
      }
      const address = (data.address ?? "").trim();
      if (!address) {
        return res.status(400).json({ error: "Укажите адрес доставки" });
      }
      const verdict = await verifyAddressInCity(address, cook.city ?? "");
      if (verdict === "format" || verdict === "notFound") {
        return res.status(400).json({ error: "Адрес не найден — уточните улицу и номер дома" });
      }
      if (verdict === "wrongCity") {
        return res.status(400).json({ error: `Адрес должен быть в городе ${cook.city}` });
      }
      // "unavailable" (геокодер недоступен) — заказ не блокируем
    }

    // деньги храним с точностью до копейки (float-арифметика даёт 648.9899…)
    const total = Math.round((itemsTotal + deliveryFee) * 100) / 100;

    // защита от двойного клика (idempotency): если тот же покупатель только что
    // (в течение 90 сек) создал такой же заказ этому повару на ту же сумму — не
    // плодим дубль и не списываем порции дважды, а возвращаем уже созданный заказ.
    const dupCandidate = await prisma.order.findFirst({
      where: {
        buyerId: req.user!.userId,
        cookProfileId: data.cookProfileId,
        status: "PENDING",
        total,
        createdAt: { gte: new Date(Date.now() - 90_000) },
      },
      orderBy: { createdAt: "desc" },
      include: { items: true, cookProfile: { select: { kitchenName: true } }, buyer: { select: { name: true } } },
    });
    // Сверяем СОСТАВ, а не только сумму: разные наборы блюд легко дают
    // одинаковый итог (борщ 500 ≠ два пирожка по 250), и такой «дубль»
    // молча съедал второй, реально новый заказ.
    const sameBasket = (o: { items: { dishId: string | null; qty: number }[] }) => {
      if (o.items.length !== data.items.length) return false;
      const want = new Map(data.items.map((i) => [i.dishId, i.qty]));
      return o.items.every((it) => it.dishId != null && want.get(it.dishId) === it.qty);
    };
    const dup = dupCandidate && sameBasket(dupCandidate) ? dupCandidate : null;
    if (dup) return res.status(200).json({ order: dup, deduplicated: true });

    class OutOfStock extends Error {
      constructor(public dishId: string) { super("out of stock"); }
    }

    let order;
    try {
      order = await prisma.$transaction(async (tx) => {
        // атомарное списание порций: условие в updateMany защищает от гонки
        // двух одновременных заказов на последние порции
        for (const i of data.items) {
          const updated = await tx.dish.updateMany({
            where: { id: i.dishId, isAvailable: true, portions: { gte: i.qty } },
            data: { portions: { decrement: i.qty } },
          });
          if (updated.count === 0) throw new OutOfStock(i.dishId);
        }
        return tx.order.create({
          data: {
            buyerId: req.user!.userId,
            cookProfileId: data.cookProfileId,
            fulfillment: data.fulfillment,
            address: data.address,
            note: data.note,
            scheduledFor: data.scheduledFor ? new Date(data.scheduledFor) : null,
            deliveryFee,
            total,
            // бесплатный запуск: расчёт наличными при получении (карт/предоплаты нет)
            paymentMethod: "cash",
            items: {
              create: data.items.map((i) => {
                const dish = dishes.find((d) => d.id === i.dishId)!;
                return {
                  dishId: dish.id,
                  titleSnapshot: dish.title,
                  priceAtOrder: dish.price,
                  qty: i.qty,
                };
              }),
            },
          },
          include: { items: true, cookProfile: { select: { kitchenName: true } }, buyer: { select: { name: true } } },
        });
      });
    } catch (e) {
      if (e instanceof OutOfStock) {
        const d = dishes.find((x) => x.id === e.dishId);
        return res.status(409).json({ error: `«${d?.title ?? "Блюдо"}» уже разобрали — обновите корзину` });
      }
      throw e;
    }
    // повар получает уведомление о новом заказе
    await notify(cook.userId, { type: "order_new", body: order.buyer?.name ?? "", orderId: order.id }).catch(() => {});
    res.status(201).json({ order });
  })
);

// POST /api/orders/dinein — бронь «Посиделки у повара дома» (покупатель)
const dineInSchema = z.object({
  cookProfileId: z.string(),
  guests: z.number().int().positive(),
  scheduledFor: z.string().datetime().optional(),
  note: z.string().optional(),
});

ordersRouter.post(
  "/dinein",
  createLimit,
  requireAuth,
  requireVerified,
  asyncHandler(async (req, res) => {
    const data = dineInSchema.parse(req.body);
    const cook = await prisma.cookProfile.findUnique({ where: { id: data.cookProfileId } });
    if (!cook || !cook.dineInEnabled) {
      return res.status(400).json({ error: "Этот повар не принимает гостей" });
    }
    // посиделки — очная встреча за столом, без алкоголя (Селина не продаёт и
    // не рекламирует алкоголь, ФЗ-171); возрастной барьер не требуется
    const dineBuyer = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { city: true },
    });
    // встреча очная — доступна только в своём городе (серверная проверка)
    if (!sameCity(dineBuyer?.city, cook.city)) {
      return res.status(400).json({ error: "Встреча доступна только в вашем городе" });
    }
    if (data.guests > cook.dineInSeats) {
      return res.status(400).json({ error: `Максимум ${cook.dineInSeats} гостей` });
    }
    // антиспам: звать одного повара на посиделки можно раз в 30 минут
    const recent = await prisma.order.findFirst({
      where: {
        buyerId: req.user!.userId,
        cookProfileId: cook.id,
        fulfillment: "DINE_IN",
        createdAt: { gte: new Date(Date.now() - 30 * 60_000) },
      },
    });
    if (recent) return res.status(429).json({ error: "Отправлять заявку этому повару можно раз в 30 минут" });
    const total = cook.dineInPrice * data.guests;
    const order = await prisma.order.create({
      data: {
        buyerId: req.user!.userId,
        cookProfileId: cook.id,
        fulfillment: "DINE_IN",
        status: "PENDING",
        scheduledFor: data.scheduledFor ? new Date(data.scheduledFor) : null,
        note: data.note,
        total,
        // бесплатный запуск: расчёт наличными на месте
        paymentMethod: "cash",
        items: {
          create: {
            titleSnapshot: "Посиделки у соседа",
            priceAtOrder: cook.dineInPrice,
            qty: data.guests,
          },
        },
      },
      include: { items: true, cookProfile: { select: { kitchenName: true } }, buyer: { select: { name: true } } },
    });
    await notify(cook.userId, { type: "order_new", body: order.buyer?.name ?? "", orderId: order.id }).catch(() => {});
    res.status(201).json({ order });
  })
);

// GET /api/orders — мои заказы (по роли)
ordersRouter.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const where =
      req.user!.role === "COOK"
        ? { cookProfile: { userId: req.user!.userId } }
        : { buyerId: req.user!.userId };

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: true,
        buyer: { select: { name: true, phone: true } },
        cookProfile: { select: { kitchenName: true } },
        review: { select: { id: true, rating: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ orders });
  })
);

// GET /api/orders/:id
ordersRouter.get(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        items: true,
        review: true,
        buyer: { select: { name: true, phone: true } },
        cookProfile: { select: { id: true, kitchenName: true, userId: true } },
      },
    });
    if (!order) return res.status(404).json({ error: "Заказ не найден" });

    const isOwner =
      order.buyerId === req.user!.userId ||
      order.cookProfile.userId === req.user!.userId;
    if (!isOwner) return res.status(403).json({ error: "Нет доступа" });

    res.json({ order });
  })
);

// допустимые переходы статусов
const NEXT: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["ACCEPTED", "CANCELLED"],
  ACCEPTED: ["COOKING", "CANCELLED"],
  COOKING: ["READY", "CANCELLED"],
  READY: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

// PATCH /api/orders/:id/status — повар двигает статус; покупатель может отменить PENDING
ordersRouter.patch(
  "/:id/status",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { status } = z
      .object({ status: z.enum(["ACCEPTED", "COOKING", "READY", "DELIVERED", "CANCELLED"]) })
      .parse(req.body);

    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { cookProfile: { select: { userId: true, kitchenName: true } }, buyer: { select: { name: true } } },
    });
    if (!order) return res.status(404).json({ error: "Заказ не найден" });

    const isCook = order.cookProfile.userId === req.user!.userId;
    const isBuyer = order.buyerId === req.user!.userId;
    // покупатель может отменить только PENDING и только в течение 5 минут после оформления
    const CANCEL_WINDOW_MS = 5 * 60 * 1000;
    const withinWindow = Date.now() - new Date(order.createdAt).getTime() <= CANCEL_WINDOW_MS;
    if (isBuyer && !isCook && status === "CANCELLED" && order.status === "PENDING" && !withinWindow) {
      return res.status(400).json({ error: "Отменить заказ можно в течение 5 минут после оформления" });
    }
    const isBuyerCancel =
      isBuyer && status === "CANCELLED" && order.status === "PENDING" && withinWindow;
    if (!isCook && !isBuyerCancel) {
      return res.status(403).json({ error: "Нет доступа" });
    }

    if (!NEXT[order.status as OrderStatus].includes(status)) {
      return res
        .status(400)
        .json({ error: `Нельзя перейти из ${order.status} в ${status}` });
    }

    const updated = await prisma.$transaction(async (tx) => {
      // условие по СТАРОМУ статусу защищает от гонки (двойной клик по «Отменить»,
      // покупатель и повар отменяют одновременно): второй запрос не пройдёт
      // и порции не вернутся в наличие дважды
      const changed = await tx.order.updateMany({
        where: { id: order.id, status: order.status },
        data: { status },
      });
      if (changed.count === 0) return null;
      const u = await tx.order.findUniqueOrThrow({ where: { id: order.id }, include: { items: true } });
      // отмена возвращает списанные порции обратно в наличие
      if (status === "CANCELLED" && order.fulfillment !== "DINE_IN") {
        for (const it of u.items) {
          if (it.dishId) {
            await tx.dish.updateMany({ where: { id: it.dishId }, data: { portions: { increment: it.qty } } });
          }
        }
      }
      return u;
    });
    if (!updated) {
      return res.status(409).json({ error: "Статус заказа уже изменился — обновите страницу" });
    }

    // уведомляем вторую сторону о смене статуса
    if (isCook) {
      // повар двигает заказ → покупатель узнаёт («принят/готовится/готов/доставлен»)
      await notify(order.buyerId, { type: "order_status", title: status, body: order.cookProfile.kitchenName, orderId: order.id }).catch(() => {});
    } else {
      // покупатель отменил → повар узнаёт
      await notify(order.cookProfile.userId, { type: "order_status", title: "CANCELLED", body: order.buyer?.name ?? "", orderId: order.id }).catch(() => {});
    }

    res.json({ order: updated });
  })
);

export default ordersRouter;
