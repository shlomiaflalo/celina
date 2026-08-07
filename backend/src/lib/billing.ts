import { randomUUID } from "crypto";
import { luhnValid } from "./luhn.js";

/**
 * Биллинг активации повара — стартовая бизнес-модель: разовый $1 (₽100).
 *
 * Реальный провайдер: ЮKassa (входит в Сбер) — работает с российскими картами и СБП.
 * Безопасная (PCI) схema: мы НЕ принимаем номер карты у себя — создаём платёж и
 * редиректим повара на защищённую страницу ЮKassa, затем проверяем статус.
 *
 * Подключение (env):
 *   BILLING_PROVIDER=yookassa            (sber|yookassa|sbp — все идут через ЮKassa-шлюз)
 *   YOOKASSA_SHOP_ID=<shopId>
 *   YOOKASSA_SECRET_KEY=<secretKey>
 *   ACTIVATION_RUB=100                   (сумма списания в рублях $1)
 *
 * Пока ключи не заданы — безопасная СИМУЛЯЦИЯ (форма карты в dev, «…0000» = отказ).
 */

export const ACTIVATION_USD = Number(process.env.ACTIVATION_USD || 1);
export const ACTIVATION_RUB = Number(process.env.ACTIVATION_RUB || 100);

export function billingProvider(): string {
  return (process.env.BILLING_PROVIDER || "yookassa").toLowerCase();
}
export function billingProviderName(): string {
  const map: Record<string, string> = { sber: "SberPay", yookassa: "ЮKassa", sbp: "СБП", payoneer: "Payoneer" };
  return map[billingProvider()] || billingProvider();
}

const YK_SHOP = process.env.YOOKASSA_SHOP_ID;
const YK_KEY = process.env.YOOKASSA_SECRET_KEY;
const YK_API = "https://api.yookassa.ru/v3";

/** Подключены ли реальные ключи провайдера (иначе — симуляция). */
export function billingConfigured(): boolean {
  return !!(YK_SHOP && YK_KEY);
}
function ykAuth(): string {
  return "Basic " + Buffer.from(`${YK_SHOP}:${YK_KEY}`).toString("base64");
}

/** Создать платёж у провайдера → ссылка на оплату для редиректа повара. */
export async function createActivationPayment(opts: {
  returnUrl: string;
  metadata: Record<string, string>;
}): Promise<{ paymentId: string; confirmationUrl: string }> {
  const res = await fetch(`${YK_API}/payments`, {
    method: "POST",
    headers: {
      Authorization: ykAuth(),
      "Idempotence-Key": randomUUID(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: { value: ACTIVATION_RUB.toFixed(2), currency: "RUB" },
      capture: true,
      confirmation: { type: "redirect", return_url: opts.returnUrl },
      description: "Celina — активация аккаунта повара ($1)",
      metadata: opts.metadata,
    }),
  });
  if (!res.ok) throw new Error("yookassa_create_failed:" + res.status);
  const data: any = await res.json();
  return { paymentId: data.id, confirmationUrl: data?.confirmation?.confirmation_url };
}

/** Проверить статус платежа. succeeded → оплачено. */
export async function getActivationPaymentStatus(paymentId: string): Promise<{ paid: boolean; status: string }> {
  const res = await fetch(`${YK_API}/payments/${encodeURIComponent(paymentId)}`, {
    headers: { Authorization: ykAuth() },
  });
  if (!res.ok) throw new Error("yookassa_status_failed:" + res.status);
  const data: any = await res.json();
  return { paid: data.status === "succeeded", status: data.status };
}

// ───────── СИМУЛЯЦИЯ (нет ключей провайдера) — только для локальной разработки ─────────
/** Прямое списание по карте — ТОЛЬКО в режиме симуляции (когда нет ключей провайдера). */
export async function simCharge(card: string): Promise<{ ok: boolean; paymentId?: string; error?: string }> {
  const num = (card || "").replace(/\D/g, "");
  if (!luhnValid(num)) return { ok: false, error: "card_invalid" };
  if (num.endsWith("0000")) return { ok: false, error: "declined" };
  return { ok: true, paymentId: `sim_${Date.now()}_${Math.random().toString(36).slice(2, 8)}` };
}
