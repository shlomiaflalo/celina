import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { asyncHandler } from "../middleware/error.js";
import { requireAuth } from "../middleware/auth.js";
import { rateLimit } from "../middleware/rateLimit.js";
import { hashPassword, verifyPassword, signToken } from "../lib/auth.js";
import { csvToArray, arrayToCsv } from "../lib/serialize.js";
import type { Role } from "../lib/enums.js";
import { genCode, deliver, mask, registerFailedAttempt, clearAttempts } from "../lib/otp.js";
import { verifyAddressInCity } from "../lib/geo.js";
import { createSession, countActiveSessions, activeSessions, MAX_DEVICES, deviceLabel } from "../lib/session.js";
import { pickLang } from "../i18n/errorMessages.js";
import { uniqueReferralCode } from "../lib/referral.js";

export const authRouter = Router();

const registerSchema = z.object({
  phone: z.string().min(5),
  name: z.string().min(1),
  password: z.string().min(4),
  role: z.enum(["BUYER", "COOK"]).default("BUYER"),
  kitchenName: z.string().optional(), // обязательно для COOK
  city: z.string().optional(),
  address: z.string().max(300).optional(), // адрес доставки в выбранном городе
  // подтверждённое местоположение обязательно (GPS или координаты выбранного города)
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  // согласие с Политикой конфиденциальности обязательно
  policyAccepted: z.boolean().optional(),
  // legacy-поле старых клиентов: игнорируется (18+-барьера больше нет — сервис
  // про домашнюю еду и посиделки без алкоголя, ФЗ-171)
  over18: z.boolean().optional(),
  // реферальный код пригласившего (из ссылки ?ref=CODE);
  // невалидный код молча игнорируем — он не должен блокировать регистрацию
  ref: z.preprocess(
    (v) => (typeof v === "string" && /^[A-Za-z0-9]{1,16}$/.test(v.trim()) ? v.trim() : undefined),
    z.string().optional()
  ),
});

authRouter.post(
  "/register",
  rateLimit({ windowMs: 10 * 60_000, max: 8 }),
  asyncHandler(async (req, res) => {
    const data = registerSchema.parse(req.body);

    if (!data.policyAccepted) {
      return res.status(400).json({ error: "Необходимо принять Политику конфиденциальности" });
    }

    // 18+ больше НЕ требуется: сервис про домашнюю еду и соседские посиделки
    // (без алкоголя, ФЗ-171). Убрали и барьер регистрации, и «18+»-мессседжинг.

    // Адрес/координаты при регистрации НЕ обязательны — подтверждаются при
    // первом заказе (в корзине verifyAddressInCity). Так регистрация проходит
    // без трения; для маркетплейса без поваров это критично для конверсии.
    // Город обязателен (для подбора поваров), остальное — по желанию.
    if (!data.city) {
      return res.status(400).json({ error: "Выберите город" });
    }

    const exists = await prisma.user.findUnique({ where: { phone: data.phone } });
    if (exists) return res.status(409).json({ error: "Телефон уже зарегистрирован" });

    // реферал: кто пригласил (по коду из ссылки), + свой уникальный код
    let referredById: string | undefined;
    if (data.ref) {
      const inviter = await prisma.user.findUnique({ where: { referralCode: data.ref.toUpperCase() }, select: { id: true } });
      if (inviter) referredById = inviter.id;
    }
    const referralCode = await uniqueReferralCode();

    const user = await prisma.user.create({
      data: {
        phone: data.phone,
        name: data.name,
        passwordHash: hashPassword(data.password),
        role: data.role,
        city: data.city,
        address: data.address,
        lat: data.lat,
        lng: data.lng,
        referralCode,
        referredById,
        policyAcceptedAt: new Date(),
        cookProfile:
          data.role === "COOK"
            ? {
                create: {
                  kitchenName: data.kitchenName || data.name,
                  city: data.city,
                },
              }
            : undefined,
      },
      include: { cookProfile: true },
    });

    // сессия устройства (для лимита устройств и удалённого выхода)
    const sid = await createSession(user.id, req);
    const token = signToken({ userId: user.id, role: user.role as Role, sid });
    res.status(201).json({ token, user: sanitize(user) });
  })
);

