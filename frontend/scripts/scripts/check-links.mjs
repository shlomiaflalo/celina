/**
 * Проверка внутренних ссылок: каждый to:/href в данных должен вести на
 * маршрут, который существует в App.tsx.
 *
 * Зачем. Ссылка «Задать вопрос» на /kontakty жила в landingPages.ts и вела в
 * 404: маршрут называется /contact. Её не поймал ни TypeScript (строка есть
 * строка), ни сборка (пререндер ходит по маршрутам, а не по ссылкам), ни
 * ревью — нашлась вручную, уже на проде. Этот файл ловит такой класс целиком.
 *
 * Запуск: node scripts/check-links.mjs (входит в `npm run build`).
 */
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SRC = resolve(dirname(fileURLToPath(import.meta.url)), "../src");

// Маршруты из App.tsx: и статические, и параметрические.
const app = readFileSync(join(SRC, "App.tsx"), "utf8");
const routes = [...app.matchAll(/path:\s*"([^"]+)"/g)].map((m) => m[1]);
const staticRoutes = new Set(routes.filter((r) => !r.includes(":") && r !== "*"));
const dynamic = routes.filter((r) => r.includes(":"))
  .map((r) => new RegExp("^" + r.replace(/:[^/]+/g, "[^/]+") + "$"));

function known(path) {
  const clean = path.split(/[?#]/)[0].replace(/\/+$/, "") || "/";
  if (staticRoutes.has(clean)) return true;
  return dynamic.some((re) => re.test(clean));
}

// Собираем ссылки из данных и страниц.
const files = [];
(function walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.tsx?$/.test(e.name)) files.push(p);
  }
})(SRC);

const bad = [];
for (const f of files) {
  const src = readFileSync(f, "utf8");
  const found = [
    ...src.matchAll(/\bto:\s*"(\/[^"]*)"/g),
    ...src.matchAll(/<Link\s+to="(\/[^"]*)"/g),
  ];
  for (const m of found) {
    if (!known(m[1])) bad.push(`${f.replace(SRC, "src")}: ${m[1]}`);
  }
}

if (bad.length) {
  console.error("\n[links] внутренние ссылки в никуда:\n" + bad.map((b) => "  " + b).join("\n") + "\n");
  process.exit(1);
}
console.log(`[links] ok — все внутренние ссылки ведут на существующие маршруты (${staticRoutes.size} статических, ${dynamic.length} параметрических)`);
