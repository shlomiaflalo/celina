import { useEffect, useRef } from "react";
import { Head } from "vite-react-ssg";
import { useLang } from "../i18n";
import { DEFAULT_TITLE, claimPageTitle, pageOwnsTitle } from "../lib/pageTitle";
import { applyPageHead, claimPageHead, clearPageHead, pageOwnsHead } from "../lib/pageHead";

// ⚠️ Прод-домен. ОБЯЗАТЕЛЬНО задаётся VITE_SITE_URL при сборке — от него зависят
// canonical/OG/sitemap/JSON-LD. Фолбэк — зарезервированный домен .example (его
// нельзя купить/занять), чтобы при забытом VITE_SITE_URL ссылки НЕ уходили на
// чужой/сквоттерский домен. Перед деплоем: VITE_SITE_URL=https://ваш-домен npm run build
export const SITE_URL = import.meta.env.VITE_SITE_URL || "https://celina.example";
// Карточка для соцсетей и выдачи: 1200×630 с едой.
// Раньше здесь стояла Красная площадь — любая ссылка на Селину, куда бы её ни
// кинули, показывала туристическую открытку вместо того, что сервис продаёт.
const DEFAULT_IMAGE = "/images/og-default.jpg";

// Коды подтверждения прав в вебмастерах. Задаются ПРИ СБОРКЕ (секрета нет):
//   VITE_YANDEX_VERIFICATION=... VITE_GOOGLE_VERIFICATION=... npm run build
// Берутся из кабинетов Яндекс.Вебмастер и Google Search Console — это разблокирует
// индексацию, sitemap и быстрый показ в выдаче. Пусто → метатег не выводится.
// [TO FILL]: коды появятся в вебмастерах после добавления сайта.
export const YANDEX_VERIFICATION = import.meta.env.VITE_YANDEX_VERIFICATION || "";
export const GOOGLE_VERIFICATION = import.meta.env.VITE_GOOGLE_VERIFICATION || "";

/** Обрезает meta description до ~158 символов по границе слова (Google так и режет). */
export function clampMeta(s: string, max = 158): string {
  s = s.trim().replace(/\s+/g, " ");
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const sp = cut.lastIndexOf(" ");
  return (sp > max * 0.6 ? cut.slice(0, sp) : cut).replace(/[\s.,;—-]+$/, "") + "…";
}

export interface SeoProps {
  /** <title> страницы (на русском). */
  title: string;
  /** meta description (на русском, ~150–160 символов). */
  description: string;
  /** Английский <title> — используется, когда выбран EN (иначе остаётся русский). */
  titleEn?: string;
  /** Английское описание для EN. */
  descriptionEn?: string;
  /** Путь страницы для canonical, напр. "/about". По умолчанию — корень. */
  path?: string;
  /** Абсолютный или относительный URL картинки для OG/Twitter. */
  image?: string;
  /** og:type — "website" | "article" | "profile" и т.п. */
  type?: string;
  /** Любой JSON-LD объект (или массив) — будет внедрён как <script type="application/ld+json">. */
  jsonLd?: object | object[];
}

/**
 * Единый помощник SEO-метатегов. Работает и при пререндере (SSG → попадает
 * в готовый HTML для краулеров Yandex/Google), и на клиенте.
 * Дизайн не затрагивает — рендерит только теги в <head>.
 */