const loginSchema = z.object({
  phone: z.string(),
  password: z.string(),
  // при достижении лимита устройств: id сессии, которую пользователь решил
  // отключить, чтобы освободить место и войти на новом устройстве
  logoutSessionId: z.string().optional(),
});

authRouter.post(
  "/login",
  rateLimit({ windowMs: 5 * 60_000, max: 15 }),
  asyncHandler(async (req, res) => {
    const { phone, password, logoutSessionId } = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({
      where: { phone },
      include: { cookProfile: true },
    });
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({ error: "Неверный телефон или пароль" });
    }

    // Пользователь подтвердил пароль → может отключить одно из своих устройств,
    // чтобы освободить слот под новое (это и есть UX «сначала выйдите на одном»)
    if (logoutSessionId) {
      await prisma.session.updateMany({
        where: { id: logoutSessionId, userId: user.id, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }

    // Лимит одновременных устройств (как Netflix/WhatsApp)
    if ((await countActiveSessions(user.id)) >= MAX_DEVICES) {
      const sessions = await activeSessions(user.id);
      return res.status(409).json({
        error: `Достигнут лимит устройств (${MAX_DEVICES}). Выйдите на одном из устройств, чтобы войти здесь.`,
        deviceLimit: true,
        maxDevices: MAX_DEVICES,
        sessions: sessions.map((s) => ({
          id: s.id,
          device: s.device || deviceLabel(s.userAgent),
          location: s.location || null,
          lastSeenAt: s.lastSeenAt,
        })),
      });
    }

    const sid = await createSession(user.id, req);
    const token = signToken({ userId: user.id, role: user.role as Role, sid });
    res.json({ token, user: sanitize(user) });
  })
);

authRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      include: { cookProfile: true },
    });
    if (!user) return res.status(404).json({ error: "Пользователь не найден" });
    res.json({ user: sanitize(user) });
  })
);

// ── Управление устройствами (сессиями) ──

// GET /api/auth/sessions — список активных устройств; текущее помечено флагом
authRouter.get(
  "/sessions",
  requireAuth,
  asyncHandler(async (req, res) => {
    const sessions = await activeSessions(req.user!.userId);
    res.json({
      maxDevices: MAX_DEVICES,
      sessions: sessions.map((s) => ({
        id: s.id,
        device: s.device || deviceLabel(s.userAgent),
        location: s.location || null,
        lastSeenAt: s.lastSeenAt,
        createdAt: s.createdAt,
        current: s.id === req.user!.sid,
      })),
    });
  })
);

