import { RU_CITIES } from "./ruCities";
import { cityCoords, haversineM } from "./cityCoords";

/** Радиус в пределах города от его центра (м). */
export const CITY_RADIUS_M = 60000;

/**
 * Адрес считается в городе, если он достаточно конкретный (≥5 символов)
 * и НЕ упоминает другой известный город. Без внешних API — как в регистрации.
 */
export function addressInCity(addr: string, city: string | null | undefined): boolean {
  if (!city || addr.trim().length < 5) return false;
  const low = addr.toLowerCase();
  const mentioned = RU_CITIES.find((c) => low.includes(c.toLowerCase()));
  return !mentioned || mentioned === city;
}

/** Точка геолокации попадает в выбранный город (≤60 км от центра)? */
export function pointInCity(here: { lat: number; lng: number }, city: string | null | undefined): boolean {
  const target = cityCoords(city);
  if (!target) return false;
  return haversineM(here, target) <= CITY_RADIUS_M;
}

/** Нормализованное сравнение городов (покупатель ↔ повар). */
export function sameCity(a: string | null | undefined, b: string | null | undefined): boolean {
  if (!a || !b) return false;
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

/**
 * Быстрая структурная проверка похоже на адрес: есть номер дома (цифра) и
 * признак улицы (ул./проспект/street…) ИЛИ хотя бы пара слов. Отсекает мусор
 * вроде DSDDS ДО обращения к геокодеру. Это только предфильтр — настоящая
 * проверка делается геокодированием (geocodeInCity).
 */
export function looksLikeAddress(addr: string): boolean {
  const s = addr.trim();
  if (s.length < 5) return false;
  if (!/\d/.test(s)) return false; // у настоящего адреса есть номер дома
  const streetWord =
    /(ул\.?|улиц|пр-?кт|пр-?т|проспект|пер\.?|переул|ш\.?|шоссе|наб\.?|набереж|б-?р|бульвар|пл\.?|площад|проезд|кв-?л|микрорайон|мкр|street|st\.?|ave|avenue|road|rd\.?|lane|ln\.?|blvd|drive|dr\.?)/i.test(s);
  const words = s.replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter((w) => w.length > 1);
  return streetWord || words.length >= 2;
}
