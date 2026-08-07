/**
 * Серверная проверка адреса доставки: адрес должен быть НАСТОЯЩИМ и находиться
 * в городе повара/покупателя. Зеркалит клиентскую проверку (frontend/src/lib/geocode.ts),
 * потому что клиентскую можно обойти прямым запросом к API.
 *
 * Геокодер — Photon (OpenStreetMap, без ключа). При недоступности сервиса
 * заказ НЕ блокируем (мягкий откат на структурную проверку) — доступность
 * важнее строгости для пилота.
 */

/** Радиус города от центра (м) — как на клиенте. */
export const CITY_RADIUS_M = 60000;

/** Центры основных городов (широта, долгота) — подмножество клиентской таблицы. */
const CITY_COORDS: Record<string, [number, number]> = {
  "Москва": [55.7558, 37.6173],
  "Санкт-Петербург": [59.9311, 30.3609],
  "Новосибирск": [55.0084, 82.9357],
  "Екатеринбург": [56.8389, 60.6057],
  "Казань": [55.7963, 49.1088],
  "Нижний Новгород": [56.2965, 43.9361],
  "Челябинск": [55.1644, 61.4368],
  "Самара": [53.1959, 50.1002],
  "Омск": [54.9885, 73.3242],
  "Ростов-на-Дону": [47.2357, 39.7015],
  "Уфа": [54.7388, 55.9721],
  "Красноярск": [56.0153, 92.8932],
  "Воронеж": [51.6755, 39.2089],
  "Пермь": [58.0105, 56.2502],
  "Волгоград": [48.708, 44.5133],
  "Краснодар": [45.0355, 38.9753],
  "Саратов": [51.5336, 46.0343],
  "Тюмень": [57.153, 65.5343],
  "Калининград": [54.7104, 20.4522],
  "Сочи": [43.6028, 39.7342],
  "Владивосток": [43.1155, 131.8855],
};

function haversineM(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(s)));
}

/** Нормализованное сравнение городов (покупатель ↔ повар). */
export function sameCity(a: string | null | undefined, b: string | null | undefined): boolean {
  if (!a || !b) return false;
  return a.trim().toLowerCase().replace(/ё/g, "е") === b.trim().toLowerCase().replace(/ё/g, "е");
}

/** Структурный предфильтр: есть цифра дома и признак улицы/пара слов. */
export function looksLikeAddress(addr: string): boolean {
  const s = addr.trim();
  if (s.length < 5) return false;
  if (!/\d/.test(s)) return false;
  const streetWord =
    /(ул\.?|улиц|пр-?кт|пр-?т|проспект|пер\.?|переул|ш\.?|шоссе|наб\.?|набереж|б-?р|бульвар|пл\.?|площад|проезд|кв-?л|микрорайон|мкр|street|st\.?|ave|avenue|road|rd\.?|lane|ln\.?|blvd|drive|dr\.?)/i.test(s);
  const words = s.replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter((w) => w.length > 1);
  return streetWord || words.length >= 2;
}

const STREET_WORD = /^(ул|улица|пр|прт|пркт|проспект|пер|переулок|ш|шоссе|наб|набережная|бр|бульвар|пл|площадь|проезд|дом|д|кв|корпус|стр|street|st|ave|avenue|road|rd|lane|ln|drive|dr|blvd)$/i;

export type AddressVerdict = "ok" | "format" | "notFound" | "wrongCity" | "unavailable";

// кэш результатов на процесс: один и тот же адрес не гоняем в геокодер повторно
const cache = new Map<string, AddressVerdict>();

/**
 * Проверяет, что адрес реален и находится в заданном городе (≤60 км от центра).
 * "unavailable" — геокодер недоступен: вызывающий решает, блокировать ли заказ
 * (мы НЕ блокируем — как и клиент).
 */
export async function verifyAddressInCity(address: string, city: string): Promise<AddressVerdict> {
  if (!looksLikeAddress(address)) return "format";
  const key = `${address.trim().toLowerCase()}|${city.trim().toLowerCase()}`;
  const hit = cache.get(key);
  if (hit && hit !== "unavailable") return hit;

  const target = CITY_COORDS[city.trim()] ?? null;
  try {
    const q = encodeURIComponent(`${address} ${city}`);
    const url = `https://photon.komoot.io/api/?q=${q}&limit=1&lang=default`;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 5000);
    const res = await fetch(url, { headers: { Accept: "application/json" }, signal: ctrl.signal });
    clearTimeout(timer);
    if (!res.ok) return "unavailable";
    const d = (await res.json()) as { features?: Array<{ properties?: Record<string, string>; geometry?: { coordinates?: number[] } }> };
    const f = d?.features?.[0];
    if (!f) { cache.set(key, "notFound"); return "notFound"; }
    const p = f.properties || {};
    const [lng, lat] = f.geometry?.coordinates ?? [];

    // геокодер нечёткий: на мусор вернёт «что-то рядом». Требуем, чтобы найденный
    // объект реально содержал слова запроса (название улицы).
    const resultText = `${p.name ?? ""} ${p.street ?? ""} ${p.district ?? ""} ${p.city ?? ""} ${p.state ?? ""}`.toLowerCase();
    const qWords = address.toLowerCase().replace(/[^\p{L}\s]/gu, " ").split(/\s+/)
      .filter((w) => w.length >= 3 && !STREET_WORD.test(w));
    const overlap = qWords.length === 0 || qWords.some((w) => resultText.includes(w));
    if (!overlap) { cache.set(key, "notFound"); return "notFound"; }

    if (target && Number.isFinite(lat) && Number.isFinite(lng)) {
      if (haversineM({ lat: lat as number, lng: lng as number }, { lat: target[0], lng: target[1] }) > CITY_RADIUS_M) {
        cache.set(key, "wrongCity");
        return "wrongCity";
      }
    }
    cache.set(key, "ok");
    return "ok";
  } catch {
    return "unavailable"; // сеть/таймаут — не блокируем заказ
  }
}
