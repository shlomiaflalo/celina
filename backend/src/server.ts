import "dotenv/config"; // загрузка .env в process.env (SMTP и пр.) до старта приложения
import path from "node:path";
import { createApp } from "./app.js";
import { pingSitemapOnStart } from "./lib/indexnow.js";

// Страховка от полного падения процесса. Ошибка в асинхронном потоке (например
// в createReadStream) не проходит через errorHandler Express: без этого
// обработчика она становится uncaughtException и убивает весь сервер — один
// «плохой» запрос ронял сайт целиком. Логируем и продолжаем работать; это
// последний рубеж, а не замена валидации в самих маршрутах.
process.on("uncaughtException", (err) => {
  console.error("[uncaughtException] сервер продолжает работу:", err);
});
process.on("unhandledRejection", (reason) => {
  console.error("[unhandledRejection] сервер продолжает работу:", reason);
});

const PORT = Number(process.env.PORT) || 4000;
// За обратным прокси (nginx на хосте) слушаем только 127.0.0.1, чтобы порт
// не был доступен снаружи в обход nginx/HTTPS. По умолчанию — все интерфейсы.
const HOST = process.env.HOST || "0.0.0.0";

createApp().listen(PORT, HOST, () => {
  console.log(`🍲 Celina API запущен на http://${HOST}:${PORT}`);
  // свежесть для Яндекса: каждый деплой пингует IndexNow всеми URL из sitemap
  if (process.env.FRONTEND_DIST) {
    pingSitemapOnStart(path.resolve(process.env.FRONTEND_DIST, "sitemap.xml"));
  }
});
