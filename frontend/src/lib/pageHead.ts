// Кто владеет остальными тегами <head>: description, canonical, hreflang, OG/Twitter
// и JSON-LD. Продолжение истории из lib/pageTitle.ts.
//
// Зачем: react-helmet-async в связке с vite-react-ssg 0.9.1-beta.1 ПОСЛЕ ГИДРАТАЦИИ
// head больше не трогает. В отдаваемом HTML метатеги правильные (пререндер их
// проставил), но при переходе внутри SPA они остаются от предыдущей страницы —
// проверено 08.08: /zagotovki → /obedy оставлял canonical на /zagotovki. Для
// заголовка это починено (страница сама владеет document.title), а description,
// canonical, OG и разметка Schema.org так и висели протухшими.
//
// Почему это важно именно в России: Яндекс рендерит JS и ходит по внутренним
// ссылкам. При JS-рендеринге он мог увидеть у страницы чужой canonical (прямой
// сигнал «это дубль другой страницы»), чужое описание в сниппете и чужую
// разметку — например, Recipe/FAQ от предыдущей статьи на странице города.
//
// Решение то же, что с заголовком: <Seo> сам владеет тегами. Мы не создаём
// дубликатов — сначала ищем тег, который уже отдал пререндер (у него `data-rh`),
// и переписываем его; свои пометки ставим атрибутом `data-seo-head`, чтобы при
// уходе на страницу без <Seo> (корзина, вход) убрать ровно то, чем управляли,
// и вернуться к базовому index.html, где этих тегов нет.

/** Значения, которыми <Seo> владеет на клиенте. */
export interface PageHeadState {
  title: string;
  description: string;
  canonical: string;
  image: string;
  type: string;
  jsonLd: object[];
}

/** Атрибут-пометка: тегом управляет <Seo>. */
const MARK = "data-seo-head";

let owners = 0;

/** true — теги задаёт страница, посторонним трогать нельзя. */
export function pageOwnsHead(): boolean {
  return owners > 0;
}

/** Страница забирает head себе; возвращает функцию освобождения (для cleanup). */
export function claimPageHead(): () => void {
  owners++;
  let released = false;
  return () => {
    if (released) return; // защита от двойного вызова в StrictMode
    released = true;
    owners--;
  };
}

function setMeta(attr: "name" | "property", key: string, content: string) {
  const head = document.head;
  let el = head.querySelector<HTMLMetaElement>(`meta[${attr}="${CSS.escape(key)}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    head.appendChild(el);
  }
  el.setAttribute(MARK, "");
  if (el.getAttribute("content") !== content) el.setAttribute("content", content);
}

function setLink(selector: string, attrs: Record<string, string>) {
  const head = document.head;
  let el = head.querySelector<HTMLLinkElement>(selector);
  if (!el) {
    el = document.createElement("link");
    head.appendChild(el);
  }
  el.setAttribute(MARK, "");
  for (const [k, v] of Object.entries(attrs)) {
    if (el.getAttribute(k) !== v) el.setAttribute(k, v);
  }
}

/**
 * JSON-LD переписываем целиком: блоки у страниц разные и по количеству, и по типу.
 * Скрипты пререндера (`data-rh`) забираем себе — иначе к Article от предыдущей
 * страницы просто добавился бы второй набор разметки.
 */
function setJsonLd(blocks: object[]) {
  const head = document.head;
  const selector = `script[type="application/ld+json"]`;
  const existing = Array.from(head.querySelectorAll<HTMLScriptElement>(selector));
  const next = blocks.map((b) => JSON.stringify(b));
  // Уже стоит ровно то, что нужно (обычный случай сразу после гидратации) —
  // не дёргаем DOM, только помечаем теги своими.
  if (existing.length === next.length && existing.every((el, i) => el.textContent === next[i])) {
    existing.forEach((el) => el.setAttribute(MARK, ""));
    return;
  }
  existing.forEach((el) => el.remove());
  for (const json of next) {
    const el = document.createElement("script");
    el.type = "application/ld+json";
    el.setAttribute(MARK, "");
    el.textContent = json;
    head.appendChild(el);
  }
}

/** Проставить теги текущей страницы. Вызывается из <Seo> после монтирования. */
export function applyPageHead(s: PageHeadState) {
  setMeta("name", "description", s.description);
  setMeta("property", "og:type", s.type);
  setMeta("property", "og:title", s.title);
  setMeta("property", "og:description", s.description);
  setMeta("property", "og:url", s.canonical);
  setMeta("property", "og:image", s.image);
  setMeta("name", "twitter:title", s.title);
  setMeta("name", "twitter:description", s.description);
  setMeta("name", "twitter:image", s.image);
  setLink(`link[rel="canonical"]`, { rel: "canonical", href: s.canonical });
  setLink(`link[rel="alternate"][hreflang="ru"]`, { rel: "alternate", hreflang: "ru", href: s.canonical });
  setLink(`link[rel="alternate"][hreflang="x-default"]`, { rel: "alternate", hreflang: "x-default", href: s.canonical });
  setJsonLd(s.jsonLd);
}

/** Ушли на страницу без своего <Seo> — снимаем всё, чем управляли. */
export function clearPageHead() {
  document.head.querySelectorAll(`[${MARK}]`).forEach((el) => el.remove());
}
