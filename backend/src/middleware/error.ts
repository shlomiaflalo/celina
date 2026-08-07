import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

/** Оборачивает async-обработчики, чтобы ошибки попадали в errorHandler. */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof ZodError) {
    return res.status(400).json({ error: "Ошибка валидации", details: err.issues });
  }
  // Клиентские ошибки (напр. битый JSON тела → body-parser ставит err.status=400)
  // не должны маскироваться под 500 и засорять логи трейсами (иначе клиент может
  // спамить лог полным стеком, отправляя мусор в теле запроса).
  const e = err as { status?: number; statusCode?: number };
  const code =
    typeof e?.status === "number" ? e.status
    : typeof e?.statusCode === "number" ? e.statusCode
    : 500;
  if (code >= 500) console.error(err);
  res.status(code).json({ error: code >= 500 ? "Внутренняя ошибка сервера" : "Некорректный запрос" });
}
