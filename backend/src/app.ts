import express from "express";
import cors from "cors";
import compression from "compression";
import path from "node:path";
import { readFileSync, existsSync } from "node:fs";
import { prisma } from "./prisma.js";
import { authRouter } from "./routes/auth.routes.js";
import { cooksRouter } from "./routes/cooks.routes.js";
import { dishesRouter } from "./routes/dishes.routes.js";
import { ordersRouter } from "./routes/orders.routes.js";
import { reviewsRouter } from "./routes/reviews.routes.js";
import { uploadsRouter } from "./routes/uploads.routes.js";
import { statsRouter } from "./routes/stats.routes.js";
import { paymentsRouter } from "./routes/payments.routes.js";
import { adminRouter } from "./routes/admin.routes.js";
import { eventsRouter } from "./routes/events.routes.js";
import { billingRouter } from "./routes/billing.routes.js";
import { gatheringsRouter } from "./routes/gatherings.routes.js";
import { referralsRouter } from "./routes/referrals.routes.js";
import { waitlistRouter } from "./routes/waitlist.routes.js";
import { errorHandler } from "./middleware/error.js";
import { localizeErrors } from "./middleware/i18n.js";
import { installZodRu } from "./lib/zodRu.js";
import { z } from "zod";
import { rateLimit } from "./middleware/rateLimit.js";
import { sendMail, mailConfigured, contactEmailHtml } from "./lib/mailer.js";

