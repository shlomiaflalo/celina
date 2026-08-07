import type { Request, Response, NextFunction } from "express";

/**
 * Лёгкий in-memory rate-limiter (без внешних зависимостей) против перебора:
 * ограничивает число запросов с одного IP к конкретному маршруту в окне времени.
 * Для прода/кластера заменить на Redis-хранилище.
 */
const hits = new Map<string, { count: number; reset: number }>();

// периодическая очистка устаревших записей
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of hits) if (now > v.reset) hits.delete(k);
}, 5 * 60_000).unref?.();

export function rateLimit({ windowMs, max }: { windowMs: number; max: number }) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    // Ключ строим по НОРМАЛИЗОВАННОМУ пути. Express матчит маршруты без учёта
    // регистра и лишнего слэша: /api/auth/login, /API/AUTH/Login и
    // /api/auth/login/ — один и тот же обработчик, но раньше это давало три
    // РАЗНЫХ счётчика, то есть лимит подбора пароля умножался на число
    // вариантов написания. Приводим к нижнему регистру и срезаем хвостовой слэш.
    const path = req.path.toLowerCase().replace(/\/+$/, "") || "/";
    const key = `${ip}:${req.method}:${path}`;
    const now = Date.now();
    const e = hits.get(key);
    if (!e || now > e.reset) {
      hits.set(key, { count: 1, reset: now + windowMs });
      return next();
    }
    e.count += 1;
    if (e.count > max) {
      const retry = Math.ceil((e.reset - now) / 1000);
      res.setHeader("Retry-After", String(retry));
      // retryAfterSec — чтобы фронтенд показал обратный отсчёт (как в сбросе пароля)
      return res.status(429).json({ error: "Слишком много попыток. Попробуйте позже.", retryAfterSec: retry });
    }
    next();
  };
}
