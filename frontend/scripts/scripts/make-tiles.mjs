/**
 * Плитки прилавка: квадратные копии блюд в трёх размерах + webp.
 *
 * Запуск — РУЧНОЙ и локальный:  node frontend/scripts/make-tiles.mjs
 * Результат КОММИТИТСЯ в репозиторий.
 *
 * Почему не в сборке. Образ собирается из node:20 (Debian), где нет ни cwebp,
 * ни sips; шаг генерации в Dockerfile или в `npm run build` уронил бы сборку,
 * а сетка на 102 пререндеренных страницах отдавала бы 404 по всем srcset.
 * sharp уже стоит в deck/node_modules (им собираются презентации), поэтому
 * плитки делаются на машине и уезжают файлами — ровно так же, как /images/preview.
 *
 * Оригиналы — 1100–1600 px по мегабайту: на первом экране прилавка их
 * двенадцать, то есть около 10 МБ ради картинок, которые рисуются в 200 px.
 */
import sharp from "../../deck/node_modules/sharp/lib/index.js";
import { mkdirSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const PUB = resolve(HERE, "../public/images");
const OUT = resolve(PUB, "tiles");

/** Блюда прилавка. Порядок = порядок в сетке. */
const DISHES = [
  ["okroshka", "dishes/okroshka.jpg"],
  ["borscht", "borscht.jpg"],
  ["pelmeni", "pelmeni.jpg"],
  ["pirozhki", "pirozhki.jpg"],
  ["syrniki", "syrniki.jpg"],
  ["medovik", "dishes/medovik.jpg"],
  ["plov", "dishes/plov.jpg"],
  ["shchi", "dishes/shchi.jpg"],
  ["vareniki", "dishes/vareniki.jpg"],
  ["golubtsy", "dishes/golubtsy.jpg"],
  ["draniki", "dishes/draniki.jpg"],
  ["napoleon", "dishes/napoleon.jpg"],
];

// 2 колонки на 360px → ~180 CSS px → 360 для 2x. Дальше 3-4 колонки на десктопе.
const SIZES = [240, 360, 540];

mkdirSync(OUT, { recursive: true });

let made = 0;
for (const [name, rel] of DISHES) {
  const src = resolve(PUB, rel);
  if (!existsSync(src)) {
    console.error(`✗ нет исходника: ${rel}`);
    process.exitCode = 1;
    continue;
  }
  for (const w of SIZES) {
    // квадрат по центру: сетка прилавка держит 1:1, чтобы ряды не рвались
    const base = sharp(src).resize(w, w, { fit: "cover", position: "attention" });
    await base.clone().webp({ quality: 74 }).toFile(resolve(OUT, `${name}-${w}.webp`));
    await base.clone().jpeg({ quality: 78, mozjpeg: true }).toFile(resolve(OUT, `${name}-${w}.jpg`));
    made += 2;
  }
}
console.log(`✅ ${made} файлов → public/images/tiles (${DISHES.length} блюд × ${SIZES.length} размера × webp+jpg)`);
