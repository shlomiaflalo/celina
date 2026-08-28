import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { asyncHandler } from "../middleware/error.js";
import { requireAuth } from "../middleware/auth.js";
import { rateLimit } from "../middleware/rateLimit.js";
import {
  createActivationPayment, getActivationPaymentStatus, simCharge,
  billingProvider, billingProviderName, billingConfigured,
  ACTIVATION_USD, ACTIVATION_RUB,
} from "../lib/billing.js";
import { sendMail, mailConfigured, activationReceiptHtml } from "../lib/mailer.js";

export const billingRouter = Router();

async function cookOf(userId: string) {
  const me = await prisma.user.findUnique({ where: { id: userId }, include: { cookProfile: true } });
  if (!me || me.role !== "COOK" || !me.cookProfile) return null;
  // гарантируем не-null cookProfile в типе для дальнейшего кода
  return { ...me, cookProfile: me.cookProfile };
}

async function markPaidAndReceipt(me: any, paymentId: string, email?: string | null) {
  await prisma.cookProfile.update({
    where: { id: me.cookProfile.id },
    data: { activationPaidAt: new Date(), activationPaymentId: paymentId },
  });
  const receiptEmail = me.email || email || null;
  if (receiptEmail && !me.email && email) {
    await prisma.user.update({ where: { id: me.id }, data: { email } });
  }
  let receiptSent = false;
  if (receiptEmail && mailConfigured()) {
    receiptSent = await sendMail(
      receiptEmail,
      "Celina — чек об активации аккаунта повара",
      activationReceiptHtml({
        name: me.name,
        amount: `$${ACTIVATION_USD} (${ACTIVATION_RUB} ₽)`,
        provider: billingProviderName(),
        paymentId,
        date: new Date().toLocaleString("ru-RU"),
      })
    );
  }
  return { receiptSent, emailedTo: receiptEmail };
}

// GET /api/billing/activation — статус активации + параметры платежа
billingRouter.get(
  "/activation",
  requireAuth,
  asyncHandler(async (req, res) => {
    const cp = await prisma.cookProfile.findUnique({
      where: { userId: req.user!.userId },
      select: { activationPaidAt: true },
    });
    res.json({
      paid: !!cp?.activationPaidAt,
      amountUsd: ACTIVATION_USD,
      amountRub: ACTIVATION_RUB,
      provider: billingProvider(),
      providerName: billingProviderName(),
      configured: billingConfigured(), // true → реальный провайдер (редирект), false → симуляция (форма карты)
    });
  })
);

// POST /api/billing/activate/start — РЕАЛЬНЫЙ провайдер: создать платёж и вернуть ссылку для редиректа
billingRouter.post(
  "/activate/start",
  rateLimit({ windowMs: 10 * 60_000, max: 12 }),
  requireAuth,
  asyncHandler(async (req, res) => {
    const { returnUrl, email } = z.object({ returnUrl: z.string().url(), email: z.string().email().optional() }).parse(req.body);
    const me = await cookOf(req.user!.userId);
    if (!me) return res.status(403).json({ error: "Активация доступна только повару" });
    if (me.cookProfile.activationPaidAt) return res.json({ ok: true, alreadyPaid: true });
    if (!billingConfigured()) return res.status(409).json({ error: "Провайдер не настроен", sim: true });

    if (email && !me.email) await prisma.user.update({ where: { id: me.id }, data: { email } });
    const pay = await createActivationPayment({
      returnUrl,
      metadata: { userId: me.id, cookProfileId: me.cookProfile.id },
    });
    // запоминаем id платежа (ещё не оплачен)
    await prisma.cookProfile.update({ where: { id: me.cookProfile.id }, data: { activationPaymentId: pay.paymentId } });
    res.json({ ok: true, redirect: pay.confirmationUrl, paymentId: pay.paymentId });
  })
);

// POST /api/billing/activate/confirm — проверить статус платежа после возврата от провайдера
billingRouter.post(
  "/activate/confirm",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { paymentId } = z.object({ paymentId: z.string() }).parse(req.body);
    const me = await cookOf(req.user!.userId);
    if (!me) return res.status(403).json({ error: "Только для повара" });
    if (me.cookProfile.activationPaidAt) return res.json({ ok: true, alreadyPaid: true });

    // Платёж обязан быть СВОИМ: без этой сверки один оплаченный paymentId
    // активировал сколько угодно чужих аккаунтов повара (его достаточно было
    // подсмотреть или переиспользовать со своего второго аккаунта).
    if (!me.cookProfile.activationPaymentId || paymentId !== me.cookProfile.activationPaymentId) {
      return res.status(403).json({ error: "Платёж не принадлежит этому аккаунту" });
    }

    const st = await getActivationPaymentStatus(paymentId);
    if (!st.paid) return res.json({ ok: false, status: st.status });
    const r = await markPaidAndReceipt(me, paymentId);
    res.json({ ok: true, ...r });
  })
);

// POST /api/billing/webhook — уведомление от ЮKassa (без авторизации).
// Подлинность подтверждаем повторным запросом статуса у провайдера (защита от подделки).
// URL для регистрации в кабинете ЮKassa:  https://<домен>/api/billing/webhook
billingRouter.post(
  "/webhook",
  asyncHandler(async (req, res) => {
    const obj = req.body?.object;
    // мгновенно подтверждаем приём, иначе ЮKassa будет повторять
    if (req.body?.event !== "payment.succeeded" || !obj?.id || !billingConfigured()) {
      return res.status(200).json({ ok: true });
    }
    const cookProfileId: string | undefined = obj?.metadata?.cookProfileId;
    if (!cookProfileId) return res.status(200).json({ ok: true });

    // авторитетная проверка статуса у провайдера
    const st = await getActivationPaymentStatus(obj.id).catch(() => ({ paid: false, status: "error" }));
    if (!st.paid) return res.status(200).json({ ok: true });

    const cp = await prisma.cookProfile.findUnique({ where: { id: cookProfileId }, include: { user: true } });
    if (cp && !cp.activationPaidAt) {
      await markPaidAndReceipt({ ...cp.user, cookProfile: cp }, obj.id);
    }
    res.status(200).json({ ok: true });
  })
);

// POST /api/billing/activate — СИМУЛЯЦИЯ (когда провайдер не настроен): прямой charge по карте
billingRouter.post(
  "/activate",
  rateLimit({ windowMs: 10 * 60_000, max: 10 }),
  requireAuth,
  asyncHandler(async (req, res) => {
    const { cardNumber, email } = z
      .object({ cardNumber: z.string().min(12), email: z.string().email().optional() })
      .parse(req.body);
    // Симуляционная оплата — только для стенда. Если настроен реальный
    // провайдер, этот путь обязан быть закрыт: иначе повар «активируется»
    // бесплатно в обход кассы.
    if (billingConfigured()) {
      return res.status(409).json({ error: "Оплата проходит только через провайдера" });
    }
    const me = await cookOf(req.user!.userId);
    if (!me) return res.status(403).json({ error: "Активация доступна только повару" });
    if (me.cookProfile.activationPaidAt) return res.json({ ok: true, alreadyPaid: true });

    const charge = await simCharge(cardNumber);
    if (!charge.ok) return res.status(402).json({ ok: false, error: charge.error });
    const r = await markPaidAndReceipt(me, charge.paymentId!, email);
    res.json({ ok: true, paymentId: charge.paymentId, ...r });
  })
);

export default billingRouter;
