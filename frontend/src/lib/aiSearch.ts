/**
 * Умный разбор запроса на естественном языке, напр.:
 *  борщ 4 звезды рядом 100 метров / borscht 4+ stars within 100m open now.
 * Достаёт рейтинг, расстояние, работает сейчас и ключевые слова блюда/кухни.
 *
 * Поиск устойчив к опечаткам и языку: "borsht", "borcht", "borst", "борщь"
 * всё равно находят Борщ (расстояние Левенштейна + словарь синонимов RU/EN).
 */

import type { CookProfile } from "../types";

export interface ParsedQuery {
  minRating: number;
  maxDistanceM: number | null;
  city: string | null;
  openNow: boolean;
  keyword: string;
  raw: string;
}

/** Радиус никогда не больше 10 км. */
const MAX_RADIUS_M = 10000;

// мост между языками + частые написания/опечатки → русский корень блюда/кухни
const SYNONYMS: Record<string, string> = {
  // борщ
  borscht: "борщ", borsch: "борщ", borsht: "борщ", borcht: "борщ", borshch: "борщ",
  borst: "борщ", bortsch: "борщ",
  // пельмени / dumplings
  pelmeni: "пельмен", pelmen: "пельмен", dumplings: "пельмен", dumpling: "пельмен",
  // хинкали
  khinkali: "хинкал", hinkali: "хинкал", chinkali: "хинкал", kinkali: "хинкал",
  // хачапури
  khachapuri: "хачапур", hachapuri: "хачапур", katchapuri: "хачапур",
  // сырники
  syrniki: "сырник", sirniki: "сырник", syrnik: "сырник",
  // блины
  blini: "блин", bliny: "блин", pancakes: "блин", pancake: "блин",
  // пироги / пирожки
  pie: "пирог", pirog: "пирог", piroshki: "пирожк", pirozhki: "пирожк", pirozhok: "пирожк",
  // оливье / салаты
  olivier: "оливье", salad: "салат", salads: "салат",
  apple: "яблок", apples: "яблок",
  // кухни / категории
  georgian: "грузин", georgia: "грузин", russian: "русск", homemade: "домашн", home: "домашн",
  baking: "выпеч", pastry: "выпеч", bakery: "выпеч", dessert: "десерт", desserts: "десерт",
  soup: "суп", soups: "суп", hot: "горяч", main: "горяч", mains: "горяч", dish: "",
  plov: "плов", shashlik: "шашлык", shashlyk: "шашлык", golubtsy: "голубц", vareniki: "вареник",
  manty: "манты", cheburek: "чебурек", draniki: "драник", medovik: "медов", napoleon: "наполеон",
  okroshka: "окрошк", ukha: "уха", kotlety: "котлет", vinegret: "винегрет",
};

/** Города на двух языках → канонический русский (для точного фильтра по городу). */
const CITY_MAP: Record<string, string> = {
  "москва": "москва", "moscow": "москва", "мск": "москва",
  "санкт-петербург": "санкт-петербург", "санкт петербург": "санкт-петербург",
  "saint petersburg": "санкт-петербург", "st petersburg": "санкт-петербург",
  "petersburg": "санкт-петербург", "питер": "санкт-петербург", "спб": "санкт-петербург",
  "казань": "казань", "kazan": "казань",
  "сочи": "сочи", "sochi": "сочи",
  "новосибирск": "новосибирск", "novosibirsk": "новосибирск",
  "екатеринбург": "екатеринбург", "yekaterinburg": "екатеринбург", "ekaterinburg": "екатеринбург",
  "краснодар": "краснодар", "krasnodar": "краснодар",
  "нижний новгород": "нижний новгород", "nizhny novgorod": "нижний новгород",
  "владивосток": "владивосток", "vladivostok": "владивосток",
  "калининград": "калининград", "kaliningrad": "калининград",
  "ростов-на-дону": "ростов-на-дону", "ростов": "ростов-на-дону", "rostov": "ростов-на-дону",
};