export function Seo({ title, description, titleEn, descriptionEn, path = "/", image = DEFAULT_IMAGE, type = "website", jsonLd }: SeoProps) {
  const { lang } = useLang();
  const t = lang === "en" && titleEn ? titleEn : title;
  // <title> на клиенте задаёт САМА страница. Два повода делать это здесь, а не
  // полагаться на <Head>:
  //   1) react-helmet-async в этой связке после гидратации head уже не трогает
  //      (проверено: при переходе внутри SPA description/canonical остаются от
  //      предыдущей страницы), поэтому единственным «хозяином» заголовка
  //      оказывался эффект LanguageProvider — и на всех страницах после
  //      гидратации стоял дефолтный «Селина — Соседи кормят соседей»;
  //   2) эффект родителя выполняется ПОСЛЕ дочернего, так что перетереть title
  //      он успевал в любом случае (см. lib/pageTitle.ts).
  // Отдаваемый HTML всегда был правильный, но Яндекс и Google рендерят JS —
  // при рендеринге у 100 URL был один и тот же заголовок, то есть терялся
  // сильнейший on-page фактор.
  const langRef = useRef(lang);
  langRef.current = lang;
  useEffect(() => {
    document.title = t;
  }, [t]);
  // Ушли на страницу без своего <Seo> (кабинет, вход) — возвращаем дефолтный
  // заголовок на текущем языке. Эффект без зависимостей: язык берём из ref,
  // иначе cleanup срабатывал бы на каждом переключении RU/EN.
  useEffect(() => {
    const release = claimPageTitle();
    return () => {
      release();
      if (!pageOwnsTitle()) document.title = DEFAULT_TITLE[langRef.current];
    };
  }, []);
  const d = lang === "en" && descriptionEn ? descriptionEn : description;
  const canonical = SITE_URL + (path === "/" ? "" : path);
  const img = image.startsWith("http") ? image : SITE_URL + image;
  const blocks = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];
  // Остальной head — по той же причине, что и заголовок: react-helmet-async после
  // гидратации теги не обновляет, и при переходе внутри SPA description, canonical,
  // hreflang, OG/Twitter и JSON-LD оставались от предыдущей страницы. Яндекс рендерит
  // JS и ходит по внутренним ссылкам, то есть мог увидеть у страницы чужой canonical
  // (сигнал «это дубль») и чужую разметку. Подробности — в lib/pageHead.ts.
  const blocksKey = JSON.stringify(blocks);
  useEffect(() => {
    applyPageHead({ title: t, description: d, canonical, image: img, type, jsonLd: JSON.parse(blocksKey) });
  }, [t, d, canonical, img, type, blocksKey]);
  // Ушли на страницу без своего <Seo> — снимаем теги, возвращаясь к базовому
  // index.html (там ни description, ни canonical, ни OG нет).
  useEffect(() => {
    const release = claimPageHead();
    return () => {
      release();
      if (!pageOwnsHead()) clearPageHead();
    };
  }, []);
  return (
    <Head>
      <html lang={lang} />
      <title>{t}</title>
      <meta name="description" content={d} />
      <link rel="canonical" href={canonical} />
      {/* индексация: разрешаем, крупные превью картинок (важно для еды в выдаче) */}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
      <meta name="theme-color" content="#e0860c" />
      {YANDEX_VERIFICATION && <meta name="yandex-verification" content={YANDEX_VERIFICATION} />}
      {GOOGLE_VERIFICATION && <meta name="google-site-verification" content={GOOGLE_VERIFICATION} />}
      {/* hreflang: контент двуязычный на одном URL → ru основной, x-default тот же */}
      {/* hrefLang="ru", а НЕ "ru-RU". Региональный субтег -RU означает «эта
          страница предназначена для России» — на /eda/almaty, /eda/tashkent и
          /strana/uzbekistan это прямой сигнал не тому региону, поверх и без
          того российской доменной зоны. Язык страниц действительно русский;
          страна у них разная. */}
      <link rel="alternate" hrefLang="ru" href={canonical} />
      <link rel="alternate" hrefLang="x-default" href={canonical} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="Celina" />
      <meta property="og:title" content={t} />
      <meta property="og:description" content={d} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={img} />
      <meta property="og:locale" content="ru_RU" />
      {/* og:locale:alternate en_US убран: английский переключается на ТОМ ЖЕ
          URL клиентским кодом, отдельной английской страницы не существует,
          и объявлять её — значит обещать альтернативу, которой нет. */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={t} />
      <meta name="twitter:description" content={d} />
      <meta name="twitter:image" content={img} />
      {blocks.map((b, i) => (
        <script key={i} type="application/ld+json">{JSON.stringify(b)}</script>
      ))}
    </Head>
  );
}

