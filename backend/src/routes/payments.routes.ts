import { Router } from "express";
import { z } from "zod";
import { randomBytes } from "crypto";
import { prisma } from "../prisma.js";
import { asyncHandler } from "../middleware/error.js";
import { requireAuth } from "../middleware/auth.js";
import { rateLimit } from "../middleware/rateLimit.js";
import { luhnValid } from "../lib/luhn.js";

export const paymentsRouter = Router();

// анти-абуз для платёжных эндпоинтов (щедрые лимиты — обычный поток не страдает)
const payLimit = rateLimit({ windowMs: 10 * 60_000, max: 30 });

/**
 * Платёжный модуль Celina.
 *
 * Архитектура повторяет реальные эквайринг-шлюзы (ЮKassa / Stripe):
 *   1) POST /api/payments/intent  — создаём «намерение оплаты» по заказу
 *   2) POST /api/payments/confirm — подтверждаем оплату данными карты
 *
 * Здесь подключается тестовый шлюз: карта проверяется по алгоритму Луна,
 * а решение эквайера эмулируется. Чтобы перейти на боевой приём платежей,
 * достаточно заменить тело confirmWithAcquirer() вызовом ЮKassa/Stripe API
 * (карта при этом не должна доходить до нашего сервера — токенизация на фронте).
 */

async function loadOwnedOrder(orderId: string, userId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.buyerId !== userId) return null;
  return order;
}

// POST /api/payments/intent — намерение оплаты
paymentsRouter.post(
  "/intent",
  payLimit,
  requireAuth,
  asyncHandler(async (req, res) => {
    const { orderId } = z.object({ orderId: z.string() }).parse(req.body);
    const order = await loadOwnedOrder(orderId, req.user!.userId);
    if (!order) return res.status(404).json({ error: "Заказ не найден" });
    if (order.paymentStatus === "PAID") {
      return res.status(409).json({ error: "Заказ уже оплачен" });
    }
    res.json({
      intent: {
        id: "pi_" + randomBytes(10).toString("hex"),
        orderId: order.id,
        amount: order.total,
        currency: "RUB",
        status: "requires_payment_method",
      },
    });
  })
);

const confirmSchema = z.object({
  orderId: z.string(),
  method: z.enum(["card", "cash"]).default("card"),
  card: z
    .object({
      number: z.string(),
      expMonth: z.number().int().min(1).max(12),
      expYear: z.number().int(),
      cvc: z.string().min(3).max(4),
      holder: z.string().optional(),
    })
    .optional(),
});

// Эмуляция решения эквайера (здесь точка интеграции ЮKassa/Stripe)
function confirmWithAcquirer(card: { number: string; expMonth: number; expYear: number; cvc: string }) {
  const now = new Date();
  const exp = new Date(card.expYear, card.expMonth - 1, 1);
  if (exp < new Date(now.getFullYear(), now.getMonth(), 1)) {
    return { ok: false as const, error: "Срок действия карты истёк" };
  }
  if (!luhnValid(card.number)) {
    return { ok: false as const, error: "Неверный номер карты" };
  }
  // тестовая карта для отказа: оканчивается на 0000
  if (card.number.replace(/\D/g, "").endsWith("0000")) {
    return { ok: false as const, error: "Платёж отклонён банком" };
  }
  return { ok: true as const, transactionId: "txn_" + randomBytes(12).toString("hex") };
}

// POST /api/payments/confirm — подтверждение оплаты
paymentsRouter.post(
  "/confirm",
  payLimit,
  requireAuth,
  asyncHandler(async (req, res) => {
    const data = confirmSchema.parse(req.body);
    const order = await loadOwnedOrder(data.orderId, req.user!.userId);
    if (!order) return res.status(404).json({ error: "Заказ не найден" });
    if (order.paymentStatus === "PAID") {
      return res.json({ status: "succeeded", order });
    }

    // Оплата при получении — заказ остаётся неоплаченным до доставки
    if (data.method === "cash") {
      const updated = await prisma.order.update({
        where: { id: order.id },
        data: { paymentMethod: "cash" },
      });
      return res.json({ status: "cash", order: updated });
    }

    if (!data.card) return res.status(400).json({ error: "Нет данных карты" });
    const result = confirmWithAcquirer(data.card);
    if (!result.ok) return res.status(402).json({ error: result.error });

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: "PAID",
        paymentMethod: "card",
        paymentId: result.transactionId,
        paidAt: new Date(),
      },
    });
    res.json({ status: "succeeded", transactionId: result.transactionId, order: updated });
  })
);

export default paymentsRouter;