/** Привести название города (любой язык/написание) к каноническому русскому, или null. */
export function canonicalCity(text: string | null | undefined): string | null {
  if (!text) return null;
  const t = text.toLowerCase().trim().replace(/\s+/g, " ");
  if (CITY_MAP[t] !== undefined) return CITY_MAP[t] || null;
  let best = Infinity, hit: string | null = null;
  for (const k in CITY_MAP) {
    if (!CITY_MAP[k]) continue;
    const d = levenshtein(t, k);
    if (d < best) { best = d; hit = k; }
  }
  if (hit && best <= (t.length <= 5 ? 1 : 2)) return CITY_MAP[hit];
  return null;
}

/** Найти город внутри свободного запроса (вкл. многословные) и вырезать его. */
function detectCity(raw: string): { city: string | null; rest: string } {
  const low = " " + raw.toLowerCase().replace(/\s+/g, " ") + " ";
  const keys = Object.keys(CITY_MAP).filter((k) => CITY_MAP[k]).sort((a, b) => b.length - a.length);
  for (const k of keys) {
    if (low.includes(" " + k + " ")) {
      return { city: CITY_MAP[k], rest: (low.replace(" " + k + " ", " ")).trim() };
    }
  }
  // нечётко: одно слово с опечаткой (масква → москва), но только если оно явно похоже на город
  const words = low.trim().split(" ").filter(Boolean);
  for (const w of words) {
    if (w.length < 4) continue;
    const c = canonicalCity(w);
    if (c) return { city: c, rest: words.filter((x) => x !== w).join(" ") };
  }
  return { city: null, rest: raw };
}

// Unicode-границы: обычный \b не работает для кириллицы.
// ВАЖНО: НЕ используем lookbehind (?<!…) — Safari поддерживает его только с 16.4,
// а на iOS 15 сама конструкция new RegExp кидает SyntaxError на уровне модуля и
// УБИВАЕТ всё приложение (кнопки мертвы, вечная «Загрузка…»). Вместо этого
// захватываем предшествующий не-буквенный символ группой и возвращаем его "$1".
const STOP = new RegExp(
  "(^|[^\\p{L}])(?:от|до|min|max|over|near|nearby|within|рядом|около|возле|меня|me|my|i|сейчас|работает|открыт|онлайн|open|now|который|которые|готовит|makes|make|that|with|со|и|с|the|a|an|для|find|найди|покажи|show|звёзд|звезды|звезда|звёзды|stars?|star" +
    // частые слова-наполнители в естественных фразах
    "|need|want|would|like|just|get|some|please|gimme|give|looking|hungry|craving|fancy|of|for|to|me|us|we|can|could|any" +
    "|хочу|хочется|нужно|надо|дай|дайте|немного|чуть|поесть|хотим|хотел|хотела|можно)(?!\\p{L})",
  "giu"
);

// слова-единицы измерения (остаются после вырезания числа) — чистим из ключевого слова
const UNIT_WORD = /^(км|м|метр[а-я]*|km|m|metr[a-zа-я]*|meter[s]?|kilomet[a-z]*|киломе[а-я]*)$/u;

