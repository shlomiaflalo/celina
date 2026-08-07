import { randomInt } from "node:crypto";
import { sendMail, mailConfigured, codeEmailHtml } from "./mailer.js";
import { sendSms, smsConfigured } from "./sms.js";
import type { Lang } from "../i18n/errorMessages.js";

/**
 * Единая точка для одноразовых кодов (сброс пароля, 2FA основателя и любых будущих).
 * Генерация + доставка (e-mail/SMS) + маскирование контакта + безопасное поле devCode.
 * Язык письма/СМС — по выбору пользователя (X-Lang запроса).
 */

const DEV = process.env.NODE_ENV !== "production";

/** Назначение кода. Текст локализуется по языку пользователя. */
export type Purpose = "reset" | "founder2fa";
const PURPOSE_TEXT: Record<Lang, Record<Purpose, string>> = {
  ru: { reset: "сброса пароля", founder2fa: "входа в панель основателя" },
  en: { reset: "password reset", founder2fa: "founder panel sign-in" },
};

/** 6-значный код. Криптостойкий генератор (не Math.random) — код нельзя предсказать. */
export const genCode = (): string => String(randomInt(100000, 1000000));

/** Доставка кода в языке пользователя. Возвращает true, если реально отправлено провайдером (e-mail/SMS). */
export async function deliver(target: string, code: string, purpose: Purpose, lang: Lang = "ru"): Promise<boolean> {
  const pText = PURPOSE_TEXT[lang][purpose];
  const subject = lang === "en" ? `Celina — code: ${code}` : `Celina — код: ${code}`;
  if (target.includes("@") && mailConfigured()) {
    if (await sendMail(target, subject, codeEmailHtml(code, pText, lang))) return true;
  }
  if (!target.includes("@") && smsConfigured()) {
    const smsText = lang === "en"
      ? `Celina: code ${code} (${pText}). Do not share it with anyone.`
      : `Celina: код ${code} (${pText}). Никому не сообщайте.`;
    if (await sendSms(target, smsText)) return true;
  }
  // не доставлено провайдером → код в лог ТОЛЬКО вне продакшена (иначе утечка кодов в логи)
  if (process.env.NODE_ENV !== "production") {
    console.log(`[Celina:${purpose}] code for ${target} = ${code}`);
  }
  return false;
}

/** Маскирование e-mail/телефона для ответа («ab***@x.ru», «+799****01»). */
export function mask(contact: string): string {
  if (contact.includes("@")) {
    const [u, d] = contact.split("@");
    return u.slice(0, 2) + "***@" + d;
  }
  return contact.slice(0, 4) + "****" + contact.slice(-2);
}

/**
 * Поле devCode для ответа. Возвращается ТОЛЬКО когда код не доставлен провайдером
 * И сервер не в production. В production не раскрывается никогда.
 */
export function devCodeField(delivered: boolean, code: string): { devCode?: string } {
  return !delivered && DEV ? { devCode: code } : {};
}

// ── защита от подбора одноразового кода ────────────────────────────────────
// IP-лимит не спасает: код 6-значный (900 000 вариантов), и с меняющихся адресов
// перебор реален. Считаем НЕУДАЧНЫЕ попытки по конкретному аккаунту и после
// порога гасим код — дальше нужен новый запрос кода.
// Память процесса: сервис работает одним процессом в контейнере; при рестарте
// счётчик обнуляется, что приемлемо — код к тому моменту всё равно протухает.
const MAX_CODE_ATTEMPTS = 5;
const attempts = new Map<string, { n: number; exp: number }>();

setInterval(() => {
  const now = Date.now();
  for (const [k, v] of attempts) if (now > v.exp) attempts.delete(k);
}, 5 * 60_000).unref?.();

/** Засчитать неудачную попытку. true → порог исчерпан, код нужно погасить. */
export function registerFailedAttempt(userId: string, purpose: Purpose): boolean {
  const key = `${purpose}:${userId}`;
  const now = Date.now();
  const cur = attempts.get(key);
  const next = !cur || now > cur.exp ? { n: 1, exp: now + 30 * 60_000 } : { n: cur.n + 1, exp: cur.exp };
  attempts.set(key, next);
  return next.n >= MAX_CODE_ATTEMPTS;
}

/** Сбросить счётчик после успешного ввода или выдачи нового кода. */
export function clearAttempts(userId: string, purpose: Purpose): void {
  attempts.delete(`${purpose}:${userId}`);
}
