/**
 * Перевод пользовательских сообщений об ошибках RU → EN.
 * Бэкенд хранит сообщения на русском; если запрос пришёл с языком EN
 * (заголовок X-Lang), middleware подменяет текст по этому словарю.
 * Строки, которых нет в словаре, отдаются как есть (на русском).
 */
const RU_TO_EN: Record<string, string> = {
  // auth
  "Неверный телефон или пароль": "Invalid phone or password",
  "Неверный токен": "Invalid token",
  "Неверный или просроченный код": "Invalid or expired code",
  "Требуется подтверждение по коду": "Code confirmation required",
  "Телефон уже зарегистрирован": "This phone is already registered",
  "Телефон уже занят": "This phone is already taken",
  "Слишком много попыток. Попробуйте позже.": "Too many attempts. Please try again later.",
  "Необходимо принять Политику конфиденциальности": "You must accept the Privacy Policy",
  "Подтвердите местоположение, чтобы завершить регистрацию": "Confirm your location to finish registration",
  "Не авторизован": "Not authorized",
  "Нет доступа": "Access denied",
  "Доступ только для основателя": "Founder access only",
  "Сессия завершена — войдите снова": "Your session has ended — please sign in again",
  "Выберите город": "Select a city",
  "Лимит запросов кода исчерпан (3 в час) — попробуйте позже":
    "Code request limit reached (3 per hour) — please try again later",

  // users / cooks
  "Пользователь не найден": "User not found",
  "Повар не найден": "Cook not found",
  "Профиль повара не найден": "Cook profile not found",
  "Нельзя удалить кухню, по которой уже есть заказы": "You can't delete a kitchen that already has orders",
  "Только для повара": "Cooks only",
  "Активация доступна только повару": "Activation is available to cooks only",
  "Сначала пройдите верификацию": "Complete verification first",
  "Опубликовать блюдо можно только после верификации": "You can publish a dish only after verification",
  "Изменять блюда можно только после верификации": "You can edit dishes only after verification",
  "Повар должен принять санитарные нормы, загрузить фото кухни и подписать заявление о безопасности":
    "The cook must accept hygiene standards, upload kitchen photos and sign the safety statement",
  "Повар сейчас не в сети": "The cook is offline right now",
  "Этот повар не принимает гостей": "This cook is not accepting guests",
  "Отправлять заявку этому повару можно раз в 30 минут": "You can send a request to this cook once every 30 minutes",
  "Нельзя позвонить себе": "You can't call yourself",

  // dishes
  "Блюдо не найдено": "Dish not found",
  "Добавьте хотя бы одно фото блюда": "Add at least one dish photo",

  // orders / reviews
  "Заказ не найден": "Order not found",
  "Заказ уже оплачен": "Order is already paid",
  "Неверный состав заказа": "Invalid order contents",
  "Оценить можно только доставленный заказ": "You can only review a delivered order",
  "Отменить заказ можно в течение 5 минут после оформления": "Orders can be cancelled within 5 minutes of placing",
  "Отзыв не найден": "Review not found",
  "Можно удалять только отзывы о своей кухне": "You can only delete reviews about your own kitchen",
  "Вы уже оценили этот заказ": "You have already reviewed this order",
  "Статус заказа уже изменился — обновите страницу": "The order status has already changed — refresh the page",
  "Можно заказывать максимум у 2 поваров за 30 минут — попробуйте чуть позже": "You can order from up to 2 cooks within 30 minutes — please try again a bit later",
  "Повар из другого города — доставка недоступна": "This cook is in a different city — delivery is unavailable",
  "Укажите адрес доставки": "Please enter a delivery address",
  "Адрес не найден — уточните улицу и номер дома": "Address not found — please check the street and house number",
  "Встреча доступна только в вашем городе": "Meetups are only available in your city",
  "Требуется согласие на обработку биометрических данных": "Consent to process biometric data is required",
  "Доставка кода не настроена — проверьте SMTP_* в backend/.env на сервере": "Code delivery is not configured — check SMTP_* in backend/.env on the server",
  "Сервис отправки кодов временно недоступен — попробуйте позже": "The code delivery service is temporarily unavailable — please try again later",

  // calls
  "Нет доступа к звонку": "No access to this call",

  // payments
  "Неверный номер карты": "Invalid card number",
  "Срок действия карты истёк": "The card has expired",
  "Нет данных карты": "No card details",
  "Платёж отклонён банком": "Payment declined by the bank",
  "Провайдер не настроен": "Payment provider is not configured",

  // gatherings
  "Застолье не найдено": "Gathering not found",
  "Застолье уже прошло": "This gathering has already taken place",
  "Застолье отменено": "This gathering has been canceled",
  "Дата застолья должна быть в будущем": "The gathering date must be in the future",
  "Вы организатор этого застолья": "You are the host of this gathering",
  "Только организатор может отменить": "Only the host can cancel",
  "Недостаточно свободных мест": "Not enough seats available",
  "Добавьте фото места или хозяина": "Add a photo of the place or host",

  // waitlist / contact
  "Укажите город": "Please enter a city",
  "Заполните имя, корректный e-mail и сообщение": "Please fill in your name, a valid e-mail and a message",
  "Отправка временно недоступна — напишите нам на почту напрямую":
    "Sending is temporarily unavailable — please e-mail us directly",
  "Не удалось отправить — попробуйте позже или напишите на почту напрямую":
    "Couldn't send — please try again later or e-mail us directly",

  // uploads
  "Файл не получен": "No file received",
  "Допустимы изображения, видео (mp4/webm) или PDF": "Images, video (mp4/webm) or PDF are allowed",

  // generic
  "Not found": "Not found",
  "Ошибка валидации": "Validation error",
  "Внутренняя ошибка сервера": "Internal server error",

  // валидация Zod (lib/zodRu.ts) — попадает в details[].message каждой формы
  "Обязательное поле": "This field is required",
  "Заполните поле": "Please fill in this field",
  "Ожидается число": "A number is expected",
  "Ожидается текст": "Text is expected",
  "Ожидается «да/нет»": "A yes/no value is expected",
  "Неверный тип значения": "Invalid value type",
  "Значение слишком маленькое": "Value is too small",
  "Значение слишком большое": "Value is too large",
  "Недопустимое значение": "Invalid value",
  "Неверный адрес e-mail": "Invalid e-mail address",
  "Неверная дата/время": "Invalid date/time",
  "Неверный формат": "Invalid format",
};

