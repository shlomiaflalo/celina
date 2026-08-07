import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { analyticsAllowed } from "../lib/consent";

// Яндекс.Метрика — веб-аналитика (посещения, источники, карта кликов).
// Номер счётчика задаётся ПРИ СБОРКЕ, секрета в нём нет:
//   VITE_YANDEX_METRICA_ID=XXXXXXXX npm run build
// Пусто (dev / нет аккаунта) → счётчик не подключается и не мешает.
// [TO FILL]: создайте счётчик на https://metrika.yandex.ru и подставьте его номер.
const METRICA_ID = import.meta.env.VITE_YANDEX_METRICA_ID || "";

declare global {
  interface Window {
    ym?: ((...args: unknown[]) => void) & { a?: unknown[]; l?: number };
  }
}

let injected = false;

/**
 * Цель Метрики (KPI.md: register · order_placed · gathering_rsvp · cook_signup ·
 * contact_sent) — воронка «визит → повар → корзина → заказ». Безопасно всегда:
 * без счётчика/согласия ym отсутствует и вызов тихо пропускается.
 */
export function metricaGoal(name: string): void {
  try {
    if (METRICA_ID && typeof window !== "undefined" && window.ym) {
      window.ym(Number(METRICA_ID), "reachGoal", name);
    }
  } catch { /* аналитика никогда не должна ломать продукт */ }
}

/**
 * Подключает Я.Метрику один раз и отправляет hit при каждом переходе
 * (SPA-навигация не перезагружает страницу, поэтому считаем переходы вручную).
 * Дизайн не затрагивает — ничего не рендерит.
 */
export function Metrica() {
  const loc = useLocation();

  // первичная инициализация (только в браузере, при заданном ID И согласии на аналитику).
  // Пересматриваем при событии согласия — чтобы счётчик подключился сразу после «Принять».
  useEffect(() => {
    function tryInit() {
      if (!METRICA_ID || injected || typeof window === "undefined" || !analyticsAllowed()) return;
      injected = true;
    // официальный сниппет: сначала очередь вызовов, затем загрузка tag.js
    window.ym =
      window.ym ||
      function (...args: unknown[]) {
        (window.ym!.a = window.ym!.a || []).push(args);
      };
    window.ym.l = +new Date();
    window.ym(Number(METRICA_ID), "init", {
      clickmap: true,
      trackLinks: true,
      accurateTrackBounce: true,
      webvisor: false,
      defer: true,
    });
      const s = document.createElement("script");
      s.async = true;
      s.src = "https://mc.yandex.ru/metrika/tag.js";
      document.head.appendChild(s);
    }
    tryInit();
    window.addEventListener("celina-consent", tryInit);
    return () => window.removeEventListener("celina-consent", tryInit);
  }, []);

  // SPA: каждый переход — отдельный просмотр страницы (только если счётчик подключён)
  useEffect(() => {
    if (!METRICA_ID || typeof window === "undefined" || !window.ym || !analyticsAllowed()) return;
    window.ym(Number(METRICA_ID), "hit", loc.pathname + loc.search);
  }, [loc.pathname, loc.search]);

  return null;
}
