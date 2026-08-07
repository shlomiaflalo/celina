import nodemailer, { type Transporter } from "nodemailer";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import type { Lang } from "../i18n/errorMessages.js";

// логотип Celina для шапки письма (встраивается через CID — виден и в Gmail)
// оранжевая чаша (оригинальный логотип) для писем на белом фоне; фолбэк — старый белый
const LOGO_PATH = (() => {
  const orange = resolve(process.cwd(), "assets/email-logo-orange.png");
  return existsSync(orange) ? orange : resolve(process.cwd(), "assets/email-logo.png");
})();
const LOGO_CID = "celinalogo";

/**
 * Отправка e-mail через SMTP. Настраивается переменными окружения:
 *   SMTP_HOST, SMTP_PORT (587/465), SMTP_USER, SMTP_PASS, MAIL_FROM
 * Пример (Gmail): SMTP_HOST=smtp.gmail.com SMTP_PORT=465
 *   SMTP_USER=...@gmail.com  SMTP_PASS=<app-password>
 * Если переменные не заданы — письма не отправляются (dev-режим: код в логе/ответе).
 */
let cached: Transporter | null = null;

export function mailConfigured(): boolean {
  return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function transport(): Transporter | null {
  if (cached) return cached;
  if (!mailConfigured()) return null;
  const port = Number(process.env.SMTP_PORT) || 587;
  cached = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    // предпочитаем IPv4 (в контейнере IPv6-выход часто «висит») и ставим явные
    // таймауты — иначе при недоступном SMTP запрос кода зависал на ~45 сек.
    // family нет в типах nodemailer, но валиден в рантайме (опция net.connect) → as any
    family: 4,
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  } as any);
  return cached;
}

