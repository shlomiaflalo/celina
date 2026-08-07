import { Router } from "express";
import multer from "multer";
import { randomBytes } from "crypto";
import { extname, basename, join, resolve, sep } from "path";
import { mkdirSync, createReadStream, statSync } from "fs";
import { requireAuth, isSessionActive } from "../middleware/auth.js";
import { rateLimit } from "../middleware/rateLimit.js";
import { verifyToken } from "../lib/auth.js";
import { prisma } from "../prisma.js";

const UPLOAD_DIR = "uploads";
mkdirSync(UPLOAD_DIR, { recursive: true });

// Документы верификации (паспорт, селфи-видео) — ПЕРСОНАЛЬНЫЕ данные (ФЗ-152).
// Храним их ВНЕ публичной статики (не в uploads/, которую отдаёт express.static),
// и выдаём только владельцу или основателю через авторизованный маршрут ниже.
const KYC_DIR = "uploads-private";
mkdirSync(KYC_DIR, { recursive: true });

// Расширение файла берём ИЗ ПРОВЕРЕННОГО mime-типа, а не из имени, которое
// прислал клиент. Иначе можно было загрузить файл с mimetype=image/png, но
// именем «x.html» — он лёг бы в uploads/ и express.static отдал бы его как
// text/html (CSP разрешает инлайн-скрипты) → хранимая XSS на своём же домене.
const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": ".jpg", "image/jpg": ".jpg", "image/png": ".png", "image/webp": ".webp",
  "image/gif": ".gif", "video/mp4": ".mp4", "video/webm": ".webm", "video/quicktime": ".mov",
  "video/ogg": ".ogg", "application/pdf": ".pdf",
};

/** Безопасное расширение по mime-типу; неизвестный тип → .bin (не исполняется). */
function safeExt(mimetype: string): string {
  return EXT_BY_MIME[mimetype.toLowerCase()] ?? ".bin";
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const name = randomBytes(8).toString("hex") + safeExt(file.mimetype);
    cb(null, name);
  },
});

// каждый пользователь — в своей подпапке: владелец файла читается прямо из пути,
// поэтому доступ работает и для предпросмотра ещё не отправленного документа
const kycStorage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const uid = req.user?.userId;
    if (!uid) return cb(new Error("unauthorized"), "");
    const dir = join(KYC_DIR, uid);
    mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const name = randomBytes(16).toString("hex") + safeExt(file.mimetype);
    cb(null, name);
  },
});

// Разрешаем фото блюд, видео блюд/верификации и документы (паспорт и т.п.)
const ALLOWED = /^(image\/(jpe?g|png|webp|gif)|video\/(mp4|webm|quicktime|ogg)|application\/pdf)$/;

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  if (ALLOWED.test(file.mimetype)) cb(null, true);
  else cb(new Error("Допустимы изображения, видео (mp4/webm) или PDF"));
};

const upload = multer({ storage, limits: { fileSize: 60 * 1024 * 1024 }, fileFilter });
const kycUpload = multer({ storage: kycStorage, limits: { fileSize: 60 * 1024 * 1024 }, fileFilter });

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp",
  ".gif": "image/gif", ".mp4": "video/mp4", ".webm": "video/webm", ".mov": "video/quicktime",
  ".ogg": "video/ogg", ".pdf": "application/pdf",
};

export const uploadsRouter = Router();

// POST /api/uploads — загрузка файла (фото/видео блюда, видео и документ для верификации)
// Доступно любому авторизованному пользователю.
uploadsRouter.post("/", rateLimit({ windowMs: 15 * 60_000, max: 50 }), requireAuth, upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Файл не получен" });
  res.status(201).json({
    url: `/uploads/${req.file.filename}`,
    mime: req.file.mimetype,
    kind: req.file.mimetype.startsWith("video/")
      ? "video"
      : req.file.mimetype === "application/pdf"
      ? "doc"
      : "image",
  });
});