export function parseQuery(raw: string): ParsedQuery {
  const q = " " + raw.toLowerCase() + " ";

  // ★ (U+2605, текстовая звезда — её показывают плейсхолдеры «4★»), ⭐ (U+2B50), *
  let minRating = 0;
  const r1 = q.match(/(\d(?:[.,]\d)?)\s*(\+|звёзд[а-я]*|звезд[а-я]*|star[s]?|★|⭐|\*)/);
  if (r1) minRating = parseFloat(r1[1].replace(",", "."));
  else {
    const r2 = q.match(/(?:от|min|≥|>=|over)\s*(\d(?:[.,]\d)?)/);
    if (r2) minRating = parseFloat(r2[1].replace(",", "."));
  }

  // ── расстояние ── работаем по остатку после вырезания рейтинга,
  // чтобы 4★ не приняли за радиус 4 км.
  let work = q.replace(/(\d(?:[.,]\d)?)\s*(\+|звёзд|звезд|star[s]?|★|⭐|\*)/g, " ");
  let maxDistanceM: number | null = null;
  // (?!\p{L}) вместо \b: JS \b не срабатывает после кириллицы ('500 м',
  // '500 метров') — граница слова там никогда не выполнялась, и радиус терялся
  const km = work.match(/(\d+(?:[.,]\d)?)\s*(km|км|киломе[а-я]*)(?!\p{L})/u);
  const m = work.match(/(\d+)\s*(metr[a-zа-я]*|meter[s]?|метр[а-я]*|m|м)(?!\p{L})/u);
  if (km) maxDistanceM = Math.round(parseFloat(km[1].replace(",", ".")) * 1000);
  else if (m) maxDistanceM = parseInt(m[1], 10);
  // голое число БЕЗ единицы — это поисковый запрос (цена «390», номер дома),
  // а не радиус: показываем только то, что реально содержит введённое
  if (maxDistanceM != null) maxDistanceM = Math.min(Math.max(maxDistanceM, 1), MAX_RADIUS_M);

  // ── точный фильтр по городу (кросс-языковой) ──
  const { city, rest } = detectCity(raw);

  const openNow = /(сейчас|работает|открыт|онлайн|open|now)/.test(q);

  let keyword = rest
    .toLowerCase()
    .replace(/(\d(?:[.,]\d)?)\s*(\+|звёзд[а-я]*|звезд[а-я]*|star[s]?|★|⭐|\*)/g, " ")
    .replace(/\bзвёзд[а-я]*|\bзвезд[а-я]*|\bstars?\b/giu, " ")
    // число С единицей измерения — это радиус, из ключевых слов убираем;
    // голое число остаётся и ищется в данных (цена, номер) как есть
    .replace(/(\d+(?:[.,]\d+)?)\s*(km|км|киломе[а-яa-z]*|metr[a-zа-я]*|meter[s]?|метр[а-я]*|м|m)(?!\p{L})/giu, " ")
    .replace(STOP, "$1")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
  // убираем оставшиеся слова-единицы (метров, км, м) и одиночные буквы
  // одиночные буквы сохраняем (инкрементальный поиск m, б); единицы (км/м/метров) убираем только у слов длиной ≥2
  keyword = keyword.split(" ").filter((w) => w.length === 1 || !UNIT_WORD.test(w)).filter(Boolean).join(" ");

  return { minRating, maxDistanceM, city, openNow, keyword, raw };
}

/** Расстояние Левенштейна (число правок) между двумя строками. */
function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
    }
    prev = cur;
  }
  return prev[b.length];
}



/** Фонетическая нормализация для нечёткого сравнения: ё→е, й→и, щ→ш, ъ/ь убираем.
 *  щ→ш — чтобы «борш» находил «борщ» (частая замена при наборе и транслите). */
function phon(s: string): string {
  return s.toLowerCase().replace(/ё/g, "е").replace(/й/g, "и").replace(/щ/g, "ш").replace(/[ъь]/g, "");
}


/**
 * Привести слово запроса к русскому корню через словарь.
 * Точное совпадение по словарю — всегда. Опечатка — только ОЧЕНЬ близкая:
 * ровно ≤1 правка, та же первая буква и близкая длина. Иначе несвязанные слова
 * (напр. maria → main → горяч) ошибочно совпадали со всеми поварами.
 */
function canonical(word: string): string | null {
  if (SYNONYMS[word] !== undefined) return SYNONYMS[word] || null;
  if (word.length < 4) return null;
  let best = Infinity;
  let hit: string | null = null;
  for (const k in SYNONYMS) {
    if (k[0] !== word[0]) continue;
    if (Math.abs(k.length - word.length) > 1) continue;
    const d = levenshtein(word, k);
    if (d < best) { best = d; hit = k; }
  }
  if (hit && best <= 1) return SYNONYMS[hit] || null;
  return null;
}

