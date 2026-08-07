import { ViteReactSSG } from "vite-react-ssg";
import { routes } from "./App";
import "./index.css";

// После деплоя новой сборки старые хешированные чанки исчезают с сервера.
// Телефон с закешированной старой страницей при переходе на ленивый чанк
// получает 404 → вечный спиннер («грузится, но никуда не приходит»).
// Лечение: при ошибке предзагрузки один раз перезагружаем страницу — браузер
// заберёт свежий HTML с новыми хешами. Защита от цикла: не чаще раза в 30 сек.
if (typeof window !== "undefined") {
  window.addEventListener("vite:preloadError", (e) => {
    const last = Number(sessionStorage.getItem("celina:chunk-reload") || 0);
    if (Date.now() - last > 30_000) {
      sessionStorage.setItem("celina:chunk-reload", String(Date.now()));
      e.preventDefault(); // ошибку обработали сами — не роняем приложение
      window.location.reload();
    }
  });

  // ── авто-обновление устаревшей вкладки ──
  // Главная проблема на телефонах: старая вкладка держит в кеше СТАРЫЙ основной
  // бандл (app-HASH.js, immutable) и показывает прежний интерфейс, пока её не
  // перезагрузят вручную. preloadError ловит только ленивые чанки, а не главный.
  // Решение: когда пользователь возвращается на вкладку (visibility / выход из
  // bfcache), тихо сверяем hash развёрнутого бандла с тем, что реально отдаёт
  // сервер сейчас. Отличается → значит вышла новая версия → один раз reload.
  const runningBundle =
    [...document.querySelectorAll('script[src*="/assets/app-"]')]
      .map((s) => s.getAttribute("src"))
      .find(Boolean) || "";
  let checking = false;
  async function checkForNewVersion() {
    if (checking || !runningBundle) return; // в dev бандла нет — выходим
    checking = true;
    try {
      const html = await fetch("/", { cache: "no-store" }).then((r) => (r.ok ? r.text() : ""));
      const m = html.match(/\/assets\/app-[A-Za-z0-9_-]+\.js/);
      if (m && m[0] !== runningBundle) {
        const last = Number(sessionStorage.getItem("celina:ver-reload") || 0);
        if (Date.now() - last > 60_000) {
          sessionStorage.setItem("celina:ver-reload", String(Date.now()));
          window.location.reload();
        }
      }
    } catch { /* оффлайн / сеть недоступна — игнорируем */ } finally {
      checking = false;
    }
  }
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") checkForNewVersion();
  });
  window.addEventListener("pageshow", (e) => { if ((e as PageTransitionEvent).persisted) checkForNewVersion(); });
}

// Единая точка входа для SSG (пререндер в HTML) и клиента (гидратация).
// На клиенте vite-react-ssg сам монтирует приложение; на сборке — рендерит HTML.
export const createRoot = ViteReactSSG({ routes });
