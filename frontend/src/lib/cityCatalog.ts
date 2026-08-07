/**
 * Статический список приоритетных городов для SEO-страниц /eda/:city.
 * Нужен, чтобы страница «Домашняя еда в <городе>» существовала и индексировалась
 * ДАЖЕ когда в городе ещё нет ни одного повара (каталог seo-data.json пуст на старте).
 * Без этого весь высокочастотный ФУД-интент («домашняя еда в Москве/СПб/…») не имел
 * бы ни одной индексируемой посадочной страницы. У каждого города есть фото
 * (см. cityImages.json) и предложный падеж (prep) для грамматики заголовков.
 */
export interface CityEntry { slug: string; name: string; prep: string }

export const CITY_CATALOG: CityEntry[] = [
  { slug: "moskva", name: "Москва", prep: "Москве" },
  { slug: "sankt-peterburg", name: "Санкт-Петербург", prep: "Санкт-Петербурге" },
  { slug: "novosibirsk", name: "Новосибирск", prep: "Новосибирске" },
  { slug: "ekaterinburg", name: "Екатеринбург", prep: "Екатеринбурге" },
  { slug: "kazan", name: "Казань", prep: "Казани" },
  { slug: "nizhniy-novgorod", name: "Нижний Новгород", prep: "Нижнем Новгороде" },
  { slug: "chelyabinsk", name: "Челябинск", prep: "Челябинске" },
  { slug: "krasnoyarsk", name: "Красноярск", prep: "Красноярске" },
  { slug: "ufa", name: "Уфа", prep: "Уфе" },
  { slug: "krasnodar", name: "Краснодар", prep: "Краснодаре" },
  { slug: "voronezh", name: "Воронеж", prep: "Воронеже" },
  { slug: "rostov-na-donu", name: "Ростов-на-Дону", prep: "Ростове-на-Дону" },
  { slug: "sochi", name: "Сочи", prep: "Сочи" },
  { slug: "perm", name: "Пермь", prep: "Перми" },
  { slug: "volgograd", name: "Волгоград", prep: "Волгограде" },
  // ещё крупные города РФ — расширение охвата поиска
  { slug: "samara", name: "Самара", prep: "Самаре" },
  { slug: "omsk", name: "Омск", prep: "Омске" },
  { slug: "tyumen", name: "Тюмень", prep: "Тюмени" },
  { slug: "saratov", name: "Саратов", prep: "Саратове" },
  // Беларусь — ТОЛЬКО SEO-контент + список ожидания (спрос), без операций:
  // другая юрисдикция (закон о ПД РБ ≠ 152-ФЗ) — запуск сервиса требует
  // отдельного решения основателя. Страницы копят спрос, ничего не обещают.
  { slug: "minsk", name: "Минск", prep: "Минске" },
  { slug: "gomel", name: "Гомель", prep: "Гомеле" },
  { slug: "brest", name: "Брест", prep: "Бресте" },
];

/** Все slug приоритетных городов — для безусловной генерации маршрутов/sitemap. */
export const CITY_CATALOG_SLUGS = CITY_CATALOG.map((c) => c.slug);

export function getCityStatic(slug: string): CityEntry | undefined {
  return CITY_CATALOG.find((c) => c.slug === slug);
}
