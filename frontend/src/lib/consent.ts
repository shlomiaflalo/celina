/**
 * Согласие на аналитические cookie (Яндекс.Метрика). По требованиям РФ
 * (Роскомнадзор + ToS Метрики) счётчик не должен загружаться и отправлять данные
 * до получения согласия пользователя. Храним выбор в localStorage.
 */
const KEY = "celina_analytics_consent"; // "yes" | "no"

export type Consent = "yes" | "no" | null;

export function getAnalyticsConsent(): Consent {
  if (typeof window === "undefined") return null;
  try {
    const v = localStorage.getItem(KEY);
    return v === "yes" || v === "no" ? v : null;
  } catch {
    return null;
  }
}

export function setAnalyticsConsent(v: "yes" | "no") {
  try {
    localStorage.setItem(KEY, v);
  } catch {
    /* приватный режим — просто не сохраняем */
  }
  // оповещаем компоненты в этой вкладке (storage-событие срабатывает только в других)
  if (typeof window !== "undefined") window.dispatchEvent(new Event("celina-consent"));
}

/** Аналитику можно грузить только при явном "yes". */
export function analyticsAllowed(): boolean {
  return getAnalyticsConsent() === "yes";
}