// ───────────────── автодополнение (подсказки) ─────────────────
export interface Suggestion {
  kind: "dish" | "cook";
  cookId: string;
  kitchenName: string;
  dishTitle?: string;
  category?: string;
  cuisine?: string;
}

// ── транслитерация латиница → кириллица (для поиска латиницей по русским названиям) ──
const L2C_DIGRAPHS: [string, string][] = [
  ["shch", "щ"], ["sch", "щ"], ["zh", "ж"], ["kh", "х"], ["ch", "ч"], ["sh", "ш"],
  ["ts", "ц"], ["yu", "ю"], ["ya", "я"], ["yo", "ё"], ["je", "е"], ["ph", "ф"], ["ia", "ия"], ["iya", "ия"],
];
const L2C_SINGLE: Record<string, string> = {
  a: "а", b: "б", v: "в", g: "г", d: "д", e: "е", z: "з", i: "и", j: "й", k: "к",
  l: "л", m: "м", n: "н", o: "о", p: "п", r: "р", s: "с", t: "т", u: "у", f: "ф",
  h: "х", c: "к", w: "в", x: "кс", y: "ы", q: "к",
};
export function latinToCyrillic(s: string): string {
  s = s.toLowerCase();
  let out = "", i = 0;
  outer: while (i < s.length) {
    for (const [lat, cyr] of L2C_DIGRAPHS) {
      if (s.startsWith(lat, i)) { out += cyr; i += lat.length; continue outer; }
    }
    out += L2C_SINGLE[s[i]] ?? s[i];
    i++;
  }
  return out;
}

/**
 * Оценка совпадения слова запроса с одним словом текста (0 = нет).
 * СТРОГО: показываем только то, что реально содержит запрос — прямое вхождение,
 * префикс/корень, транслит латиница→кириллица, либо опечатка ровно в 1 правку
 * с тем же первым символом и близкой длиной (мариа~мария, борщь~борщ).
 * Никаких подпоследовательностей и многобуквенных опечаток — они давали
 * несвязанные результаты.
 */
/**
 * Балл совпадения слова запроса с одним словом текста (0 = нет).
 * Инкрементальный поиск: префикс важнее подстроки, поддержка латиница→кириллица
 * и одной буквы. б/бор/борщ → борщ; m → любое слово с м.
 */
function wordScore(qw: string, token: string): number {
  if (!qw || !token) return 0;
  let best = 0;
  const variants = [qw];
  if (/[a-z]/.test(qw)) {
    const tr = latinToCyrillic(qw);
    if (tr && tr !== qw) variants.push(tr);
    // «x» неоднозначен: xachapuri → хачапури (х), maxim → максим (кс) — пробуем оба
    if (qw.includes("x")) {
      const tr2 = latinToCyrillic(qw.replace(/x/g, "kh"));
      if (tr2 && !variants.includes(tr2)) variants.push(tr2);
    }
  }
  for (const v of variants) {
    if (!v) continue;
    const pv = phon(v), pt = phon(token);
    if (!pv || !pt) continue;
    if (pt === pv) best = Math.max(best, 100);                 // точное слово
    else if (pt.startsWith(pv)) best = Math.max(best, 90);     // префикс: бор → борщ (инкрементальный набор)
    else if (pt.includes(pv)) best = Math.max(best, 74);       // подстрока внутри слова
    // словоформа: запрос длиннее слова, но начинается с него (борщи → борщ, марии → мария…)
    else if (pt.length >= 3 && pv.startsWith(pt)) best = Math.max(best, 58);
    else if (pv.length >= 4 && pt[0] === pv[0]) {
      // опечатка в целом слове: ≤1 правка, та же первая буква (хинкли → хинкали)
      if (Math.abs(pt.length - pv.length) <= 1 && levenshtein(pv, pt) <= 1) best = Math.max(best, 70);
      // опечатка в НЕЗАВЕРШЁННОМ наборе: сравниваем с началом слова той же длины,
      // чтобы недописанное слово с одной ошибкой всё равно находило цель
      else if (pt.length > pv.length && levenshtein(pv, pt.slice(0, pv.length)) <= 1) best = Math.max(best, 66);
    }
  }
  return best;
}