export type Lang = "ru" | "en";

export function pickLang(headerValue?: string | null): Lang {
  return (headerValue || "").toLowerCase().startsWith("en") ? "en" : "ru";
}

// Динамические сообщения (с подстановками): пара [русский шаблон, английская замена].
// $1/$2 — захваченные группы (название блюда, числа, статусы).
const DYNAMIC: Array<[RegExp, string]> = [
  [/^«(.+)» уже разобрали — обновите корзину$/, "“$1” is sold out — refresh your cart"],
  [/^«(.+)» сейчас недоступно — обновите корзину$/, "“$1” is currently unavailable — refresh your cart"],
  [/^«(.+)» — осталось порций: (\d+)$/, "“$1” — only $2 portion(s) left"],
  [/^Максимум (\d+) гостей$/, "Maximum $1 guests"],
  [/^Минимальный заказ — (\d+(?:\.\d+)?) ₽$/, "Minimum order — $1 ₽"],
  [/^Нельзя перейти из (\S+) в (\S+)$/, "Cannot change order status from $1 to $2"],
  [/^Адрес должен быть в городе (.+)$/, "The address must be in $1"],
  [
    /^Достигнут лимит устройств \((\d+)\)\. Выйдите на одном из устройств, чтобы войти здесь\.$/,
    "Device limit reached ($1). Sign out on one of your devices to sign in here.",
  ],
  // валидация Zod с подстановкой границы (lib/zodRu.ts)
  [/^Число должно быть не меньше (\S+)$/, "Must be at least $1"],
  [/^Число должно быть больше (\S+)$/, "Must be greater than $1"],
  [/^Число должно быть не больше (\S+)$/, "Must be at most $1"],
  [/^Минимум (\S+) символов$/, "At least $1 characters"],
  [/^Максимум (\S+) символов$/, "At most $1 characters"],
  [/^Добавьте хотя бы (\S+)$/, "Add at least $1"],
  [/^Не больше (\S+)$/, "No more than $1"],
];

export function translateError(message: string, lang: Lang): string {
  if (lang !== "en") return message;
  for (const [re, en] of DYNAMIC) {
    if (re.test(message)) return message.replace(re, en);
  }
  return RU_TO_EN[message] ?? message;
}