// POST /api/auth/sessions/:id/revoke — выйти на конкретном устройстве
authRouter.post(
  "/sessions/:id/revoke",
  requireAuth,
  asyncHandler(async (req, res) => {
    await prisma.session.updateMany({
      where: { id: req.params.id, userId: req.user!.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    res.json({ ok: true });
  })
);

// POST /api/auth/sessions/logout-others — выйти на всех устройствах, КРОМЕ текущего
authRouter.post(
  "/sessions/logout-others",
  requireAuth,
  asyncHandler(async (req, res) => {
    const r = await prisma.session.updateMany({
      where: { userId: req.user!.userId, revokedAt: null, id: { not: req.user!.sid ?? "" } },
      data: { revokedAt: new Date() },
    });
    // старые токены без sid — тоже «другие устройства»: отзываем и их
    // (текущее устройство не задето — его токен несёт sid и живую сессию)
    await prisma.user.update({ where: { id: req.user!.userId }, data: { sessionsRevokedAt: new Date() } });
    res.json({ ok: true, revoked: r.count });
  })
);

// POST /api/auth/logout-all — выйти на ВСЕХ устройствах, включая текущее
authRouter.post(
  "/logout-all",
  requireAuth,
  asyncHandler(async (req, res) => {
    const r = await prisma.session.updateMany({
      where: { userId: req.user!.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    // отзываем и старые токены без sid (выданные до внедрения сессий)
    await prisma.user.update({ where: { id: req.user!.userId }, data: { sessionsRevokedAt: new Date() } });
    res.json({ ok: true, revoked: r.count });
  })
);

// POST /api/auth/logout — выход на ТЕКУЩЕМ устройстве (клиент затем чистит токен)
authRouter.post(
  "/logout",
  requireAuth,
  asyncHandler(async (req, res) => {
    if (req.user!.sid) {
      await prisma.session.updateMany({
        where: { id: req.user!.sid, userId: req.user!.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
    res.json({ ok: true });
  })
);

const updateMeSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().min(5).optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
});

// PUT /api/auth/me — редактирование профиля
authRouter.put(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const data = updateMeSchema.parse(req.body);
    if (data.phone) {
      const ex = await prisma.user.findUnique({ where: { phone: data.phone } });
      if (ex && ex.id !== req.user!.userId) {
        return res.status(409).json({ error: "Телефон уже занят" });
      }
    }
    // адрес в профиле проверяем геокодером так же, как адрес доставки в заказе:
    // «DSDDS» и прочий мусор не должен сохраняться как настоящий адрес
    if (data.address && data.address.trim()) {
      const city =
        data.city ??
        (await prisma.user.findUnique({ where: { id: req.user!.userId }, select: { city: true } }))?.city ??
        "";
      const verdict = await verifyAddressInCity(data.address.trim(), city);
      if (verdict === "format" || verdict === "notFound") {
        return res.status(400).json({ error: "Адрес не найден — уточните улицу и номер дома" });
      }
      if (verdict === "wrongCity") {
        return res.status(400).json({ error: `Адрес должен быть в городе ${city}` });
      }
      // "unavailable" (геокодер недоступен) — не блокируем сохранение
    }
    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data,
      include: { cookProfile: true },
    });
    res.json({ user: sanitize(user) });
  })
);

const verifySchema = z.object({
  videoUrl: z.string().min(1),
  docUrl: z.string().min(1),
  // отдельное согласие на биометрию (ст.11 152-ФЗ) — обязательно
  biometricConsent: z.boolean().optional(),
  // для поваров — безопасность пищи (обязательно)
  hygieneAccepted: z.boolean().optional(),
  kitchenPhotos: z.array(z.string()).max(4).optional(),
  foodSafetySigned: z.boolean().optional(),
});

// POST /api/auth/verify — проверка личности (видео + документ).
// Для ПОВАРОВ дополнительно требуется безопасность пищи: согласие с
// санитарными нормами, фото кухни и подписанное заявление о безопасности.
// Подключается к автоматическому KYC-провайдеру (Sumsub/Veriff и т.п.).
authRouter.post(
  "/verify",
  requireAuth,
  asyncHandler(async (req, res) => {
    const data = verifySchema.parse(req.body);
    const me = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!me) return res.status(404).json({ error: "Пользователь не найден" });

    // биометрия (селфи-видео + документ) обрабатывается только при ОТДЕЛЬНОМ
    // согласии (ст.11 152-ФЗ) — без него верификацию не принимаем
    if (!data.biometricConsent) {
      return res.status(400).json({ error: "Требуется согласие на обработку биометрических данных" });
    }

    // Повар обязан пройти проверку безопасности пищи
    if (me.role === "COOK") {
      if (!data.hygieneAccepted || !data.foodSafetySigned || !(data.kitchenPhotos && data.kitchenPhotos.length)) {
        return res.status(400).json({
          error: "Повар должен принять санитарные нормы, загрузить фото кухни и подписать заявление о безопасности",
        });
      }
      await prisma.cookProfile.update({
        where: { userId: me.id },
        data: {
          hygieneAccepted: true,
          kitchenPhotos: arrayToCsv(data.kitchenPhotos),
          foodSafetySignedAt: new Date(),
        },
      });
    }

    // Фиксируем материалы и ставим статус «на проверке».
    // Решение принимает ОСНОВАТЕЛЬ вручную (без авто-одобрения),
    // сверяя документ с указанным городом и тем, что он выдан в России.
    const user = await prisma.user.update({
      where: { id: me.id },
      data: {
        verificationVideoUrl: data.videoUrl,
        verificationDocUrl: data.docUrl,
        verificationStatus: "PENDING",
        isVerified: false,
        biometricConsentAt: new Date(),
      },
      include: { cookProfile: true },
    });

    res.json({ user: sanitize(user) });
  })
);

// ───────────────── восстановление пароля + 2FA основателя ─────────────────
// Генерация/доставка кодов вынесены в общий модуль lib/otp.ts.

// ── анти-спам сброса пароля: максимум 3 отправки кода в час НА АККАУНТ ──
// (in-memory: для пилота достаточно; сбрасывается при рестарте сервера)
const RESET_SENDS_PER_HOUR = 3;
const resetSendLog = new Map<string, number[]>(); // userId → отметки времени отправок
setInterval(() => {
  const cutoff = Date.now() - 3600_000;
  for (const [k, v] of resetSendLog) {
    const fresh = v.filter((t) => t > cutoff);
    if (fresh.length) resetSendLog.set(k, fresh); else resetSendLog.delete(k);
  }
}, 10 * 60_000).unref?.();

// POST /api/auth/forgot — запросить код сброса пароля (по телефону или e-mail)
authRouter.post(
  "/forgot",
  rateLimit({ windowMs: 15 * 60_000, max: 6 }),
  asyncHandler(async (req, res) => {
    const { identifier } = z.object({ identifier: z.string().min(3) }).parse(req.body);
    const user = await prisma.user.findFirst({ where: { OR: [{ phone: identifier }, { email: identifier }] } });
    if (user) {
      // лимит 3 отправки в час на аккаунт → на 4-й раз честный отказ с таймером
      const now = Date.now();
      const sends = (resetSendLog.get(user.id) ?? []).filter((ts) => ts > now - 3600_000);
      if (sends.length >= RESET_SENDS_PER_HOUR) {
        const retryAfterSec = Math.ceil((sends[0] + 3600_000 - now) / 1000);
        res.setHeader("Retry-After", String(retryAfterSec));
        return res.status(429).json({
          error: "Лимит запросов кода исчерпан (3 в час) — попробуйте позже",
          retryAfterSec,
        });
      }

      // ВАЖНО: если действующий код ещё жив — отправляем ЕГО ЖЕ, а не новый.
      // Раньше каждый клик генерировал новый код и затирал старый: код из первого
      // письма мгновенно становился «неверным». Теперь любой из полученных
      // писем работает все 15 минут.
      let code = user.resetCode;
      const stillValid = code && user.resetCodeExp && user.resetCodeExp.getTime() > now + 2 * 60_000;
      if (!stillValid) {
        code = genCode();
        await prisma.user.update({ where: { id: user.id }, data: { resetCode: code, resetCodeExp: new Date(now + 15 * 60000) } });
      }

      // язык письма — как выбран у пользователя в приложении (заголовок X-Lang)
      const lang = pickLang(req.header("X-Lang") || req.header("Accept-Language"));
      const delivered = await deliver(user.email || user.phone, code!, "reset", lang);
      // в production не притворяемся, что код отправлен, если провайдер не сработал —
      // иначе пользователь бесконечно ждёт письмо. Конфигурацию наружу не раскрываем.
      if (!delivered && process.env.NODE_ENV === "production") {
        return res.status(503).json({ error: "Сервис отправки кодов временно недоступен — попробуйте позже" });
      }
      sends.push(now);
      resetSendLog.set(user.id, sends);
      return res.json({ sent: true, to: mask(user.email || user.phone), expiresInMin: 15 });
    }
    // не раскрываем, существует ли аккаунт
    res.json({ sent: true, expiresInMin: 15 });
  })
);

// POST /api/auth/reset — установить новый пароль по коду
authRouter.post(
  "/reset",
  rateLimit({ windowMs: 15 * 60_000, max: 12 }),
  asyncHandler(async (req, res) => {
    const { identifier, code, password } = z
      .object({ identifier: z.string(), code: z.string(), password: z.string().min(4) })
      .parse(req.body);
    const user = await prisma.user.findFirst({ where: { OR: [{ phone: identifier }, { email: identifier }] } });
    if (!user || !user.resetCode || user.resetCode !== code || !user.resetCodeExp || user.resetCodeExp < new Date()) {
      // неудачная попытка по конкретному аккаунту: после порога гасим код,
      // иначе 6-значный код перебирается с меняющихся IP
      if (user && registerFailedAttempt(user.id, "reset")) {
        await prisma.user.update({ where: { id: user.id }, data: { resetCode: null, resetCodeExp: null } });
      }
      return res.status(400).json({ error: "Неверный или просроченный код" });
    }
    clearAttempts(user.id, "reset");
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hashPassword(password),
        resetCode: null,
        resetCodeExp: null,
        // безопасность: смена пароля завершает ВСЕ сессии (в т.ч. старые токены
        // без sid) — украденный вход перестаёт работать сразу
        sessionsRevokedAt: new Date(),
      },
    });
    await prisma.session.updateMany({ where: { userId: user.id, revokedAt: null }, data: { revokedAt: new Date() } });
    res.json({ ok: true });
  })
);