/**
 * Числовая релевантность текста запросу. ВСЕ значимые слова запроса должны
 * совпасть (иначе 0); итог — средний балл лучших совпадений. Учитывает синонимы.
 */
export function matchScore(keyword: string, text: string): number {
  const qTokens = keyword.toLowerCase().split(/\s+/).filter(Boolean);
  if (qTokens.length === 0) return 1;
  const low = text.toLowerCase();
  const words = low.split(/[^\p{L}\p{N}]+/u).filter(Boolean);
  let sum = 0;
  for (const qt of qTokens) {
    let best = 0;
    for (const w of words) { const s = wordScore(qt, w); if (s > best) best = s; }
    const canon = canonical(qt);
    if (canon && low.includes(canon)) best = Math.max(best, 80);
    if (best === 0) return 0; // это слово запроса не совпало ни с чем → текст не подходит
    sum += best;
  }
  return sum / qTokens.length;
}

/** Релевантность текста (0 = нет совпадения). */
function textScore(keyword: string, text: string): number {
  return matchScore(keyword, text);
}

/** Подсказки автодополнения по запросу: блюда и кухни, ранжированные. */
export function suggestSearch(raw: string, cooks: CookProfile[], limit = 6): Suggestion[] {
  const parsed = parseQuery(raw);
  const keyword = parsed.keyword;
  // город в запросе сужает кандидатов («борщ спб» → только питерские кухни)
  const pool = parsed.city
    ? cooks.filter((c) => (canonicalCity(c.city) ?? c.city?.toLowerCase()) === parsed.city)
    : cooks;
  if (!keyword) {
    // запрос — ТОЛЬКО город («москва», «спб», «moskva»): показываем кухни города,
    // а не пустоту (раньше город вырезался и подсказок не оставалось)
    if (parsed.city) {
      return pool.slice(0, limit).map((c) => ({
        kind: "cook" as const, cookId: c.id, kitchenName: c.kitchenName, cuisine: c.cuisine?.[0],
      }));
    }
    return [];
  }
  const scored: (Suggestion & { score: number })[] = [];
  for (const c of pool) {
    for (const d of c.dishes ?? []) {
      const s = textScore(keyword, `${d.title} ${d.category} ${d.price}`);
      if (s > 0) scored.push({ kind: "dish", cookId: c.id, kitchenName: c.kitchenName, dishTitle: d.title, category: d.category, score: s + 3 });
    }
    const ks = textScore(keyword, `${c.kitchenName} ${c.user?.name ?? ""} ${(c.cuisine || []).join(" ")} ${c.bio ?? ""} ${c.city ?? ""}`);
    if (ks > 0) scored.push({ kind: "cook", cookId: c.id, kitchenName: c.kitchenName, cuisine: c.cuisine?.[0], score: ks });
  }
  scored.sort((a, b) => b.score - a.score);
  const seen = new Set<string>();
  const res: Suggestion[] = [];
  for (const o of scored) {
    const key = o.kind + (o.dishTitle ?? o.kitchenName) + o.cookId;
    if (seen.has(key)) continue;
    seen.add(key);
    res.push({ kind: o.kind, cookId: o.cookId, kitchenName: o.kitchenName, dishTitle: o.dishTitle, category: o.category, cuisine: o.cuisine });
    if (res.length >= limit) break;
  }
  return res;
}

export function matchKeyword(keyword: string, haystack: string): boolean {
  if (!keyword) return true;
  return matchScore(keyword, haystack) > 0;
}
