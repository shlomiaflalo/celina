/**
 * Города, для которых существует посадочная страница /eda/:slug.
 *
 * Список — это МАРКЕТИНГОВЫЙ ОХВАТ, а не зона работы сервиса. Работает Селина
 * только в России; за её пределами страница честно говорит, что сервиса тут
 * пока нет, и собирает список ожидания. Границу «где мы работаем» держит
 * СОВСЕМ другой список — RU_CITIES в lib/ruCities.ts, закрытый выпадающий
 * список при регистрации повара. Никогда не подменяйте один список другим
 * «чтобы синхронизировать»: одна такая правка молча открывает регистрацию
 * поваров в Алматы и Ереване.
 *
 * country нужен не для красоты: от него зависят addressCountry в разметке,
 * валюта, наличие поля контакта в форме ожидания и сам факт, что страница
 * говорит «мы тут не работаем».
 */
export type CountryCode = "RU" | "BY" | "KZ" | "UZ" | "AM";

export interface CountryEntry {
  code: CountryCode;
  /** Название страны, именительный падеж. */
  name: string;
  /** Предложный падеж — подставляется после «в». */
  prep: string;
  /** Латинский слаг для /strana/:slug */
  slug: string;
  /** ISO-код валюты и символ — для контекста, НЕ для цен Селины. */
  currency: string;
  currencySymbol: string;
  /** Работает ли сервис в этой стране на самом деле. Сейчас — только Россия. */
  operates: boolean;
  /**
   * Можно ли просить контакт в списке ожидания.
   * KZ и UZ — нет: без имени, телефона и IP форма собирает обезличенную
   * статистику и не попадает под местные законы о персданных вообще,
   * а не «попадает, но у нас есть оправдание».
   */
  allowsContact: boolean;
}

export const COUNTRIES: Record<CountryCode, CountryEntry> = {
  RU: { code: "RU", name: "Россия", prep: "России", slug: "rossiya",
        currency: "RUB", currencySymbol: "₽", operates: true, allowsContact: true },
  BY: { code: "BY", name: "Беларусь", prep: "Беларуси", slug: "belarus",
        currency: "BYN", currencySymbol: "Br", operates: false, allowsContact: true },
  KZ: { code: "KZ", name: "Казахстан", prep: "Казахстане", slug: "kazakhstan",
        currency: "KZT", currencySymbol: "₸", operates: false, allowsContact: false },
  UZ: { code: "UZ", name: "Узбекистан", prep: "Узбекистане", slug: "uzbekistan",
        currency: "UZS", currencySymbol: "сум", operates: false, allowsContact: false },
  AM: { code: "AM", name: "Армения", prep: "Армении", slug: "armeniya",
        currency: "AMD", currencySymbol: "֏", operates: false, allowsContact: true },
};

export interface CityEntry { slug: string; name: string; prep: string; country: CountryCode }

export const CITY_CATALOG: CityEntry[] = [
  { slug: "moskva", name: "Москва", prep: "Москве", country: "RU" },
  { slug: "sankt-peterburg", name: "Санкт-Петербург", prep: "Санкт-Петербурге", country: "RU" },
  { slug: "novosibirsk", name: "Новосибирск", prep: "Новосибирске", country: "RU" },
  { slug: "ekaterinburg", name: "Екатеринбург", prep: "Екатеринбурге", country: "RU" },
  { slug: "kazan", name: "Казань", prep: "Казани", country: "RU" },
  { slug: "nizhniy-novgorod", name: "Нижний Новгород", prep: "Нижнем Новгороде", country: "RU" },
  { slug: "chelyabinsk", name: "Челябинск", prep: "Челябинске", country: "RU" },
  { slug: "krasnoyarsk", name: "Красноярск", prep: "Красноярске", country: "RU" },
  { slug: "ufa", name: "Уфа", prep: "Уфе", country: "RU" },
  { slug: "krasnodar", name: "Краснодар", prep: "Краснодаре", country: "RU" },
  { slug: "voronezh", name: "Воронеж", prep: "Воронеже", country: "RU" },
  { slug: "rostov-na-donu", name: "Ростов-на-Дону", prep: "Ростове-на-Дону", country: "RU" },
  { slug: "sochi", name: "Сочи", prep: "Сочи", country: "RU" },
  { slug: "perm", name: "Пермь", prep: "Перми", country: "RU" },
  { slug: "volgograd", name: "Волгоград", prep: "Волгограде", country: "RU" },
  // ещё крупные города РФ — расширение охвата поиска
  { slug: "samara", name: "Самара", prep: "Самаре", country: "RU" },
  { slug: "omsk", name: "Омск", prep: "Омске", country: "RU" },
  { slug: "tyumen", name: "Тюмень", prep: "Тюмени", country: "RU" },
  { slug: "saratov", name: "Саратов", prep: "Саратове", country: "RU" },

  // ── Беларусь ── охват и список ожидания; сервис здесь НЕ работает
  { slug: "minsk", name: "Минск", prep: "Минске", country: "BY" },
  { slug: "gomel", name: "Гомель", prep: "Гомеле", country: "BY" },
  { slug: "grodno", name: "Гродно", prep: "Гродно", country: "BY" },
  { slug: "vitebsk", name: "Витебск", prep: "Витебске", country: "BY" },
  { slug: "mogilev", name: "Могилёв", prep: "Могилёве", country: "BY" },
  { slug: "brest", name: "Брест", prep: "Бресте", country: "BY" },
  { slug: "bobruysk", name: "Бобруйск", prep: "Бобруйске", country: "BY" },

  // ── Казахстан ── охват и список ожидания; сервис здесь НЕ работает
  { slug: "almaty", name: "Алматы", prep: "Алматы", country: "KZ" },
  { slug: "astana", name: "Астана", prep: "Астане", country: "KZ" },
  { slug: "shymkent", name: "Шымкент", prep: "Шымкенте", country: "KZ" },
  { slug: "karaganda", name: "Караганда", prep: "Караганде", country: "KZ" },
  { slug: "ust-kamenogorsk", name: "Усть-Каменогорск", prep: "Усть-Каменогорске", country: "KZ" },
  { slug: "pavlodar", name: "Павлодар", prep: "Павлодаре", country: "KZ" },

  // ── Узбекистан ── охват и список ожидания; сервис здесь НЕ работает
  { slug: "tashkent", name: "Ташкент", prep: "Ташкенте", country: "UZ" },
  { slug: "samarkand", name: "Самарканд", prep: "Самарканде", country: "UZ" },
  { slug: "fergana", name: "Фергана", prep: "Фергане", country: "UZ" },

  // ── Армения ── охват и список ожидания; сервис здесь НЕ работает
  { slug: "yerevan", name: "Ереван", prep: "Ереване", country: "AM" },
];

/** Все slug приоритетных городов — для безусловной генерации маршрутов/sitemap. */
export const CITY_CATALOG_SLUGS = CITY_CATALOG.map((c) => c.slug);

export function getCityStatic(slug: string): CityEntry | undefined {
  return CITY_CATALOG.find((c) => c.slug === slug);
}