// Подставляет управляемые OG/Twitter-теги в готовый index.html (заменяя дефолтные,
// чтобы не было дублей). Меняется только <head> — разметка/дизайн не затрагиваются.
function injectOg(html: string, m: { title: string; desc: string; img: string; url: string }): string {
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const cleaned = html
    .replace(/<title>[\s\S]*?<\/title>/i, "")
    .replace(/<meta[^>]+(?:property|name)=["'](?:og:[^"']+|twitter:[^"']+|description)["'][^>]*>/gi, "")
    // canonical + hreflang в шаблоне указывают на главную; на динамической странице
    // это делало её «дублем» главной — Яндекс/Google не индексировали. Убираем и
    // ставим правильные (на сам URL страницы).
    .replace(/<link[^>]+rel=["']canonical["'][^>]*>/gi, "")
    .replace(/<link[^>]+rel=["']alternate["'][^>]*hreflang=[^>]*>/gi, "");
  const tags =
    `<title>${esc(m.title)}</title>` +
    `<meta name="description" content="${esc(m.desc)}">` +
    `<link rel="canonical" href="${esc(m.url)}">` +
    `<link rel="alternate" hreflang="ru-RU" href="${esc(m.url)}">` +
    `<link rel="alternate" hreflang="x-default" href="${esc(m.url)}">` +
    `<meta property="og:type" content="article">` +
    `<meta property="og:site_name" content="Celina">` +
    `<meta property="og:title" content="${esc(m.title)}">` +
    `<meta property="og:description" content="${esc(m.desc)}">` +
    `<meta property="og:image" content="${esc(m.img)}">` +
    `<meta property="og:url" content="${esc(m.url)}">` +
    `<meta property="og:locale" content="ru_RU">` +
    `<meta name="twitter:card" content="summary_large_image">` +
    `<meta name="twitter:title" content="${esc(m.title)}">` +
    `<meta name="twitter:description" content="${esc(m.desc)}">` +
    `<meta name="twitter:image" content="${esc(m.img)}">`;
  return cleaned.replace(/<\/head>/i, tags + "</head>");
}

// Заголовки безопасности (без зависимостей — точный контроль).
// CSP допускает инлайн-скрипты (нужны для JSON-LD/SSG/Метрики) — это осознанный
// компромисс; основная защита от XSS — экранирование React и esc() в OG-вставке.
function securityHeaders(req: import("express").Request, res: import("express").Response, next: import("express").NextFunction) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "geolocation=(self), camera=(self), microphone=(self), payment=()");
  res.removeHeader("X-Powered-By");
  // HSTS — только по HTTPS (за прокси смотрим x-forwarded-proto)
  if (req.secure || req.headers["x-forwarded-proto"] === "https") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  res.setHeader(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://mc.yandex.ru",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https:",
      "media-src 'self' https: blob:",
      "font-src 'self' data: https://fonts.gstatic.com",
      "connect-src 'self' https: wss:",
      "frame-src https://mc.yandex.ru",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
    ].join("; ")
  );
  next();
}

export function createApp() {
  installZodRu(); // русские сообщения валидации Zod (details[].message)
  const app = express();
  app.disable("x-powered-by");
  // trust proxy = сколько ДОВЕРЕННЫХ прокси перед нами. По умолчанию 0: в
  // Docker-развёртывании контейнер публикуется напрямую (80:4000, без nginx),
  // и клиент сам управляет X-Forwarded-For — доверять ему нельзя, иначе
  // rate-limit обходится сменой XFF (брутфорс кода сброса). За nginx (ручной
  // деплой) поставьте TRUST_PROXY=1, чтобы req.ip брался из XFF от nginx.
  app.set("trust proxy", Number(process.env.TRUST_PROXY ?? 0));
  // gzip/deflate для текстовых ответов (HTML/JS/CSS/JSON). Бандл ~580 КБ сжимается
  // до ~150 КБ — заметный выигрыш LCP на мобильных/медленных каналах.
  app.use(compression());
  app.use(securityHeaders);
  // CORS: токен в заголовке Authorization (не cookie) → CSRF не актуален; всё же
  // ограничиваем источники списком. Запросы без Origin (same-origin, мобильные, curl) — ок.
  const allowedOrigins = [process.env.SITE_URL, "http://localhost:5173", "http://localhost:4173"].filter(Boolean) as string[];
  app.use(cors({
    origin(origin, cb) {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      return cb(null, false);
    },
  }));
  app.use(express.json({ limit: "2mb" }));

  // перевод сообщений об ошибках по языку клиента (X-Lang)
  app.use(localizeErrors);

  // статика загруженных фото
  app.use("/uploads", express.static("uploads"));

  app.get("/api/health", (_req, res) => res.json({ ok: true, service: "celina" }));

  // Маяк JS-ошибок с устройств пользователей (инлайн-скрипт в index.html).
  // Старые iPhone/Android падают молча (напр. SyntaxError бандла) — без этого
  // эндпоинта такие устройства невозможно диагностировать. Пишем в stdout →
  // docker logs. Тело уже ограничено 2mb выше; дополнительно режем до 800 байт.
  app.post("/api/client-log", (req, res) => {
    try {
      const s = JSON.stringify(req.body).slice(0, 800);
      console.error(`[client-error] ${req.ip} ${s}`);
    } catch { /* не мешаем пользователю из-за телеметрии */ }
    res.status(204).end();
  });

  // Форма «Связаться с нами»: письмо уходит НА СЕРВЕРЕ на support-адрес.
  // Раньше фронт открывал mailto: — без почтового клиента текст пользователя
  // просто терялся. Теперь отправляем сами; Reply-To = e-mail отправителя.
  const contactSchema = z.object({
    name: z.string().min(1).max(120),
    email: z.string().email().max(160),
    message: z.string().min(1).max(4000),
  });
  const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || process.env.MAIL_FROM_ADDR || "celinarussia.support@gmail.com";
  app.post("/api/contact", rateLimit({ windowMs: 15 * 60_000, max: 5 }), async (req, res) => {
    const parsed = contactSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Заполните имя, корректный e-mail и сообщение" });
    const { name, email, message } = parsed.data;
    if (!mailConfigured()) {
      // почта не настроена → всё равно фиксируем обращение в логах, не теряем текст
      console.log(`[contact] ${name} <${email}>: ${message.slice(0, 500)}`);
      if (process.env.NODE_ENV === "production") {
        return res.status(503).json({ error: "Отправка временно недоступна — напишите нам на почту напрямую" });
      }
      return res.json({ ok: true });
    }
    const ok = await sendMail(SUPPORT_EMAIL, `Celina — сообщение с сайта от ${name}`, contactEmailHtml({ name, email, message }), { replyTo: email });
    if (!ok) return res.status(503).json({ error: "Не удалось отправить — попробуйте позже или напишите на почту напрямую" });
    res.json({ ok: true });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/cooks", cooksRouter);
  app.use("/api/dishes", dishesRouter);
  app.use("/api/orders", ordersRouter);
  app.use("/api/reviews", reviewsRouter);
  app.use("/api/uploads", uploadsRouter);
  app.use("/api/stats", statsRouter);
  app.use("/api/payments", paymentsRouter);
  app.use("/api/admin", adminRouter);
  app.use("/api/events", eventsRouter);
  app.use("/api/billing", billingRouter);
  app.use("/api/gatherings", gatheringsRouter);
  app.use("/api/referrals", referralsRouter);
  app.use("/api/waitlist", waitlistRouter);

  // в продакшене тот же сервер отдаёт собранный фронтенд (единый origin → относительный /api работает).
  // FRONTEND_DIST указывает на каталог сборки (vite-react-ssg → frontend/dist).
  const FRONTEND_DIST = process.env.FRONTEND_DIST;
  if (FRONTEND_DIST) {
    const dist = path.resolve(FRONTEND_DIST);
    // Хешированные бандлы (/assets/app-XXXX.js|css) неизменяемы → кэшируем на год
    // (иначе max-age=0 заставляет ревалидировать каждый повторный визит).
    app.use("/assets", express.static(path.join(dist, "assets"), { immutable: true, maxAge: "365d" }));
    // Картинки не хешируются, но меняются редко → умеренный кэш.
    app.use("/images", express.static(path.join(dist, "images"), { maxAge: "7d" }));

    // Чистые URL (без расширения) отдаём как соответствующий пререндер <path>.html
    // ДО express.static. Иначе для /blog и /eda/moskva static видит одноимённый
    // каталог (посты / категории) и делает 301 на /blog/ , /eda/moskva/ , где нет
    // index.html → отдаётся SPA-заглушка (дубль главной, canonical=/). Так теряется
    // индексируемость двухуровневых SEO-страниц. Здесь отдаём именно их пререндер.
    app.get(/^\/(?!api\/|uploads\/)[^.]*$/, (req, res, next) => {
      const rel = req.path.replace(/\/+$/, ""); // /blog/ → /blog
      if (!rel) return next(); // корень → общий static (index.html)
      const file = path.resolve(dist, "." + rel + ".html");
      if (!file.startsWith(dist + path.sep)) return next(); // защита от обхода каталога
      if (!existsSync(file)) return next();
      res.sendFile(file);
    });

    app.use(express.static(dist, { extensions: ["html"], maxAge: 0 }));

    // Динамические OG-теги для застолий: они создаются после сборки, поэтому
    // не пререндерятся. Краулеры соцсетей (Telegram/VK/WhatsApp) не исполняют
    // JS → без серверной подстановки превью пустое. Здесь отдаём index.html
    // с подставленными og:title/description/image (фото застолья) → красивая
    // карточка при шаринге. Дизайн страницы не меняется (только <head>).
    app.get("/gatherings/:id", async (req, res, next) => {
      const indexPath = path.resolve(FRONTEND_DIST, "index.html");
      try {
        const g = await prisma.gathering.findUnique({
          where: { id: req.params.id },
          include: { host: { select: { name: true } } },
        });
        // несуществующее застолье → настоящий 404 (иначе soft-404: краулер
        // индексирует мёртвый URL как дубль). SPA сам покажет страницу 404.
        if (!g) return res.status(404).sendFile(indexPath);
        const base = process.env.SITE_URL || `${req.protocol}://${req.get("host")}`;
        const url = `${base}/gatherings/${g.id}`;
        const img = g.coverUrl
          ? (g.coverUrl.startsWith("http") ? g.coverUrl : base + g.coverUrl)
          : `${base}/images/red-square.jpg`;
        const dateStr = new Date(g.startsAt).toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
        const title = `${g.title} — застолье${g.city ? ` · ${g.city}` : ""} | Celina`;
        const desc = (g.description ||
          `Соседское застолье «${g.title}»${g.city ? ` · ${g.city}` : ""}, ${dateStr}. Присоединяйтесь на Celina — соседи кормят соседей.`
        ).slice(0, 200);
        const html = injectOg(readFileSync(indexPath, "utf8"), { title, desc, img, url });
        res.set("Content-Type", "text/html; charset=utf-8").send(html);
      } catch {
        res.sendFile(indexPath);
      }
    });

    // Динамические OG-теги для страницы повара (созданные ПОСЛЕ сборки не
    // пререндерятся → без этого соцпревью пустое). Пререндеренные повара из
    // снимка обслуживаются express.static выше — туда мы не доходим.
    app.get("/cooks/:id", async (req, res) => {
      const indexPath = path.resolve(FRONTEND_DIST, "index.html");
      try {
        const c = await prisma.cookProfile.findUnique({
          where: { id: req.params.id },
          include: { dishes: { where: { isAvailable: true }, take: 5 } },
        });
        if (!c) return res.status(404).sendFile(indexPath); // мёртвый URL → настоящий 404
        const base = process.env.SITE_URL || `${req.protocol}://${req.get("host")}`;
        const url = `${base}/cooks/${c.id}`;
        const photo = c.dishes.find((d) => d.photoUrl)?.photoUrl ?? null;
        const img = photo ? (photo.startsWith("http") ? photo : base + photo) : `${base}/images/red-square.jpg`;
        const title = `${c.kitchenName} — домашняя еда${c.city ? ` · ${c.city}` : ""} | Celina`;
        const desc = ((c.bio && c.bio.trim()) ||
          `Закажите домашнюю еду у повара «${c.kitchenName}»${c.city ? ` в ${c.city}` : ""} на Celina — соседи кормят соседей.`
        ).slice(0, 200);
        const html = injectOg(readFileSync(indexPath, "utf8"), { title, desc, img, url });
        res.set("Content-Type", "text/html; charset=utf-8").send(html);
      } catch {
        res.sendFile(indexPath);
      }
    });

    // SPA-фолбэк для динамических маршрутов (кроме /api и /uploads).
    // /blyudo, /eda, /blog пререндерятся исчерпывающе из снимка: промах = мёртвый
    // URL → отдаём 404 (SPA сам покажет страницу 404), а не 200 с контентом главной
    // (soft-404 → краулер плодит дубли главной по несуществующим slug).
    app.get(/^\/(?!api\/|uploads\/).*/, (req, res) => {
      const prerendered = /^\/(blyudo|eda|blog)\//.test(req.path);
      res.status(prerendered ? 404 : 200).sendFile(path.resolve(FRONTEND_DIST, "index.html"));
    });
  }

  app.use(errorHandler);
  return app;
}