// POST /api/uploads/kyc — загрузка ДОКУМЕНТА ВЕРИФИКАЦИИ (паспорт/селфи-видео).
// Файл кладётся в приватную папку; ссылка ведёт на авторизованный маршрут ниже.
uploadsRouter.post("/kyc", rateLimit({ windowMs: 15 * 60_000, max: 30 }), requireAuth, kycUpload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Файл не получен" });
  res.status(201).json({
    url: `/api/uploads/kyc/${req.user!.userId}/${req.file.filename}`,
    mime: req.file.mimetype,
    kind: req.file.mimetype.startsWith("video/") ? "video" : req.file.mimetype === "application/pdf" ? "doc" : "image",
  });
});

// GET /api/uploads/kyc/:uid/:file?token=JWT — отдаёт приватный документ верификации.
// <img>/<video> не умеют слать заголовок Authorization, поэтому JWT — в query
// (тот же приём, что и SSE-поток). Доступ: владелец файла ИЛИ основатель.
uploadsRouter.get("/kyc/:uid/:file", rateLimit({ windowMs: 60_000, max: 60 }), async (req, res) => {
  let requesterId: string;
  try {
    // токен либо в Authorization (fetch → blob, не светится в истории браузера),
    // либо в query (для <img>/<video>, которые не умеют слать заголовки)
    const header = req.header("Authorization");
    const raw = header?.startsWith("Bearer ") ? header.slice(7) : String(req.query.token || "");
    const payload = verifyToken(raw);
    // маршрут проверяет токен сам, поэтому отзыв сессии проверяем здесь явно —
    // иначе «выйти на всех устройствах» и смена пароля не закрывают доступ
    // к паспортам по ранее выданной ссылке
    if (!(await isSessionActive(payload))) return res.status(401).end();
    requesterId = payload.userId;
  } catch {
    return res.status(401).end();
  }

  // Защита от обхода пути: оба сегмента должны быть «плоскими» именами.
  // ВАЖНО: одного basename() мало — basename(".") === ".", и такой сегмент
  // схлопывал путь обратно в КАТАЛОГ пользователя. Дальше createReadStream
  // открывал каталог, ронял EISDIR мимо обработчика ошибок Express и убивал
  // процесс целиком. Поэтому точечные сегменты отбрасываем явно.
  const uid = basename(req.params.uid);
  const file = basename(req.params.file);
  if (uid !== req.params.uid || file !== req.params.file) return res.status(400).end();
  if (uid === "." || uid === ".." || file === "." || file === "..") return res.status(400).end();
  // имена файлов мы генерируем сами: 32 hex-символа + расширение
  if (!/^[0-9a-f]{32}\.[a-z0-9]{2,5}$/.test(file)) return res.status(400).end();

  // доступ: сам владелец папки или основатель
  if (requesterId !== uid) {
    const me = await prisma.user.findUnique({
      where: { id: requesterId },
      select: { isFounder: true, founderSessionUntil: true },
    });
    if (!me?.isFounder) return res.status(403).end();
    // чужие документы верификации — только при активной 2FA-сессии основателя,
    // как и остальная панель (requireFounder). Иначе второй фактор не защищал
    // как раз самые чувствительные данные в сервисе.
    if (!me.founderSessionUntil || me.founderSessionUntil < new Date()) {
      return res.status(403).json({ error: "Требуется подтверждение входа в панель", twoFARequired: true });
    }
  }

  const abs = resolve(join(KYC_DIR, uid, file));
  if (!abs.startsWith(resolve(KYC_DIR) + sep)) return res.status(404).end();
  // именно ФАЙЛ, а не каталог: см. комментарий про EISDIR выше
  const st = statSync(abs, { throwIfNoEntry: false });
  if (!st?.isFile()) return res.status(404).end();

  res.setHeader("Content-Type", CONTENT_TYPES[extname(file).toLowerCase()] || "application/octet-stream");
  res.setHeader("Cache-Control", "private, no-store");
  // ошибка потока не всплывает в errorHandler Express — без своего обработчика
  // она становится uncaughtException и завершает процесс
  const stream = createReadStream(abs);
  stream.on("error", () => { if (!res.headersSent) res.status(500).end(); else res.destroy(); });
  stream.pipe(res);
});

export default uploadsRouter;
