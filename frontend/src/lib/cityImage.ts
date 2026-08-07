import cityMap from "./cityImages.json";

/**
 * Обложка кухни = фото города, в котором зарегистрирован повар.
 * Картинки по городам собраны автоматически (ведущее фото города из Википедии).
 * Если фото города нет — показываем Москву (Красная площадь) как запасной вариант.
 */
const FALLBACK = "/images/red-square.jpg";

export function cityImage(city?: string | null): string {
  if (!city) return FALLBACK;
  return (cityMap as Record<string, string>)[city] || FALLBACK;
}
