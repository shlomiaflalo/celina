import type { Request, Response, NextFunction } from "express";
import { pickLang, translateError } from "../i18n/errorMessages.js";

/**
 * Если клиент прислал X-Lang: en — подменяем русские сообщения об ошибках
 * (поле `error` и тексты в `details`) на английские. Патчим res.json один раз
 * на запрос, поэтому работает для всех роутов и для errorHandler.
 */
export function localizeErrors(req: Request, res: Response, next: NextFunction) {
  const lang = pickLang(req.header("X-Lang") || req.header("Accept-Language"));
  if (lang === "ru") return next();

  const originalJson = res.json.bind(res);
  res.json = (body: unknown) => {
    if (body && typeof body === "object") {
      const b = body as Record<string, unknown>;
      if (typeof b.error === "string") b.error = translateError(b.error, lang);
      if (Array.isArray(b.details)) {
        b.details = b.details.map((d) =>
          d && typeof d === "object" && typeof (d as { message?: unknown }).message === "string"
            ? { ...d, message: translateError((d as { message: string }).message, lang) }
            : d
        );
      }
    }
    return originalJson(body);
  };
  next();
}
