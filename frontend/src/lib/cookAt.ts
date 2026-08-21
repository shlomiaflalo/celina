/**
 * «Готовлю в четверг к 18:00» — человекочитаемое время готовки партии.
 *
 * Зачем это вообще есть. Домашний повар не стоит у плиты весь день: он варит
 * кастрюлю один раз. Указав время, он собирает предзаказы и знает, сколько
 * порций готовить, а покупатель видит главное, чего боятся при заказе у
 * частника: еду приготовят специально к этому часу, а не достанут из
 * холодильника. Это же снимает и вторую проблему — повар не выбрасывает лишнее.
 */

export type CookAtState =
  | { kind: "none" }                                   // повар готовит по заказу
  | { kind: "soon"; text: string }                     // готовится прямо сейчас / скоро
  | { kind: "scheduled"; text: string }                // будет готово в такой-то день
  | { kind: "passed"; text: string };                  // время уже прошло

const RU_WEEKDAY_AT = [
  "в воскресенье", "в понедельник", "во вторник", "в среду",
  "в четверг", "в пятницу", "в субботу",
];

function hhmm(d: Date): string {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/**
 * Разбор времени готовки в готовую подпись.
 * `now` параметром — чтобы это можно было проверить тестом, не подменяя часы.
 */
export function describeCookAt(
  cookAt: string | null | undefined,
  lang: "ru" | "en",
  now: Date = new Date()
): CookAtState {
  if (!cookAt) return { kind: "none" };
  const d = new Date(cookAt);
  if (Number.isNaN(d.getTime())) return { kind: "none" };

  const diffMs = d.getTime() - now.getTime();
  const time = hhmm(d);

  // уже прошло. «Уже приготовлено» честно только в тот же день: партию, сваренную
  // вчера или неделю назад, нельзя выдавать за свежую — это ровно тот обман, ради
  // защиты от которого поле и вводилось. Со сменой суток подпись просто исчезает,
  // и блюдо снова выглядит как «готовлю под заказ», пока повар не назначит новую партию.
  if (diffMs < 0) {
    if (!sameDay(d, now)) return { kind: "none" };
    return { kind: "passed", text: lang === "en" ? "Cooked today" : "Уже приготовлено" };
  }

  // меньше двух часов — «готовится сейчас», самое сильное состояние
  if (diffMs < 2 * 3600_000) {
    return {
      kind: "soon",
      text: lang === "en" ? `Cooking now, ready by ${time}` : `Готовится сейчас, будет к ${time}`,
    };
  }

  const tomorrow = new Date(now.getTime() + 24 * 3600_000);
  if (sameDay(d, now)) {
    return {
      kind: "scheduled",
      text: lang === "en" ? `Cooking today by ${time}` : `Готовлю сегодня к ${time}`,
    };
  }
  if (sameDay(d, tomorrow)) {
    return {
      kind: "scheduled",
      text: lang === "en" ? `Cooking tomorrow by ${time}` : `Готовлю завтра к ${time}`,
    };
  }

  // Дальше недели день недели становится двусмысленным: «в четверг» за 10 дней
  // до партии читается как ближайший четверг, и покупатель ждёт еду не в тот день.
  // Для таких дат называем число — двусмысленности нет.
  if (diffMs >= 7 * 24 * 3600_000) {
    const date = d.toLocaleDateString(lang === "en" ? "en-GB" : "ru-RU", { day: "numeric", month: "long" });
    return {
      kind: "scheduled",
      text: lang === "en" ? `Cooking on ${date} by ${time}` : `Готовлю ${date} к ${time}`,
    };
  }

  // в пределах недели — по дню недели: «в четверг» читается легче, чем «14.08»
  if (lang === "en") {
    const wd = d.toLocaleDateString("en-GB", { weekday: "long" });
    return { kind: "scheduled", text: `Cooking on ${wd} by ${time}` };
  }
  return { kind: "scheduled", text: `Готовлю ${RU_WEEKDAY_AT[d.getDay()]} к ${time}` };
}

/** Значение для <input type="datetime-local"> из ISO-строки (в местном времени). */
export function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
