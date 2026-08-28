/** Преобразование CSV-полей (cuisine, tags) в массивы для ответа API. */

export function csvToArray(value: string | null | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function arrayToCsv(value: string[] | undefined): string {
  if (!value) return "";
  return value.map((s) => s.trim()).filter(Boolean).join(",");
}

export function serializeDish(dish: any) {
  const photos = csvToArray(dish.photos);
  return {
    ...dish,
    tags: csvToArray(dish.tags),
    allergens: csvToArray(dish.allergens),
    photos,
    // главное фото: photoUrl или первое из массива
    photoUrl: dish.photoUrl || photos[0] || null,
  };
}

/** Огрубление координаты до ~110 м — достаточно для расстояния, но не для адреса. */
function fuzzCoord(v: number | null | undefined): number | null {
  return typeof v === "number" ? Math.round(v * 1000) / 1000 : null;
}

export function serializeCook(cook: any) {
  // ВНИМАНИЕ: user вырезаем из спреда явно. Верхнеуровневые lat/lng ниже
  // огрубляются до ~110 м, но вложенный user приходил из Prisma с ТОЧНЫМИ
  // lat/lng — то есть домашний адрес повара уезжал в публичный /api/cooks
  // мимо всего огрубления. Отдаём наружу только безопасные поля профиля.
  const { user, activationPaymentId, activationPaidAt, ...rest } = cook;
  return {
    ...rest,
    user: user ? { name: user.name, city: user.city, isVerified: user.isVerified } : undefined,
    cuisine: csvToArray(cook.cuisine),
    kitchenPhotos: csvToArray(cook.kitchenPhotos),
    dishes: cook.dishes?.map(serializeDish),
    // Координаты повара нужны ленте, чтобы показать расстояние («1.2 км»).
    // Но точные координаты домашнего повара — это его домашний адрес, а лента
    // открыта без авторизации. Огрубляем до 3 знаков (~110 м): расстояние
    // остаётся верным на показываемой точности, а дом по ним не найти.
    lat: fuzzCoord(cook.user?.lat),
    lng: fuzzCoord(cook.user?.lng),
  };
}