// POST /api/auth/founder/request-2fa — отправить код для входа в панель основателя
authRouter.post(
  "/founder/request-2fa",
  rateLimit({ windowMs: 10 * 60_000, max: 5 }),
  requireAuth,
  asyncHandler(async (req, res) => {
    const me = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!me || !me.isFounder) return res.status(403).json({ error: "Доступ только для основателя" });
    const code = genCode();
    await prisma.user.update({ where: { id: me.id }, data: { twoFACode: code, twoFAExp: new Date(Date.now() + 10 * 60000) } });
    // язык письма — как выбран у основателя в приложении (заголовок X-Lang)
    const lang = pickLang(req.header("X-Lang") || req.header("Accept-Language"));
    const delivered = await deliver(me.email || me.phone, code, "founder2fa", lang);
    // в production «не доставлено» = основатель заперт снаружи без диагностики.
    // Говорим прямо (это его собственный сервер — SMTP_* не настроен/недоступен).
    if (!delivered && process.env.NODE_ENV === "production") {
      return res.status(503).json({ error: "Доставка кода не настроена — проверьте SMTP_* в backend/.env на сервере" });
    }
    res.json({ sent: true, to: mask(me.email || me.phone) });
  })
);

// POST /api/auth/founder/verify-2fa — подтвердить код → открыть сессию панели на 2 часа
authRouter.post(
  "/founder/verify-2fa",
  rateLimit({ windowMs: 10 * 60_000, max: 10 }),
  requireAuth,
  asyncHandler(async (req, res) => {
    const { code } = z.object({ code: z.string() }).parse(req.body);
    const me = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!me || !me.isFounder) return res.status(403).json({ error: "Доступ только для основателя" });
    if (!me.twoFACode || me.twoFACode !== code || !me.twoFAExp || me.twoFAExp < new Date()) {
      // тот же порог, что и при сбросе пароля: перебор второго фактора
      // не должен быть возможен просто со смены IP
      if (registerFailedAttempt(me.id, "founder2fa")) {
        await prisma.user.update({ where: { id: me.id }, data: { twoFACode: null, twoFAExp: null } });
      }
      return res.status(400).json({ error: "Неверный или просроченный код" });
    }
    clearAttempts(me.id, "founder2fa");
    await prisma.user.update({ where: { id: me.id }, data: { founderSessionUntil: new Date(Date.now() + 2 * 3600000), twoFACode: null, twoFAExp: null } });
    res.json({ ok: true });
  })
);

function sanitize(user: any) {
  // никогда не отдаём наружу: хеш пароля и одноразовые коды (сброс/2FA)
  const { passwordHash, resetCode, resetCodeExp, twoFACode, twoFAExp, ...rest } = user;
  if (rest.cookProfile) {
    rest.cookProfile = { ...rest.cookProfile, cuisine: csvToArray(rest.cookProfile.cuisine) };
  }
  return rest;
}
