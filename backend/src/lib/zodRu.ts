import { z } from "zod";

/**
 * Русскоязычные сообщения валидации Zod (базовый язык приложения — русский).
 * Раньше поле `details[].message` уходило пользователю на английском
 * («Number must be greater than 0», «Expected integer, received float»),
 * хотя приложение русскоязычное. Устанавливаем один раз при старте сервера.
 * (EN-локализация — вторична; верхнеуровневое «Ошибка валидации» переводится
 * middleware localizeErrors.)
 */
const ruErrorMap: z.ZodErrorMap = (issue, ctx) => {
  switch (issue.code) {
    case z.ZodIssueCode.invalid_type:
      if (issue.received === "undefined" || issue.received === "null") return { message: "Обязательное поле" };
      if (issue.expected === "number") return { message: "Ожидается число" };
      if (issue.expected === "string") return { message: "Ожидается текст" };
      if (issue.expected === "boolean") return { message: "Ожидается «да/нет»" };
      return { message: "Неверный тип значения" };
    case z.ZodIssueCode.too_small:
      if (issue.type === "number")
        return { message: issue.inclusive ? `Число должно быть не меньше ${issue.minimum}` : `Число должно быть больше ${issue.minimum}` };
      if (issue.type === "string")
        return { message: issue.minimum === 1 ? "Заполните поле" : `Минимум ${issue.minimum} символов` };
      if (issue.type === "array") return { message: `Добавьте хотя бы ${issue.minimum}` };
      return { message: "Значение слишком маленькое" };
    case z.ZodIssueCode.too_big:
      if (issue.type === "number") return { message: `Число должно быть не больше ${issue.maximum}` };
      if (issue.type === "string") return { message: `Максимум ${issue.maximum} символов` };
      if (issue.type === "array") return { message: `Не больше ${issue.maximum}` };
      return { message: "Значение слишком большое" };
    case z.ZodIssueCode.invalid_enum_value:
      return { message: "Недопустимое значение" };
    case z.ZodIssueCode.invalid_string:
      if (issue.validation === "email") return { message: "Неверный адрес e-mail" };
      if (issue.validation === "datetime") return { message: "Неверная дата/время" };
      return { message: "Неверный формат" };
    default:
      return { message: ctx.defaultError };
  }
};

export function installZodRu(): void {
  z.setErrorMap(ruErrorMap);
}
