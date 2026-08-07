/**
 * Доступ к статическому снимку данных (frontend/src/data/seo-data.json),
 * сгенерированному бекендом (`npm run seo:export`).
 * Используется программными SEO-страницами (города/категории/повара/блюда),
 * чтобы при пререндере (vite-react-ssg) в HTML попадал реальный контент.
 */
import raw from "../data/seo-data.json";
import { RU_CITY_PREP } from "./ruCities";

export interface SeoDish {
  id: string;
  slug: string;
  title: string;
  category: string;
  price: number;
  photoUrl: string | null;
  description: string;
}
export interface SeoReview {
  rating: number;
  comment: string;
  createdAt: string;
  buyerName: string;
}
export interface SeoCook {
  id: string;
  slug: string;
  kitchenName: string;
  ownerName: string;
  bio: string;
  city: string;
  cuisine: string[];
  rating: number;
  ratingsCount: number;
  lat: number | null;
  lng: number | null;
  dishes: SeoDish[];
  reviews?: SeoReview[]; // опционально: старые снимки без отзывов остаются валидными
}
export interface SeoCity { name: string; prep: string; slug: string; cookCount: number }

/** Заглавная первая буква (для категорий: горячее → Горячее). */
export function cap(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

/**
 * Винительный падеж названия категории — для фраз вида «заказать выпечку»,
 * «повара готовят выпечку». Набор категорий фиксирован (CATEGORIES в
 * pages/cook/Menu.tsx); у остальных винительный совпадает с именительным,
 * поэтому незнакомое слово возвращается без изменений.
 */
const CATEGORY_ACC: Record<string, string> = {
  выпечка: "выпечку",
};
export function catAcc(s: string): string {
  const key = s.toLowerCase();
  return CATEGORY_ACC[key] ?? key;
}
export interface SeoCategory { name: string; slug: string; count: number }

interface SeoSnapshot {
  generatedAt: string;
  cooks: SeoCook[];
  cities: SeoCity[];
  categories: SeoCategory[];
}

const data = raw as SeoSnapshot;

export const seoCooks = data.cooks;
export const seoCities = data.cities;
export const seoCategories = data.categories;

export function cooksInCity(citySlug: string): SeoCook[] {
  const city = seoCities.find((c) => c.slug === citySlug);
  if (!city) return [];
  return seoCooks.filter((c) => c.city === city.name);
}

export function getCity(citySlug: string): SeoCity | undefined {
  return seoCities.find((c) => c.slug === citySlug);
}

export function getCategory(catSlug: string): SeoCategory | undefined {
  return seoCategories.find((c) => c.slug === catSlug);
}

/** Повара в городе, у которых есть блюдо нужной категории. */
export function cooksInCityByCategory(citySlug: string, catSlug: string): SeoCook[] {
  const cat = getCategory(catSlug);
  if (!cat) return [];
  return cooksInCity(citySlug).filter((c) => c.dishes.some((d) => d.category === cat.name));
}

export function getCook(id: string): SeoCook | undefined {
  return seoCooks.find((c) => c.id === id);
}

/** Слаг города по его названию (для хлебных крошек), или "" если города нет в снимке. */
export function citySlugOf(name: string | null | undefined): string {
  if (!name) return "";
  return seoCities.find((c) => c.name === name)?.slug ?? "";
}

/** Предложный падеж города по названию (Калининград → Калининграде).
 *  Снимок покрывает только города с поварами, поэтому для остальных
 *  (например, город застолья) берём общий список RU_CITY_PREP. */
export function cityPrepOf(name: string | null | undefined): string {
  if (!name) return "";
  return seoCities.find((c) => c.name === name)?.prep ?? RU_CITY_PREP[name] ?? name;
}

/** Найти блюдо по слагу + его повара (для страницы блюда). */
export function getDishBySlug(dishSlug: string): { dish: SeoDish; cook: SeoCook } | undefined {
  for (const cook of seoCooks) {
    const dish = cook.dishes.find((d) => d.slug === dishSlug);
    if (dish) return { dish, cook };
  }
  return undefined;
}

/**
 * Снимок повара → минимальный CookProfile для НАЧАЛЬНОГО рендера (SSG + первый кадр на клиенте).
 * Недостающие интерактивные поля получаем живым запросом к API на клиенте.
 */
export function seoCookToProfile(id: string): import("../types").CookProfile | null {
  const c = getCook(id);
  if (!c) return null;
  return {
    id: c.id,
    userId: "",
    kitchenName: c.kitchenName,
    bio: c.bio,
    cuisine: c.cuisine,
    rating: c.rating,
    ratingsCount: c.ratingsCount,
    isOnline: false,
    deliveryEnabled: true,
    pickupEnabled: true,
    deliveryFee: 0,
    minOrder: 0,
    city: c.city,
    user: { name: c.ownerName, isVerified: true, city: c.city, lat: c.lat, lng: c.lng },
    dishes: c.dishes.map((d) => ({
      id: d.id,
      cookProfileId: c.id,
      title: d.title,
      description: d.description,
      price: d.price,
      photoUrl: d.photoUrl,
      photos: d.photoUrl ? [d.photoUrl] : [],
      category: d.category,
      portions: 1,
      prepTimeMin: 0,
      tags: [],
      allergens: [],
      isAvailable: true,
    })),
    reviews: (c.reviews ?? []).map((r, i) => ({
      id: `seo-${c.id}-${i}`,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
      buyer: { name: r.buyerName },
    })),
  };
}