/** Product + Offer (+ рейтинг) для страницы блюда — карточка с ценой/звёздами в выдаче. */
export function dishJsonLd(d: {
  name: string; description?: string; image?: string; price: number;
  cookName?: string; city?: string; rating?: number; ratingsCount?: number; path: string;
}): object {
  const abs = (u?: string) => (u ? (u.startsWith("http") ? u : SITE_URL + u) : SITE_URL + DEFAULT_IMAGE);
  const o: any = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: d.name,
    description: d.description || `Домашнее блюдо ${d.name} от соседа-повара${d.city ? ` в городе ${d.city}` : ""}. Закажите на Celina.`,
    image: abs(d.image),
    category: "Домашняя еда",
    brand: { "@type": "Brand", name: d.cookName || "Celina" },
    offers: {
      "@type": "Offer",
      price: d.price,
      priceCurrency: "RUB",
      availability: "https://schema.org/InStock",
      url: SITE_URL + d.path,
      seller: { "@type": "Organization", name: d.cookName || "Celina" },
    },
  };
  if (d.rating && d.ratingsCount) {
    o.aggregateRating = { "@type": "AggregateRating", ratingValue: d.rating, reviewCount: d.ratingsCount, bestRating: 5 };
  }
  return o;
}

/** FoodEstablishment/LocalBusiness для страницы повара — локальная выдача и карты. */
export function cookJsonLd(c: {
  name: string; description?: string; image?: string; city?: string;
  rating?: number; ratingsCount?: number; path: string;
}): object {
  const abs = (u?: string) => (u ? (u.startsWith("http") ? u : SITE_URL + u) : SITE_URL + DEFAULT_IMAGE);
  const o: any = {
    "@context": "https://schema.org",
    "@type": "FoodEstablishment",
    name: c.name,
    servesCuisine: "Домашняя кухня",
    // если кухня уже названа «Домашняя кухня …», префикс не дублируем
    description:
      c.description ||
      `${/^домашняя кухня/i.test(c.name.trim()) ? c.name : `Домашняя кухня ${c.name}`}${c.city ? ` в городе ${c.city}` : ""} на Celina — закажите еду у проверенного соседа-повара.`,
    image: abs(c.image),
    url: SITE_URL + c.path,
    priceRange: "₽₽",
  };
  if (c.city) o.address = { "@type": "PostalAddress", addressLocality: c.city, addressCountry: "RU" };
  if (c.rating && c.ratingsCount) {
    o.aggregateRating = { "@type": "AggregateRating", ratingValue: c.rating, reviewCount: c.ratingsCount, bestRating: 5 };
  }
  return o;
}

/** BreadcrumbList — хлебные крошки (город/категория) для расширенных сниппетов. */
export function breadcrumbJsonLd(items: { name: string; path: string }[]): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: SITE_URL + it.path,
    })),
  };
}

/** Organization + WebSite (+ SearchAction) — глобальные данные о сайте для главной. */
export const siteJsonLd: object[] = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": SITE_URL + "/#organization",
    name: "Celina",
    alternateName: ["Селина", "Celina — соседи кормят соседей"],
    url: SITE_URL,
    logo: SITE_URL + "/icon-512.png",
    image: SITE_URL + "/icon-512.png",
    slogan: "Соседи кормят соседей",
    description: "Маркетплейс домашней еды в России: заказывайте блюда у проверенных соседей-поваров с доставкой и самовывозом.",
    email: "celinarussia.support@gmail.com",
        // Правило основателя (25.08.2026): место создания сервиса на сайте НЕ
    // указывается — публикуется только факт: сервис выпущен в июле 2026.
    foundingDate: "2026-07",
    areaServed: { "@type": "Country", name: "Россия" },
    // привязка соцпрофилей к бренду → узнавание сущности и панель знаний в Яндексе/Google
    sameAs: [
      "https://t.me/Celina_eda",
      "https://vk.com/celina_eda",
      "https://ok.ru/group/70000059720754",
      "https://www.linkedin.com/company/celina-food/",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      email: "celinarussia.support@gmail.com",
      contactType: "customer support",
      areaServed: "RU",
      availableLanguage: ["Russian", "English"],
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Celina",
    url: SITE_URL,
    inLanguage: "ru-RU",
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: SITE_URL + "/?q={search_term_string}" },
      "query-input": "required name=search_term_string",
    },
  },
];

/** Та же организация (тот же @id), что и на главной — для страницы «О нас».
 *  Профильная страница компании несёт данные об организации, дате основания
 *  (foundingDate 2026-07) и дате запуска (июль 2026), а не только главная. */
export const aboutJsonLd: object[] = [siteJsonLd[0]];