export async function sendMail(to: string, subject: string, html: string, opts?: { replyTo?: string }): Promise<boolean> {
  const tx = transport();
  if (!tx) return false;
  try {
    await tx.sendMail({
      from: process.env.MAIL_FROM || `Celina <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      ...(opts?.replyTo ? { replyTo: opts.replyTo } : {}),
      // встраиваем логотип как inline-вложение (cid) — отображается во всех клиентах
      attachments: existsSync(LOGO_PATH)
        ? [{ filename: "celina.png", path: LOGO_PATH, cid: LOGO_CID }]
        : [],
    });
    return true;
  } catch (e) {
    console.error("[mailer] send failed:", e instanceof Error ? e.message : e);
    return false;
  }
}

/** Единая фирменная оболочка письма: шапка с логотипом + тело + подвал. Язык по выбору пользователя. */
function emailShell(bodyHtml: string, lang: Lang = "ru"): string {
  // бренд и слоган — на языке аккаунта: RU → «Селина» / «Соседи кормят соседей»,
  // EN → «Celina» / «Neighbors feed neighbors» (логотип-символ один и тот же)
  const brand = lang === "en" ? "Celina" : "Селина";
  const slogan = lang === "en" ? "Neighbors feed neighbors" : "Соседи кормят соседей";
  // Бело-оранжевая тема — как логотип: светлый фон, белая карточка, оранжевая
  // чаша и «Селина» оранжевым, акценты оранжевые. Текст тёплый тёмный (не чёрный).
  return `
  <div style="margin:0;padding:28px 12px;background:#faf5ee;font-family:Arial,Helvetica,sans-serif">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr><td align="center">
        <table role="presentation" width="480" cellpadding="0" cellspacing="0" border="0" style="max-width:480px;width:100%;background:#ffffff;border:1px solid #f2e2c8;border-radius:18px;overflow:hidden;box-shadow:0 6px 22px rgba(176,104,8,0.10)">
          <tr><td align="center" style="padding:30px 24px 22px">
            <img src="cid:${LOGO_CID}" width="64" alt="${brand}" style="display:block;width:64px;height:auto;margin:0 auto 10px" />
            <div style="font-size:27px;font-weight:bold;color:#e0860c;letter-spacing:.5px">${brand}</div>
            <div style="font-size:13px;color:#c79a5e;margin-top:4px">${slogan}</div>
          </td></tr>
          <tr><td style="padding:6px 28px 26px">${bodyHtml}</td></tr>
          <tr><td style="border-top:1px solid #f4e6cf;padding:16px 24px;text-align:center">
            <div style="font-size:12px;color:#b8956a">${slogan}</div>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </div>`;
}

export function codeEmailHtml(code: string, purpose: string, lang: Lang = "ru"): string {
  // бело-оранжевая тема: акцентное слово оранжевым (как в логотипе)
  const L = lang === "en"
    ? {
        hi: "Hello,",
        label: `Your confirmation code for <b style="color:#e0860c">${purpose}</b>:`,
        note: "The code is valid for a limited time. Do not share it with anyone. If you didn't request it, simply ignore this email.",
      }
    : {
        hi: "Здравствуйте,",
        label: `Ваш код подтверждения для <b style="color:#e0860c">${purpose}</b>:`,
        note: "Код действует ограниченное время. Никому его не сообщайте. Если вы не запрашивали код — просто проигнорируйте это письмо.",
      };
  // Код: оранжевая коробка (как логотип) + белый код — сочетание белого и оранжевого.
  return emailShell(`
    <p style="margin:0 0 6px;font-size:17px;color:#5b4f42">${L.hi}</p>
    <p style="margin:0 0 20px;font-size:15px;color:#6b6258;line-height:1.5">${L.label}</p>
    <div style="font-size:40px;font-weight:bold;letter-spacing:12px;color:#ffffff;background:#e0860c;background-image:linear-gradient(160deg,#f4a01f 0%,#e6850c 100%);border-radius:16px;padding:20px 12px;text-align:center;box-shadow:0 4px 14px rgba(176,104,8,0.22)">${code}</div>
    <p style="margin:20px 0 0;font-size:13px;color:#9a8f7e;line-height:1.6">${L.note}</p>
  `, lang);
}

/** Письмо в поддержку с формы «Связаться с нами» — уходит на support-адрес. */
export function contactEmailHtml(p: { name: string; email: string; message: string }): string {
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  // бело-оранжевая тема (как код-письмо)
  return emailShell(`
    <div style="font-size:13px;color:#9a8f7e;margin-bottom:10px">Сообщение с сайта Celina</div>
    <table role="presentation" width="100%" style="border-collapse:collapse;font-size:14px;color:#3a3a3a;background:#fff7ee;border:1px solid #f3e2c8;border-radius:12px">
      <tr><td style="padding:10px 14px;color:#9a8f7e;width:90px">Имя</td><td style="padding:10px 14px;font-weight:bold">${esc(p.name)}</td></tr>
      <tr><td style="padding:10px 14px;color:#9a8f7e">E-mail</td><td style="padding:10px 14px"><a href="mailto:${esc(p.email)}" style="color:#e0860c">${esc(p.email)}</a></td></tr>
    </table>
    <p style="margin:18px 0 6px;font-size:13px;color:#9a8f7e">Сообщение:</p>
    <p style="color:#3a3a3a;margin:0;font-size:15px;line-height:1.6;white-space:pre-wrap">${esc(p.message)}</p>
    <p style="margin:18px 0 0;font-size:12px;color:#9a8f7e">Ответьте прямо на это письмо, чтобы связаться с отправителем.</p>
  `);
}

/** Чек о разовой активации аккаунта повара ($1). */
export function activationReceiptHtml(p: { name: string; amount: string; provider: string; paymentId: string; date: string }): string {
  return emailShell(`
    <div style="font-size:13px;color:#9a8f7e;margin-bottom:10px">Чек об активации аккаунта повара</div>
    <p style="color:#3a3a3a;margin:0 0 18px;font-size:15px;line-height:1.5">Спасибо, <b>${p.name}</b>. Ваш аккаунт повара активирован — можно начинать готовить и продавать.</p>
    <table role="presentation" width="100%" style="border-collapse:collapse;font-size:14px;color:#3a3a3a;background:#fff7ee;border-radius:12px">
      <tr><td style="padding:10px 14px;color:#9a8f7e">Назначение</td><td style="padding:10px 14px;text-align:right">Разовая активация</td></tr>
      <tr><td style="padding:10px 14px;color:#9a8f7e">Сумма</td><td style="padding:10px 14px;text-align:right;font-weight:bold;color:#e0860c">${p.amount}</td></tr>
      <tr><td style="padding:10px 14px;color:#9a8f7e">Способ оплаты</td><td style="padding:10px 14px;text-align:right">${p.provider}</td></tr>
      <tr><td style="padding:10px 14px;color:#9a8f7e">ID платежа</td><td style="padding:10px 14px;text-align:right;font-family:monospace;font-size:12px">${p.paymentId}</td></tr>
      <tr><td style="padding:10px 14px;color:#9a8f7e">Дата</td><td style="padding:10px 14px;text-align:right">${p.date}</td></tr>
    </table>
    <p style="color:#9a8f7e;font-size:12px;margin-top:16px">Это разовый платёж. Спасибо, что вы с Celina.</p>
  `);
}
