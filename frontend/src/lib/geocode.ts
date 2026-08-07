/**
 * Лёгкое обратное геокодирование через OpenStreetMap Nominatim (без ключа).
 * Используется кнопкой Найти моё местоположение, чтобы подставить реальный
 * адрес. Если сервис недоступен — возвращаем null, и пользователь вводит вручную.
 */
export interface GeoAddr {
  display: string;
  city: string | null;
  lat: number;
  lng: number;
}

import { cityCoords, haversineM } from "./cityCoords";
import { CITY_RADIUS_M, looksLikeAddress } from "./address";
import { latinToCyrillic } from "./aiSearch";

const STREET_WORD = /^(ул|улица|пр|прт|пркт|проспект|пер|переулок|ш|шоссе|наб|набережная|бр|бульвар|пл|площадь|проезд|дом|д|кв|корпус|стр|street|st|ave|avenue|road|rd|lane|ln|drive|dr|blvd)$/i;

export type AddrReason = "format" | "notFound" | "wrongCity";
export interface AddrCheck { ok: boolean; reason?: AddrReason; display?: string; lat?: number; lng?: number }

/**
 * Настоящая проверка адреса: прямое геокодирование (OpenStreetMap Nominatim).
 * Адрес считается валидным, только если геокодер нашёл КОНКРЕТНУЮ точку с улицей
 * и она находится в нужном городе (≤60 км от центра). DSDDS и подобный мусор
 * не находится → отклоняется. При недоступности сервиса — мягкий откат на
 * структурную проверку, чтобы не блокировать заказ из-за сети.
 */
export async function geocodeInCity(address: string, city: string): Promise<AddrCheck> {
  if (!looksLikeAddress(address)) return { ok: false, reason: "format" };
  const target = cityCoords(city);
  try {
    const q = encodeURIComponent(`${address} ${city}`);
    const url = `https://photon.komoot.io/api/?q=${q}&limit=1&lang=default`;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(url, { headers: { Accept: "application/json" }, signal: ctrl.signal });
    clearTimeout(timer);
    if (!res.ok) return { ok: looksLikeAddress(address) }; // мягкий откат при недоступности
    const d = await res.json();
    const f = d?.features?.[0];
    if (!f) return { ok: false, reason: "notFound" };
    const p = f.properties || {};
    const [lng, lat] = (f.geometry?.coordinates as number[]) || [];

    // ВАЖНО: геокодер делает нечёткий поиск и на мусор (DSDDS) вернёт ближайший
    // объект. Поэтому проверяем, что найденный объект реально СОДЕРЖИТ слова из
    // запроса (название улицы), а не просто что-то рядом.
    const resultText = `${p.name ?? ""} ${p.street ?? ""} ${p.district ?? ""} ${p.city ?? ""} ${p.state ?? ""}`.toLowerCase();
    const qWords = address.toLowerCase().replace(/[^\p{L}\s]/gu, " ").split(/\s+/)
      .filter((w) => w.length >= 3 && !STREET_WORD.test(w));
    const overlap = qWords.length === 0 || qWords.some((w) => {
      const tr = latinToCyrillic(w);
      return resultText.includes(w) || (tr.length > 1 && resultText.includes(tr));
    });
    if (!overlap) return { ok: false, reason: "notFound" };

    // в нужном городе? (≤60 км от центра)
    if (target && Number.isFinite(lat) && Number.isFinite(lng)) {
      if (haversineM({ lat, lng }, target) > CITY_RADIUS_M) return { ok: false, reason: "wrongCity" };
    }
    const display = [p.street, p.housenumber].filter(Boolean).join(", ") || p.name || "";
    return { ok: true, display, lat, lng };
  } catch {
    return { ok: looksLikeAddress(address) }; // сеть недоступна — не блокируем заказ
  }
}

export async function reverseGeocode(lat: number, lng: number): Promise<GeoAddr | null> {
  try {
    const url = `https://photon.komoot.io/reverse?lon=${lng}&lat=${lat}&lang=default`;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(url, { headers: { Accept: "application/json" }, signal: ctrl.signal });
    clearTimeout(timer);
    if (!res.ok) return null;
    const d = await res.json();
    const p = d?.features?.[0]?.properties || {};
    const city: string | null = p.city || p.town || p.village || p.district || p.state || null;
    const display = [p.street, p.housenumber].filter(Boolean).join(", ") || p.name || "";
    return { display, city, lat, lng };
  } catch {
    return null;
  }
}
