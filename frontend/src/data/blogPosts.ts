/**
 * Контент-модель блога/гайдов (двуязычная RU/EN — RU основной для Яндекса).
 * Каждый пост — отдельная индексируемая страница (/blog/:slug), пререндерится
 * (vite-react-ssg, на сборке lang=ru) и попадает в sitemap. Внутренние ссылки
 * усиливают SEO. Картинки — из уже существующих ассетов.
 *
 * Добавление поста: добавьте объект — страница и sitemap обновятся на сборке.
 */
import type { Lang } from "../i18n";

export interface BlogBlock { h?: string; p: string[] }
export interface BlogFaq { q: string; a: string }
/** `faq` — вопрос-ответ внизу статьи; отдаётся ещё и как FAQPage-схема (Яндекс/Google). */
export interface BlogLocale { title: string; excerpt: string; body: BlogBlock[]; faq?: BlogFaq[] }
export interface BlogPost {
  slug: string;
  cover: string;        // путь к существующей картинке в /public
  date: string;         // ISO
  readMin: number;
  tags: string[];
  /** Внутренние ссылки на города/категории/блюда/ленту — усиливают перелинковку (SEO). */
  links?: { to: string; label: string }[];
  ru: BlogLocale;
  en: BlogLocale;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "kak-zakazat-domashnyuyu-edu",
    cover: "/images/pelmeni.jpg",
    date: "2026-07-22",
    readMin: 4,
    tags: ["домашняя еда", "доставка", "инструкция"],
    ru: {
      title: "Как заказать домашнюю еду рядом с вами",
      excerpt:
        "Пошагово: как найти соседа-повара, выбрать блюда и получить свежую домашнюю еду с доставкой или самовывозом — за пару минут.",
      body: [
        { p: ["Домашняя еда — это вкус, который не повторит ни один ресторан: семейные рецепты, свежие продукты и забота. На Celina вы заказываете её напрямую у проверенных соседей-поваров. Рассказываем, как это работает."] },
        { h: "Шаг 1. Найдите повара рядом", p: ["Откройте ленту и посмотрите, кто готовит в вашем городе и районе. Можно искать по блюду (борщ, хачапури, выпечка), по кухне или по тому, что ближе к вам. Умный поиск понимает опечатки и три языка, а фильтр по расстоянию показывает кухни в нескольких минутах от дома."] },
        { h: "Шаг 2. Выберите блюда", p: ["У каждого повара есть витрина: фотографии блюд, состав, цена и честные отзывы соседей. Добавляйте понравившееся в корзину — можно заказывать сразу у нескольких поваров."] },
        { h: "Шаг 3. Доставка или самовывоз", p: ["Выберите, как удобнее: доставка от повара или забрать самому. На этапе бесплатного запуска оплата — наличными при получении, напрямую повару, без комиссий и карт."] },
        { h: "Почему это безопасно", p: ["Каждый повар проходит проверку личности и подтверждает санитарные правила, а рейтинги и отзывы помогают выбрать лучшего."] },
        { p: ["Готовы попробовать? Посмотрите, кто готовит рядом, и закажите настоящую домашнюю еду уже сегодня."] },
      { h: "Обновление: два повара в одном заказе и заказ к времени", p: ["Селина растёт: теперь можно заказать сразу у двух поваров — заказы оформятся рядом, одним экраном. А ещё вы выбираете удобное время получения при оформлении: повар приготовит так, чтобы к нужному часу всё было свежим. Отменить заказ можно в течение 5 минут после оформления — повар сразу получит уведомление."] },
      ],
    },
    en: {
      title: "How to order homemade food near you",
      excerpt:
        "Step by step: find a neighbor-cook, pick dishes, and get fresh homemade food by delivery or pickup — in a couple of minutes.",
      body: [
        { p: ["Homemade food is a taste no restaurant can match: family recipes, fresh ingredients, and care. On Celina you order it straight from verified neighbor-cooks. Here's how it works."] },
        { h: "Step 1. Find a cook nearby", p: ["Open the feed and see who's cooking in your city and neighborhood. Search by dish (\"borscht\", \"khachapuri\", \"baking\"), by cuisine, or just by what's closest. Smart search handles typos and three languages, and the distance filter shows kitchens minutes from your door."] },
        { h: "Step 2. Pick your dishes", p: ["Every cook has a storefront: dish photos, ingredients, price, and honest neighbor reviews. Add what you like to the cart — you can order from several cooks at once."] },
        { h: "Step 3. Delivery or pickup", p: ["Choose what suits you: delivery by the cook or pickup. Right now, payment is cash on delivery — directly to the cook, no fees or cards."] },
        { h: "Why it's safe", p: ["Every cook passes identity verification and confirms food-safety rules, while ratings and reviews help you choose the best."] },
        { p: ["Ready to try? See who's cooking nearby and order real homemade food today."] },
      { h: "Update: two cooks in one order and scheduled pickup", p: ["Celina is growing: you can now order from two cooks at once — the orders appear side by side on one screen. You also pick a convenient handover time at checkout, and an order can be cancelled within 5 minutes with the cook notified instantly."] },
      ],
    },
  },
  {
    slug: "bezopasno-li-zakazyvat-domashnyuyu-edu",
    cover: "/images/borscht.jpg",
    date: "2026-07-22",
    readMin: 5,
    tags: ["безопасность", "доверие", "верификация"],
    ru: {
      title: "Безопасно ли заказывать домашнюю еду? Как Celina защищает",
      excerpt:
        "Проверка поваров, санитарные правила, честные отзывы и оплата при получении — как мы выстраиваем доверие в маркетплейсе домашней еды.",
      body: [
        { p: ["Когда речь о еде, доверие важнее всего. Celina — информационная площадка, которая соединяет соседей, и мы делаем всё, чтобы заказ был спокойным и предсказуемым."] },
        { h: "Проверка личности повара", p: ["Перед публикацией повар проходит верификацию: подтверждение личности, согласие с санитарно-гигиеническими стандартами, фотографии кухни и подписанное Заявление о безопасности пищи."] },
        { h: "Состав и аллергены", p: ["Повар указывает состав и аллергены каждого блюда. Если у вас есть ограничения — вы видите это заранее и выбираете осознанно."] },
        { h: "Честные отзывы соседей", p: ["После заказа покупатели оставляют оценки и отзывы. Рейтинг складывается из реальных мнений — никакой накрутки."] },
        { h: "Оплата при получении", p: ["На этапе запуска оплата — наличными при получении, напрямую повару. Вы платите, когда заказ у вас в руках."] },
        { p: ["Мы также сотрудничаем с правоохранительными органами по законным запросам. Подробные условия — в нашей Политике конфиденциальности."] },
      { h: "Обновление: безопасность аккаунта тоже важна", p: ["Мы защищаем не только заказы, но и ваш вход: сессия автоматически завершается после часа без активности, вход возможен максимум с 5 устройств, а в профиле появился раздел «Устройства и безопасность» — там видно, где вы вошли, и можно удалённо выйти на любом устройстве. Сброс пароля завершает все сессии сразу."] },
      ],
    },
    en: {
      title: "Is it safe to order homemade food? How Celina protects you",
      excerpt:
        "Cook verification, food-safety rules, honest reviews, and pay-on-delivery — how we build trust in a homemade-food marketplace.",
      body: [
        { p: ["When it comes to food, trust matters most. Celina is an information platform that connects neighbors, and we do everything to make ordering calm and predictable."] },
        { h: "Cook identity verification", p: ["Before publishing, a cook is verified: identity confirmation, agreement to sanitary-hygiene standards, kitchen photos, and a signed Food Safety Statement."] },
        { h: "Ingredients and allergens", p: ["The cook lists ingredients and allergens for every dish. If you have restrictions, you see them in advance and choose consciously."] },
        { h: "Honest neighbor reviews", p: ["After an order, buyers leave ratings and reviews. The rating is built from real opinions — no manipulation."] },
        { h: "Pay on delivery", p: ["During the launch, payment is cash on delivery, directly to the cook. You pay when the order is in your hands."] },
        { p: ["We also cooperate with law enforcement upon lawful request. Full terms are in our Privacy Policy."] },
      { h: "Update: account safety matters too", p: ["We protect your sign-in as well as your orders: sessions auto-expire after an hour of inactivity, sign-in is limited to 5 devices, and the profile's 'Devices & security' section lets you sign out remotely on any device. A password reset ends all sessions at once."] },
      ],
    },
  },
  {
    slug: "zastolye-s-sosedyami-kak-organizovat",
    cover: "/images/khachapuri.jpg",
    date: "2026-07-22",
    readMin: 4,
    tags: ["застолье", "соседи", "события"],
    ru: {
      title: "Застолье с соседями: как организовать тёплый вечер",
      excerpt:
        "Соседское застолье — это больше, чем ужин. Как создать встречу на Celina, позвать гостей и провести её безопасно и душевно.",
      body: [
        { p: ["Соседи кормят соседей — это не только про доставку. На Celina можно собраться за общим столом: позвать соседей на ужин, грузинский вечер или просто на чай с пирогами."] },
        { h: "Создайте застолье", p: ["Укажите название, фото места, дату, город и число гостей. Цена за гостя может быть любой — или 0, если зовёте просто в гости. Адрес виден только тем, кто подтвердил участие."] },
        { h: "Пригласите соседей", p: ["Поделитесь ссылкой на застолье в Telegram или VK — красивая карточка с деталями появится автоматически. Каждый, кто перейдёт, сможет присоединиться в пару кликов."] },
        { h: "Безопасность встречи", p: ["Участие добровольное: хозяин и гости проходят проверку личности, а условия вечера видны до брони. Встречайтесь разумно, сообщите близким адрес, а о любом происшествии сообщайте по номеру 112."] },
        { p: ["Создайте первое застолье и познакомьтесь с соседями ближе — через еду."] },
      { h: "Обновление: встречи стало проще найти", p: ["Теперь у встреч есть отдельная страница «С кем поужинать» — с ответами на частые вопросы: кто эти люди, сколько стоит, можно ли с детьми. А после брони места сервис предложит позвать соседей личной ссылкой — чем больше соседей на Селине, тем больше столов рядом с вами."] },
      ],
    },
    en: {
      title: "A gathering with neighbors: how to host a warm evening",
      excerpt:
        "A neighbor gathering is more than dinner. How to create an event on Celina, invite guests, and host it safely and warmly.",
      body: [
        { p: ["\"Neighbors feeding neighbors\" isn't only about delivery. On Celina you can gather around a shared table: invite neighbors to dinner, a Georgian evening, or just tea with pies."] },
        { h: "Create a gathering", p: ["Set a title, a photo of the place, the date, city, and number of guests. The price per guest can be anything — or 0 if you're simply inviting people over. The address is shown only to those who RSVP."] },
        { h: "Invite neighbors", p: ["Share the gathering link on Telegram or VK — a beautiful card with the details appears automatically. Anyone who clicks can join in a couple of taps."] },
        { h: "Meeting safety", p: ["Participation is voluntary: hosts and guests pass identity verification, and the terms of the evening are visible before you book. Meet sensibly, share the address with someone close, and report any incident to 112."] },
        { p: ["Create your first gathering and get closer to your neighbors — through food."] },
      { h: "Update: meetups are easier to find", p: ["Meetups now have their own 'Who to have dinner with' page answering the common questions: who these people are, what it costs, whether kids are welcome. And after booking a seat, the service suggests inviting neighbors with your personal link."] },
      ],
    },
  },
  {
    slug: "gde-zakazat-domashnyuyu-edu-v-moskve",
    cover: "/images/borscht.jpg",
    date: "2026-07-23",
    readMin: 6,
    tags: ["домашняя еда москва", "доставка", "москва", "инструкция"],
    links: [
      { to: "/eda/moskva", label: "Домашняя еда в Москве" },
      { to: "/eda/moskva/supy", label: "Супы и борщи" },
      { to: "/eda/moskva/vypechka", label: "Домашняя выпечка" },
      { to: "/blog", label: "Все статьи блога" },
    ],
    ru: {
      title: "Где заказать домашнюю еду в Москве: гид по соседям-поварам",
      excerpt:
        "Домашняя еда в Москве — напрямую у проверенных соседей-поваров. Как найти кухню рядом, выбрать блюда и получить заказ с доставкой или самовывозом.",
      body: [
        { p: ["Домашняя еда в Москве — это не про пластиковые контейнеры из тёмной кухни, а про борщ, который варит сосед по семейному рецепту, тёплые пирожки из соседнего подъезда и хачапури, за которым не нужно ехать через весь город. На Celina вы заказываете такую еду напрямую у проверенных соседей-поваров: без ресторанной наценки, без обезличенного конвейера. В этом гиде разберём, где и как найти домашнюю еду рядом с вами в Москве.", "Город большой, и повара готовят в самых разных районах — от центра до спальных окраин. Поэтому первое, что стоит сделать, — посмотреть, кто готовит поблизости именно от вас."] },
        { h: "С чего начать: откройте ленту по Москве", p: ["Самый простой путь — открыть подборку домашней еды по Москве и посмотреть, какие кухни уже работают в городе. Площадка молодая, повара продолжают подключаться, поэтому список живой и обновляется. Не стоит ждать сотен витрин с первого дня — зато каждый повар здесь реальный человек, прошедший проверку личности.", "Дальше можно сузить поиск: по блюду (борщ, пельмени, выпечка), по кухне (русская, грузинская, домашние десерты) или просто по тому, что ближе к дому. Умный поиск понимает опечатки и работает на трёх языках, а фильтр по расстоянию покажет кухни в нескольких минутах от вас."] },
        { h: "Ищите по блюду или по настроению", p: ["Если хочется горячего супа в будний вечер — загляните в раздел супов: борщ, солянка, куриный бульон, которые готовят как дома. Хочется к чаю — домашняя выпечка: пирожки, пироги, блины. Планируете стол на выходные — салаты и горячее закроют застолье целиком.", "Плюс соседского формата в том, что вы заказываете ровно то, что человек умеет готовить лучше всего. У многих поваров есть коронное блюдо — та самая тарелка, ради которой к ним и возвращаются."] },
        { h: "Как понять, что повару можно доверять", p: ["Каждый повар на Celina проходит верификацию: подтверждение личности и согласие с санитарно-гигиеническими правилами. Важно быть честными: это не проверка кухни инспектором и не гарантия качества блюда от площадки — это подтверждённая личность и заявление самого повара о соблюдении санитарных норм.", "Помогают выбрать и отзывы соседей. После заказа покупатели оставляют честные оценки — без накрутки. У каждого блюда указан состав и аллергены, так что если у вас есть ограничения, вы увидите это заранее."] },
        { h: "Доставка или самовывоз — как удобнее", p: ["Москва — город расстояний, поэтому у вас есть выбор. Доставка от повара привезёт заказ к двери, а самовывоз удобен, если повар готовит буквально в соседнем доме и вам приятно зайти лично.", "На этапе бесплатного запуска оплата — наличными при получении, напрямую повару. Никаких карт и предоплаты: вы платите, когда заказ уже у вас в руках. Это снимает главный страх при первом заказе у нового человека."] },
        { h: "Сколько это стоит", p: ["Цену на каждое блюдо устанавливает сам повар — она указана в его витрине рядом с фото и составом. Поскольку вы заказываете напрямую у соседа, между вами и тарелкой нет ресторанной кухни, аренды зала и наценки за бренд. Это и есть смысл домашней еды: честная цена за настоящую готовку.", "Конкретные суммы зависят от блюда и повара, поэтому самый точный способ узнать стоимость — открыть ленту по Москве и посмотреть актуальные предложения рядом с вами."] },
        { p: ["Готовы попробовать? Посмотрите, кто готовит рядом в Москве, выберите блюдо по душе и закажите настоящую домашнюю еду — с доставкой или самовывозом, с оплатой при получении."] },
      { h: "Обновление: что нового на Селине в Москве", p: ["С запуска сервиса добавились страницы для 15 городов, гиды по домашней еде и статьи-помощники: что приготовить на ужин и на обед, готовая еда на неделю, где заказать настоящий борщ. Страница Москвы — целиком про ваш город: повара рядом, застолья и доставка по районам."] },
      ],
    },
    en: {
      title: "Where to order homemade food in Moscow: a neighbor-cook guide",
      excerpt:
        "Homemade food in Moscow — straight from verified neighbor-cooks. How to find a kitchen nearby, pick dishes, and get your order by delivery or pickup.",
      body: [
        { p: ["Homemade food in Moscow isn't about plastic containers from an anonymous kitchen — it's about borscht simmered by a neighbor to a family recipe, warm pirozhki from the next entrance, and khachapuri you don't have to cross the whole city for. On Celina you order this food directly from verified neighbor-cooks: no restaurant markup, no faceless conveyor belt. In this guide we'll cover where and how to find homemade food near you in Moscow.", "The city is big, and cooks work in all kinds of districts — from the center to the outskirts. So the first thing to do is see who cooks close to you."] },
        { h: "Where to start: open the Moscow feed", p: ["The simplest path is to open the homemade-food selection for Moscow and see which kitchens are already active in the city. The platform is young and cooks keep joining, so the list is alive and updating. Don't expect hundreds of storefronts on day one — but every cook here is a real person who has passed identity verification.", "From there you can narrow the search: by dish (borscht, pelmeni, baking), by cuisine (Russian, Georgian, homemade desserts), or simply by what's closest. Smart search handles typos and works in three languages, and the distance filter shows kitchens minutes from you."] },
        { h: "Search by dish or by mood", p: ["Craving a hot soup on a weeknight? Look into the soups section: borscht, solyanka, chicken broth, made the home way. Something for tea? Homemade baking: pirozhki, pies, blini. Planning a weekend table? Salads and mains cover the whole spread.", "The beauty of the neighbor format is that you order exactly what a person cooks best. Many cooks have a signature dish — the very plate people come back for."] },
        { h: "How to know a cook is trustworthy", p: ["Every cook on Celina passes verification: identity confirmation and agreement to sanitary-hygiene rules. Let's be honest about what that means: it isn't an inspector checking the kitchen, and it isn't a quality guarantee from the platform — it's a confirmed identity plus the cook's own declaration that they follow sanitary norms.", "Neighbor reviews help too. After an order, buyers leave honest ratings — no manipulation. Each dish lists ingredients and allergens, so if you have restrictions you'll see them in advance."] },
        { h: "Delivery or pickup — whatever suits you", p: ["Moscow is a city of distances, so you get a choice. The cook brings the order to your door, while pickup is handy when a cook works literally in the next building and you'd enjoy stopping by in person.", "Right now, payment is cash on delivery, directly to the cook. No cards, no prepayment: you pay when the order is already in your hands. That removes the main worry of a first order from someone new."] },
        { h: "What it costs", p: ["The cook sets the price for each dish — it's shown in their storefront next to the photo and ingredients. Because you order directly from a neighbor, there's no restaurant kitchen, hall rent, or brand markup between you and the plate. That's the point of homemade food: a fair price for real cooking.", "Exact amounts depend on the dish and the cook, so the most accurate way to check is to open the Moscow feed and see current offers near you."] },
        { p: ["Ready to try? See who's cooking nearby in Moscow, pick a dish you like, and order real homemade food — by delivery or pickup, paid on delivery."] },
      { h: "Update: what's new on Celina in Moscow", p: ["Since launch we've added pages for 15 cities, food guides and helper articles: what to cook for dinner and lunch, ready food for the week, where to order real borscht. The Moscow page covers your city end to end."] },
      ],
    },
  },
  {
    slug: "kak-legalno-prodavat-domashnyuyu-edu-2026",
    cover: "/images/pirozhki.jpg",
    date: "2026-07-13",
    readMin: 8,
    tags: ["как продавать домашнюю еду легально", "самозанятость", "закон", "повар"],
    links: [
      { to: "/login?mode=register&role=cook", label: "Стать поваром на Celina" },
      { to: "/eda/moskva/vypechka", label: "Домашняя выпечка в Москве" },
      { to: "/eda/moskva", label: "Кухни соседей в Москве" },
      { to: "/blog", label: "Блог для поваров" },
    ],
    ru: {
      title: "Как легально продавать домашнюю еду в России в 2026",
      excerpt:
        "Самозанятость, НПД и базовые санитарные правила простыми словами. Убираем страх перед законом и показываем, как честно начать продавать домашнюю еду.",
      body: [
        { p: ["Многие, кто хорошо готовит, боятся начать продавать домашнюю еду из-за одного вопроса: «А это вообще законно?» Хорошая новость — да, при правильном оформлении это абсолютно легально и не требует ни юриста, ни бухгалтера. В этой статье простыми словами разберём, как продавать домашнюю еду легально в России в 2026 году: что такое самозанятость, налог на профессиональный доход и какие санитарные правила стоит соблюдать.", "Важная оговорка: это обзорная статья, а не юридическая консультация. Законы и требования могут меняться, поэтому по вашей конкретной ситуации сверяйтесь с официальными источниками. Но общая картина сегодня довольно дружелюбна к тем, кто хочет готовить дома на продажу."] },
        { h: "Самозанятость: самый простой путь", p: ["Для домашнего повара самый удобный режим — самозанятость, официально это налог на профессиональный доход (НПД). Он создан именно для тех, кто работает на себя, без сотрудников и без больших оборотов. Регистрация занимает несколько минут через приложение «Мой налог» — не нужно идти в налоговую, платить госпошлину или заводить ИП.", "Стать самозанятым может физическое лицо, которое продаёт результат своего труда — в нашем случае приготовленные блюда. Никаких бумажных отчётов: приложение само считает налог, а вы просто формируете чек на каждый заказ."] },
        { h: "Сколько платить налога", p: ["Ставки НПД фиксированные и низкие: 4% с дохода, если ваш покупатель — физическое лицо, и 6%, если юридическое. Для домашнего повара, который готовит для соседей, почти всегда действует ставка 4%. Налог начисляется только с фактически полученного дохода — нет заказов, нет и налога.", "Есть и годовой лимит дохода для этого режима — он измеряется миллионами рублей в год, так что для старта и подработки вы в него точно укладываетесь. Новым самозанятым также даётся налоговый вычет, который первое время снижает ставку. Точные цифры вычета и лимита проверяйте в приложении «Мой налог» — оно всё считает автоматически."] },
        { h: "Как это работает на практике", p: ["Схема простая. Приняли заказ — приготовили — получили оплату — сформировали чек в приложении в пару касаний. Чек можно отправить покупателю или просто сохранить. В конце месяца приложение покажет сумму налога, и вы оплатите её картой. Всё.", "Никакой кассовой техники, никаких деклараций и походов в инспекцию. Именно эта простота и убирает главный страх: легальность здесь не про сложную бюрократию, а про пару действий в телефоне."] },
        { h: "Санитарные правила: база, о которой важно знать", p: ["Готовя еду на продажу, вы берёте на себя ответственность за её безопасность. Базовые санитарные принципы (СанПиН) — это здравый смысл, оформленный в правила: чистые руки и рабочие поверхности, свежие продукты с нормальным сроком годности, раздельная разделка сырого и готового, правильное хранение и температура, а также аккуратная упаковка.", "Отдельно стоит помнить об аллергенах: указывайте состав блюд честно, чтобы покупатель с ограничениями мог выбрать осознанно. Это не только требование здравого смысла, но и основа доверия — на площадке состав и аллергены видны в карточке каждого блюда."] },
        { h: "Чего бояться не нужно", p: ["Главный страх новичка — «меня накажут за то, что я готовлю дома». На практике проблемы возникают у тех, кто работает полностью в тени и игнорирует и налоги, и санитарию. Если вы оформили самозанятость, платите свои 4% и соблюдаете базовые санитарные правила — вы работаете честно и открыто.", "Оформление не делает готовку сложнее — оно делает её спокойнее. Вы перестаёте прятаться, можете спокойно рассказывать о своём деле и строить репутацию вдолгую. А репутация в домашней еде — это и есть ваш главный актив."] },
        { h: "Как Celina помогает работать честно", p: ["Celina — информационная площадка, которая соединяет соседей. Перед публикацией повар проходит верификацию личности и подтверждает согласие с санитарно-гигиеническими правилами. Это не отменяет вашей ответственности как самозанятого, но задаёт понятную рамку: честная личность, честный состав блюд, честные отзывы соседей.", "На этапе бесплатного запуска покупатели платят наличными при получении, напрямую вам. Вы формируете чек самозанятого на полученную сумму — и ваша деятельность остаётся прозрачной и законной."] },
        { p: ["Легально продавать домашнюю еду в 2026 году проще, чем кажется: самозанятость оформляется за минуты, налог низкий, а санитарные правила — это обычная забота о тех, кого вы кормите. Готовы начать честно и без страха? Станьте поваром на Celina и приготовьте первое блюдо для соседей."] },
      ],
    },
    en: {
      title: "How to legally sell homemade food in Russia in 2026",
      excerpt:
        "Self-employment, the professional-income tax, and basic sanitary rules in plain words. We remove the fear of the law and show how to start selling honestly.",
      body: [
        { p: ["Many people who cook well are afraid to start selling homemade food because of one question: \"Is this even legal?\" The good news — yes, done properly it's completely legal and requires neither a lawyer nor an accountant. In this article we'll explain in plain words how to sell homemade food legally in Russia in 2026: what self-employment is, the professional-income tax, and which sanitary rules are worth following.", "An important caveat: this is an overview article, not legal advice. Laws and requirements can change, so for your specific situation check official sources. But today's overall picture is quite friendly to anyone who wants to cook at home for sale."] },
        { h: "Self-employment: the simplest path", p: ["For a home cook the most convenient regime is self-employment — officially the professional-income tax (NPD). It's built precisely for people who work for themselves, without employees or large turnover. Registration takes a few minutes through the \"My Tax\" app — no need to visit the tax office, pay a fee, or set up a sole proprietorship.", "An individual who sells the result of their own labor — in our case, cooked dishes — can become self-employed. No paper reports: the app calculates the tax itself, and you simply issue a receipt for each order."] },
        { h: "How much tax to pay", p: ["NPD rates are fixed and low: 4% on income if your buyer is an individual, and 6% if a legal entity. For a home cook cooking for neighbors, the 4% rate almost always applies. Tax is charged only on income actually received — no orders, no tax.", "There's also an annual income cap for this regime — measured in millions of rubles a year, so for starting out and a side gig you'll certainly stay within it. New self-employed people also get a tax deduction that lowers the rate at first. Check the exact deduction and cap figures in the \"My Tax\" app — it calculates everything automatically."] },
        { h: "How it works in practice", p: ["The scheme is simple. Take an order — cook it — receive payment — issue a receipt in the app in a couple of taps. You can send the receipt to the buyer or just save it. At the end of the month the app shows your tax amount, and you pay it by card. That's it.", "No cash-register equipment, no declarations, no trips to the inspectorate. It's this simplicity that removes the main fear: legality here isn't about complex bureaucracy, but about a couple of actions on your phone."] },
        { h: "Sanitary rules: the basics worth knowing", p: ["Cooking food for sale means taking responsibility for its safety. The basic sanitary principles (SanPiN) are common sense turned into rules: clean hands and surfaces, fresh products within their shelf life, separate cutting of raw and cooked food, proper storage and temperature, and careful packaging.", "Allergens deserve special mention: list ingredients honestly so a buyer with restrictions can choose consciously. This is not just common sense but the foundation of trust — on the platform, ingredients and allergens are visible on every dish card."] },
        { h: "What you don't need to fear", p: ["The beginner's main fear is \"I'll be punished for cooking at home.\" In practice, problems arise for those who operate entirely off the books and ignore both taxes and sanitation. If you've registered as self-employed, pay your 4%, and follow basic sanitary rules, you're working honestly and openly.", "Registering doesn't make cooking harder — it makes it calmer. You stop hiding, can speak freely about your business, and build a reputation for the long run. And in homemade food, reputation is your main asset."] },
        { h: "How Celina helps you work honestly", p: ["Celina is an information platform that connects neighbors. Before publishing, a cook passes identity verification and confirms agreement to sanitary-hygiene rules. This doesn't remove your responsibility as a self-employed person, but it sets a clear frame: an honest identity, honest dish ingredients, honest neighbor reviews.", "Right now, buyers pay cash on delivery, directly to you. You issue a self-employed receipt for the amount received — and your activity stays transparent and lawful."] },
        { p: ["Legally selling homemade food in 2026 is easier than it seems: self-employment is set up in minutes, the tax is low, and sanitary rules are simply care for the people you feed. Ready to start honestly and without fear? Become a cook on Celina and prepare your first dish for the neighbors."] },
      ],
    },
  },
  {
    slug: "nastoyashchie-khachapuri-po-adzharski-recept",
    cover: "/images/khachapuri.jpg",
    date: "2026-07-13",
    readMin: 7,
    tags: ["хачапури", "грузинская кухня", "рецепт", "выпечка"],
    links: [
      { to: "/eda/moskva", label: "Посмотреть, кто готовит рядом в Москве" },
      { to: "/eda/moskva/vypechka", label: "Домашняя выпечка в Москве" },
      { to: "/blog", label: "Другие статьи блога" },
    ],
    ru: {
      title: "Настоящие хачапури по-аджарски: рецепт и история",
      excerpt:
        "Хачапури по-аджарски — лодочка из теста с сыром, желтком и маслом. Разбираем настоящий рецепт, историю блюда и как есть его правильно.",
      body: [
        { p: ["Хачапури по-аджарски узнаёшь с первого взгляда: золотистая лодочка из теста, до краёв полная тягучего сыра, а в самом центре — солнечный желток и кусочек сливочного масла. Это, пожалуй, самое эффектное блюдо грузинской кухни, и приготовить его дома вполне реально. Ниже — настоящий рецепт хачапури по-аджарски, немного истории и пара честных советов от тех, кто печёт их постоянно."] },
        { h: "Откуда родом «лодочка»", p: ["Аджария — приморский регион на юго-западе Грузии, на границе с Турцией, с центром в Батуми. Именно отсюда родом та самая форма-лодочка. Есть красивая версия, что открытая форма напоминает лодку рыбака, а желток в середине — заходящее над морем солнце. Точных летописей у народного блюда нет, но образ прижился, и сегодня «аджарское» хачапури знают далеко за пределами Грузии.", "Важно не путать разновидности. По-аджарски — открытая лодочка с яйцом. По-имеретински — закрытая круглая лепёшка с сыром внутри. По-мегрельски — та же круглая, но с сыром ещё и сверху. У каждого региона свой характер, и это нормально: хачапури — это целое семейство блюд, а не один рецепт."] },
        { h: "Какой сыр брать", p: ["В Грузии классика — имеретинский сыр, молодой и в меру солёный, часто в смеси с сулугуни для тягучести. В российских магазинах имеретинский найти сложнее, поэтому рабочая замена — сулугуни плюс немного адыгейского или моцареллы для мягкости. Если сыр очень солёный, вымочите его 30–40 минут в холодной воде и обсушите.", "Пропорция на глаз: примерно 300–350 г сыра на одну крупную лодочку. Сыр нужно натереть или размять руками — так он равномернее плавится."] },
        { h: "Тесто: дрожжевое, но не капризное", p: ["На 2–3 лодочки понадобится: около 300 мл тёплого молока (или воды пополам с молоком), 7 г сухих дрожжей, чайная ложка сахара, чайная ложка соли, столовая ложка растительного масла и примерно 500–550 г муки.", "Разведите дрожжи и сахар в тёплом молоке, дайте 10 минут ожить. Добавьте соль, масло и постепенно муку, вымесите мягкое, слегка липковатое тесто. Накройте и оставьте в тепле на час-полтора, пока не увеличится вдвое. Хорошо поднявшееся тесто — половина успеха."] },
        { h: "Как собрать лодочку", p: ["Разделите тесто на части, каждую раскатайте в овал. Заверните два длинных края к центру и защипните концы, чтобы получилась лодочка с бортиками и заострёнными носами. Выложите на противень с пергаментом и щедро наполните серединку сыром.", "Выпекайте в разогретой до 220–230 °C духовке примерно 12–15 минут, пока борта не зарумянятся, а сыр не начнёт пузыриться. Затем достаньте, ложкой сделайте в сыре углубление, вбейте туда сырое яйцо (или только желток, если любите погуще) и верните в духовку буквально на 2–3 минуты — белок должен схватиться, а желток остаться жидким. В самом конце положите сверху кусочек сливочного масла."] },
        { h: "Как есть правильно", p: ["Хачапури по-аджарски едят руками и обязательно горячим. Отламываете «нос» лодочки, макаете его в середину, размешивая вилкой желток, масло и сыр в единую тягучую массу, — и дальше кусочек за кусочком продвигаетесь к центру. Никаких приборов для основной части: это блюдо про удовольствие и живое застолье, а не про этикет."] },
        { h: "Нет времени печь? Закажи у соседа", p: ["Честно: дрожжевое тесто, правильный сыр и точная работа с духовкой требуют времени и практики. Если хочется настоящих хачапури здесь и сейчас, посмотрите, кто готовит грузинское рядом с вами. На Селине домашние повара продают выпечку напрямую соседям — с доставкой или самовывозом. На этапе бесплатного запуска оплата наличными при получении, напрямую повару, без карт и комиссий.", "Каждый повар проходит проверку личности и подтверждает соблюдение санитарных правил, а честные отзывы соседей помогают выбрать. Загляните в раздел выпечки в вашем городе — возможно, лучшие хачапури уже пекут в паре кварталов от вас."] },
      ],
    },
    en: {
      title: "Real Adjarian khachapuri: the recipe and its story",
      excerpt:
        "Adjarian khachapuri is a bread boat filled with cheese, an egg yolk, and butter. Here's the real recipe, the story behind it, and how to eat it right.",
      body: [
        { p: ["You recognize Adjarian khachapuri at first glance: a golden boat of dough brimming with stretchy cheese, and in the very center a sunny yolk and a knob of butter. It's arguably the most striking dish in Georgian cuisine, and making it at home is entirely doable. Below is the real recipe for Adjarian khachapuri, a bit of history, and a few honest tips from people who bake them all the time."] },
        { h: "Where the \"boat\" comes from", p: ["Adjara is a coastal region in southwestern Georgia, on the border with Turkey, centered on Batumi. This is where that famous boat shape comes from. There's a lovely idea that the open form recalls a fisherman's boat, and the yolk in the middle is the sun setting over the sea. A folk dish keeps no exact records, but the image stuck, and today Adjarian khachapuri is known far beyond Georgia.", "Don't confuse the varieties. Adjarian is an open boat with an egg. Imeretian is a closed round flatbread with cheese inside. Megrelian is the same round shape but with cheese on top as well. Each region has its own character, and that's fine: khachapuri is a whole family of dishes, not a single recipe."] },
        { h: "Which cheese to use", p: ["In Georgia the classic is Imeretian cheese — young and moderately salty, often mixed with sulguni for stretch. Imeretian is harder to find in Russian shops, so a workable substitute is sulguni plus a little Adyghe cheese or mozzarella for softness. If the cheese is very salty, soak it in cold water for 30–40 minutes and pat it dry.", "A rough measure: about 300–350 g of cheese per one large boat. Grate or crumble the cheese by hand — it melts more evenly that way."] },
        { h: "The dough: yeasted, but forgiving", p: ["For 2–3 boats you'll need: about 300 ml warm milk (or half water, half milk), 7 g dry yeast, a teaspoon of sugar, a teaspoon of salt, a tablespoon of vegetable oil, and roughly 500–550 g of flour.", "Dissolve the yeast and sugar in the warm milk and let it wake up for 10 minutes. Add salt, oil, and gradually the flour, then knead a soft, slightly sticky dough. Cover and leave in a warm spot for an hour to an hour and a half, until it doubles. Well-risen dough is half the battle."] },
        { h: "How to shape the boat", p: ["Divide the dough into pieces and roll each into an oval. Fold the two long edges toward the center and pinch the ends so you get a boat with raised sides and pointed tips. Place it on a parchment-lined tray and fill the middle generously with cheese.", "Bake in an oven preheated to 220–230 °C for about 12–15 minutes, until the sides are golden and the cheese starts to bubble. Then take it out, make a well in the cheese with a spoon, crack in a raw egg (or just the yolk if you like it richer), and return it to the oven for just 2–3 minutes — the white should set while the yolk stays runny. Right at the end, drop a piece of butter on top."] },
        { h: "How to eat it right", p: ["Adjarian khachapuri is eaten with your hands and always hot. You tear off the \"nose\" of the boat, dip it into the center while a fork stirs the yolk, butter, and cheese into one stretchy mass, and then work your way piece by piece toward the middle. No cutlery for the main part: this dish is about pleasure and a lively table, not etiquette."] },
        { h: "No time to bake? Order from a neighbor", p: ["Honestly: yeasted dough, the right cheese, and precise oven work take time and practice. If you want real khachapuri here and now, see who's cooking Georgian food near you. On Celina, home cooks sell their baking directly to neighbors — with delivery or pickup. Right now, payment is cash on delivery, straight to the cook, no cards or fees.", "Every cook passes identity verification and confirms they follow sanitary rules, and honest neighbor reviews help you choose. Check the baking section in your city — the best khachapuri might already be baking a couple of blocks away."] },
      ],
    },
  },
  {
    slug: "domashnie-pelmeni-po-regionam-rossii",
    cover: "/images/pelmeni.jpg",
    date: "2026-07-23",
    readMin: 7,
    tags: ["домашние пельмени", "регионы России", "рецепт", "русская кухня"],
    links: [
      { to: "/eda/moskva/goryachee", label: "Горячие блюда в Москве" },
      { to: "/eda/moskva", label: "Посмотреть поваров рядом" },
      { to: "/eda/sankt-peterburg", label: "Домашняя еда в Санкт-Петербурге" },
      { to: "/blog", label: "Читать другие статьи" },
    ],
    ru: {
      title: "Домашние пельмени: как их лепят в регионах России",
      excerpt:
        "Домашние пельмени лепят по-разному от Урала до Сибири. Разбираем региональные традиции, базовый рецепт теста и начинки — и когда проще заказать.",
      body: [
        { p: ["Домашние пельмени — блюдо, вокруг которого в России собирается вся семья. Кто-то раскатывает тесто, кто-то крутит фарш, кто-то лепит — и морозилка наполняется запасом на недели вперёд. Но «правильных» пельменей не существует: в каждом регионе своя форма, своя начинка и свои привычки. Давайте пройдёмся по стране и заодно вспомним базовый рецепт."] },
        { h: "Урал: родина слова", p: ["Само слово «пельмень» пришло из финно-угорских языков Прикамья: «пельнянь» — буквально «хлебное ухо», по форме защипнутого края. Урал многие считают родиной блюда в его нынешнем виде. Здесь ценят классику: начинка из смеси говядины и свинины, много лука, тесто раскатано тонко. Уральские пельмени часто делают небольшими — чтобы тесто не перебивало вкус мяса."] },
        { h: "Сибирь: заготовка на морозе", p: ["В Сибири пельмени лепили массово и замораживали прямо на улице — суровый климат сам работал морозильной камерой. В дорогу и на охоту брали мешок замороженных пельменей, которые достаточно было бросить в кипяток или бульон. В начинку добавляли не только говядину и свинину, но и лосятину, оленину, а для сочности — колотый лёд или ледяную воду прямо в фарш. Сибирская традиция — это про запас, практичность и щедрую порцию."] },
        { h: "Пермский край и коми: близкие родственники", p: ["В Прикамье и у народов коми сохранились начинки, о которых в других регионах знают меньше: пельмени с редькой, с грибами, с квашеной капустой, а иногда с рыбой. Это напоминает, что пельмень изначально был крестьянской едой — начинку клали ту, что была под рукой и хорошо хранилась."] },
        { h: "Соседи по «тесту с начинкой»", p: ["Пельмени — часть большой семьи блюд. Их близкие родственники — уральские и сибирские вареники с картошкой или творогом, среднеазиатские манты (крупные, на пару), грузинские хинкали (с бульоном внутри, которые едят руками). Форма и способ варки разные, а идея общая: тесто, обнимающее сочную начинку. Знать эти различия полезно хотя бы для того, чтобы не спорить, «как правильно»."] },
        { h: "Базовый рецепт: тесто и начинка", p: ["Тесто: 300 г муки, 1 яйцо, около 120–130 мл холодной воды, щепотка соли. Замесите плотное, эластичное тесто, заверните в плёнку и дайте отдохнуть 30 минут — так оно станет податливее и не будет рваться.", "Начинка (классика): 500 г фарша из смеси говядины и свинины, 1–2 крупные луковицы (чем больше лука, тем сочнее), соль, чёрный перец и пара ложек ледяной воды. Лук лучше не жалеть и измельчать мелко.", "Раскатайте тесто тонко, вырежьте кружки стаканом, кладите начинку и защипывайте края, соединяя два уголка. Варите в подсоленной воде 5–7 минут после всплытия. Подавайте со сметаной, сливочным маслом, уксусом или бульоном — тут уж как принято в вашей семье."] },
        { h: "Когда проще заказать домашние", p: ["Слепить хорошие пельмени — это час-два работы и целая гора посуды. Если хочется настоящих домашних, но без марафона на кухне, посмотрите, кто готовит рядом с вами. На Селине домашние повара лепят пельмени вручную по семейным рецептам и продают напрямую соседям — с доставкой или самовывозом. На этапе бесплатного запуска оплата наличными при получении, напрямую повару, без карт и комиссий.", "Каждый повар проходит проверку личности и подтверждает соблюдение санитарных правил, а состав и отзывы соседей видны заранее. Загляните в раздел горячих блюд в вашем городе — возможно, кто-то уже лепит те самые, «как у бабушки»."] },
      { h: "Обновление: где заказать пельмени ручной лепки", p: ["Теперь на Селине можно найти пельмени ручной лепки у поваров своего города: откройте ленту, посмотрите, кто лепит рядом, — с фото, отзывами и оплатой при получении. А гиды по домашней еде уже есть для Москвы, Петербурга, Новосибирска, Екатеринбурга и Казани."] },
      ],
    },
    en: {
      title: "Homemade pelmeni: how they're made across Russia",
      excerpt:
        "Homemade pelmeni are shaped differently from the Urals to Siberia. We cover regional traditions, a basic dough and filling recipe — and when it's easier to order.",
      body: [
        { p: ["Homemade pelmeni are a dish that brings the whole family together in Russia. One person rolls the dough, another mixes the filling, someone else does the shaping — and the freezer fills up with a stash for weeks ahead. But there's no single \"correct\" pelmeni: every region has its own shape, filling, and habits. Let's travel the country and refresh the basic recipe along the way."] },
        { h: "The Urals: home of the word", p: ["The word \"pelmen\" itself comes from the Finno-Ugric languages of the Kama region: \"pelnyan\" literally means \"bread ear,\" after the shape of the pinched edge. Many consider the Urals the birthplace of the dish in its present form. Here the classic is prized: a filling of mixed beef and pork, plenty of onion, and thinly rolled dough. Ural pelmeni are often made small, so the dough doesn't overpower the meat."] },
        { h: "Siberia: stockpiled in the frost", p: ["In Siberia, pelmeni were made in bulk and frozen right outside — the harsh climate served as its own freezer. Travelers and hunters took a sack of frozen pelmeni that only needed to be dropped into boiling water or broth. Fillings included not just beef and pork but also elk and venison, and for juiciness, crushed ice or ice-cold water was mixed straight into the meat. The Siberian tradition is about stockpiling, practicality, and a generous portion."] },
        { h: "Perm Krai and the Komi: close relatives", p: ["In the Kama region and among the Komi peoples, fillings survive that are less known elsewhere: pelmeni with radish, with mushrooms, with sauerkraut, and sometimes with fish. It's a reminder that the pelmen was originally peasant food — the filling was whatever was on hand and kept well."] },
        { h: "Cousins in the \"dough-and-filling\" family", p: ["Pelmeni are part of a large family of dishes. Their close relatives are vareniki with potato or curd, Central Asian manti (large, steamed), and Georgian khinkali (with broth inside, eaten by hand). The shape and cooking method vary, but the idea is shared: dough hugging a juicy filling. Knowing these differences is useful if only to avoid arguing about \"the right way.\""] },
        { h: "Basic recipe: dough and filling", p: ["Dough: 300 g flour, 1 egg, about 120–130 ml cold water, a pinch of salt. Knead a firm, elastic dough, wrap it in film, and let it rest for 30 minutes — it becomes more pliable and won't tear.", "Filling (classic): 500 g of mixed beef and pork mince, 1–2 large onions (the more onion, the juicier), salt, black pepper, and a couple of spoons of ice-cold water. Don't skimp on the onion, and chop it finely.", "Roll the dough thin, cut circles with a glass, add filling, and pinch the edges, joining two corners. Boil in salted water for 5–7 minutes after they float. Serve with sour cream, butter, vinegar, or broth — whatever your family prefers."] },
        { h: "When it's easier to order homemade", p: ["Making good pelmeni is an hour or two of work and a mountain of dishes. If you want the real homemade thing without the kitchen marathon, see who's cooking near you. On Celina, home cooks shape pelmeni by hand from family recipes and sell them directly to neighbors — with delivery or pickup. Right now, payment is cash on delivery, straight to the cook, no cards or fees.", "Every cook passes identity verification and confirms they follow sanitary rules, and the ingredients and neighbor reviews are visible in advance. Check the hot dishes section in your city — someone might already be making the ones that taste \"just like grandma's.\""] },
      { h: "Update: where to order hand-made pelmeni", p: ["You can now find hand-folded pelmeni from cooks in your city on Celina — with photos, reviews and cash on receipt. City guides are live for Moscow, St. Petersburg, Novosibirsk, Yekaterinburg and Kazan."] },
      ],
    },
  },
  {
    slug: "kak-my-proveryaem-domashnih-povarov",
    cover: "/images/gatherings/homedinner.jpg",
    date: "2026-07-13",
    readMin: 6,
    tags: ["проверенные повара", "доверие", "верификация", "безопасность"],
    links: [
      { to: "/eda/moskva", label: "Посмотреть проверенных поваров в Москве" },
      { to: "/login?mode=register&role=cook", label: "Стать поваром на Селине" },
      { to: "/blog", label: "Другие статьи о доверии" },
    ],
    ru: {
      title: "Как мы проверяем домашних поваров в Селине",
      excerpt:
        "«Проверенный повар» на Селине — это проверка личности и заявленное соблюдение санитарных правил. Честно объясняем, что мы проверяем, а что нет.",
      body: [
        { p: ["Когда вы заказываете еду у соседа, справедливо спросить: а кто этот человек и можно ли ему доверять? Мы относимся к этому вопросу серьёзно и хотим быть предельно честными в формулировках. Ниже — как именно работает проверка проверенных домашних поваров на Селине, и, что не менее важно, чего наша проверка не означает."] },
        { h: "Что значит «проверенный»", p: ["На Селине значок «проверенный» означает две конкретные вещи: во-первых, повар прошёл подтверждение личности; во-вторых, он самостоятельно подтвердил, что соблюдает санитарно-гигиенические правила при готовке. Это всё. Мы намеренно не используем это слово шире, чтобы не создавать ложных ожиданий."] },
        { h: "Шаг 1. Подтверждение личности", p: ["Перед тем как повар сможет публиковать блюда, он проходит верификацию личности. Это отсекает анонимность: за витриной стоит реальный человек с подтверждёнными данными, а не безымянный аккаунт. Для маркетплейса, где соседи встречаются лично при передаче заказа, это базовый уровень доверия."] },
        { h: "Шаг 2. Заявление о санитарных правилах", p: ["Повар знакомится с санитарно-гигиеническими стандартами и подписывает Заявление о безопасности пищи — берёт на себя ответственность готовить чисто, хранить продукты правильно и честно указывать состав. Это самодекларация: повар заявляет о своём соблюдении правил, и эта ответственность лежит на нём."] },
        { h: "Что мы НЕ проверяем — говорим прямо", p: ["Здесь начинается самая важная часть, и мы не будем её сглаживать. Селина — информационная площадка, которая соединяет соседей. Мы не инспектируем кухни, не берём пробы блюд и не гарантируем качество или безопасность еды. Слово «проверенный» относится к личности повара и к его собственному заявлению о санитарии — но это не знак того, что мы за него ручаемся как надзорный орган.", "Мы считаем, что честно обозначить границы важнее, чем красиво пообещать лишнее. Доверие строится на понятных правилах, а не на громких словах."] },
        { h: "Что помогает выбирать вам", p: ["Кроме нашей базовой проверки, у вас есть собственные инструменты. Повар указывает состав и аллергены каждого блюда — вы видите это заранее. После заказа покупатели оставляют честные отзывы и оценки, без накрутки, и рейтинг складывается из реальных мнений соседей. А оплата на этапе бесплатного запуска — наличными при получении, напрямую повару: вы платите, когда заказ уже у вас в руках."] },
        { h: "Хотите готовить сами?", p: ["Если вы готовите вкусно и хотите продавать соседям, вы тоже можете стать проверенным поваром: пройти подтверждение личности, согласиться с санитарными правилами и открыть свою витрину. А если пока хотите просто поесть по-домашнему — посмотрите, кто готовит рядом с вами, и выбирайте по составу и отзывам."] },
      ],
    },
    en: {
      title: "How we verify home cooks on Celina",
      excerpt:
        "A \"verified cook\" on Celina means identity verification and self-declared sanitary compliance. We explain honestly what we check — and what we don't.",
      body: [
        { p: ["When you order food from a neighbor, it's fair to ask: who is this person, and can they be trusted? We take that question seriously and want to be completely honest about our wording. Below is exactly how verification of verified home cooks works on Celina — and, just as importantly, what our check does not mean."] },
        { h: "What \"verified\" means", p: ["On Celina, the \"verified\" badge means two specific things: first, the cook has passed identity confirmation; second, they have self-declared that they follow sanitary and hygiene rules when cooking. That's it. We deliberately don't use the word more broadly, so as not to create false expectations."] },
        { h: "Step 1. Identity confirmation", p: ["Before a cook can publish dishes, they go through identity verification. This removes anonymity: behind the storefront stands a real person with confirmed details, not a nameless account. For a marketplace where neighbors meet in person to hand over an order, this is a baseline level of trust."] },
        { h: "Step 2. Sanitary rules statement", p: ["The cook reviews the sanitary and hygiene standards and signs a Food Safety Statement — taking responsibility to cook cleanly, store ingredients properly, and honestly list what's in each dish. This is a self-declaration: the cook attests to their own compliance, and that responsibility rests with them."] },
        { h: "What we do NOT check — said plainly", p: ["This is the most important part, and we won't smooth it over. Celina is an information platform that connects neighbors. We do not inspect kitchens, we do not test dishes, and we do not guarantee the quality or safety of the food. The word \"verified\" refers to the cook's identity and their own sanitary declaration — but it is not a sign that we vouch for them as a regulatory authority.", "We believe it's more important to state the boundaries honestly than to promise something we can't deliver. Trust is built on clear rules, not on big words."] },
        { h: "What helps you choose", p: ["Beyond our basic check, you have your own tools. The cook lists the ingredients and allergens for every dish — you see them in advance. After an order, buyers leave honest reviews and ratings, with no manipulation, and the rating is built from real neighbor opinions. And right now, payment is cash on delivery, straight to the cook: you pay when the order is already in your hands."] },
        { h: "Want to cook yourself?", p: ["If you cook well and want to sell to neighbors, you can become a verified cook too: pass identity confirmation, agree to the sanitary rules, and open your own storefront. And if for now you just want a home-cooked meal — see who's cooking near you and choose by ingredients and reviews."] },
      ],
    },
  },
  {
    slug: "menyu-na-den-rozhdeniya-bez-gotovki",
    cover: "/images/olivier-salad.jpg",
    date: "2026-07-13",
    readMin: 6,
    tags: ["меню на день рождения", "праздничный стол", "домашняя еда", "застолье"],
    links: [
      { to: "/eda-na-prazdnik", label: "Праздничный стол на заказ" },
      { to: "/dostavka", label: "Доставка домашней еды на дом" },
      { to: "/blog/eda-na-kompaniyu", label: "Еда на компанию: что заказать на вечеринку" },
      { to: "/eda/moskva/salaty", label: "Салаты в Москве" },
      { to: "/eda/moskva/goryachee", label: "Горячее в Москве" },
      { to: "/eda/moskva/deserty", label: "Десерты в Москве" },
      { to: "/gatherings", label: "Застолья с соседями" },
    ],
    ru: {
      title: "Меню на день рождения: домашний стол без готовки",
      excerpt:
        "Готовое меню на день рождения без часов у плиты: салаты, горячее, закуски и торт от соседей-поваров. Что заказать и как рассчитать порции.",
      body: [
        { p: ["Меню на день рождения обычно означает два-три дня у плиты: салаты с вечера, горячее с утра, а торт — как повезёт. Но праздник — это не про усталость хозяйки, а про то, чтобы самой сесть за стол с гостями. На Celina можно собрать домашний праздничный стол, ничего не готовя самому: каждое блюдо приготовит проверенный сосед-повар по семейному рецепту, а вам останется красиво расставить тарелки.", "Рассказываем, как спланировать меню на день рождения так, чтобы хватило всем, ничего не осталось лишним, и вкус был именно домашним — а не как из общепита."] },
        { h: "С чего начать: сколько человек и какой формат", p: ["Сначала определитесь с двумя вещами: сколько будет гостей и какой формат застолья. Тёплый семейный ужин на 6 человек и шумная компания на 15 — это разные объёмы и разный набор блюд.", "Простое правило для полноценного застолья: на каждого гостя закладывайте 2–3 салата в общих тарелках, одно горячее, холодные закуски и десерт. Если день рождения приходится на обед или ранний вечер, люди едят плотнее; если это поздние посиделки — акцент можно сместить на закуски и выпечку."] },
        { h: "Салаты: основа праздничного стола", p: ["Без салатов русский день рождения не обходится. Классика, которую любят все: оливье, «Селёдка под шубой», крабовый, мимоза. Домашние версии отличаются от магазинных заметно — свежий майонез или заправка, нормальное мясо в оливье вместо колбасы, и никакого лишнего сахара.", "Рассчитывайте примерно 150–200 граммов салата на человека, если салатов несколько. Закажите два-три разных вида, чтобы был выбор: один мясной, один рыбный, один лёгкий овощной. Посмотрите, кто из соседей готовит салаты рядом с вами, и выберите по составу и отзывам."] },
        { h: "Горячее: одно основное блюдо на всех", p: ["Горячее — центр стола. Здесь работает принцип «одно сытное блюдо, которого точно хватит»: запечённая курица или утка, буженина, плов, голубцы, жаркое в горшочках. Такие блюда удобно заказывать целиком на компанию — их легко разогреть и подать.", "На человека закладывайте примерно 250–300 граммов горячего с гарниром. Если гости разные по аппетиту, лучше взять чуть больше — остатки горячего на следующий день только радуют. Домашнее горячее у соседей часто готовят под заказ к нужной дате, поэтому оформляйте заранее."] },
        { h: "Закуски и выпечка: чтобы стол выглядел полным", p: ["Холодные закуски делают стол богатым визуально и дают гостям что перехватить, пока подаётся горячее. Домашние пирожки, рулетики, фаршированные яйца, сырная и мясная нарезка, лаваш с начинкой — всё это заказывается заранее и не требует от вас ни минуты готовки.", "Пирожки и несладкая выпечка хороши тем, что их удобно есть руками и они уходят в любой компании. Пара видов закусок на 8–10 человек создаёт ощущение изобилия без переплаты."] },
        { h: "Торт и десерты: финал вечера", p: ["Именинный торт лучше заказывать у того, кто печёт дома под конкретную дату — так он будет свежим, без консервантов и по вашему вкусу. Медовик, «Наполеон», сметанник, чизкейк — классика, которая нравится и детям, и взрослым.", "Если гостей много, к торту можно добавить тарелку домашней выпечки: сырники, пироги, печенье. Уточняйте у повара срок изготовления заранее — торт на день рождения обычно готовят под заказ за один-два дня."] },
        { h: "Как оформить заказ и оплатить", p: ["Соберите меню от разных поваров в одну корзину: салаты у одного, горячее у другого, торт у третьего — это нормально. Выберите доставку от повара к нужному часу или самовывоз. На этапе бесплатного запуска оплата — наличными при получении, напрямую повару, без карт и предоплаты.", "Оформляйте заказ на день рождения заранее, особенно если это выходные: популярные блюда и торты повара готовят под конкретную дату, и место в расписании лучше занять пораньше."] },
        { h: "Хотите не стол, а целый праздник у соседей", p: ["Если день рождения хочется провести не дома, а в тёплой компании соседей, посмотрите раздел застолий: там соседи собирают гостей за общим столом. Можно присоединиться к встрече или создать свою — например, позвать друзей на грузинский вечер или чай с домашними пирогами.", "А если формат классический — накрытый дома стол без готовки — просто посмотрите, кто готовит рядом, и соберите меню на день рождения из настоящей домашней еды. Праздник заслуживает того, чтобы вы провели его за столом, а не у плиты."] },
      ],
    },
    en: {
      title: "Birthday menu: a homemade spread with no cooking",
      excerpt:
        "A ready birthday menu without hours at the stove: salads, mains, appetizers and cake from neighbor-cooks. What to order and how to size portions.",
      body: [
        { p: ["A birthday menu usually means two or three days at the stove: salads the night before, mains in the morning, and the cake if you're lucky. But a celebration isn't about an exhausted host — it's about sitting down at the table with your guests. On Celina you can put together a homemade party spread without cooking anything yourself: each dish is made by a verified neighbor-cook from a family recipe, and all that's left for you is to arrange the plates.", "Here's how to plan a birthday menu so there's enough for everyone, nothing goes to waste, and the taste is genuinely homemade — not canteen-style."] },
        { h: "Start here: how many people and what format", p: ["First decide two things: how many guests you'll have and what kind of gathering it is. A warm family dinner for 6 and a lively party of 15 mean different volumes and a different set of dishes.", "A simple rule for a full spread: per guest, plan on 2–3 salads in shared bowls, one main, cold appetizers, and dessert. If the birthday falls at lunch or early evening, people eat more heartily; for a late get-together you can shift the focus to appetizers and baking."] },
        { h: "Salads: the base of the party table", p: ["No Russian birthday goes without salads. The classics everyone loves: Olivier, herring under a fur coat, crab salad, mimosa. Homemade versions differ noticeably from store-bought ones — fresh mayo or dressing, proper meat in the Olivier instead of sausage, and no extra sugar.", "Count on roughly 150–200 grams of salad per person if you're serving several. Order two or three different kinds for variety: one with meat, one with fish, one light and vegetable-based. See which neighbors make salads near you and choose by ingredients and reviews."] },
        { h: "The main: one central dish for everyone", p: ["The hot main is the center of the table. The principle here is \"one hearty dish that will definitely be enough\": roast chicken or duck, baked pork, plov, cabbage rolls, or meat stew in pots. These are convenient to order whole for a group — easy to reheat and serve.", "Plan on about 250–300 grams of main with a side per person. If your guests vary in appetite, take a little more — leftover mains the next day are a bonus. Neighbors often cook homemade mains to order for a specific date, so place your order in advance."] },
        { h: "Appetizers and baking: making the table look full", p: ["Cold appetizers make the table look abundant and give guests something to nibble while the main is being served. Homemade pirozhki, roll-ups, deviled eggs, cheese and meat platters, stuffed lavash — all ordered ahead and requiring not a minute of cooking from you.", "Pirozhki and savory baking are great because they're easy to eat by hand and disappear in any crowd. A couple of appetizer options for 8–10 people create a sense of plenty without overpaying."] },
        { h: "Cake and desserts: the finale of the evening", p: ["The birthday cake is best ordered from someone who bakes at home for a specific date — that way it's fresh, preservative-free, and to your taste. Honey cake, Napoleon, sour-cream cake, cheesecake — classics loved by kids and adults alike.", "If there are many guests, add a plate of homemade baking alongside the cake: syrniki, pies, cookies. Check the lead time with the cook in advance — a birthday cake is usually made to order one or two days ahead."] },
        { h: "How to place the order and pay", p: ["Combine a menu from different cooks in one cart: salads from one, the main from another, the cake from a third — that's fine. Choose delivery by the cook for a specific hour or pickup. Right now, payment is cash on delivery, directly to the cook, with no cards or prepayment.", "Place your birthday order in advance, especially on weekends: cooks prepare popular dishes and cakes for a specific date, so it's best to claim a slot in their schedule early."] },
        { h: "Want not just a table, but a whole celebration with neighbors", p: ["If you'd rather host the birthday not at home but in the warm company of neighbors, take a look at the gatherings section: there, neighbors bring guests together around a shared table. You can join a meeting or create your own — say, invite friends to a Georgian evening or tea with homemade pies.", "And if the format is classic — a table set at home with no cooking — just see who's cooking nearby and build your birthday menu out of real homemade food. A celebration deserves to be spent at the table, not at the stove."] },
      ],
    },
  },
  {
    slug: "plov-na-zakaz-gde-nayti-nastoyashchiy",
    cover: "/images/dishes/plov.jpg",
    date: "2026-07-13",
    readMin: 6,
    tags: ["плов на заказ", "узбекская кухня", "домашняя еда", "горячее"],
    links: [
      { to: "/eda/moskva/goryachee", label: "Горячее в Москве" },
      { to: "/eda/moskva", label: "Домашняя еда в Москве" },
      { to: "/eda/sankt-peterburg", label: "Домашняя еда в Петербурге" },
      { to: "/blog", label: "Другие гайды о еде" },
    ],
    ru: {
      title: "Плов на заказ: где найти настоящий узбекский",
      excerpt:
        "Настоящий узбекский плов на заказ — из казана, с зирваком и правильным рисом. Как отличить хороший плов и заказать его у соседа-повара.",
      body: [
        { p: ["Плов на заказ ищут, когда хочется того самого вкуса: рассыпчатый рис, мягкая баранина, сладковатая морковь и аромат зиры, который слышно ещё до того, как снимут крышку с казана. Такой плов почти невозможно приготовить на скорую руку в обычной кастрюле — нужны казан, время и опыт. Поэтому проще заказать настоящий узбекский плов у того, кто готовит его дома как надо.", "На Celina плов на заказ готовят проверенные соседи-повара — часто по семейным рецептам, привезённым из Средней Азии. Рассказываем, чем отличается настоящий плов, как его выбрать и на что обратить внимание при заказе."] },
        { h: "Что такое настоящий узбекский плов", p: ["Настоящий плов начинается с зирвака — основы из обжаренного мяса, лука и моркови с приправами, которую томят до того, как засыпать рис. Именно зирвак даёт плову вкус и цвет: рис потом впитывает его и получается насыщенным, а не пресным.", "Классический ферганский плов делают из баранины, жёлтой и красной моркови, риса сорта девзира или лазер, с зирой, барбарисом и целыми головками чеснока. Рис должен быть рассыпчатым — каждая рисинка отдельно, — а не слипшимся в кашу. Это главный признак того, что плов готовил человек, который умеет."] },
        { h: "Почему домашний плов лучше ресторанного", p: ["В плове всё решают детали: сорт риса, качество баранины, соотношение мяса и моркови, огонь и время. Дома у повара нет задачи ускорить процесс ради оборота — плов томится столько, сколько нужно. Часто это рецепт, который в семье готовят десятилетиями, с точными пропорциями, доведёнными до идеала.", "Ещё домашний плов честнее по составу: вы видите, из чего он, и можете спросить повара напрямую. Баранина или говядина, сколько чеснока, острый или мягкий — всё обсуждается заранее."] },
        { h: "Как выбрать повара для плова", p: ["Откройте раздел горячего в вашем городе и посмотрите, кто готовит плов рядом. У каждого повара есть витрина: фото блюда, состав, цена и отзывы соседей. Обратите внимание на то, из какого мяса плов, указан ли сорт риса, и что пишут в отзывах те, кто уже пробовал.", "Фотография тоже говорит о многом: у хорошего плова рис рассыпчатый и золотистый, морковь целая, мясо крупными кусками. Если повар готовит и другие блюда узбекской кухни — самсу, лагман, манты — это хороший знак, что кухня для него родная."] },
        { h: "Сколько плова заказывать", p: ["Плов — блюдо сытное, и на человека обычно хватает 300–350 граммов как основного блюда. Но плов любят заказывать на компанию: он идеален для большого стола, дня рождения или встречи с гостями, потому что его удобно готовить большим объёмом и легко разогреть.", "Если берёте плов на праздник, закладывайте чуть больше — остывший и разогретый на следующий день плов многие любят даже сильнее. Уточните у повара, к какому часу и на сколько персон нужно приготовить: плов из казана делают под заказ, поэтому оформляйте заранее."] },
        { h: "Плов не только узбекский", p: ["Кроме классического ферганского, бывают и другие виды: самаркандский, где рис и зирвак не перемешивают до подачи, азербайджанский с сухофруктами, ташкентский. Разные повара готовят по-разному — это и есть прелесть заказа домашней еды: можно найти именно тот вкус, который вам близок.", "Если у вас есть предпочтения — меньше жира, острее, без чеснока, только баранина — напишите повару. Домашняя кухня гибче ресторанной, и многое можно обговорить до готовки."] },
        { h: "Как заказать и оплатить", p: ["Добавьте плов в корзину, выберите доставку от повара к нужному времени или самовывоз. Плов лучше есть свежим и горячим, поэтому удобно согласовать час доставки под ваш стол. На этапе бесплатного запуска оплата — наличными при получении, напрямую повару, без карт и предоплаты.", "Готовы попробовать настоящий узбекский плов на заказ? Посмотрите, кто готовит его рядом с вами, и выберите повара по составу и отзывам — вкус из казана стоит того, чтобы заказать его домой."] },
      ],
    },
    en: {
      title: "Plov to order: where to find the real Uzbek one",
      excerpt:
        "Real Uzbek plov to order — from the cauldron, with zirvak and the right rice. How to tell good plov apart and order it from a neighbor-cook.",
      body: [
        { p: ["People look for plov to order when they want that exact taste: crumbly rice, tender lamb, sweetish carrot, and the aroma of cumin you can smell before the cauldron lid even comes off. Such plov is nearly impossible to make quickly in an ordinary pot — it needs a kazan, time, and experience. So it's easier to order real Uzbek plov from someone who cooks it at home the proper way.", "On Celina, plov to order is made by verified neighbor-cooks — often from family recipes brought from Central Asia. Here's what makes plov real, how to choose it, and what to look for when ordering."] },
        { h: "What real Uzbek plov is", p: ["Real plov begins with the zirvak — a base of seared meat, onion, and carrot with spices, simmered before the rice goes in. It's the zirvak that gives plov its flavor and color: the rice then absorbs it and turns rich rather than bland.", "Classic Fergana plov is made with lamb, yellow and red carrot, devzira or laser rice, with cumin, barberries, and whole heads of garlic. The rice must be crumbly — every grain separate — not clumped into porridge. That's the main sign the plov was made by someone who knows how."] },
        { h: "Why homemade plov beats restaurant plov", p: ["In plov, details decide everything: the type of rice, the quality of the lamb, the meat-to-carrot ratio, the heat and the timing. At home the cook has no reason to rush for turnover — the plov simmers as long as it needs to. Often it's a recipe a family has cooked for decades, with exact proportions perfected over time.", "Homemade plov is also more honest about ingredients: you see what's in it and can ask the cook directly. Lamb or beef, how much garlic, spicy or mild — all discussed in advance."] },
        { h: "How to choose a cook for plov", p: ["Open the mains section for your city and see who cooks plov nearby. Every cook has a storefront: dish photo, ingredients, price, and neighbor reviews. Note what meat the plov uses, whether the rice type is listed, and what people who've already tried it write in reviews.", "The photo says a lot too: good plov has crumbly golden rice, whole carrot, and large pieces of meat. If the cook also makes other Uzbek dishes — samsa, lagman, manti — that's a good sign this cuisine is native to them."] },
        { h: "How much plov to order", p: ["Plov is filling, and about 300–350 grams per person is usually enough as a main. But plov is popular to order for a group: it's ideal for a big table, a birthday, or a gathering, because it's easy to make in large volume and easy to reheat.", "If you're getting plov for a celebration, take a little more — many love plov even more the next day, cooled and reheated. Check with the cook for what hour and how many servings to prepare: plov from the cauldron is made to order, so place it in advance."] },
        { h: "Not only Uzbek plov", p: ["Besides classic Fergana, there are other kinds: Samarkand, where rice and zirvak aren't mixed until serving; Azerbaijani with dried fruit; Tashkent. Different cooks make it differently — that's the beauty of ordering homemade food: you can find exactly the taste that's close to you.", "If you have preferences — less fat, spicier, no garlic, lamb only — write to the cook. Home cooking is more flexible than restaurant cooking, and much can be arranged before cooking begins."] },
        { h: "How to order and pay", p: ["Add the plov to your cart and choose delivery by the cook for a set time or pickup. Plov is best eaten fresh and hot, so it's convenient to arrange a delivery hour around your table. Right now, payment is cash on delivery, directly to the cook, with no cards or prepayment.", "Ready to try real Uzbek plov to order? See who cooks it near you and choose a cook by ingredients and reviews — a taste from the cauldron is worth ordering to your home."] },
      ],
    },
  },
  {
    slug: "domashnyaya-eda-s-dostavkoy-otlichie-ot-restorannoy",
    cover: "/images/borscht.jpg",
    date: "2026-07-13",
    readMin: 7,
    tags: ["домашняя еда с доставкой", "доставка еды", "маркетплейс", "соседи-повара"],
    links: [
      { to: "/dostavka", label: "Как работает доставка домашней еды" },
      { to: "/eda/moskva", label: "Домашняя еда в Москве" },
      { to: "/eda/sankt-peterburg", label: "Домашняя еда в Петербурге" },
      { to: "/eda/moskva/supy", label: "Домашние супы в Москве" },
      { to: "/login?mode=register&role=cook", label: "Стать поваром" },
    ],
    ru: {
      title: "Домашняя еда с доставкой: чем отличается от ресторанной",
      excerpt:
        "Домашняя еда с доставкой — это семейные рецепты от соседей, а не кухня ресторана. Разбираем отличия: вкус, состав, цена, доверие и как заказать.",
      body: [
        { p: ["Домашняя еда с доставкой и еда из ресторана на первый взгляд похожи: и то, и другое привозят к двери. Но по сути это разные вещи. Ресторан — это поток, стандартизированное меню и кухня, работающая на оборот. Домашняя еда — это конкретный человек, который готовит для вас по своему рецепту, как готовил бы для семьи.", "На Celina домашнюю еду с доставкой готовят проверенные соседи-повара. Разбираем по пунктам, чем такой формат отличается от ресторанного и когда он подходит лучше."] },
        { h: "Кто готовит: повар ресторана или сосед", p: ["В ресторане блюдо проходит через линию: заготовки, повара смены, стандарт подачи. Задача — чтобы одно и то же блюдо было одинаковым каждый день. Это удобно, но безлично.", "Домашнюю еду готовит один человек — сосед, который отвечает за блюдо от начала до конца. У него есть имя, витрина, отзывы и свой стиль. Часто это рецепт из семьи: бабушкин борщ, мамины пельмени, домашняя выпечка по записи, которой сто лет. Вы заказываете не «позицию из меню», а еду конкретного человека."] },
        { h: "Вкус: стандарт против семейного рецепта", p: ["Ресторанная кухня стремится к предсказуемости — и в этом её сила, и её ограничение. Домашняя еда живая: борщ может быть чуть гуще, пирожки — чуть румянее, потому что их делали руками, а не по технологической карте.", "Именно поэтому домашнюю еду часто заказывают за тем вкусом, которого не найти в общепите: настоящий русский суп, кавказская выпечка, узбекский плов из казана, соленья и заготовки. Это еда, которую готовят так, как дома, а не так, как удобно ставить на поток."] },
        { h: "Состав и честность", p: ["В ресторане вы редко знаете полный состав блюда и почти никогда не можете обсудить его с тем, кто готовит. В домашней еде это норма: повар указывает состав и аллергены, а многие вещи можно уточнить заранее — меньше соли, без лука, острее или мягче.", "На Celina каждый повар указывает состав и аллергены блюд. Если у вас есть ограничения по питанию, вы видите это до заказа и выбираете осознанно."] },
        { h: "Цена: за что вы платите", p: ["В цене ресторанного блюда заложены аренда зала, зарплаты смены, наценка на алкоголь и обслуживание. У домашней еды этих слоёв нет: вы платите повару за продукты и труд напрямую. Часто за те же деньги вы получаете больший объём и более честный состав.", "На этапе бесплатного запуска Celina оплата — наличными при получении, напрямую повару, без карт, предоплаты и комиссий. Вы платите, когда заказ у вас в руках."] },
        { h: "Доверие: как оно устроено без ресторанной вывески", p: ["У ресторана есть вывеска и репутация заведения. У домашней еды доверие строится иначе, но не слабее. Прежде чем публиковать блюда, повар на Celina проходит проверку личности и подтверждает согласие с санитарно-гигиеническими правилами. После заказов соседи оставляют честные отзывы и оценки — рейтинг складывается из реальных мнений.", "Важно понимать честно: «проверенный повар» означает подтверждение личности и самостоятельно заявленное соблюдение санитарных правил. Celina — это площадка, которая соединяет соседей; выбор повара за вами, а отзывы и состав помогают решить."] },
        { h: "Когда домашняя еда подходит лучше", p: ["Домашняя еда с доставкой особенно хороша, когда хочется именно домашнего вкуса: борщ или щи как в детстве, свежая выпечка к чаю, полноценный обед без готовки, стол на праздник или большая порция плова на компанию. Это про тепло и заботу, а не про «просто поесть».", "Ресторанная доставка выигрывает, когда нужно очень быстро и в любой час ночи. Домашнюю еду чаще готовят под заказ к определённому времени — поэтому её оформляют заранее, но взамен получают свежесть и вкус, которого в потоке не бывает."] },
        { h: "Как заказать — и как начать готовить", p: ["Чтобы заказать домашнюю еду с доставкой, откройте ленту своего города, найдите повара по блюду или кухне, добавьте блюда в корзину и выберите доставку или самовывоз. Можно заказывать сразу у нескольких соседей.", "А если вы сами вкусно готовите — домашняя еда с доставкой это ещё и возможность зарабатывать на любимом деле. Станьте поваром на Celina: пройдите проверку, выложите свою витрину и готовьте для соседей то, что умеете лучше всего."] },
      ],
    },
    en: {
      title: "Homemade food delivery: how it differs from restaurant food",
      excerpt:
        "Homemade food delivery means family recipes from neighbors, not a restaurant kitchen. We break down the differences: taste, ingredients, price, trust, and how to order.",
      body: [
        { p: ["Homemade food delivery and restaurant food look alike at first: both arrive at your door. But they're fundamentally different. A restaurant is a pipeline — a standardized menu and a kitchen built for turnover. Homemade food is a specific person cooking for you by their own recipe, the way they'd cook for their family.", "On Celina, homemade food delivery is made by verified neighbor-cooks. Here's a point-by-point breakdown of how this format differs from the restaurant one, and when it's the better choice."] },
        { h: "Who cooks: a restaurant chef or a neighbor", p: ["In a restaurant a dish passes down a line: prep, the shift's cooks, a plating standard. The goal is for the same dish to be identical every day. That's convenient, but impersonal.", "Homemade food is made by one person — a neighbor who owns the dish from start to finish. They have a name, a storefront, reviews, and a style. Often it's a family recipe: grandma's borscht, mom's pelmeni, homemade baking from a note that's a century old. You're ordering not a \"menu item\" but a specific person's food."] },
        { h: "Taste: a standard vs. a family recipe", p: ["Restaurant cooking aims for predictability — that's both its strength and its limit. Homemade food is alive: the borscht may be a bit thicker, the pirozhki a bit more golden, because they were made by hand, not by a spec sheet.", "That's why people often order homemade food for a taste you can't find in catering: a real Russian soup, Caucasian baking, Uzbek plov from the cauldron, pickles and preserves. It's food cooked the way it's done at home, not the way that's easy to mass-produce."] },
        { h: "Ingredients and honesty", p: ["At a restaurant you rarely know a dish's full composition and almost never get to discuss it with whoever cooked it. With homemade food that's the norm: the cook lists ingredients and allergens, and many things can be arranged in advance — less salt, no onion, spicier or milder.", "On Celina every cook lists ingredients and allergens for their dishes. If you have dietary restrictions, you see them before ordering and choose consciously."] },
        { h: "Price: what you're paying for", p: ["A restaurant dish's price includes rent, shift wages, markups on drinks and service. Homemade food has none of those layers: you pay the cook for ingredients and labor directly. Often, for the same money, you get a bigger portion and a more honest composition.", "During Celina's free launch, payment is cash on delivery, directly to the cook, with no cards, prepayment, or fees. You pay when the order is in your hands."] },
        { h: "Trust: how it works without a restaurant sign", p: ["A restaurant has a sign and an establishment's reputation. Homemade food builds trust differently, but no less firmly. Before publishing dishes, a cook on Celina passes identity verification and confirms agreement to sanitary-hygiene rules. After orders, neighbors leave honest reviews and ratings — the rating is built from real opinions.", "It's important to be honest: a \"verified cook\" means confirmed identity and self-declared compliance with sanitary rules. Celina is a platform that connects neighbors; the choice of cook is yours, and reviews and ingredients help you decide."] },
        { h: "When homemade food is the better fit", p: ["Homemade food delivery is especially good when you want exactly that home taste: borscht or shchi like in childhood, fresh baking with tea, a full meal with no cooking, a spread for a celebration, or a big portion of plov for a group. It's about warmth and care, not just \"getting fed.\"", "Restaurant delivery wins when you need something very fast, at any hour of the night. Homemade food is more often made to order for a set time — so it's placed in advance, but in return you get freshness and a taste a pipeline can't produce."] },
        { h: "How to order — and how to start cooking", p: ["To order homemade food delivery, open your city's feed, find a cook by dish or cuisine, add dishes to your cart, and choose delivery or pickup. You can order from several neighbors at once.", "And if you're a good cook yourself — homemade food delivery is also a way to earn from what you love. Become a cook on Celina: pass verification, set up your storefront, and cook for your neighbors what you do best."] },
      ],
    },
  },
  {
    slug: "osetinskie-pirogi-na-zakaz",
    cover: "/images/pirozhki.jpg",
    date: "2026-07-13",
    readMin: 6,
    tags: ["осетинские пироги", "на заказ", "выпечка", "кавказская кухня"],
    links: [
      { to: "/eda/moskva/vypechka", label: "Домашняя выпечка в Москве" },
      { to: "/eda/moskva", label: "Домашняя еда в Москве" },
      { to: "/blog", label: "Другие статьи о домашней еде" },
    ],
    ru: {
      title: "Осетинские пироги на заказ: настоящие против магазинных",
      excerpt:
        "Чем осетинский пирог на заказ от соседа-повара отличается от магазинного: тесто, начинка, тонкость коржа и вкус. И где найти домашние.",
      body: [
        { p: ["Осетинские пироги на заказ ищут, когда хочется того самого вкуса — тонкого коржа, щедрой начинки и аромата свежей выпечки, а не разогретого полуфабриката из витрины супермаркета. Разница между настоящим домашним пирогом и магазинным огромна, и она чувствуется с первого куска. Разберём, в чём она, и как заказать пирог у соседа-повара."] },
        { h: "Что такое настоящий осетинский пирог", p: ["Осетинский пирог — это тонкая лепёшка из дрожжевого теста с обильной начинкой. Классических видов много: уалибах (с сыром), фыдджын (с мясом), кабускаджын (с капустой), цахараджын (со свекольной ботвой и сыром), картофджын (с картофелем и сыром). Традиционно пироги подают по три — это часть застольного этикета в Осетии.", "Главный признак мастерства — соотношение теста и начинки. У правильного пирога корж тонкий, почти незаметный, а начинки много, и она равномерно распределена до самых краёв. Это трудно сделать: тонко раскатать тесто с тяжёлой влажной начинкой, не порвав его, умеет не каждый."] },
        { h: "Чем магазинный пирог отличается от домашнего", p: ["Магазинный пирог почти всегда экономит на начинке: слой тонкий, ближе к краям сходит на нет, а тесто, наоборот, толстое и сухое — так дешевле и проще в производстве. Сыр часто заменяют дешёвыми смесями, а зелень — минимумом для запаха.", "Домашний пирог от соседа-повара печётся небольшими партиями под заказ. Повар не гонится за сроком годности в неделю: пирог едет к вам тёплым, в день выпечки. Сыр — настоящий, зелени не жалеют, тесто раскатано тонко руками, а не отштамповано."] },
        { h: "Почему у домашнего повара пирог вкуснее", p: ["Домашняя кухня — это про рецепт семьи, а не про технологическую карту фабрики. Многие повара-осетины готовят так, как учили дома: с определённым сортом сыра, со своей пропорцией зелени, с ручной защипкой. Такой пирог невозможно поставить на конвейер.", "Свежесть решает всё. Осетинский пирог хорош, пока он тёплый и мягкий. Магазинный проводит сутки на полке и подсыхает. Домашний вы получаете вскоре после того, как его достали из духовки."] },
        { h: "Как выбрать повара и заказать", p: ["На Celina вы заказываете осетинские пироги напрямую у проверенных соседей-поваров. У каждого повара витрина: фото пирогов, состав, аллергены, цена и честные отзывы соседей. Смотрите, какие виды печёт повар — уалибах, фыдджын, картофджын — и что пишут те, кто уже заказывал.", "Каждый повар проходит проверку личности и подтверждает соблюдение санитарных правил. Это не гарантия качества со стороны площадки, а прозрачность: вы видите, кто готовит, и решаете сами по отзывам и составу."] },
        { h: "Доставка, самовывоз и оплата", p: ["Выберите удобный способ: доставка от повара тёплого пирога или самовывоз рядом с домом. На этапе бесплатного запуска оплата — наличными при получении, напрямую повару, без карт и предоплаты.", "Совет: пироги лучше заказывать заранее, особенно на праздник или большое застолье — их пекут под заказ, а не держат готовыми."] },
        { p: ["Настоящий осетинский пирог стоит того, чтобы заказать его у того, кто печёт с душой. Посмотрите, кто готовит рядом, и выберите повара, чьи пироги захочется заказывать снова."] },
      ],
    },
    en: {
      title: "Ossetian pies to order: real ones vs. store-bought",
      excerpt:
        "How a made-to-order Ossetian pie from a neighbor-cook differs from store-bought: dough, filling, thin crust, and taste — and where to find homemade.",
      body: [
        { p: ["People look for Ossetian pies to order when they want that real taste — a thin crust, generous filling, and the aroma of fresh baking, not a reheated ready-meal from a supermarket shelf. The gap between a real homemade pie and a store-bought one is huge, and you feel it from the first bite. Let's break down what that difference is, and how to order a pie from a neighbor-cook."] },
        { h: "What a real Ossetian pie is", p: ["An Ossetian pie is a thin round of yeast dough with an abundant filling. There are many classic kinds: ualibakh (cheese), fydjyn (meat), kabuskadzhyn (cabbage), tsakharadzhyn (beet greens and cheese), kartofdzhyn (potato and cheese). Traditionally the pies are served in threes — part of the table etiquette in Ossetia.", "The main sign of skill is the ratio of dough to filling. In a proper pie the crust is thin, almost imperceptible, while there is a lot of filling, spread evenly right to the edges. That's hard to do: rolling dough thin under a heavy, moist filling without tearing it is a real craft."] },
        { h: "How store-bought differs from homemade", p: ["A store-bought pie almost always skimps on filling: a thin layer that fades near the edges, while the dough is thick and dry — cheaper and easier to mass-produce. Cheese is often swapped for cheap blends, and greens are kept to the bare minimum for aroma.", "A homemade pie from a neighbor-cook is baked in small batches to order. The cook isn't chasing a week-long shelf life: the pie reaches you warm, on the day it's baked. The cheese is real, the greens aren't spared, the dough is rolled thin by hand rather than stamped out."] },
        { h: "Why a home cook's pie tastes better", p: ["A home kitchen is about a family recipe, not a factory production sheet. Many Ossetian cooks bake the way they were taught at home: a particular kind of cheese, their own proportion of greens, a hand-crimped seal. You can't put that on a conveyor.", "Freshness is everything. An Ossetian pie is good while it's warm and soft. A store one spends a day on the shelf and dries out. The homemade one reaches you soon after it leaves the oven."] },
        { h: "How to choose a cook and order", p: ["On Celina you order Ossetian pies straight from verified neighbor-cooks. Every cook has a storefront: pie photos, ingredients, allergens, price, and honest neighbor reviews. See which kinds the cook bakes — ualibakh, fydjyn, kartofdzhyn — and what past buyers say.", "Every cook passes identity verification and confirms they follow sanitary rules. That isn't a quality guarantee from the platform — it's transparency: you see who's cooking and decide for yourself based on reviews and ingredients."] },
        { h: "Delivery, pickup, and payment", p: ["Pick what suits you: delivery of a warm pie by the cook or pickup near your home. Right now, payment is cash on delivery, directly to the cook, with no cards or prepayment.", "Tip: order pies in advance, especially for a holiday or a big gathering — they're baked to order, not kept ready-made."] },
        { p: ["A real Ossetian pie deserves to be ordered from someone who bakes it with heart. See who's cooking nearby and pick a cook whose pies you'll want to order again."] },
      ],
    },
  },
  {
    slug: "kak-nachat-gotovit-na-prodazhu-iz-doma",
    cover: "/images/syrniki.jpg",
    date: "2026-07-13",
    readMin: 7,
    tags: ["готовить на продажу", "повар", "из дома", "подработка"],
    links: [
      { to: "/login?mode=register&role=cook", label: "Стать поваром на Celina" },
      { to: "/eda/moskva", label: "Посмотреть, как готовят соседи" },
      { to: "/zagotovki", label: "Продать излишки заготовок соседям" },
      { to: "/blog", label: "Полезные статьи для поваров" },
    ],
    ru: {
      title: "Как начать готовить на продажу из дома: пошаговый гайд",
      excerpt:
        "Пошаговый гайд, как начать готовить на продажу из дома: с чего начать, что приготовить первым, как оформить витрину и получить первый заказ.",
      body: [
        { p: ["Если вы вкусно готовите и соседи давно говорят «продавай!», начать готовить на продажу из дома проще, чем кажется. Не нужен ресторан, аренда и большие вложения — нужны любимый рецепт, чистая кухня и желание. Этот пошаговый гайд проведёт вас от идеи до первого заказа на Celina."] },
        { h: "Шаг 1. Выберите блюда, которые у вас получаются лучше всего", p: ["Не пытайтесь сразу составить меню на двадцать позиций. Начните с двух-трёх блюд, которые вы готовите уверенно и которые хорошо переносят доставку или самовывоз. Хорошо «едут» пироги, пельмени, супы в контейнере, выпечка, сырники, домашние заготовки.", "Подумайте, чем вы отличаетесь. Семейный рецепт борща, бабушкины хачапури, честная начинка в пирогах — именно это ищут покупатели, уставшие от магазинной еды."] },
        { h: "Шаг 2. Посчитайте цену честно", p: ["Сложите стоимость продуктов на порцию, добавьте электроэнергию, упаковку и своё время. Цена должна покрывать затраты и быть справедливой к вам — работать в минус ради «низкой цены» нет смысла.", "Посмотрите, как оценивают похожие блюда другие соседи-повара, чтобы понять рыночный ориентир. Но не занижайте: домашнее качество стоит своих денег."] },
        { h: "Шаг 3. Подготовьте кухню и упаковку", p: ["Чистая кухня — основа доверия. Соблюдайте базовые санитарные правила: чистые поверхности, свежие продукты, раздельная работа с сырым мясом. При регистрации повар подтверждает соблюдение санитарно-гигиенических правил и подписывает Заявление о безопасности пищи.", "Продумайте упаковку: чтобы суп не протёк, пирог доехал тёплым, а выпечка не помялась. Аккуратная подача — часть впечатления."] },
        { h: "Шаг 4. Сделайте хорошие фото", p: ["Фотография продаёт блюдо раньше, чем его попробуют. Снимайте при дневном свете, на чистом фоне, так, чтобы было видно настоящую порцию — без прикрас, которые не совпадут с реальностью. Честное фото приносит хорошие отзывы, приукрашенное — разочарование и низкие оценки."] },
        { h: "Шаг 5. Оформите витрину и укажите состав", p: ["Зарегистрируйтесь как повар и заполните витрину: название блюда, описание, цену, состав и аллергены. Указывать состав и аллергены обязательно — покупатели с ограничениями выбирают осознанно, и это защищает вас.", "Опишите блюдо живо: что внутри, на сколько человек, как хранить. Чем понятнее карточка, тем меньше вопросов и больше заказов."] },
        { h: "Шаг 6. Получите первый заказ и отзыв", p: ["Когда витрина готова, ваши блюда появляются в ленте, и соседи находят вас по поиску, кухне или расстоянию. На этапе бесплатного запуска оплата — наличными при получении, напрямую вам, без комиссий площадки.", "После первого заказа попросите покупателя оставить честный отзыв. Первые отзывы — ваш фундамент: по ним новые соседи решают, заказать ли у вас. Готовьте стабильно, отвечайте вовремя — и репутация начнёт работать на вас."] },
        { p: ["Начать проще, чем откладывать. Выберите пару блюд, сфотографируйте их и станьте поваром на Celina — первый заказ ближе, чем вы думаете."] },
      ],
    },
    en: {
      title: "How to start selling homemade food: a step-by-step guide",
      excerpt:
        "A step-by-step guide to start cooking for sale from home: where to begin, what to make first, how to build your storefront, and how to get your first order.",
      body: [
        { p: ["If you cook well and neighbors keep telling you to \"sell it,\" starting to cook for sale from home is easier than it seems. You don't need a restaurant, a lease, or big investments — you need a favorite recipe, a clean kitchen, and the will. This step-by-step guide takes you from idea to your first order on Celina."] },
        { h: "Step 1. Choose the dishes you make best", p: ["Don't try to build a twenty-item menu at once. Start with two or three dishes you cook confidently and that travel well for delivery or pickup. Pies, dumplings, soups in a container, baked goods, syrniki, and homemade preserves all \"travel\" well.", "Think about what sets you apart. A family borscht recipe, grandma's khachapuri, an honest filling in your pies — that's exactly what buyers tired of store food are looking for."] },
        { h: "Step 2. Price it honestly", p: ["Add up the cost of ingredients per portion, then electricity, packaging, and your time. The price should cover your costs and be fair to you — there's no point working at a loss for a \"low price.\"", "Look at how other neighbor-cooks price similar dishes to get a market sense. But don't undersell: homemade quality is worth its price."] },
        { h: "Step 3. Prepare your kitchen and packaging", p: ["A clean kitchen is the foundation of trust. Follow basic sanitary rules: clean surfaces, fresh ingredients, separate handling of raw meat. At registration a cook confirms compliance with sanitary-hygiene rules and signs a Food Safety Statement.", "Plan the packaging so soup won't leak, a pie arrives warm, and baked goods don't get crushed. Neat presentation is part of the impression."] },
        { h: "Step 4. Take good photos", p: ["A photo sells the dish before anyone tastes it. Shoot in daylight, on a clean background, showing the real portion — without embellishments that won't match reality. An honest photo earns good reviews; a doctored one earns disappointment and low ratings."] },
        { h: "Step 5. Build your storefront and list ingredients", p: ["Register as a cook and fill in your storefront: dish name, description, price, ingredients, and allergens. Listing ingredients and allergens is required — buyers with restrictions choose consciously, and it protects you.", "Describe the dish vividly: what's inside, how many people it serves, how to store it. The clearer the card, the fewer questions and the more orders."] },
        { h: "Step 6. Get your first order and review", p: ["Once your storefront is ready, your dishes appear in the feed, and neighbors find you by search, cuisine, or distance. Right now, payment is cash on delivery, directly to you, with no platform fees.", "After your first order, ask the buyer for an honest review. Your first reviews are your foundation: new neighbors use them to decide whether to order from you. Cook consistently, reply on time, and your reputation will start working for you."] },
        { p: ["Starting is easier than putting it off. Pick a couple of dishes, photograph them, and become a cook on Celina — your first order is closer than you think."] },
      ],
    },
  },
  {
    slug: "domashnyaya-vypechka-na-zakaz",
    cover: "/images/apple-pie.jpg",
    date: "2026-07-23",
    readMin: 6,
    tags: ["домашняя выпечка", "на заказ", "торты", "пироги"],
    links: [
      { to: "/eda/moskva/vypechka", label: "Домашняя выпечка в Москве" },
      { to: "/eda/moskva", label: "Домашняя еда в Москве" },
      { to: "/blog/yablochnyy-spas-chto-prigotovit", label: "Что пекут на Медовый, Яблочный и Ореховый Спас" },
      { to: "/login?mode=register&role=cook", label: "Печёте? Станьте поваром" },
      { to: "/blog", label: "Другие статьи" },
    ],
    ru: {
      title: "Домашняя выпечка на заказ: торты, пироги и хлеб от соседей",
      excerpt:
        "Домашняя выпечка на заказ от проверенных соседей-поваров: торты, пироги, хлеб и десерты — свежее, честный состав, доставка или самовывоз.",
      body: [
        { p: ["Домашняя выпечка на заказ — это когда торт на день рождения печёт не фабрика, а сосед по району, а пирог к чаю приезжает тёплым и пахнет так, как в детстве. На Celina вы заказываете выпечку напрямую у проверенных соседей-поваров: торты, пироги, хлеб и десерты, сделанные небольшими партиями под вас."] },
        { h: "Что можно заказать", p: ["Категория выпечки широкая. Торты и капкейки — на праздник, юбилей или просто к выходным. Пироги — сладкие и сытные, от яблочного до осетинского. Хлеб на закваске и булочки — тем, кто ценит настоящий вкус вместо магазинной нарезки. Десерты — сырники, чизкейки, эклеры, печенье.", "У каждого повара своя специализация. Кто-то делает сложные торты на заказ по фото, кто-то печёт домашний хлеб каждое утро. Витрина показывает, что именно готовит конкретный сосед."] },
        { h: "Почему домашняя выпечка лучше магазинной", p: ["Свежесть и честный состав — вот главное. Домашний повар печёт под заказ, а не держит на полке неделю. В тесте — настоящее масло, а не спред; в креме — сливки, а не растительная замена. Вы видите состав и аллергены в карточке блюда и выбираете осознанно.", "Ещё домашняя выпечка гибкая: можно обсудить с поваром размер торта, надпись, меньше сахара или начинку по вкусу. Фабрика так не умеет."] },
        { h: "Как выбрать повара", p: ["Откройте раздел выпечки и посмотрите, кто печёт в вашем городе и районе. У каждого повара — фото работ, состав, цена и честные отзывы соседей. Читайте отзывы тех, кто уже заказывал: они точнее любой рекламы.", "Каждый повар проходит проверку личности и подтверждает соблюдение санитарных правил. Площадка не инспектирует кухни и не гарантирует качество — она даёт прозрачность, чтобы вы решали сами по составу и отзывам."] },
        { h: "Доставка, самовывоз и оплата", p: ["Выберите доставку от повара или самовывоз рядом с домом. Торты и хрупкие десерты лучше забирать самому или уточнить у повара упаковку. На этапе бесплатного запуска оплата — наличными при получении, напрямую повару, без карт и предоплаты.", "Торты и большие заказы оформляйте заранее — их пекут под вас, а не держат готовыми. За пару дней повар успеет всё спланировать."] },
        { h: "Печёте сами? Станьте поваром", p: ["Если выпечка — ваше, домашняя кухня может приносить доход. Начать просто: зарегистрируйтесь, оформите витрину с фото и составом, укажите цену. Соседи найдут вас по поиску и расстоянию, а первые честные отзывы построят репутацию.", "На этапе бесплатного запуска площадка не берёт комиссию — вы получаете оплату напрямую от покупателя наличными при получении."] },
        { p: ["Настоящая выпечка — это про заботу и свежесть. Посмотрите, кто печёт рядом, и закажите торт, пирог или хлеб у соседа, которому хочется довериться."] },
      { h: "Обновление: выпечка к завтраку с доставкой", p: ["Домашнюю выпечку теперь удобно заказывать и к утру: сырники, блины, ватрушки от соседки — к согласованному часу. Подробный гид — «Домашний завтрак с доставкой»."] },
      ],
    },
    en: {
      title: "Homemade baking to order: cakes, pies, and bread from neighbors",
      excerpt:
        "Homemade baking to order from verified neighbor-cooks: cakes, pies, bread, and desserts — fresh, honest ingredients, delivery or pickup.",
      body: [
        { p: ["Homemade baking to order is when your birthday cake is baked not by a factory but by a neighbor in your district, and the pie for tea arrives warm and smells the way it did in childhood. On Celina you order baking straight from verified neighbor-cooks: cakes, pies, bread, and desserts made in small batches, just for you."] },
        { h: "What you can order", p: ["The baking category is broad. Cakes and cupcakes — for a celebration, an anniversary, or just the weekend. Pies — sweet and savory, from apple to Ossetian. Sourdough bread and buns — for those who value real taste over pre-sliced store loaves. Desserts — syrniki, cheesecakes, eclairs, cookies.", "Every cook has a specialty. Some make elaborate custom cakes from a photo; others bake fresh bread every morning. The storefront shows exactly what a given neighbor makes."] },
        { h: "Why homemade baking beats store-bought", p: ["Freshness and honest ingredients are what matter most. A home cook bakes to order rather than keeping things on a shelf for a week. Real butter in the dough, not spread; cream in the filling, not a vegetable substitute. You see the ingredients and allergens on the dish card and choose consciously.", "Homemade baking is also flexible: you can discuss the cake size, an inscription, less sugar, or a filling to taste with the cook. A factory can't do that."] },
        { h: "How to choose a cook", p: ["Open the baking section and see who bakes in your city and district. Every cook has photos of their work, ingredients, price, and honest neighbor reviews. Read reviews from past buyers — they're more telling than any ad.", "Every cook passes identity verification and confirms they follow sanitary rules. The platform doesn't inspect kitchens or guarantee quality — it provides transparency so you decide for yourself based on ingredients and reviews."] },
        { h: "Delivery, pickup, and payment", p: ["Choose delivery by the cook or pickup near your home. Cakes and delicate desserts are best picked up yourself or ask the cook about packaging. Right now, payment is cash on delivery, directly to the cook, with no cards or prepayment.", "Place cake and large orders in advance — they're baked just for you, not kept ready-made. A couple of days gives the cook time to plan everything."] },
        { h: "Do you bake? Become a cook", p: ["If baking is your thing, your home kitchen can bring in income. Starting is simple: register, set up a storefront with photos and ingredients, and set your price. Neighbors find you by search and distance, and your first honest reviews build your reputation.", "Right now the platform takes no commission — you receive payment directly from the buyer, cash on delivery."] },
        { p: ["Real baking is about care and freshness. See who bakes nearby and order a cake, pie, or bread from a neighbor you'll want to trust."] },
      { h: "Update: breakfast pastry delivered", p: ["Home baking can now be ordered for the morning too: syrniki, blini and vatrushki from a neighbor by an agreed hour. See the full guide 'Homemade breakfast delivered'."] },
      ],
    },
  },
  {
    slug: "chto-zakazat-na-pominki",
    cover: "/images/blini.jpg",
    date: "2026-07-13",
    readMin: 6,
    tags: ["поминки", "домашняя еда", "меню", "заказ"],
    links: [
      { to: "/eda/moskva/vypechka", label: "Домашняя выпечка в Москве" },
      { to: "/eda/moskva/supy", label: "Домашние супы" },
      { to: "/eda/moskva/goryachee", label: "Горячие блюда" },
      { to: "/eda/sankt-peterburg", label: "Домашняя еда в Санкт-Петербурге" },
    ],
    ru: {
      title: "Меню на поминки: домашние блюда без лишних хлопот",
      excerpt:
        "Что заказать на поминки, чтобы всё было по традиции и достойно: спокойное домашнее меню от соседей-поваров, с доставкой или самовывозом.",
      body: [
        { p: ["Поминки — это день, когда сил на готовку почти не остаётся, а собрать стол для близких всё равно нужно. В такие моменты помогает простое решение: заказать домашние блюда у соседей-поваров, чтобы меню на поминки было тёплым, привычным и без лишних хлопот. Ниже — что обычно ставят на поминальный стол и как всё организовать спокойно."] },
        { h: "Каким должен быть поминальный стол", p: ["Поминальная трапеза — не праздничный банкет, а тихая встреча за общим столом в память об ушедшем. Блюда выбирают простые и сытные, без излишеств. Главное здесь не изобилие, а уважение к традиции и возможность побыть рядом с теми, кто пришёл разделить горе.", "По православному обычаю трапезу открывают кутьёй — сладкой кашей из пшеницы или риса с мёдом и изюмом. За ней идут блины, кисель или компот, а дальше — привычные домашние блюда. В разных семьях традиции отличаются, поэтому ориентируйтесь на то, что было принято у ваших близких."] },
        { h: "Что обычно заказывают на поминки", p: ["Классический поминальный набор складывается из нескольких групп блюд. Первое — кутья и блины как обязательная часть обряда. Затем горячий суп: чаще всего это борщ, щи или домашняя лапша. На горячее — котлеты, тушёное мясо, курица с гарниром, каша или картофель.", "Отдельно ставят закуски и салаты: винегрет, селёдку под шубой, нарезки, солёные грибы и овощи. Завершает стол выпечка — пироги с разными начинками, блины и что-то к чаю. Такой набор понятен всем гостям и не требует особых объяснений."] },
        { h: "Примерное меню на 10-15 человек", p: ["Чтобы было проще сориентироваться, вот спокойный вариант меню. Кутья и стопка блинов на всех. Кастрюля борща или домашней лапши. Горячее — котлеты или тушёное мясо с картофелем или гречкой. Два-три салата: винегрет, селёдка под шубой, овощная нарезка. Пироги с капустой, картошкой и с яблоком к чаю. Кисель или компот.", "Количество порций проще обсудить напрямую с поваром: он подскажет, сколько взять на ваше число гостей, и поможет не заказать лишнего."] },
        { h: "Как заказать домашнюю еду на поминки", p: ["На Celina вы заказываете блюда напрямую у проверенных соседей-поваров. Откройте ленту, найдите поваров в вашем городе и посмотрите, кто готовит супы, горячее и выпечку. У каждого — витрина с фото, составом и честными отзывами соседей.", "Соберите нужные блюда в корзину — можно заказывать сразу у нескольких поваров, например суп у одного, а пироги у другого. Выберите доставку от повара или самовывоз к нужному часу. На этапе бесплатного запуска оплата — наличными при получении, напрямую повару, без карт и предоплаты."] },
        { h: "О сроках и деликатности", p: ["Поминки часто организуют быстро, поэтому договоритесь с поваром заранее и укажите точное время, к которому нужен готовый стол. Многие домашние повара с пониманием относятся к таким заказам и стараются подстроиться под ситуацию.", "Важно помнить: Celina — это площадка, которая соединяет соседей. Мы проверяем личность повара и его согласие с санитарными правилами, но не готовим сами и не гарантируем вкус конкретного блюда. Выбирайте по отзывам и не стесняйтесь заранее обсудить с поваром все детали заказа."] },
        { p: ["В трудный день меньше хлопот — это уже большая помощь. Посмотрите, кто готовит рядом, и соберите спокойный поминальный стол, не отходя от близких."] },
      ],
    },
    en: {
      title: "Memorial meal menu: homemade dishes without the fuss",
      excerpt:
        "What to order for a memorial meal so everything is done properly and with dignity: a calm homemade menu from neighbor-cooks, by delivery or pickup.",
      body: [
        { p: ["A memorial day leaves little energy for cooking, yet a table still needs to be set for loved ones. In moments like these a simple solution helps: order homemade dishes from neighbor-cooks so the memorial menu is warm, familiar, and free of extra hassle. Below is what usually goes on the memorial table and how to arrange it calmly."] },
        { h: "What a memorial table should be", p: ["A memorial meal is not a festive banquet but a quiet gathering around a shared table in memory of the departed. The dishes are simple and hearty, without excess. What matters here is not abundance but respect for tradition and the chance to sit with those who came to share the grief.", "By Orthodox custom the meal opens with kutya — a sweet wheat or rice porridge with honey and raisins. It is followed by bliny, kissel or compote, and then the usual homemade dishes. Traditions differ from family to family, so follow what was customary for your loved ones."] },
        { h: "What is usually ordered for a memorial meal", p: ["A classic memorial set is made up of a few groups of dishes. First, kutya and bliny as the obligatory part of the rite. Then a hot soup: most often borscht, shchi, or homemade noodle soup. For the main course — cutlets, stewed meat, chicken with a side, porridge, or potatoes.", "Appetizers and salads are set out separately: vinegret, herring under a fur coat, cold cuts, pickled mushrooms and vegetables. The table is rounded off with baking — pies with various fillings, bliny, and something for tea. Such a set is familiar to every guest and needs no special explanation."] },
        { h: "A sample menu for 10-15 people", p: ["To make it easier to plan, here is a calm option. Kutya and a stack of bliny for everyone. A pot of borscht or homemade noodle soup. A main course — cutlets or stewed meat with potatoes or buckwheat. Two or three salads: vinegret, herring under a fur coat, a vegetable platter. Pies with cabbage, potato, and apple for tea. Kissel or compote.", "The number of portions is easiest to discuss directly with the cook: they will suggest how much to order for your number of guests and help you avoid ordering too much."] },
        { h: "How to order homemade food for a memorial meal", p: ["On Celina you order dishes directly from verified neighbor-cooks. Open the feed, find cooks in your city, and see who makes soups, mains, and baking. Each has a storefront with photos, ingredients, and honest neighbor reviews.", "Gather the dishes you need in the cart — you can order from several cooks at once, say the soup from one and the pies from another. Choose delivery by the cook or pickup for the hour you need. Right now, payment is cash on delivery, directly to the cook, with no cards or prepayment."] },
        { h: "On timing and sensitivity", p: ["Memorial meals are often arranged quickly, so agree with the cook in advance and state the exact time the table needs to be ready. Many home cooks approach such orders with understanding and try to accommodate the situation.", "It is important to remember: Celina is a platform that connects neighbors. We verify the cook's identity and their agreement to sanitary rules, but we do not cook ourselves and do not guarantee the taste of any particular dish. Choose by reviews and don't hesitate to discuss all the details of the order with the cook in advance."] },
        { p: ["On a hard day, fewer chores is already a great help. See who's cooking nearby and set a calm memorial table without leaving your loved ones' side."] },
      ],
    },
  },
  {
    slug: "kavkazskaya-kuhnya-na-zakaz",
    cover: "/images/khinkali.jpg",
    date: "2026-07-13",
    readMin: 7,
    tags: ["кавказская кухня", "хинкали", "долма", "на заказ"],
    links: [
      { to: "/vypit-vmeste", label: "Посиделки у соседа: найти компанию" },
      { to: "/eda/moskva/goryachee", label: "Горячие блюда в Москве" },
      { to: "/halal", label: "Халяльная домашняя еда на заказ" },
      { to: "/eda/moskva", label: "Домашняя еда в Москве" },
      { to: "/gatherings", label: "Застолья с соседями" },
      { to: "/login?mode=register&role=cook", label: "Стать поваром" },
    ],
    ru: {
      title: "Кавказская кухня на заказ: долма, хинкали, чахохбили",
      excerpt:
        "Кавказская кухня на заказ у соседей-поваров: долма, хинкали, чахохбили и другие домашние блюда с доставкой или самовывозом.",
      body: [
        { p: ["Кавказская кухня — это про щедрость, специи и большие тёплые застолья. Приготовить настоящие хинкали или долму дома непросто: нужны время, навык и правильные пропорции. Поэтому кавказская кухня на заказ у соседей-поваров — отличный способ получить домашние блюда без многочасовой возни у плиты. Разбираем, что заказать и как это работает на Celina."] },
        { h: "Что такое кавказская кухня", p: ["Под «кавказской кухней» обычно понимают блюда Грузии, Армении, Азербайджана и народов Северного Кавказа. У каждой из этих кухонь свой характер, но объединяет их любовь к мясу, зелени, специям и хлебу, а ещё — культура застолья, где еда собирает людей вместе.", "Готовят здесь основательно: тесто замешивают вручную, мясо рубят ножом, а соусы вроде ткемали или наршараба делают из настоящих фруктов. Именно поэтому домашний вариант так ценится — его сложно повторить в общепите."] },
        { h: "Долма — виноградные листья с начинкой", p: ["Долма — это фарш с рисом и зеленью, завёрнутый в виноградные листья. Блюдо кропотливое: каждый листочек заворачивают вручную, а потом долго тушат. В армянской и азербайджанской традиции долму подают с чесночным йогуртом или мацони.", "Заказать долму удобно как раз потому, что дома её редко готовят из-за трудоёмкости. У повара она получается ровной, ароматной и в правильном количестве — хоть на семейный ужин, хоть на большой стол."] },
        { h: "Хинкали — сочные грузинские мешочки", p: ["Хинкали — это крупные пельмени-мешочки с рубленым мясом и бульоном внутри. Едят их руками: берут за «хвостик», надкусывают, выпивают горячий сок, а сам хвостик оставляют на тарелке. Тесто должно быть эластичным, а начинка — сочной, и это целое искусство.", "Домашние хинкали от повара, который лепит их с детства, заметно отличаются от магазинных. Их лучше заказывать к точному времени и сразу подавать горячими — так раскрывается весь вкус."] },
        { h: "Чахохбили и другие горячие блюда", p: ["Чахохбили — это тушёная курица в густом соусе из помидоров, лука и большого количества зелени: кинзы, базилика, петрушки. Блюдо ароматное, сытное и при этом не тяжёлое, его подают с свежим хлебом или лавашем.", "Кроме чахохбили, стоит присмотреться к хачапури, лобио, харчо, шашлыку, кутабам и купатам. Всё это — привычные герои кавказского стола, которые хорошо подходят и для семейного ужина, и для встречи с гостями."] },
        { h: "Как заказать кавказскую кухню на Celina", p: ["Откройте ленту и посмотрите, кто из соседей готовит кавказские блюда в вашем городе. Ищите по названию — «хинкали», «долма», «чахохбили» — или по разделу с горячим. У каждого повара есть витрина с фото, составом и честными отзывами.", "Соберите блюда в корзину, выберите доставку от повара или самовывоз и укажите удобное время. На этапе бесплатного запуска оплата — наличными при получении, напрямую повару, без карт и предоплаты. Хинкали и другие блюда, которые вкуснее горячими, лучше согласовать по времени заранее."] },
        { h: "Кавказский стол для застолья", p: ["Кавказская кухня создана для больших компаний, поэтому она идеально подходит для соседского застолья. На Celina можно не только заказать блюда, но и создать встречу: собрать соседей на грузинский вечер с хинкали, хачапури и долмой.", "А если вы сами умеете готовить кавказские блюда по семейным рецептам — станьте поваром на Celina. Соседи как раз ищут настоящую долму и хинкали, которые сложно найти в обычных магазинах."] },
        { p: ["Настоящая кавказская кухня — это про вкус, который готовят с душой. Посмотрите, кто готовит рядом, и закажите домашние хинкали, долму или чахохбили уже сегодня."] },
      ],
    },
    en: {
      title: "Caucasian cuisine to order: dolma, khinkali, chakhokhbili",
      excerpt:
        "Caucasian cuisine to order from neighbor-cooks: dolma, khinkali, chakhokhbili and other homemade dishes by delivery or pickup.",
      body: [
        { p: ["Caucasian cuisine is all about generosity, spices, and big warm feasts. Making real khinkali or dolma at home is no easy task: it takes time, skill, and the right proportions. That's why Caucasian cuisine to order from neighbor-cooks is a great way to get homemade dishes without hours at the stove. Let's look at what to order and how it works on Celina."] },
        { h: "What Caucasian cuisine is", p: ["\"Caucasian cuisine\" usually refers to the dishes of Georgia, Armenia, Azerbaijan, and the peoples of the North Caucasus. Each of these cuisines has its own character, but they share a love of meat, herbs, spices, and bread — and a culture of feasting where food brings people together.", "Cooking here is done thoroughly: dough is kneaded by hand, meat is chopped with a knife, and sauces like tkemali or narsharab are made from real fruit. That is exactly why the homemade version is so prized — it's hard to reproduce in a canteen."] },
        { h: "Dolma — stuffed grape leaves", p: ["Dolma is minced meat with rice and herbs, wrapped in grape leaves. It's a painstaking dish: every leaf is rolled by hand and then simmered for a long time. In the Armenian and Azerbaijani tradition, dolma is served with garlic yogurt or matsoni.", "Ordering dolma is convenient precisely because it's rarely made at home due to the effort involved. A cook makes it even, fragrant, and in the right quantity — for a family dinner or a big table alike."] },
        { h: "Khinkali — juicy Georgian dumplings", p: ["Khinkali are large pouch-shaped dumplings with chopped meat and broth inside. You eat them with your hands: take one by the \"tail\", bite in, sip the hot juice, and leave the tail on the plate. The dough must be elastic and the filling juicy — it's a real art.", "Homemade khinkali from a cook who has folded them since childhood are noticeably different from store-bought ones. They're best ordered for a set time and served hot right away — that's when the full flavor comes through."] },
        { h: "Chakhokhbili and other mains", p: ["Chakhokhbili is stewed chicken in a thick sauce of tomatoes, onion, and plenty of herbs: cilantro, basil, parsley. The dish is fragrant and hearty yet not heavy, and it's served with fresh bread or lavash.", "Besides chakhokhbili, it's worth looking at khachapuri, lobio, kharcho, shashlik, kutab, and kupaty. These are all familiar stars of the Caucasian table, well suited both to a family dinner and to a get-together with guests."] },
        { h: "How to order Caucasian cuisine on Celina", p: ["Open the feed and see which neighbors cook Caucasian dishes in your city. Search by name — \"khinkali\", \"dolma\", \"chakhokhbili\" — or by the mains section. Every cook has a storefront with photos, ingredients, and honest reviews.", "Gather the dishes in the cart, choose delivery by the cook or pickup, and set a convenient time. Right now, payment is cash on delivery, directly to the cook, with no cards or prepayment. Khinkali and other dishes that taste best hot are worth agreeing on a time for in advance."] },
        { h: "A Caucasian table for a gathering", p: ["Caucasian cuisine was made for big company, so it's perfect for a neighbor gathering. On Celina you can not only order dishes but also create an event: bring neighbors together for a Georgian evening with khinkali, khachapuri, and dolma.", "And if you yourself know how to cook Caucasian dishes from family recipes — become a cook on Celina. Neighbors are looking for exactly the kind of real dolma and khinkali that are hard to find in ordinary shops."] },
        { p: ["Real Caucasian cuisine is about a taste cooked with heart. See who's cooking nearby and order homemade khinkali, dolma, or chakhokhbili today."] },
      ],
    },
  },
  {
    slug: "skolko-stoit-domashnyaya-eda",
    cover: "/images/pelmeni.jpg",
    date: "2026-07-13",
    readMin: 6,
    tags: ["домашняя еда", "цены", "как это работает", "выгода"],
    links: [
      { to: "/eda/moskva", label: "Домашняя еда в Москве" },
      { to: "/eda/sankt-peterburg", label: "Домашняя еда в Санкт-Петербурге" },
      { to: "/eda/moskva/goryachee", label: "Горячие блюда" },
      { to: "/login?mode=register&role=cook", label: "Стать поваром" },
    ],
    ru: {
      title: "Сколько стоит домашняя еда на заказ и почему это выгодно",
      excerpt:
        "Сколько стоит домашняя еда на заказ и из чего складывается цена: как повара её формируют и почему домашнее часто выгоднее ресторана.",
      body: [
        { p: ["Один из первых вопросов при заказе — сколько стоит домашняя еда и не переплачиваешь ли за «домашнее». Честный ответ: единой цены нет, потому что каждый повар устанавливает её сам. Зато можно понять, из чего эта цена складывается, и почему домашняя еда на заказ часто оказывается выгоднее и ресторана, и полуфабрикатов из магазина."] },
        { h: "Почему нет единого прайса", p: ["Celina — это площадка, которая соединяет соседей-поваров с покупателями. Мы не готовим сами и не назначаем цены за поваров: каждый выставляет стоимость своих блюд самостоятельно, исходя из своих продуктов, рецепта и труда.", "Поэтому одинаковое на первый взгляд блюдо у разных поваров может стоить по-разному. Это нормально: вы видите цену заранее в витрине каждого повара и выбираете то, что подходит вам по вкусу и бюджету."] },
        { h: "Из чего складывается цена", p: ["Стоимость домашнего блюда обычно состоит из нескольких понятных частей. Первое — продукты: мясо, овощи, мука, специи. Чем качественнее и свежее ингредиенты, тем выше себестоимость. Второе — труд и время повара: лепка пельменей или хинкали вручную занимает часы, и это тоже часть цены.", "Третье — сложность блюда и размер порции. Долма или пироги с несколькими начинками потребуют больше времени, чем простой суп. И наконец, доставка, если выбираете доставку от повара, а не самовывоз. Всё это повар закладывает в итоговую цену, которую вы видите заранее."] },
        { h: "Почему домашнее часто выгоднее", p: ["Домашняя еда нередко оказывается выгоднее ресторана при сопоставимом качестве. В ресторане в цену блюда заложены аренда зала, зарплаты персонала, наценка заведения и налоги — всё это может умножать себестоимость в несколько раз. У домашнего повара таких расходов нет.", "По сравнению с магазинными полуфабрикатами домашнее выигрывает в другом: понятный состав, свежие продукты и настоящий вкус вместо консервантов. Вы платите за еду и труд человека, а не за упаковку и рекламу."] },
        { h: "Как сравнить цены поваров", p: ["На Celina у каждого повара есть витрина с фото блюд, составом, размером порции и ценой. Сравнивайте не только цифру, но и то, что за ней стоит: вес порции, состав, отзывы соседей. Иногда блюдо чуть дороже, но порция больше или продукты качественнее.", "Обращайте внимание на честные отзывы — они помогают понять, стоит ли блюдо своих денег. А если сомневаетесь в объёме порции или деталях, напишите повару и уточните заранее."] },
        { h: "Оплата на этапе запуска", p: ["На этапе бесплатного запуска оплата — наличными при получении, напрямую повару. Никаких карт, предоплаты и скрытых комиссий: вы платите ровно ту сумму, которую видели в корзине, когда заказ уже у вас в руках.", "Это удобно и прозрачно: вы точно знаете стоимость до того, как согласились на заказ, и рассчитываетесь только за то, что получили."] },
        { h: "Готовите сами? Станьте поваром", p: ["Если вы вкусно готовите, домашняя еда может приносить доход. Вы сами устанавливаете цены на свои блюда, исходя из продуктов и своего труда, и продаёте напрямую соседям без посредников между вами и покупателем.", "Начать просто: пройдите верификацию, оформите витрину с блюдами и ценами — и соседи увидят вас в ленте. Станьте поваром на Celina и превратите любимое хобби в понятный заработок."] },
        { p: ["Домашняя еда — это честная цена за настоящий вкус и труд человека рядом. Посмотрите, кто готовит рядом, сравните цены поваров и закажите то, что подходит именно вам."] },
      ],
    },
    en: {
      title: "How much homemade food to order costs — and why it's worth it",
      excerpt:
        "How much homemade food to order costs and what makes up the price: how cooks set it and why homemade is often better value than a restaurant.",
      body: [
        { p: ["One of the first questions when ordering is how much homemade food costs and whether you're overpaying for \"homemade\". The honest answer: there's no single price, because every cook sets it themselves. But you can understand what that price is made of, and why homemade food to order often turns out to be better value than both a restaurant and store-bought convenience food."] },
        { h: "Why there's no single price list", p: ["Celina is a platform that connects neighbor-cooks with buyers. We don't cook ourselves and don't set prices on cooks' behalf: each one sets the cost of their dishes independently, based on their ingredients, recipe, and labor.", "So a dish that looks identical can cost differently from one cook to another. That's normal: you see the price in advance on each cook's storefront and choose what suits your taste and budget."] },
        { h: "What makes up the price", p: ["The cost of a homemade dish is usually made of a few clear parts. First, ingredients: meat, vegetables, flour, spices. The better and fresher the ingredients, the higher the base cost. Second, the cook's labor and time: folding pelmeni or khinkali by hand takes hours, and that's part of the price too.", "Third, the dish's complexity and the portion size. Dolma or pies with several fillings take more time than a simple soup. And finally, delivery, if you choose delivery rather than pickup. The cook factors all of this into the final price you see in advance."] },
        { h: "Why homemade is often better value", p: ["Homemade food often turns out cheaper than a restaurant for comparable quality. In a restaurant, the price of a dish includes rent, staff wages, the venue's markup, and taxes — all of which can multiply the base cost several times over. A home cook has none of these expenses.", "Compared with store-bought convenience food, homemade wins on something else: a clear ingredient list, fresh products, and real flavor instead of preservatives. You pay for the food and a person's labor, not for packaging and advertising."] },
        { h: "How to compare cooks' prices", p: ["On Celina every cook has a storefront with dish photos, ingredients, portion size, and price. Compare not just the number but what stands behind it: portion weight, ingredients, neighbor reviews. Sometimes a dish is a bit pricier but the portion is larger or the products are better.", "Pay attention to honest reviews — they help you tell whether a dish is worth the money. And if you're unsure about the portion size or details, message the cook and check in advance."] },
        { h: "Payment during the launch", p: ["Right now, payment is cash on delivery, directly to the cook. No cards, no prepayment, no hidden fees: you pay exactly the amount you saw in the cart, once the order is already in your hands.", "It's convenient and transparent: you know the cost precisely before agreeing to the order, and you pay only for what you receive."] },
        { h: "Cook yourself? Become a cook", p: ["If you cook well, homemade food can bring income. You set the prices for your own dishes based on ingredients and your labor, and sell directly to neighbors with no middleman between you and the buyer.", "Getting started is simple: pass verification, set up a storefront with dishes and prices — and neighbors will see you in the feed. Become a cook on Celina and turn a favorite hobby into clear earnings."] },
        { p: ["Homemade food is an honest price for real flavor and the labor of a person nearby. See who's cooking near you, compare cooks' prices, and order what's right for you."] },
      ],
    },
  },
  {
    slug: "tatarskaya-kuhnya-echpochmaki-chak-chak",
    cover: "/images/pirozhki.jpg",
    date: "2026-07-13",
    readMin: 6,
    tags: ["татарская кухня", "эчпочмаки", "чак-чак", "региональная кухня"],
    links: [
      { to: "/eda/moskva/vypechka", label: "Домашняя выпечка в Москве" },
      { to: "/eda/moskva", label: "Домашняя еда в Москве" },
      { to: "/eda/moskva/deserty", label: "Домашние десерты" },
      { to: "/blog/domashnyaya-eda-v-kazani", label: "Домашняя еда в Казани" },
      { to: "/blog/domashnyaya-eda-v-ufe", label: "Домашняя еда в Уфе" },
      { to: "/login?mode=register&role=cook", label: "Стать поваром на Celina" },
    ],
    ru: {
      title: "Татарская кухня: эчпочмаки и чак-чак от казанских хозяек",
      excerpt:
        "Настоящие эчпочмаки с сочной начинкой и медовый чак-чак — как их готовят дома в Казани и где заказать татарскую выпечку у соседей-поваров.",
      body: [
        { p: ["Татарская кухня — это про уют, гостеприимство и тесто, замешанное с любовью. Треугольные эчпочмаки с сочной начинкой, хрустящий медовый чак-чак, ароматная губадия — блюда, которые в Казани и по всему Татарстану готовят по семейным рецептам, передаваемым из поколения в поколение. Рассказываем, что делает эти блюда особенными, и как заказать татарскую выпечку у проверенных соседей-поваров на Celina.", "Хорошая новость: многие домашние хозяйки готовят именно так, как готовили их бабушки — на топлёном масле, из настоящего мяса, без спешки. Такую еду не купишь в супермаркете, зато можно заказать у соседа, который печёт у себя на кухне."] },
        { h: "Эчпочмак: главный татарский пирожок", p: ["«Эчпочмак» в переводе с татарского означает «треугольник» — по характерной форме. Это закрытый пирожок из дрожжевого или пресного теста с начинкой из сырого мяса (обычно говядины или баранины), картофеля и лука, нарезанных мелкими кубиками. Мясо не прокручивают в фарш, а именно режут — так начинка получается сочной и с настоящей текстурой.", "Секрет эчпочмака — в отверстии сверху. Пирожок лепят треугольником, оставляя небольшое окошко, и в середине запекания через него доливают горячий бульон. Благодаря этому начинка внутри остаётся невероятно сочной, а картофель пропитывается мясным соком. Едят эчпочмаки горячими, часто с чашкой крепкого бульона."] },
        { h: "Чак-чак: медовое лакомство к чаю", p: ["Чак-чак — праздничный десерт и символ татарского гостеприимства. Его подают на свадьбах, встречах гостей и больших торжествах. Основа простая: маленькие кусочки теста из яиц и муки обжаривают во фритюре до золотистого цвета, а затем заливают горячим медовым сиропом и укладывают горкой.", "Мёд и обжаренное тесто застывают вместе, превращая чак-чак в хрустящее, чуть тягучее лакомство, которое можно ломать руками. У каждой хозяйки свой баланс мёда и сахара в сиропе, своя степень обжарки — поэтому домашний чак-чак у разных поваров всегда чуть-чуть отличается на вкус. Это тот случай, когда стоит попробовать у нескольких соседей."] },
        { h: "Что ещё готовят в татарских домах", p: ["Кроме эчпочмаков и чак-чака, татарская кухня богата и другими блюдами. Губадия — многослойный закрытый пирог с рисом, кортом (сушёным творогом), яйцом и изюмом, который часто пекут к праздникам. Кыстыбый — тонкие лепёшки, сложенные пополам с начинкой из картофельного пюре или пшённой каши. Элеш и перемячи — ещё две разновидности домашних пирожков с мясом.", "Отдельная любовь — талкыш калеве, воздушное медовое лакомство в форме пирамидок, которое тает во рту. Всё это — часть домашней традиции, которую проще всего попробовать у того, кто готовит по семейному рецепту."] },
        { h: "Как заказать татарскую кухню на Celina", p: ["Откройте ленту и посмотрите, кто готовит рядом с вами. Ищите по названию блюда — «эчпочмаки», «чак-чак», «губадия» — или загляните в раздел домашней выпечки. Умный поиск понимает опечатки и разные написания, так что найти нужное блюдо легко.", "У каждого повара своя витрина: фотографии, состав и цена, честные отзывы соседей. Добавляйте понравившееся в корзину, выбирайте доставку или самовывоз. На этапе бесплатного запуска оплата — наличными при получении, напрямую повару, без карт и предоплаты."] },
        { h: "Готовите татарские блюда сами?", p: ["Если вы печёте эчпочмаки или делаете чак-чак по бабушкиному рецепту — на Celina вы можете предложить их соседям. Повара проходят проверку личности и подтверждают согласие с санитарными правилами, а витрину и цены вы задаёте сами.", "Посмотрите, кто готовит рядом, закажите настоящую татарскую выпечку — или станьте поваром и поделитесь своими рецептами с соседями."] },
      ],
    },
    en: {
      title: "Tatar cuisine: echpochmak and chak-chak from Kazan home cooks",
      excerpt:
        "Real echpochmak with a juicy filling and honeyed chak-chak — how they're made at home in Kazan and where to order Tatar baking from neighbor-cooks.",
      body: [
        { p: ["Tatar cuisine is about comfort, hospitality, and dough kneaded with love. Triangular echpochmak with a juicy filling, crisp honeyed chak-chak, fragrant gubadiya — dishes that in Kazan and across Tatarstan are made from family recipes passed down through generations. Here's what makes them special, and how to order Tatar baking from verified neighbor-cooks on Celina.", "The good news: many home cooks make these exactly the way their grandmothers did — with clarified butter, real meat, and no rush. You won't find food like this in a supermarket, but you can order it from a neighbor who bakes in their own kitchen."] },
        { h: "Echpochmak: the essential Tatar pie", p: ["\"Echpochmak\" means \"triangle\" in Tatar — after its signature shape. It's a closed pie of yeast or unleavened dough with a filling of raw meat (usually beef or lamb), potato, and onion, all cut into small cubes. The meat isn't ground into mince but diced by hand — so the filling stays juicy and keeps a real texture.", "The secret of echpochmak is the hole on top. The pie is folded into a triangle with a small opening left, and midway through baking hot broth is poured in through it. That keeps the filling remarkably juicy and lets the potato soak up the meat juices. Echpochmak is eaten hot, often with a cup of strong broth."] },
        { h: "Chak-chak: a honeyed treat for tea", p: ["Chak-chak is a festive dessert and a symbol of Tatar hospitality. It's served at weddings, when welcoming guests, and at big celebrations. The base is simple: small pieces of egg-and-flour dough are deep-fried until golden, then coated in hot honey syrup and piled into a mound.", "The honey and fried dough set together, turning chak-chak into a crunchy, slightly chewy treat you can break apart with your hands. Every cook has their own balance of honey and sugar in the syrup, their own degree of frying — so homemade chak-chak always tastes a little different from cook to cook. This is a case where it's worth trying a few neighbors."] },
        { h: "What else Tatar homes cook", p: ["Beyond echpochmak and chak-chak, Tatar cuisine is rich with other dishes. Gubadiya is a multi-layered closed pie with rice, kort (dried curd), egg, and raisins, often baked for holidays. Kystyby are thin flatbreads folded over a filling of mashed potato or millet porridge. Elesh and peremech are two more kinds of homemade meat pies.", "A special favorite is talkysh kaleve, an airy honey sweet shaped into little pyramids that melts in your mouth. All of it is part of a home tradition that's easiest to taste from someone who cooks by a family recipe."] },
        { h: "How to order Tatar cuisine on Celina", p: ["Open the feed and see who's cooking near you. Search by dish name — \"echpochmak\", \"chak-chak\", \"gubadiya\" — or browse the homemade baking section. Smart search handles typos and different spellings, so finding the dish you want is easy.", "Every cook has a storefront: photos, ingredients and price, honest neighbor reviews. Add what you like to the cart and choose delivery or pickup. Right now, payment is cash on delivery — directly to the cook, no cards or prepayment."] },
        { h: "Cook Tatar dishes yourself?", p: ["If you bake echpochmak or make chak-chak by your grandmother's recipe, on Celina you can offer them to your neighbors. Cooks pass identity verification and confirm their agreement to sanitary rules, and you set your own storefront and prices.", "See who cooks nearby and order real Tatar baking — or become a cook and share your recipes with your neighbors."] },
      ],
    },
  },
  {
    slug: "pp-i-dieticheskaya-eda-na-zakaz",
    cover: "/images/syrniki.jpg",
    date: "2026-07-13",
    readMin: 6,
    tags: ["ПП еда", "правильное питание", "meal-prep", "здоровое питание"],
    links: [
      { to: "/pravilnoe-pitanie", label: "Правильное питание с доставкой на заказ" },
      { to: "/eda/moskva/salaty", label: "Домашние салаты в Москве" },
      { to: "/eda/moskva", label: "Домашняя еда в Москве" },
      { to: "/eda/moskva/goryachee", label: "Горячие блюда" },
      { to: "/login?mode=register&role=cook", label: "Стать поваром на Celina" },
    ],
    ru: {
      title: "ПП и диетическая еда от домашних поваров на заказ",
      excerpt:
        "ПП еда на заказ у соседей-поваров: свежие салаты, сбалансированные обеды и десерты без сахара — с доставкой или самовывозом и оплатой при получении.",
      body: [
        { p: ["Правильное питание держится на одной простой вещи — регулярности. Один здоровый обед погоды не делает; важно, чтобы полезная еда была под рукой каждый день. Именно поэтому ПП еда на заказ так удобна: не нужно каждый вечер стоять у плиты, взвешивать крупы и мыть контейнеры — свежие сбалансированные блюда готовит сосед-повар, а вы просто забираете или получаете доставку.", "На Celina можно найти домашних поваров, которые специализируются на здоровом питании: салаты, запечённая рыба и курица, овощные гарниры, сырники и десерты без сахара. Всё приготовлено дома, из свежих продуктов, с указанием состава — чтобы вы понимали, что едите."] },
        { h: "Что относят к ПП и диетической еде", p: ["ПП — это не про голодание, а про баланс. Обычно это блюда с понятным составом: нежирный белок (курица, индейка, рыба, творог, яйца, бобовые), сложные углеводы (гречка, бурый рис, киноа, овощи) и умеренное количество полезных жиров. Меньше жарки во фритюре и лишнего сахара — больше запекания, тушения и свежих овощей.", "Под запрос «диетическая еда» подходят и более конкретные форматы: блюда с пониженной калорийностью, без сахара, без глютена или лактозы, вегетарианские варианты. У домашнего повара проще уточнить детали и попросить приготовить с учётом ваших предпочтений — это то, чего почти не даёт готовая еда из супермаркета."] },
        { h: "Почему домашняя ПП еда удобнее заготовок", p: ["Идея meal-prep — приготовить еду заранее на несколько дней — работает, но требует времени и дисциплины. Закупка продуктов, готовка на выходных, десяток контейнеров в холодильнике. Заказ у соседа-повара снимает эту нагрузку: вы получаете свежие порции тогда, когда нужно, и не тратите вечер на готовку.", "Плюс домашняя еда просто вкуснее однообразных заготовок. Один день — салат с киноа и запечённой курицей, другой — рыба с овощами, третий — сырники на завтрак. Разнообразие помогает придерживаться правильного питания дольше, потому что не приедается."] },
        { h: "Салаты и лёгкие обеды каждый день", p: ["Салаты — основа рациона при правильном питании, и их удобнее всего заказывать свежими. Овощные миксы, тёплые салаты с курицей или тунцом, боулы с киноа и авокадо — их лучше есть в день приготовления, а не хранить неделю. Загляните в раздел домашних салатов и посмотрите, что готовят рядом.", "Для полноценного обеда добавьте горячее: запечённую рыбу, куриную грудку, овощное рагу. Можно собрать заказ у одного повара или у нескольких сразу — как удобнее вам."] },
        { h: "Как это работает на Celina", p: ["Откройте ленту и найдите поваров рядом. Ищите по запросу «ПП», «правильное питание», «диетическая еда» или по конкретным блюдам. У каждого повара есть витрина с фотографиями, составом и ценой, а также отзывы соседей — так проще выбрать того, кто готовит в вашем стиле.", "Выберите доставку или самовывоз. На этапе бесплатного запуска оплата — наличными при получении, напрямую повару, без карт и предоплаты. Если питаетесь по режиму, договоритесь с поваром о регулярных заказах на неделю вперёд — многим удобно готовить постоянным клиентам."] },
        { h: "Готовите здоровую еду? Станьте поваром", p: ["Если вы умеете готовить вкусно и сбалансированно, спрос на ПП еду — один из самых стабильных: люди заказывают её не разово, а регулярно, изо дня в день. Это возможность для домашнего повара найти постоянных клиентов среди соседей.", "На Celina вы сами задаёте меню, состав и цены. Повара проходят проверку личности и подтверждают согласие с санитарными правилами. Посмотрите, кто готовит рядом, — или станьте поваром и предложите соседям здоровые обеды."] },
      ],
    },
    en: {
      title: "Healthy and diet food to order from home cooks",
      excerpt:
        "Healthy meal-prep food to order from neighbor-cooks: fresh salads, balanced lunches, and sugar-free desserts — delivery or pickup, pay on delivery.",
      body: [
        { p: ["Healthy eating rests on one simple thing — consistency. A single healthy lunch changes nothing; what matters is having good food on hand every day. That's exactly why ordering healthy meal-prep food is so convenient: no standing at the stove every evening, weighing grains and washing containers — fresh, balanced dishes are made by a neighbor-cook, and you just pick them up or get them delivered.", "On Celina you can find home cooks who specialize in healthy eating: salads, baked fish and chicken, vegetable sides, syrniki, and sugar-free desserts. Everything is made at home, from fresh ingredients, with the ingredients listed — so you know what you're eating."] },
        { h: "What counts as healthy and diet food", p: ["Healthy eating isn't about starving — it's about balance. Usually it means dishes with a clear makeup: lean protein (chicken, turkey, fish, curd, eggs, legumes), complex carbs (buckwheat, brown rice, quinoa, vegetables), and a moderate amount of good fats. Less deep-frying and added sugar — more baking, stewing, and fresh vegetables.", "The search for \"diet food\" also covers more specific formats: lower-calorie dishes, sugar-free, gluten- or lactose-free, and vegetarian options. With a home cook it's easier to clarify the details and ask them to cook to your preferences — something ready-made supermarket food rarely offers."] },
        { h: "Why homemade healthy food beats batch prep", p: ["The meal-prep idea — cooking ahead for several days — works, but it takes time and discipline. Grocery runs, weekend cooking, a dozen containers in the fridge. Ordering from a neighbor-cook lifts that load: you get fresh portions when you need them, without spending an evening cooking.", "Plus homemade food simply tastes better than monotonous batch meals. One day it's a quinoa salad with baked chicken, the next fish with vegetables, the third syrniki for breakfast. Variety helps you stick with healthy eating longer, because you don't get tired of it."] },
        { h: "Salads and light lunches every day", p: ["Salads are the backbone of a healthy diet, and they're best ordered fresh. Vegetable mixes, warm salads with chicken or tuna, bowls with quinoa and avocado — these are best eaten the day they're made, not stored for a week. Look through the homemade salads section and see what's cooking nearby.", "For a full lunch, add a hot dish: baked fish, chicken breast, vegetable stew. You can build an order from one cook or several at once — whatever suits you."] },
        { h: "How it works on Celina", p: ["Open the feed and find cooks nearby. Search for \"healthy\", \"clean eating\", \"diet food\", or specific dishes. Every cook has a storefront with photos, ingredients, and price, plus neighbor reviews — so it's easier to pick someone who cooks in your style.", "Choose delivery or pickup. Right now, payment is cash on delivery — directly to the cook, no cards or prepayment. If you eat on a routine, arrange regular orders for the week ahead with a cook — many are happy to cook for returning customers."] },
        { h: "Cook healthy food? Become a cook", p: ["If you can cook food that's both tasty and balanced, demand for healthy food is one of the steadiest there is: people order it not once but regularly, day after day. That's a chance for a home cook to build a base of returning customers among neighbors.", "On Celina you set your own menu, ingredients, and prices. Cooks pass identity verification and confirm their agreement to sanitary rules. See who cooks nearby — or become a cook and offer your neighbors healthy lunches."] },
      ],
    },
  },
  {
    slug: "skolko-mozhno-zarabotat-gotovya-edu-doma",
    cover: "/images/pelmeni.jpg",
    date: "2026-07-13",
    readMin: 7,
    tags: ["заработок на домашней еде", "повар", "подработка"],
    links: [
      { to: "/login?mode=register&role=cook", label: "Стать поваром на Celina" },
      { to: "/eda/moskva", label: "Посмотреть кухни в Москве" },
      { to: "/eda/moskva/goryachee", label: "Горячие блюда" },
      { to: "/blog", label: "Другие статьи для поваров" },
    ],
    ru: {
      title: "Сколько можно заработать, готовя еду дома на продажу",
      excerpt:
        "Реальная математика заработка на домашней еде: как считать выручку, себестоимость и прибыль. Разбираем на примерах, без обещаний золотых гор.",
      body: [
        { p: ["Заработок на домашней еде — тема, вокруг которой много мифов: одни обещают миллионы с кастрюли, другие уверены, что это вообще не деньги. Правда посередине и зависит от простой математики. В этой статье разберём, из чего складывается доход домашнего повара, и посчитаем на примерах — честно, без гарантий и без выдуманных цифр.", "Сразу оговоримся: все суммы ниже — это иллюстративные примеры, чтобы показать логику расчёта. Ваш реальный результат зависит от блюд, цен, спроса в районе и того, сколько времени вы готовы вкладывать."] },
        { h: "Из чего складывается заработок", p: ["Формула проста: прибыль = выручка − себестоимость − ваше время. Выручка — это сумма всех заказов. Себестоимость — продукты, упаковка, электричество, доставка (если возите сами). А время — самый недооценённый ресурс: готовка, закупка, общение с покупателями тоже стоят денег.", "Хороший повар считает не только «сколько пришло», но и «сколько осталось после всех расходов». Именно чистая прибыль показывает, работает ли ваша идея."] },
        { h: "Пример 1. Пельмени как подработка на выходных", p: ["Допустим, вы лепите домашние пельмени и продаёте порцию условно за 400 рублей. Продукты и упаковка на порцию обходятся примерно в 150 рублей — значит, с каждой порции остаётся около 250 рублей до вычета вашего времени.", "Если за выходные вы соберёте 20 заказов, выручка составит 8 000 рублей, а после продуктов останется около 5 000 рублей. Это пример, а не обещание: сколько заказов будет реально, зависит от спроса рядом с вами. Но логика показывает, что даже небольшой поток на выходных превращается в ощутимую прибавку."] },
        { h: "Пример 2. Выпечка на заказ в будни", p: ["Возьмём пироги и пирожки. Пусть средний чек заказа — 700 рублей, а продукты на него — 250 рублей. Остаётся около 450 рублей с заказа. Если вы берёте по 3 заказа в день пять дней в неделю, это 15 заказов и примерно 6 750 рублей чистыми за неделю до учёта времени.", "Выпечка удобна тем, что многое можно готовить партиями: замесил тесто один раз — испёк на несколько заказов. Чем лучше вы оптимизируете процесс, тем выше доход в час вашего труда. Снова напомним: это модель, а не гарантия — цифры зависят от ваших цен и числа заказов."] },
        { h: "Что влияет на реальную цифру", p: ["Спрос в районе. Там, где рядом живёт много людей и мало домашних поваров, заказов будет больше. Ассортимент. Одно коронное блюдо, которое вы готовите идеально, часто продаётся лучше, чем десяток средних. Цена. Слишком низкая обесценивает труд, слишком высокая отпугивает — важно найти баланс.", "Отзывы и повторные заказы. Настоящие деньги в домашней еде — это постоянные покупатели. Один сосед, который заказывает каждую неделю, ценнее десяти случайных. Поэтому качество и стабильность важнее разовых акций."] },
        { h: "Как считать честно", p: ["Заведите простую таблицу: по каждому блюду выпишите цену продажи и себестоимость продуктов с упаковкой. Разница — ваша маржа. Затем прикиньте, сколько порций реально приготовить и продать за неделю. Умножьте — получите ориентир по выручке и прибыли.", "Не забудьте про своё время. Если готовка заказа занимает час, а прибыль с него 300 рублей — это ваша ставка за час. Сравните её с тем, что для вас комфортно, и решайте, какие блюда оставить в меню, а какие невыгодны."] },
        { h: "Оплата и старт без вложений в комиссии", p: ["На этапе бесплатного запуска Celina покупатели платят наличными при получении, напрямую вам. Это значит, что вы не отдаёте процент с каждого заказа и не ждёте выплат — деньги сразу у вас. Для старта это удобно: можно попробовать без финансовых рисков и понять, есть ли спрос именно на ваши блюда."] },
        { p: ["Домашняя еда не сделает вас миллионером за неделю, но при честном расчёте и хорошем блюде это реальная и растущая подработка. Хотите проверить на практике? Станьте поваром на Celina и начните готовить для соседей рядом с вами."] },
      ],
    },
    en: {
      title: "How much can you earn cooking food at home to sell",
      excerpt:
        "The real math of earning from homemade food: how to count revenue, cost, and profit. Worked through with examples — no promises of gold mines.",
      body: [
        { p: ["Earning from homemade food is a topic wrapped in myths: some promise millions from a single pot, others are sure it's no money at all. The truth is in the middle and comes down to simple math. In this article we'll break down what makes up a home cook's income and work it through with examples — honestly, with no guarantees and no invented figures.", "One caveat up front: all the amounts below are illustrative examples meant to show the logic of the calculation. Your real result depends on your dishes, prices, demand in your area, and how much time you're willing to put in."] },
        { h: "What earnings are made of", p: ["The formula is simple: profit = revenue − cost − your time. Revenue is the sum of all orders. Cost is ingredients, packaging, electricity, delivery (if you carry it yourself). And time is the most underrated resource: cooking, shopping, and talking to buyers all cost money too.", "A good cook counts not just \"what came in\" but \"what's left after every expense.\" It's net profit that shows whether your idea works."] },
        { h: "Example 1. Pelmeni as a weekend side gig", p: ["Say you make homemade pelmeni and sell a portion for, hypothetically, 400 rubles. Ingredients and packaging per portion run about 150 rubles — so roughly 250 rubles are left per portion before accounting for your time.", "If you gather 20 orders over a weekend, revenue is 8,000 rubles, and after ingredients about 5,000 rubles remain. This is an example, not a promise: how many orders you'll actually get depends on demand near you. But the logic shows that even a modest weekend flow turns into a noticeable top-up."] },
        { h: "Example 2. Made-to-order baking on weekdays", p: ["Take pies and pirozhki. Suppose the average order is 700 rubles, with ingredients at 250. That leaves about 450 rubles per order. If you take 3 orders a day five days a week, that's 15 orders and roughly 6,750 rubles net for the week before counting time.", "Baking is convenient because much of it can be made in batches: mix the dough once, bake for several orders. The better you optimize the process, the higher your income per hour of work. Again: this is a model, not a guarantee — the numbers depend on your prices and order count."] },
        { h: "What affects the real figure", p: ["Demand in your area. Where many people live nearby and few home cooks operate, there will be more orders. Range. One signature dish you make perfectly often sells better than a dozen average ones. Price. Too low devalues your work, too high scares buyers off — the point is to find the balance.", "Reviews and repeat orders. The real money in homemade food is regular customers. One neighbor who orders every week is worth more than ten one-offs. That's why quality and consistency beat one-time promotions."] },
        { h: "How to count honestly", p: ["Keep a simple table: for each dish, write down the selling price and the cost of ingredients plus packaging. The difference is your margin. Then estimate how many portions you can realistically cook and sell in a week. Multiply — and you get a benchmark for revenue and profit.", "Don't forget your time. If an order takes an hour to cook and earns 300 rubles, that's your hourly rate. Compare it with what feels comfortable to you, and decide which dishes to keep on the menu and which aren't worth it."] },
        { h: "Payment and starting without commission costs", p: ["During Celina's free launch, buyers pay cash on delivery, directly to you. That means you don't hand over a percentage of each order and don't wait for payouts — the money is yours right away. For a start that's convenient: you can try it without financial risk and find out whether there's demand for your dishes specifically."] },
        { p: ["Homemade food won't make you a millionaire in a week, but with honest math and a good dish it's a real and growing side income. Want to test it in practice? Become a cook on Celina and start cooking for the neighbors near you."] },
      ],
    },
  },
  {
    slug: "s-kem-vypit-najti-kompaniyu",
    cover: "/images/khinkali.jpg",
    date: "2026-07-13",
    readMin: 6,
    tags: ["компания на вечер", "посиделки", "соседи"],
    links: [
      { to: "/vypit-vmeste", label: "Посиделки у соседа" },
      { to: "/gatherings", label: "Застолья с соседями" },
      { to: "/eda/moskva", label: "Домашняя еда в Москве" },
      { to: "/blog", label: "Блог Celina" },
    ],
    ru: {
      title: "С кем провести вечер: как найти компанию по соседству",
      excerpt:
        "Не с кем посидеть и поговорить вечером? Разбираем, как найти компанию среди соседей: посиделки за домашним столом, застолья и правила безопасной встречи.",
      body: [
        { p: ["«С кем провести вечер?», «куда сходить вечером одному?» — эти вопросы люди задают поисковику чаще, чем признаются друзьям. В большом городе вокруг тысячи людей, а позвать за стол вечером бывает некого: друзья разъехались, коллеги спешат домой, а сидеть одному перед экраном надоедает. Хорошая новость: компания для посиделок часто живёт за соседней дверью — нужен только повод познакомиться. Таким поводом становится еда."] },
        { h: "Почему в большом городе не с кем посидеть", p: ["Городское одиночество — не про отсутствие людей, а про отсутствие поводов. Мы годами не знаем, как зовут соседа по площадке, потому что «неудобно» и «не о чем». Общий стол снимает эту неловкость: за ужином разговор начинается сам собой — о еде, районе, детях, даче. Именно так знакомились наши бабушки, и это по-прежнему работает."] },
        { h: "Соседский стол вместо кафе", p: ["Celina — площадка, где соседи-повара готовят домашнюю еду и зовут гостей к себе за стол. Вместо шумного кафе со случайными людьми — кухня в вашем же районе, хинкали или пироги из печи и хозяин, которому действительно интересно, кто живёт рядом. Каждый повар проходит проверку личности и подтверждает санитарные правила, а отзывы соседей видно ещё до того, как вы решите прийти."] },
        { h: "Как работают «посиделки у соседа»", p: ["Сосед-повар может открыть приём гостей у себя за столом: позвать на домашний ужин или чай с разговором. Вы видите приглашение в ленте, читаете описание и отзывы, подтверждаете участие — и приходите вечером в гости в своём же районе.", "Суть функции проста: она помогает найти компанию для вечера, и только. Всё вращается вокруг еды и общения — домашний ужин, чай с пирогом и человек, с которым приятно поговорить. Селина не продаёт, не доставляет и не рекламирует алкоголь."] },
        { h: "Застолья: компания для посиделок без повода", p: ["Если хочется большой компании, посмотрите застолья — соседские события на несколько гостей: грузинский вечер, пельменная суббота, чай с пирогами. Хозяин указывает дату, место и число мест, цена за гостя может быть любой — даже ноль, если человек просто зовёт в гости. Адрес видят только подтверждённые участники."] },
        { h: "Правила безопасной встречи", p: ["Знакомство с новыми людьми должно быть спокойным, поэтому несколько простых правил. Читайте профиль и отзывы хозяина до встречи. Скажите близким, куда идёте, и поделитесь адресом. На первую встречу можно прийти вдвоём с другом. Почувствовали себя некомфортно — просто уходите, вы никому ничего не должны. В экстренной ситуации звоните 112."] },
        { h: "Это сервис знакомств?", p: ["Нет. Это соседское сообщество вокруг домашней еды: люди ужинают, общаются и находят приятелей в своём районе. Никаких свиданий и анкет — только общий стол."] },
        { h: "Сколько это стоит?", p: ["Условия задаёт хозяин: у многих участие стоит как домашний ужин, а чаепития нередко бесплатные. Сейчас сервис не берёт комиссий, оплата — наличными напрямую хозяину."] },
        { p: ["Вечер не обязан быть одиноким. Загляните в раздел посиделок или на ближайшие застолья — возможно, ваша лучшая компания живёт этажом ниже."] },
      ],
    },
    en: {
      title: "Who to spend the evening with: finding company next door",
      excerpt:
        "No one to sit and talk with tonight? How to find company among your neighbors: get-togethers at a home table, gatherings, and safety rules for meeting new people.",
      body: [
        { p: ["\"Who can I spend the evening with?\", \"where to go alone tonight?\" — people ask search engines these questions more often than they admit to friends. A big city holds thousands of people, yet on many evenings there's no one to invite to the table: friends have moved away, colleagues rush home, and sitting alone in front of a screen gets old. The good news: company for a cozy evening often lives right behind the next door — you just need a reason to meet. Food is that reason."] },
        { h: "Why big-city evenings feel lonely", p: ["Urban loneliness isn't about a lack of people — it's about a lack of occasions. We can spend years not knowing our neighbor's name because it feels \"awkward\" and \"there's nothing to talk about.\" A shared table removes that awkwardness: over dinner, conversation starts by itself — about food, the neighborhood, kids, weekend plans. That's how our grandparents made friends, and it still works."] },
        { h: "A neighbor's table instead of a café", p: ["Celina is a platform where neighbor-cooks make homemade food and invite guests to their table. Instead of a noisy café full of strangers — a kitchen in your own neighborhood, khinkali or pies from the oven, and a host genuinely curious about who lives nearby. Every cook passes identity verification and confirms food-safety rules, and you can read neighbors' reviews before deciding to come."] },
        { h: "How get-togethers at a neighbor's work", p: ["A neighbor-cook can open their table to guests: invite people over for a home dinner or tea and conversation. You see the invite in the feed, read the description and reviews, RSVP — and come over for the evening, right in your own neighborhood.", "The point of the feature is simple: it helps you find company for the evening — nothing more. Everything revolves around food and conversation — a home dinner, tea with pie, and someone pleasant to talk to. Celina does not sell, deliver, or advertise alcohol."] },
        { h: "Gatherings: company with no special occasion", p: ["If you'd rather have a bigger crowd, check out gatherings — neighborhood events for several guests: a Georgian evening, a pelmeni Saturday, tea with pies. The host sets the date, place, and number of seats; the price per guest can be anything — even zero if someone is simply inviting people over. The address is shown only to confirmed guests."] },
        { h: "Safety rules for meeting new people", p: ["Meeting new people should feel calm, so a few simple rules. Read the host's profile and reviews before the meeting. Tell someone close where you're going and share the address. Bring a friend to a first meeting if you like. If you feel uncomfortable — just leave; you don't owe anyone anything. In an emergency, call 112."] },
        { h: "Is this a dating service?", p: ["No. It's a neighborhood community built around homemade food: people share dinner, talk, and make friends nearby. No dates, no dating profiles — just a shared table."] },
        { h: "How much does it cost?", p: ["The host sets the terms: at many tables you pay about the cost of a home dinner, and tea parties are often free. Right now the service charges no commission; payment is in cash directly to the host."] },
        { p: ["An evening doesn't have to be lonely. Browse the get-togethers section or upcoming gatherings — your best company might live one floor down."] },
      ],
    },
  },
  {
    slug: "dostavka-domashney-edy-na-dom",
    cover: "/images/olivier-salad.jpg",
    date: "2026-07-13",
    readMin: 5,
    tags: ["доставка", "домашняя еда", "инструкция"],
    links: [
      { to: "/dostavka", label: "Доставка домашней еды" },
      { to: "/eda/moskva", label: "Домашняя еда в Москве" },
      { to: "/login", label: "Войти и заказать" },
      { to: "/blog", label: "Блог Celina" },
    ],
    ru: {
      title: "Доставка домашней еды на дом: как это работает у соседей",
      excerpt:
        "Доставка домашней еды на дом от соседей-поваров: как оформить заказ, что с упаковкой, почему оплата наличными при получении и чем это отличается от агрегаторов.",
      body: [
        { p: ["Доставка домашней еды на дом — это не только дарк-китчены и ресторанные агрегаторы. Есть третий путь: заказать обед у соседа, который готовит у себя на кухне по семейным рецептам. Разбираем по шагам, как устроена соседская доставка на Celina, чем она отличается от привычных приложений и на что вы имеете право как покупатель."] },
        { h: "Чем соседская доставка отличается от агрегаторов", p: ["В агрегаторе вы заказываете у ресторана или цеха. У соседа-повара всё иначе: еда готовится небольшими порциями и часто под конкретный заказ, состав пишет сам человек, который стоял у плиты, а вопрос «а можно без лука?» решается сообщением, а не тикетом в поддержку.", "Ещё одно отличие — экономика. На этапе бесплатного запуска Celina не берёт комиссий: цена, которую вы видите, — это цена повара. Каждый повар на площадке проходит проверку личности и подтверждает соблюдение санитарных правил."] },
        { h: "Как оформить заказ: пошагово", p: ["Откройте ленту и найдите поваров своего города и района — можно искать по блюду (борщ, плов, блины), по кухне или по расстоянию. Изучите витрину: фото, состав, аллергены, цену и отзывы соседей. Добавьте блюда в корзину — заказывать можно сразу у нескольких поваров. Укажите адрес, выберите удобные дату и время и подтвердите заказ. Повар получит его сразу и свяжется с вами, если что-то нужно уточнить."] },
        { h: "Упаковка: как еда доезжает до двери", p: ["Домашняя еда едет к вам в плотно закрытых контейнерах — так, чтобы борщ оставался борщом, а не украшением пакета. Повар указывает, как блюдо лучше хранить и разогревать. Совет: если заказываете суп и горячее вместе, попросите упаковать их отдельно, а салаты — с заправкой отдельно, чтобы заправить перед подачей."] },
        { h: "Оплата наличными при получении", p: ["На этапе бесплатного запуска оплата одна и самая спокойная — наличными при получении, напрямую повару. Никаких предоплат и привязанных карт: вы платите тогда, когда заказ уже у вас в руках. Для покупателя это простая защита — сначала еда, потом деньги."] },
        { h: "Самовывоз: быстрее и со знакомством", p: ["Если повар живёт в соседнем доме, часто проще забрать заказ самому. Выбирайте самовывоз при оформлении: не нужно ждать доставку, а заодно вы познакомитесь с человеком, который готовил ваш ужин. Знакомство с поваром рядом часто перерастает в привычку брать домашние обеды регулярно."] },
        { h: "Ваши права как покупателя", p: ["Celina — информационная площадка, которая соединяет соседей, но правила защиты потребителей никто не отменял. До заказа вы видите состав, аллергены и цену — это ваша основа для осознанного выбора. Заказ можно отменить вскоре после оформления, пока повар не начал готовить. Если блюдо не соответствует описанию, сначала напишите повару — вопросы почти всегда решаются напрямую, а честный отзыв после заказа помогает всем соседям. Права потребителя, закреплённые законом «О защите прав потребителей», действуют и при покупке у частного повара."] },
        { h: "Сколько стоит доставка?", p: ["Условия доставки задаёт сам повар — они видны до оформления заказа. Комиссий платформы на этапе бесплатного запуска нет."] },
        { h: "Как оплатить заказ?", p: ["Наличными при получении, напрямую повару. Онлайн-оплата на старте не используется."] },
        { h: "Можно ли заказать еду заранее?", p: ["Да. При оформлении вы выбираете удобные дату и время — так повар успеет приготовить всё свежим к нужному часу."] },
        { h: "Что делать, если заказ не понравился?", p: ["Свяжитесь с поваром через платформу и опишите проблему — чаще всего вопрос решается сразу. Обязательно оставьте честный отзыв: рейтинг складывается только из реальных заказов."] },
        { p: ["Домашние обеды с доставкой на дом — это проще, чем кажется: пара минут на заказ, и сосед уже ставит кастрюлю на плиту. Посмотрите, кто готовит рядом с вами."] },
      ],
    },
    en: {
      title: "Homemade food delivery to your door: how it works",
      excerpt:
        "Homemade food delivered to your door by neighbor cooks: how ordering works, packaging, cash on delivery, pickup, and how it differs from big delivery apps.",
      body: [
        { p: ["Home delivery of homemade food isn't just dark kitchens and restaurant aggregators. There's a third way: order lunch from a neighbor who cooks in their own kitchen using family recipes. Here's a step-by-step look at how neighbor delivery works on Celina, how it differs from the usual apps, and what your rights are as a buyer."] },
        { h: "How neighbor delivery differs from aggregators", p: ["On an aggregator you order from a restaurant or a production line. With a neighbor-cook everything is different: food is made in small batches and often to order, the ingredient list is written by the person who actually stood at the stove, and \"can I have it without onions?\" is solved with a message, not a support ticket.", "The economics differ too. Right now, Celina charges no fees: the price you see is the cook's price. Every cook on the platform passes identity verification and confirms compliance with food-safety rules."] },
        { h: "How to place an order: step by step", p: ["Open the feed and find cooks in your city and neighborhood — search by dish (borscht, plov, blini), by cuisine, or by distance. Study the storefront: photos, ingredients, allergens, price, and neighbor reviews. Add dishes to the cart — you can order from several cooks at once. Enter your address, pick a convenient date and time, and confirm. The cook receives the order immediately and will contact you if anything needs clarifying."] },
        { h: "Packaging: how food travels to your door", p: ["Homemade food arrives in tightly sealed containers — so the borscht stays borscht rather than decorating the bag. The cook notes how each dish is best stored and reheated. Tip: if you order soup and a main together, ask for them to be packed separately, and for salads to come with the dressing on the side."] },
        { h: "Cash on delivery", p: ["Right now there is one payment method, and it's the calmest one — cash on delivery, directly to the cook. No prepayments, no linked cards: you pay when the order is already in your hands. For the buyer it's simple protection — food first, money after."] },
        { h: "Pickup: faster, plus you meet the cook", p: ["If the cook lives in the next building, it's often easier to collect the order yourself. Choose pickup at checkout: no waiting for delivery, and you get to meet the person who cooked your dinner. Meeting a cook nearby often turns into a habit of ordering homemade meals regularly."] },
        { h: "Your rights as a buyer", p: ["Celina is an information platform that connects neighbors, but consumer protection still applies. Before ordering you see the ingredients, allergens, and price — the basis for an informed choice. An order can be cancelled shortly after placing it, before the cook starts cooking. If a dish doesn't match its description, message the cook first — issues are almost always resolved directly, and an honest review after the order helps all neighbors. Consumer rights under the law \"On Protection of Consumer Rights\" apply to purchases from a private cook as well."] },
        { h: "How much does delivery cost?", p: ["Delivery terms are set by the cook and shown before you place the order. There are no platform fees right now."] },
        { h: "How do I pay for the order?", p: ["Cash on delivery, directly to the cook. Online payment is not used right now."] },
        { h: "Can I order food in advance?", p: ["Yes. At checkout you pick a convenient date and time — so the cook can have everything fresh by the hour you need."] },
        { h: "What if I'm unhappy with the order?", p: ["Contact the cook through the platform and describe the problem — it's usually resolved right away. And do leave an honest review: ratings are built only from real orders."] },
        { p: ["Homemade meals delivered to your door are simpler than they sound: a couple of minutes to order, and a neighbor is already putting the pot on the stove. See who's cooking near you."] },
      ],
    },
  },
  {
    slug: "chto-prigotovit-na-uzhin",
    cover: "/images/borscht.jpg",
    date: "2026-07-21",
    readMin: 6,
    tags: ["что приготовить", "ужин", "идеи", "домашняя еда"],
    links: [
      { to: "/obedy", label: "Домашние обеды с доставкой" },
      { to: "/dostavka", label: "Доставка домашней еды" },
      { to: "/", label: "Повара рядом с вами" },
      { to: "/vstrechi", label: "С кем поужинать: встречи с соседями" },
    ],
    ru: {
      title: "Что приготовить на ужин: 20 идей, когда нет сил и фантазии",
      excerpt:
        "Быстрые ужины за 20 минут, сытные семейные, лёгкие ПП-варианты — и честный план Б, если готовить сегодня совсем не хочется.",
      body: [
        { p: ["«Что приготовить на ужин?» — вопрос, который человечество задаёт себе каждый вечер примерно в 18:30. Собрали 20 проверенных идей на все случаи: когда есть 20 минут, когда надо накормить семью, когда хочется лёгкого — и когда сил нет вообще."] },
        { h: "Быстрые ужины за 15–20 минут", p: ["1. Макароны с сыром и чесноком — базовый рецепт, который не надоедает. 2. Омлет с овощами и зеленью — белок и ужин за десять минут. 3. Гречка с грибами и луком — сытно и по-домашнему. 4. Куриное филе на сковороде с помидорами. 5. Тосты с яйцом и авокадо, если ужин нужен «ещё вчера».", "Секрет быстрого ужина — не рецепт, а заготовки: отваренная с выходных крупа, размороженное филе, нарезанные овощи. Полчаса в воскресенье экономят пять вечеров."] },
        { h: "Сытные семейные ужины", p: ["6. Борщ — да, на его варку нужен час-полтора, но он живёт в холодильнике три дня и на второй день только вкуснее. 7. Котлеты с пюре — классика, против которой бессильны все тренды. 8. Плов — один казан кормит семью два вечера. 9. Тушёная картошка с мясом. 10. Домашние пельмени — если лепить всей семьёй, это ещё и лучший вечер недели.", "Семейные ужины — это блюда «на кастрюлю», а не «на порцию»: готовите один раз, едите два-три дня. В будни это спасение."] },
        { h: "Лёгкие и ПП-ужины", p: ["11. Запечённая рыба с овощами — 25 минут в духовке без вашего участия. 12. Салат с курицей и йогуртовой заправкой. 13. Овощное рагу — кабачки, перец, помидоры, всё что есть. 14. Творог с зеленью и огурцом на тостах. 15. Куриный суп на лёгком бульоне — ужин, после которого не тяжело."] },
        { h: "Когда хочется чего-то особенного", p: ["16. Хачапури по-аджарски — лодочка с яйцом, которая делает вечер праздником. 17. Сырники на ужин — почему нет? 18. Блины с начинками — солёными и сладкими. 19. Осетинский пирог. 20. Хинкали — если есть время лепить или знакомый повар, который лепит лучше.", "Кавказская и домашняя русская кухня — чемпионы «особенных» ужинов: они пахнут праздником даже в будний вторник."] },
        { h: "План Б: когда готовить нет сил", p: ["Есть вечера, когда единственный честный ответ на «что приготовить на ужин» — ничего. Для таких вечеров есть соседи, которые уже приготовили: на Селине домашнюю еду готовят проверенные повара, живущие в паре кварталов от вас. Борщ, котлеты, плов и та самая выпечка — свежие, из кастрюли, а не из витрины, с доставкой до двери или самовывозом за пять минут.", "Это не «доставка еды» в привычном смысле: готовит не ресторан, а человек с именем и отзывами соседей, оплата — наличными при получении, а сейчас сервис не берёт комиссий. Загляните в ленту — возможно, ваш сегодняшний ужин уже стоит на плите у соседа.", "А если ужинать одному надоело — посмотрите соседские встречи: ужины за общим столом у проверенных хозяев. Иногда лучший ответ на вопрос «что приготовить» — «с кем поужинать»."] },
      ],
    },
    en: {
      title: "What to Cook for Dinner: 20 Ideas for When You're Out of Energy",
      excerpt:
        "Quick 20-minute dinners, hearty family meals, light options — and an honest plan B for the nights you don't want to cook at all.",
      body: [
        { p: ["'What's for dinner?' — the question humanity asks itself every evening around 6:30 pm. Here are 20 proven ideas: for when you have 20 minutes, when you need to feed a family, when you want something light — and when you have no energy at all."] },
        { h: "Quick dinners in 15–20 minutes", p: ["1. Pasta with cheese and garlic. 2. Vegetable omelet — protein and dinner in ten minutes. 3. Buckwheat with mushrooms and onions. 4. Pan-fried chicken with tomatoes. 5. Egg and avocado toasts when dinner was needed 'yesterday'.", "The secret of a fast dinner is not the recipe but the prep: grains cooked on the weekend, defrosted fillet, chopped vegetables. Half an hour on Sunday saves five evenings."] },
        { h: "Hearty family dinners", p: ["6. Borscht — takes an hour and a half, but lives in the fridge for three days and tastes better on day two. 7. Cutlets with mashed potatoes. 8. Plov — one pot feeds the family for two evenings. 9. Braised potatoes with meat. 10. Homemade pelmeni — made together, it's also the best evening of the week."] },
        { h: "Light dinners", p: ["11. Baked fish with vegetables — 25 minutes in the oven without your involvement. 12. Chicken salad with yogurt dressing. 13. Vegetable ragout. 14. Cottage cheese with herbs on toast. 15. Light chicken soup."] },
        { h: "When you want something special", p: ["16. Adjarian khachapuri — the cheese boat with an egg that turns an evening into a celebration. 17. Syrniki for dinner — why not? 18. Blini with fillings. 19. Ossetian pie. 20. Khinkali — if you have time to fold them, or a neighbor cook who folds them better."] },
        { h: "Plan B: when there's no energy to cook", p: ["Some evenings the only honest answer to 'what to cook' is nothing. For those evenings there are neighbors who already cooked: on Celina, verified home cooks living a couple of blocks away make borscht, cutlets, plov and that very pastry — fresh from the pot, not from a counter, with delivery or five-minute pickup.", "It's not 'food delivery' in the usual sense: the cook is a person with a name and neighbors' reviews, payment is cash on receipt, and right now the service charges no commission. Check the feed — your tonight's dinner may already be on a neighbor's stove.", "And if eating alone got old — see neighbor meetups: shared-table dinners at verified hosts. Sometimes the best answer to 'what to cook' is 'who to eat with'."] },
      ],
    },
  },
  {
    slug: "domashnyaya-eda-v-sankt-peterburge",
    cover: "/images/blini.jpg",
    date: "2026-07-21",
    readMin: 5,
    tags: ["санкт-петербург", "домашняя еда", "доставка", "город"],
    links: [
      { to: "/eda/sankt-peterburg", label: "Домашняя еда в Санкт-Петербурге — страница города" },
      { to: "/dostavka", label: "Доставка домашней еды" },
      { to: "/obedy", label: "Домашние обеды с доставкой" },
      { to: "/vstrechi", label: "Встречи за общим столом" },
    ],
    ru: {
      title: "Домашняя еда в Санкт-Петербурге: где заказать и как это устроено",
      excerpt:
        "Гид по домашней еде в Петербурге: как найти соседа-повара в своём районе, что заказывают чаще всего и почему это вкуснее доставки из ресторана.",
      body: [
        { p: ["Петербург — город, который умеет есть дома: длинная зима, дожди и уютные кухни сделали домашнюю еду частью городского характера. Рассказываем, как в Санкт-Петербурге заказать настоящую домашнюю еду — не «домашнюю» из дарк-китчена, а приготовленную соседом в вашем же районе."] },
        { h: "Как это работает в Петербурге", p: ["На Селине домашнюю еду готовят проверенные соседи-повара. Откройте страницу города, посмотрите, кто готовит рядом — на Васильевском, в Купчино, на Петроградке или в Мурино, — выберите блюда и оформите заказ с доставкой или самовывозом. Повар живёт в паре кварталов, поэтому суп доезжает горячим даже в ноябрьскую слякоть.", "Каждый повар проходит проверку личности по документам, у блюд открыт состав, а оплата — наличными при получении: сначала видите заказ, потом платите. Сейчас сервис не берёт комиссий."] },
        { h: "Что заказывают в Питере чаще всего", p: ["Классика северной столицы — то, что согревает: наваристый борщ и щи, котлеты с пюре, домашние пельмени, пироги и блины. Сильна и кавказская линия — хачапури, хинкали, осетинские пироги: в Петербурге живут прекрасные повара, для которых это семейные рецепты, а не позиция в меню.", "Отдельная петербургская любовь — выпечка к чаю: пирожки, ватрушки, яблочные пироги. Домашняя выпечка от соседки с вашей улицы — это другой уровень, чем витрина сетевой кофейни."] },
        { h: "Почему не агрегатор", p: ["Доставка из ресторана в Петербурге — это часто 40–60 минут езды через мосты и пробки. Домашняя еда от соседа готовится в вашем районе: между плитой и столом — минуты. Вы знаете, кто готовил, видите отзывы соседей и платите без комиссий и наценок сервиса.", "А ещё это по-петербуржски человечно: за каждым блюдом — человек с именем, а не логотип. Многие клиенты со временем находят «своего» повара — как когда-то была «своя» булочная."] },
        { h: "С чего начать", p: ["Загляните на страницу «Домашняя еда в Санкт-Петербурге», посмотрите поваров рядом и закажите первый обед. Если в вашем районе поваров пока нет — оставьте заявку или расскажите о Селине соседке, которая печёт лучшие в парадной пироги. С неё в вашем районе всё и начнётся.", "Не хочется ужинать в одиночку — посмотрите встречи за общим столом: соседские ужины проходят и в Петербурге."] },
      ],
    },
    en: {
      title: "Homemade Food in Saint Petersburg: Where to Order and How It Works",
      excerpt:
        "A guide to home-cooked food in St. Petersburg: finding a neighbor cook in your district, what people order most, and why it beats restaurant delivery.",
      body: [
        { p: ["Petersburg is a city that knows how to eat at home: long winters, rain and cozy kitchens made home cooking part of its character. Here's how to order real homemade food in Saint Petersburg — cooked by a neighbor in your own district, not 'homestyle' from a dark kitchen."] },
        { h: "How it works in Petersburg", p: ["On Celina, home food is cooked by verified neighbors. Open the city page, see who cooks nearby — on Vasilyevsky, in Kupchino, on the Petrogradka or in Murino — pick dishes and order with delivery or pickup. The cook lives a couple of blocks away, so the soup arrives hot even through November slush.", "Every cook passes identity verification, dishes list their ingredients, and payment is cash on receipt: first you see the order, then you pay. No commissions right now."] },
        { h: "What people order most", p: ["The northern capital's classics are the warming ones: rich borscht and shchi, cutlets with mash, homemade pelmeni, pies and blini. The Caucasian line is strong too — khachapuri, khinkali, Ossetian pies: Petersburg is home to wonderful cooks for whom these are family recipes, not menu items.", "A special Petersburg love is tea-time pastry: pirozhki, vatrushki, apple pies. Homemade pastry from a neighbor on your street is a different level than a chain café counter."] },
        { h: "Why not an aggregator", p: ["Restaurant delivery in Petersburg often means 40–60 minutes across bridges and traffic. A neighbor's home cooking is made in your district: minutes between the stove and your table. You know who cooked, see neighbors' reviews, and pay with no service fees.", "It's also very Petersburg in spirit: behind every dish is a person with a name, not a logo. Many clients eventually find 'their' cook — like there used to be 'their' bakery."] },
        { h: "Where to start", p: ["Visit the 'Homemade food in Saint Petersburg' page, see the cooks nearby and order your first meal. If there are none in your district yet — leave a request, or tell the neighbor who bakes the best pies in your stairwell about Celina. That's how it starts in every district.", "And if you're tired of dining alone — check the shared-table meetups: neighbor dinners happen in Petersburg too."] },
      ],
    },
  },
  {
    slug: "chto-prigotovit-na-obed",
    cover: "/images/olivier-salad.jpg",
    date: "2026-07-22",
    readMin: 5,
    tags: ["что приготовить", "обед", "идеи", "домашняя еда"],
    links: [
      { to: "/obedy", label: "Домашние обеды с доставкой" },
      { to: "/blog/chto-prigotovit-na-uzhin", label: "Что приготовить на ужин: 20 идей" },
      { to: "/dostavka", label: "Доставка домашней еды" },
      { to: "/", label: "Повара рядом с вами" },
    ],
    ru: {
      title: "Что приготовить на обед: 15 идей для дома и работы",
      excerpt:
        "Полноценные обеды за полчаса, супы «на кастрюлю», идеи для офисного ланч-бокса — и вариант, когда готовить некогда совсем.",
      body: [
        { p: ["Обед — самый недооценённый приём пищи: на него вечно нет времени, и он вечно превращается в бутерброд у монитора. Вот 15 идей полноценного обеда — для дома, для офиса и для дней, когда готовить некогда."] },
        { h: "Супы: обед, который варится сам", p: ["1. Куриный суп с лапшой — час варки, три дня обедов. 2. Борщ — вкуснее на второй день, идеален «на кастрюлю». 3. Гороховый с копчёностями. 4. Щи из свежей капусты. 5. Грибной крем-суп.", "Суп — король обеда: варится один раз, кормит полнедели, разогревается за три минуты. Если варить некогда — у соседей-поваров суп почти всегда есть в меню."] },
        { h: "Быстрые вторые за 20–30 минут", p: ["6. Гречка с курицей в одной сковороде. 7. Паста с тунцом и лимоном. 8. Рис с овощами и яйцом по-домашнему. 9. Куриные оладьи с салатом. 10. Картофель по-деревенски с котлетой из морозилки — если она домашняя, это честный обед."] },
        { h: "Ланч-бокс в офис", p: ["11. Плов — идеально переносит разогрев в микроволновке. 12. Котлета с гречкой — классика советского судка, которая пережила все тренды, потому что работает. 13. Салат с курицей и киноа (заправка отдельно!). 14. Сырники — обед и десерт одновременно. 15. Пирожки — обед, который не требует вилки.", "Правило ланч-бокса: готовьте ужин с запасом, и обед соберётся сам. А если утром собирать нечего — домашний обед можно заказать прямо к офису."] },
        { h: "Когда готовить некогда: обед от соседа", p: ["В будни обед чаще всего проигрывает работе: некогда варить, некогда даже думать. Для таких дней есть соседи-повара на Селине: настоящий домашний суп и второе, приготовленные сегодня в паре кварталов от вас, — с доставкой домой, к офису или самовывозом за пять минут.", "Многие повара собирают полноценные комплексные обеды и готовы готовить регулярно — договоритесь напрямую, и вопрос «что на обед» исчезнет из вашей жизни. Оплата наличными при получении, сейчас без комиссий."] },
      ],
    },
    en: {
      title: "What to Cook for Lunch: 15 Ideas for Home and Work",
      excerpt:
        "Real lunches in half an hour, big-pot soups, office lunchbox ideas — and the option for days when there's no time to cook at all.",
      body: [
        { p: ["Lunch is the most underrated meal: there's never time for it, and it keeps turning into a sandwich at the monitor. Here are 15 ideas for a proper lunch — at home, at the office, and for days when cooking isn't happening."] },
        { h: "Soups: the lunch that cooks itself", p: ["1. Chicken noodle soup — an hour of cooking, three days of lunches. 2. Borscht — better on day two, perfect by the pot. 3. Pea soup with smoked meat. 4. Fresh cabbage shchi. 5. Mushroom cream soup.", "Soup is the king of lunch: cooked once, feeds you half a week, reheats in three minutes. No time to cook it — neighbor cooks almost always have soup on the menu."] },
        { h: "Quick mains in 20–30 minutes", p: ["6. One-pan buckwheat with chicken. 7. Pasta with tuna and lemon. 8. Homestyle rice with vegetables and egg. 9. Chicken fritters with salad. 10. Country-style potatoes with a cutlet from the freezer — if it's homemade, that's an honest lunch."] },
        { h: "Office lunchbox", p: ["11. Plov — survives the microwave perfectly. 12. Cutlet with buckwheat — the classic that outlived every trend because it works. 13. Chicken and quinoa salad (dressing separate!). 14. Syrniki — lunch and dessert in one. 15. Pirozhki — the lunch that needs no fork.", "The lunchbox rule: cook dinner with a margin and lunch packs itself. And if there's nothing to pack — order a home-cooked lunch straight to the office."] },
        { h: "No time to cook: lunch from a neighbor", p: ["On weekdays lunch usually loses to work: no time to cook, no time even to think. For those days there are neighbor cooks on Celina: real homemade soup and a main cooked today a couple of blocks away — delivered home, to the office, or picked up in five minutes.", "Many cooks assemble full set lunches and are happy to cook regularly — arrange it directly, and the 'what's for lunch' question disappears from your life. Cash on receipt, no commissions right now."] },
      ],
    },
  },
  {
    slug: "domashnyaya-eda-v-novosibirske",
    cover: "/images/pelmeni.jpg",
    date: "2026-07-22",
    readMin: 4,
    tags: ["новосибирск", "домашняя еда", "доставка", "город"],
    links: [
      { to: "/eda/novosibirsk", label: "Домашняя еда в Новосибирске — страница города" },
      { to: "/blog/domashnie-pelmeni-po-regionam-rossii", label: "Домашние пельмени по регионам России" },
      { to: "/blog/domashnyaya-eda-v-krasnoyarske", label: "Домашняя еда в Красноярске" },
      { to: "/dostavka", label: "Доставка домашней еды" },
      { to: "/obedy", label: "Домашние обеды с доставкой" },
    ],
    ru: {
      title: "Домашняя еда в Новосибирске: где заказать сибирский обед",
      excerpt:
        "Гид по домашней еде в Новосибирске: пельмени как в Сибири принято, наваристые супы и повара-соседи от Академгородка до Затулинки.",
      body: [
        { p: ["Сибирская домашняя кухня — это честная, сытная еда, которая согревает в −30 и радует в любую погоду: пельмени, наваристые супы, пироги с брусникой. Рассказываем, как в Новосибирске заказать настоящую домашнюю еду у соседей."] },
        { h: "Как это работает", p: ["На Селине готовят проверенные соседи: откройте страницу города, посмотрите поваров рядом — в Академгородке, на Родниках или на левом берегу, — выберите блюда и получите заказ доставкой или самовывозом. Повар живёт в вашем районе, поэтому пельмени доезжают горячими даже в сибирский мороз.", "Каждый повар проходит проверку личности, оплата — наличными при получении: сначала видите заказ, потом платите. Сейчас сервис не берёт комиссий."] },
        { h: "Что заказывают в Новосибирске", p: ["Пельмени — тут без сюрпризов: Сибирь лепит их лучше всех, и домашние пельмени от соседки не сравнить с магазинными. Дальше — борщи и супы «на кастрюлю», котлеты с пюре, домашняя выпечка: пироги с капустой, с рыбой, с ягодами. Сильна и среднеазиатская линия — плов, лагман, манты: в городе живут повара, для которых это семейная классика."] },
        { h: "С чего начать", p: ["Откройте страницу «Домашняя еда в Новосибирске», посмотрите, кто готовит рядом, и закажите первый обед. Поваров в вашем районе пока нет? Оставьте заявку или расскажите о Селине соседке, которая лепит лучшие пельмени в подъезде: с неё всё и начнётся."] },
      ],
    },
    en: {
      title: "Homemade Food in Novosibirsk: Order a Real Siberian Meal",
      excerpt:
        "A guide to home-cooked food in Novosibirsk: pelmeni the Siberian way, rich soups and neighbor cooks from Akademgorodok to the left bank.",
      body: [
        { p: ["Siberian home cooking is honest, hearty food that warms you at −30: pelmeni, rich soups, lingonberry pies. Here's how to order real homemade food from neighbors in Novosibirsk."] },
        { h: "How it works", p: ["On Celina, verified neighbors cook: open the city page, see cooks nearby — in Akademgorodok, on Rodniki or the left bank — pick dishes and get your order by delivery or pickup. The cook lives in your district, so pelmeni arrive hot even through Siberian frost.", "Every cook passes identity verification; payment is cash on receipt. No commissions right now."] },
        { h: "What people order", p: ["Pelmeni, of course — Siberia makes them best, and homemade ones from a neighbor are nothing like store-bought. Then big-pot borscht and soups, cutlets with mash, homemade pies — cabbage, fish, berry. The Central Asian line is strong too: plov, lagman, manty from cooks for whom it's family classics."] },
        { h: "Where to start", p: ["Open the 'Homemade food in Novosibirsk' page, see who cooks nearby and order your first meal. No cooks in your district yet? Leave a request or tell the neighbor who makes the best pelmeni in your building about Celina."] },
      ],
    },
  },
  {
    slug: "domashnyaya-eda-v-ekaterinburge",
    cover: "/images/pirozhki.jpg",
    date: "2026-07-22",
    readMin: 4,
    tags: ["екатеринбург", "домашняя еда", "доставка", "город"],
    links: [
      { to: "/eda/ekaterinburg", label: "Домашняя еда в Екатеринбурге — страница города" },
      { to: "/blog/domashnyaya-eda-v-chelyabinske", label: "Домашняя еда в Челябинске" },
      { to: "/blog/domashnyaya-vypechka-na-zakaz", label: "Домашняя выпечка на заказ" },
      { to: "/dostavka", label: "Доставка домашней еды" },
      { to: "/vstrechi", label: "Встречи за общим столом" },
    ],
    ru: {
      title: "Домашняя еда в Екатеринбурге: уральский стол от соседей",
      excerpt:
        "Гид по домашней еде в Екатеринбурге: уральские пельмени, шаньги, домашние обеды и повара-соседи от Уралмаша до Академического.",
      body: [
        { p: ["Уральская кухня — это пельмени, которыми регион гордится не меньше Сибири, шаньги с картошкой, грибные супы и основательные домашние обеды. Рассказываем, как в Екатеринбурге заказать домашнюю еду у проверенных соседей."] },
        { h: "Как это работает", p: ["Откройте страницу города на Селине и посмотрите, кто готовит рядом — на Уралмаше, в Академическом, на ВИЗе или в Пионерском. Выберите блюда, оформите заказ — повар приготовит и передаст доставкой или самовывозом. Готовят в вашем районе, поэтому еда приезжает горячей.", "Все повара проходят проверку личности, оплата наличными при получении, сейчас — без комиссий."] },
        { h: "Что заказывают в Екатеринбурге", p: ["Уральские пельмени — с редькой, с капустой, с мясом трёх видов: у каждой семьи свой рецепт. Шаньги с картошкой к завтраку, грибные супы, котлеты с пюре на обед. И конечно выпечка: пироги здесь пекут серьёзно — с визигой давно не найти, а вот с капустой, яйцом и зелёным луком — у соседки через двор."] },
        { h: "С чего начать", p: ["Загляните на страницу «Домашняя еда в Екатеринбурге», выберите повара рядом и закажите первый обед. Если поваров в районе пока мало — сервис запускается: оставьте заявку, а если сами печёте лучшие в доме шаньги — присоединяйтесь как повар, сейчас это бесплатно."] },
      ],
    },
    en: {
      title: "Homemade Food in Yekaterinburg: an Ural Table from Neighbors",
      excerpt:
        "A guide to home food in Yekaterinburg: Ural pelmeni, shangi, homemade lunches and neighbor cooks from Uralmash to Akademichesky.",
      body: [
        { p: ["Ural cuisine means pelmeni the region is as proud of as Siberia, potato shangi, mushroom soups and solid homemade lunches. Here's how to order home-cooked food from verified neighbors in Yekaterinburg."] },
        { h: "How it works", p: ["Open the city page on Celina and see who cooks nearby — on Uralmash, in Akademichesky, on VIZ or in Pionersky. Pick dishes, place the order — the cook prepares it and hands it over by delivery or pickup. Cooked in your district, so it arrives hot.", "All cooks pass identity verification; cash on receipt; no commissions right now."] },
        { h: "What people order", p: ["Ural pelmeni — with radish, with cabbage, with three kinds of meat: every family has its recipe. Potato shangi for breakfast, mushroom soups and cutlets for lunch. And serious baking: cabbage, egg and green onion pies from the neighbor across the yard."] },
        { h: "Where to start", p: ["Visit the 'Homemade food in Yekaterinburg' page, choose a cook nearby and order your first meal. Few cooks in your district yet? Leave a request, or join as a cook if your shangi are the best in the building; it's free right now."] },
      ],
    },
  },
  {
    slug: "domashnyaya-eda-v-kazani",
    cover: "/images/blini.jpg",
    date: "2026-07-22",
    readMin: 4,
    tags: ["казань", "домашняя еда", "татарская кухня", "город"],
    links: [
      { to: "/eda/kazan", label: "Домашняя еда в Казани — страница города" },
      { to: "/halal", label: "Халяльная домашняя еда на заказ" },
      { to: "/blog/tatarskaya-kuhnya-echpochmaki-chak-chak", label: "Татарская кухня: эчпочмаки и чак-чак" },
      { to: "/dostavka", label: "Доставка домашней еды" },
      { to: "/obedy", label: "Домашние обеды с доставкой" },
    ],
    ru: {
      title: "Домашняя еда в Казани: эчпочмаки, чак-чак и обеды от соседей",
      excerpt:
        "Гид по домашней еде в Казани: настоящая татарская домашняя кухня — эчпочмаки, кыстыбый, чак-чак — и повара-соседи по всему городу.",
      body: [
        { p: ["Казань — одна из немногих столиц России, где домашняя кухня — это живое двуязычие: борщ и эчпочмак на одном столе. Рассказываем, как заказать настоящую домашнюю еду у соседей — от Ново-Савиновского до Азино."] },
        { h: "Как это работает", p: ["На Селине готовят проверенные соседи: откройте страницу города, выберите повара рядом и закажите с доставкой или самовывозом. Готовят в вашем районе — эчпочмаки приезжают тёплыми, как из бабушкиной печи.", "Каждый повар проходит проверку личности, оплата — наличными при получении, сейчас сервис не берёт комиссий."] },
        { h: "Что заказывают в Казани", p: ["Татарская домашняя классика вне конкуренции: эчпочмаки с мясом и картошкой, кыстыбый, бэлиш, суп-лапша токмач — и, конечно, чак-чак к чаю, который у домашних мастериц получается воздушнее любого магазинного. Рядом с ней — вся русская домашняя линия: борщи, котлеты, блины.", "Именно домашние повара хранят настоящие семейные рецепты татарской кухни — те, что не найти в сетевых кафе. На Селине они готовят для соседей."] },
        { h: "С чего начать", p: ["Откройте страницу «Домашняя еда в Казани», посмотрите поваров рядом и закажите первый обед. Поваров в районе пока нет? Оставьте заявку — или позовите на Селину соседку, чьи эчпочмаки знает весь подъезд. С неё в вашем дворе всё и начнётся."] },
      ],
    },
    en: {
      title: "Homemade Food in Kazan: Echpochmak, Chak-Chak and Neighbor Lunches",
      excerpt:
        "A guide to home food in Kazan: real Tatar home cooking — echpochmak, kystybyi, chak-chak — and neighbor cooks across the city.",
      body: [
        { p: ["Kazan is one of the few Russian capitals where home cooking is a living bilingualism: borscht and echpochmak on the same table. Here's how to order real homemade food from neighbors — from Novo-Savinovsky to Azino."] },
        { h: "How it works", p: ["Verified neighbors cook on Celina: open the city page, choose a cook nearby and order with delivery or pickup. Cooked in your district — echpochmaks arrive warm, like from grandma's oven.", "Every cook passes identity verification; cash on receipt; no commissions right now."] },
        { h: "What people order", p: ["Tatar home classics are unbeatable: meat-and-potato echpochmak, kystybyi, balish, tokmach noodle soup — and chak-chak for tea, airier from home masters than any store version. Next to it — the whole Russian home line: borscht, cutlets, blini.", "It's home cooks who keep the real family recipes of Tatar cuisine — the ones chain cafés don't have. On Celina they cook for neighbors."] },
        { h: "Where to start", p: ["Open the 'Homemade food in Kazan' page, see the cooks nearby and order your first meal. None in your district yet? Leave a request — or invite the neighbor whose echpochmaks the whole building knows. That's where it starts in your yard."] },
      ],
    },
  },
  {
    slug: "domashnyaya-eda-v-nizhnem-novgorode",
    cover: "/images/borscht.jpg",
    date: "2026-07-27",
    readMin: 4,
    tags: ["нижний новгород", "домашняя еда", "доставка", "город"],
    links: [
      { to: "/eda/nizhniy-novgorod", label: "Домашняя еда в Нижнем Новгороде — страница города" },
      { to: "/blog/gde-zakazat-nastoyashchiy-borshch", label: "Где заказать настоящий борщ" },
      { to: "/dostavka", label: "Доставка домашней еды" },
      { to: "/obedy", label: "Домашние обеды с доставкой" },
    ],
    ru: {
      title: "Домашняя еда в Нижнем Новгороде: обед по-волжски от соседей",
      excerpt:
        "Гид по домашней еде в Нижнем Новгороде: наваристые щи, пироги и домашние обеды от соседей-поваров — от Автозавода до Верхних Печёр.",
      body: [
        { p: ["Нижний стоит на слиянии двух рек, и стол здесь такой же основательный, как волжские берега: густые щи и борщи, пироги во всю противень, домашние котлеты и выпечка к чаю. Рассказываем, как в Нижнем Новгороде заказать настоящую домашнюю еду — не «домашнюю» с конвейера, а приготовленную соседом в вашем же районе."] },
        { h: "Как это работает", p: ["На Селине готовят проверенные соседи-повара. Откройте страницу города, посмотрите, кто готовит рядом — на Автозаводе, в Сормове, в Канавине или в Верхних Печёрах, — выберите блюда и оформите заказ с доставкой или самовывозом. Повар живёт в паре кварталов, поэтому обед не едет через мост и весь город: между плитой и вашим столом — минуты.", "Каждый повар проходит проверку личности по документам, у блюд открыт состав, а оплата — наличными при получении: сначала видите заказ, потом платите. Сейчас сервис не берёт комиссий."] },
        { h: "Что заказывают в Нижнем Новгороде", p: ["Поволжская домашняя классика — то, что кормит семью из поколения в поколение: наваристые щи и борщ, домашние пельмени, котлеты с пюре, гречка по-купечески. Отдельная нижегородская любовь — пироги и выпечка к чаю: с капустой, с яблоками, с ягодами, которые здесь собирают на дачах вдоль Волги и Оки.", "Летом в меню у поваров появляются лёгкие окрошки и холодники, а к осени возвращаются щи из свежей капусты и грибные супы. Домашняя еда от соседа меняется вместе с сезоном — как и должно быть на настоящей кухне."] },
        { h: "С чего начать", p: ["Загляните на страницу «Домашняя еда в Нижнем Новгороде», посмотрите поваров рядом и закажите первый обед. Если поваров в вашем районе пока нет — оставьте заявку или расскажите о Селине соседке, чьи пироги знает вся лестничная площадка. С неё в вашем дворе всё и начнётся.", "А если не хочется ужинать в одиночку — загляните во встречи за общим столом: соседские ужины проходят и в Нижнем."] },
      ],
    },
    en: {
      title: "Homemade Food in Nizhny Novgorod: a Volga-Style Meal from Neighbors",
      excerpt:
        "A guide to home-cooked food in Nizhny Novgorod: rich shchi, pies and homemade lunches from neighbor cooks — from Avtozavod to Verkhnie Pechyory.",
      body: [
        { p: ["Nizhny sits where two rivers meet, and its table is as hearty as the Volga banks: thick shchi and borscht, tray-sized pies, homemade cutlets and tea-time baking. Here's how to order real homemade food in Nizhny Novgorod — cooked by a neighbor in your own district, not 'homestyle' off a conveyor."] },
        { h: "How it works", p: ["On Celina, verified neighbor cooks do the cooking. Open the city page, see who cooks nearby — in Avtozavod, Sormovo, Kanavino or Verkhnie Pechyory — pick dishes and order with delivery or pickup. The cook lives a couple of blocks away, so lunch doesn't cross a bridge and the whole city: minutes between the stove and your table.", "Every cook passes identity verification, dishes list their ingredients, and payment is cash on receipt: first you see the order, then you pay. No commissions right now."] },
        { h: "What people order", p: ["Volga home classics are what feed a family across generations: rich shchi and borscht, homemade pelmeni, cutlets with mash, merchant-style buckwheat. A special Nizhny love is pies and tea-time baking — cabbage, apple, or berries picked at the dachas along the Volga and Oka.", "In summer, cooks add light okroshka and cold soups; by autumn, fresh-cabbage shchi and mushroom soups return. A neighbor's home cooking shifts with the season — as a real kitchen should."] },
        { h: "Where to start", p: ["Visit the 'Homemade food in Nizhny Novgorod' page, see the cooks nearby and order your first meal. If there are none in your district yet — leave a request, or tell the neighbor whose pies the whole landing knows about Celina. That's how it starts in your yard.", "And if you'd rather not dine alone — check the shared-table meetups: neighbor dinners happen in Nizhny too."] },
      ],
    },
  },
  {
    slug: "domashnyaya-eda-v-krasnodare",
    cover: "/images/pirozhki.jpg",
    date: "2026-07-27",
    readMin: 4,
    tags: ["краснодар", "кубань", "домашняя еда", "доставка", "город"],
    links: [
      { to: "/eda/krasnodar", label: "Домашняя еда в Краснодаре — страница города" },
      { to: "/blog/gde-zakazat-nastoyashchiy-borshch", label: "Где заказать настоящий борщ" },
      { to: "/dostavka", label: "Доставка домашней еды" },
      { to: "/obedy", label: "Домашние обеды с доставкой" },
    ],
    ru: {
      title: "Домашняя еда в Краснодаре: кубанский стол от соседей-поваров",
      excerpt:
        "Гид по домашней еде в Краснодаре: борщ по-кубански, вареники, пироги и домашние обеды от соседей-поваров — от ФМР и ЮМР до Гидростроителей.",
      body: [
        { p: ["Краснодар — южная столица, куда переезжают со всей страны, и город, где рынок круглый год завален помидорами, зеленью и фруктами. Стол здесь щедрый и по-кубански сытный: наваристый борщ, вареники горой, пироги во всю противень и овощи прямо с грядки. Рассказываем, как в Краснодаре заказать настоящую домашнюю еду — не «домашнюю» с конвейера, а приготовленную соседом в вашем же микрорайоне."] },
        { h: "Как это работает", p: ["На Селине готовят проверенные соседи-повара. Откройте страницу города, посмотрите, кто готовит рядом — в Фестивальном (ФМР), Юбилейном (ЮМР), Комсомольском микрорайоне, на Гидростроителей или в Пашковском, — выберите блюда и оформите заказ с доставкой или самовывозом. Повар живёт в паре кварталов, поэтому обед не едет через весь город в пробках по Красной: между плитой и вашим столом — минуты.", "Каждый повар проходит проверку личности по документам, у блюд открыт состав, а оплата — наличными при получении: сначала видите заказ, потом платите. Сейчас сервис не берёт комиссий."] },
        { h: "Что заказывают в Краснодаре", p: ["Кубанская домашняя классика — то, что кормит семью из поколения в поколение: борщ по-кубански с пампушками, вареники с вишней, картошкой и творогом, голубцы, домашние котлеты с молодой картошкой. Отдельная южная любовь — заготовки: домашняя аджика, лечо, вяленые и солёные помидоры, из которых зимой вырастает половина стола.", "Летом, в разгар южного сезона, у поваров в меню окрошки, холодники и горы свежих овощей с рынка, а к осени идут закрутки и наваристые супы. Домашняя еда от соседа меняется вместе с сезоном — как и должно быть на настоящей кухне. Для многих новосёлов такой обед — ещё и кусочек дома: вкус, по которому скучаешь после переезда."] },
        { h: "С чего начать", p: ["Загляните на страницу «Домашняя еда в Краснодаре», посмотрите поваров рядом и закажите первый обед. Если поваров в вашем районе пока нет — оставьте заявку или расскажите о Селине соседке, чьи вареники и аджику знает весь подъезд. С неё в вашем дворе всё и начнётся.", "А если не хочется ужинать в одиночку — загляните во встречи за общим столом: соседские ужины проходят и в Краснодаре."] },
      ],
    },
    en: {
      title: "Homemade Food in Krasnodar: a Kuban Table from Neighbor Cooks",
      excerpt:
        "A guide to home-cooked food in Krasnodar: Kuban borscht, vareniki, pies and homemade lunches from neighbor cooks — from FMR and YuMR to Gidrostroiteley.",
      body: [
        { p: ["Krasnodar is Russia's southern capital, a city people move to from all over the country, where the market overflows with tomatoes, greens and fruit year-round. The table here is generous and Kuban-hearty: rich borscht, heaps of vareniki, tray-sized pies and vegetables straight from the garden. Here's how to order real homemade food in Krasnodar — cooked by a neighbor in your own microdistrict, not 'homestyle' off a conveyor."] },
        { h: "How it works", p: ["On Celina, verified neighbor cooks do the cooking. Open the city page, see who cooks nearby — in Festivalny (FMR), Yubileyny (YuMR), the Komsomolsky microdistrict, on Gidrostroiteley or in Pashkovsky — pick dishes and order with delivery or pickup. The cook lives a couple of blocks away, so lunch doesn't crawl across the whole city in Krasnaya Street traffic: minutes between the stove and your table.", "Every cook passes identity verification, dishes list their ingredients, and payment is cash on receipt: first you see the order, then you pay. No commissions right now."] },
        { h: "What people order", p: ["Kuban home classics are what feed a family across generations: Kuban-style borscht with pampushki, vareniki with cherry, potato and curd, cabbage rolls, homemade cutlets with new potatoes. A special southern love is the preserves — homemade adjika, lecho, sun-dried and salted tomatoes that grow into half the winter table.", "In summer, at the peak of the southern season, cooks add okroshka, cold soups and mountains of fresh market vegetables; by autumn come the preserves and hearty soups. A neighbor's home cooking shifts with the season — as a real kitchen should. For many newcomers, such a meal is also a piece of home: the taste you miss after moving south."] },
        { h: "Where to start", p: ["Visit the 'Homemade food in Krasnodar' page, see the cooks nearby and order your first meal. If there are none in your district yet — leave a request, or tell the neighbor whose vareniki and adjika the whole stairwell knows about Celina. That's how it starts in your yard.", "And if you'd rather not dine alone — check the shared-table meetups: neighbor dinners happen in Krasnodar too."] },
      ],
    },
  },
  {
    slug: "domashnyaya-eda-v-rostove-na-donu",
    cover: "/images/dishes/ukha.jpg",
    date: "2026-07-28",
    readMin: 4,
    tags: ["ростов-на-дону", "дон", "домашняя еда", "доставка", "город"],
    links: [
      { to: "/eda/rostov-na-donu", label: "Домашняя еда в Ростове-на-Дону — страница города" },
      { to: "/blog/gde-zakazat-nastoyashchiy-borshch", label: "Где заказать настоящий борщ" },
      { to: "/dostavka", label: "Доставка домашней еды" },
      { to: "/obedy", label: "Домашние обеды с доставкой" },
    ],
    ru: {
      title: "Домашняя еда в Ростове-на-Дону: донской стол от соседей-поваров",
      excerpt:
        "Гид по домашней еде в Ростове-на-Дону: донская уха, вареники, раки по-ростовски и домашние обеды от соседей-поваров — от Западного и Нахичевани до Левенцовки.",
      body: [
        { p: ["Ростов-на-Дону — папа, город у большой реки, где к столу относятся всерьёз. Здесь Центральный рынок ломится от донских помидоров, зелени и фруктов, летом варят раков целыми вёдрами, а рыба с Дона — отдельная гордость. Стол получается щедрый, южный и с характером. Рассказываем, как в Ростове заказать настоящую домашнюю еду — не «домашнюю» с конвейера, а приготовленную соседом в вашем же районе."] },
        { h: "Как это работает", p: ["На Селине готовят проверенные соседи-повара. Откройте страницу города, посмотрите, кто готовит рядом — в Западном, на Северном, в центре у Старого базара, в Нахичевани, на Сельмаше или в Левенцовке, — выберите блюда и оформите заказ с доставкой или самовывозом. Повар живёт в паре кварталов, поэтому обед не едет через весь город в пробках по Большой Садовой: между плитой и вашим столом — минуты.", "Каждый повар проходит проверку личности по документам, у блюд открыт состав, а оплата — наличными при получении: сначала видите заказ, потом платите. Сейчас сервис не берёт комиссий."] },
        { h: "Что заказывают в Ростове", p: ["Донская домашняя классика — то, что кормит семью из поколения в поколение: наваристая уха из донской рыбы, вареники с картошкой, вишней и творогом, домашние котлеты с молодой картошкой, борщ на всю кастрюлю. В Нахичевани силён армянский след — долма, толма и выпечка от соседей с корнями со Старого Нахичевана. А летом на столе — раки по-ростовски, окрошка на квасе и горы свежих овощей с рынка.", "Отдельная южная любовь — заготовки: домашняя аджика, лечо, солёные и вяленые донские помидоры, из которых зимой вырастает половина стола. К осени у поваров идут закрутки и наваристые супы — домашняя еда от соседа меняется вместе с сезоном, как и должно быть на настоящей кухне."] },
        { h: "С чего начать", p: ["Загляните на страницу «Домашняя еда в Ростове-на-Дону», посмотрите поваров рядом и закажите первый обед. Если поваров в вашем районе пока нет — оставьте заявку или расскажите о Селине соседке, чью уху и вареники знает весь двор. С неё в вашем подъезде всё и начнётся.", "А если не хочется ужинать в одиночку — загляните во встречи за общим столом: соседские ужины проходят и в Ростове."] },
      ],
    },
    en: {
      title: "Homemade Food in Rostov-on-Don: a Don Table from Neighbor Cooks",
      excerpt:
        "A guide to home-cooked food in Rostov-on-Don: Don fish soup, vareniki, Rostov-style crayfish and homemade lunches from neighbor cooks — from Zapadny and Nakhichevan to Leventsovka.",
      body: [
        { p: ["Rostov-on-Don sits on a great river and takes its table seriously. The Central Market overflows with Don tomatoes, greens and fruit, in summer crayfish are boiled by the bucket, and Don river fish is a point of pride. The table comes out generous, southern and full of character. Here's how to order real homemade food in Rostov — cooked by a neighbor in your own district, not 'homestyle' off a conveyor."] },
        { h: "How it works", p: ["On Celina, verified neighbor cooks do the cooking. Open the city page, see who cooks nearby — in Zapadny, on Severny, in the centre by the Old Bazaar, in Nakhichevan, on Selmash or in Leventsovka — pick dishes and order with delivery or pickup. The cook lives a couple of blocks away, so lunch doesn't crawl across the city in Bolshaya Sadovaya traffic: minutes between the stove and your table.", "Every cook passes identity verification, dishes list their ingredients, and payment is cash on receipt: first you see the order, then you pay. No commissions right now."] },
        { h: "What people order", p: ["Don home classics are what feed a family across generations: rich Don fish soup, vareniki with potato, cherry and curd, homemade cutlets with new potatoes, big-pot borscht. In Nakhichevan the Armenian streak runs strong — dolma, tolma and baking from neighbors with Old Nakhichevan roots. And in summer the table means Rostov-style crayfish, kvass okroshka and mountains of fresh market vegetables.", "A special southern love is the preserves — homemade adjika, lecho, salted and sun-dried Don tomatoes that grow into half the winter table. By autumn cooks turn to preserves and hearty soups — a neighbor's home cooking shifts with the season, as a real kitchen should."] },
        { h: "Where to start", p: ["Visit the 'Homemade food in Rostov-on-Don' page, see the cooks nearby and order your first meal. If there are none in your district yet — leave a request, or tell the neighbor whose fish soup and vareniki the whole yard knows about Celina. That's how it starts in your stairwell.", "And if you'd rather not dine alone — check the shared-table meetups: neighbor dinners happen in Rostov too."] },
      ],
    },
  },
  {
    slug: "domashnyaya-eda-v-ufe",
    cover: "/images/pirozhki.jpg",
    date: "2026-07-30",
    readMin: 4,
    tags: ["уфа", "башкортостан", "домашняя еда", "доставка", "город"],
    links: [
      { to: "/eda/ufa", label: "Домашняя еда в Уфе — страница города" },
      { to: "/halal", label: "Халяльная домашняя еда на заказ" },
      { to: "/blog/tatarskaya-kuhnya-echpochmaki-chak-chak", label: "Эчпочмаки и чак-чак: татарская кухня" },
      { to: "/blog/domashnyaya-eda-v-chelyabinske", label: "Домашняя еда в Челябинске" },
      { to: "/blog/domashnyaya-eda-dlya-shkolnika", label: "Домашняя еда для школьника" },
      { to: "/dostavka", label: "Доставка домашней еды" },
      { to: "/obedy", label: "Домашние обеды с доставкой" },
    ],
    ru: {
      title: "Домашняя еда в Уфе: башкирский стол от соседей-поваров",
      excerpt:
        "Гид по домашней еде в Уфе: эчпочмаки, бишбармак, вак-беляши и домашние обеды от соседей-поваров — от Черниковки и Сипайлово до Дёмы и Зелёной рощи.",
      body: [
        { p: ["Уфа — город на высоком берегу Агидели, где за одним столом веками сходятся башкирская, татарская и русская кухни. Здесь в одном доме пекут эчпочмаки, в соседнем варят борщ, а к чаю везде подают что-нибудь медовое. Стол получается щедрый, тёплый и очень «домашний» — из тех, ради которых зовут в гости. Рассказываем, как в Уфе заказать настоящую домашнюю еду: не «домашнюю» с конвейера, а приготовленную соседом в вашем же районе."] },
        { h: "Как это работает", p: ["На Селине готовят проверенные соседи-повара. Откройте страницу города, посмотрите, кто готовит рядом — в Черниковке, Сипайлово, Инорсе, Зелёной роще, Дёме или Затоне, — выберите блюда и оформите заказ с доставкой или самовывозом. Повар живёт в паре кварталов, поэтому обед не тянется через весь город в пробках по проспекту Октября: между плитой и вашим столом — минуты.", "Каждый повар проходит проверку личности по документам, у блюд открыт состав, а оплата — наличными при получении: сначала видите заказ, потом платите. Сейчас сервис не берёт комиссий — вся сумма достаётся повару."] },
        { h: "Что заказывают в Уфе", p: ["Уфимская домашняя классика — та, что кормит семью из поколения в поколение: эчпочмаки с сочной начинкой из мяса и картошки, вак-беляши, кыстыбый с картофельным пюре, наваристый бишбармак с домашней лапшой, суп-лапша токмач. Рядом на столе — то, что готовят по всей стране: борщ на всю кастрюлю, пельмени, котлеты с молодой картошкой, блины к воскресному завтраку.", "К чаю в Уфе относятся отдельно и всерьёз: медовый чак-чак, баурсак, губадия к празднику, домашняя выпечка «просто так, потому что гости». Конец лета — как раз медовое время: к Медовому Спасу в середине августа башкирский мёд идёт нарасхват, и у поваров прибавляется медовой сладкой выпечки. А к осени стол теплеет — наваристые супы, бишбармак, пироги.", "Если для вас важно халяльное меню, просто спросите повара в чате до заказа: в Уфе многие готовят именно так, дома, как готовили в семье. Про аллергены и состав тоже можно спросить напрямую — вы общаетесь с человеком, а не с колл-центром."] },
        { h: "С чего начать", p: ["Загляните на страницу «Домашняя еда в Уфе», посмотрите поваров рядом и закажите первый обед. Если поваров в вашем районе пока нет — оставьте заявку или расскажите о Селине соседке, чьи эчпочмаки и чак-чак знает весь двор. С неё в вашем подъезде всё и начнётся.", "И если впереди сентябрь и школьные будни — договоритесь с поваром о домашних обедах на учебную неделю: у ребёнка будет горячий суп и котлета вместо булки из буфета, а у вас — на одну заботу меньше."] },
      ],
    },
    en: {
      title: "Homemade Food in Ufa: a Bashkir Table from Neighbor Cooks",
      excerpt:
        "A guide to home-cooked food in Ufa: echpochmak, beshbarmak, vak-belyash and homemade lunches from neighbor cooks — from Chernikovka and Sipaylovo to Dyoma and Zelyonaya Roshcha.",
      body: [
        { p: ["Ufa stands on the high bank of the Agidel, where Bashkir, Tatar and Russian cooking have shared one table for centuries. In one flat they bake echpochmak, next door they simmer borscht, and everywhere tea comes with something honeyed. The table turns out generous, warm and thoroughly home-made — the kind you invite people over for. Here's how to order real homemade food in Ufa: cooked by a neighbor in your own district, not 'homestyle' off a conveyor."] },
        { h: "How it works", p: ["On Celina, verified neighbor cooks do the cooking. Open the city page, see who cooks nearby — in Chernikovka, Sipaylovo, Inors, Zelyonaya Roshcha, Dyoma or Zaton — pick dishes and order with delivery or pickup. The cook lives a couple of blocks away, so lunch doesn't crawl across town in Prospekt Oktyabrya traffic: minutes between the stove and your table.", "Every cook passes identity verification, dishes list their ingredients, and payment is cash on receipt: first you see the order, then you pay. No commissions right now — the cook keeps the full amount."] },
        { h: "What people order in Ufa", p: ["Ufa's home classics are what feed a family across generations: echpochmak with juicy meat-and-potato filling, vak-belyash, kystyby with mashed potato, hearty beshbarmak with hand-rolled noodles, tokmach noodle soup. Alongside them sits what's cooked all over the country: big-pot borscht, pelmeni, cutlets with new potatoes, blini for a Sunday breakfast.", "Tea is taken seriously here: honey chak-chak, baursak, gubadiya for celebrations, home baking made 'just because there are guests'. Late summer is honey season — around the mid-August Honey Feast, Bashkir honey is in high demand and cooks turn out more honeyed sweets. By autumn the table warms up: rich soups, beshbarmak, pies.", "If halal matters to you, just ask the cook in the chat before ordering — many in Ufa cook exactly that way, at home, the way their family did. You can ask about ingredients and allergens directly too: you're talking to a person, not a call centre."] },
        { h: "Where to start", p: ["Visit the 'Homemade food in Ufa' page, see the cooks nearby and order your first meal. If there are none in your district yet — leave a request, or tell the neighbor whose echpochmak and chak-chak the whole yard knows about Celina. That's how it starts in your stairwell.", "And with September and school days ahead, arrange home-cooked lunches for the school week with a cook: your child gets hot soup and a cutlet instead of a canteen bun, and you have one worry less."] },
      ],
    },
  },
  {
    slug: "domashnyaya-eda-dlya-shkolnika",
    cover: "/images/dishes/kotlety.jpg",
    date: "2026-07-29",
    readMin: 5,
    tags: ["школа", "дети", "домашняя еда", "обеды", "1 сентября"],
    links: [
      { to: "/obedy", label: "Домашние обеды с доставкой" },
      { to: "/eda-na-nedelyu", label: "Готовая еда на неделю" },
      { to: "/pravilnoe-pitanie", label: "Правильное питание на заказ" },
      { to: "/blog/chto-prigotovit-na-obed", label: "Что приготовить на обед: идеи" },
      { to: "/", label: "Повара рядом с вами" },
    ],
    ru: {
      title: "Домашняя еда для школьника: чем кормить ребёнка, когда некогда готовить",
      excerpt:
        "Скоро 1 сентября. Как накормить ребёнка настоящей домашней едой — супом, котлетами, сырниками, — когда у родителей нет времени готовить: обеды от соседей-поваров с доставкой или самовывозом.",
      body: [
        { p: ["Конец лета — это не только тетради и новая форма, но и вечный родительский вопрос: чем кормить школьника, когда весь день расписан по минутам. С 1 сентября начинается режим — ранние подъёмы, уроки, кружки, — а времени встать к плите у работающих родителей часто просто нет. На Селине эту заботу можно разделить с соседом: домашнюю еду вашему ребёнку готовит проверенный повар из вашего же района — так, как готовил бы для своих детей."] },
        { h: "Почему школьнику важна домашняя еда", p: ["Растущему ребёнку нужен нормальный горячий обед, а не перекус всухомятку между уроками. Домашний суп, котлета с гарниром, запеканка, сырники к завтраку — это привычная, понятная еда без консервантов и усилителей вкуса: только то, что повар положил в кастрюлю сегодня. Мы не обещаем «правильных КБЖУ» и не заменяем врача-диетолога — это просто честная домашняя кухня, а не конвейер и не витрина супермаркета.", "Ещё один важный момент — знакомый вкус. Ребёнок охотнее ест то, что похоже на еду из дома: не «блюдо из меню на сто позиций», а суп и котлеты, приготовленные небольшой порцией именно для него."] },
        { h: "Что заказывают детям", p: ["Домашняя детская классика — то, что едят без уговоров: куриный суп с лапшой, котлеты или тефтели с картофельным пюре, творожная запеканка, сырники, домашние блины, ленивые вареники. Повар готовит небольшими порциями, поэтому легко попросить детский вариант: без острых специй, без лука, порцию поменьше, гарнир на пару вместо жареного.", "Если ребёнок привередлив в еде, это решается просто — разговором с человеком, а не «пожеланием в комментарии к заказу». Напишите повару в чат, расскажите, что ребёнок любит и чего не ест, и договоритесь о меню под него."] },
        { h: "Обед с собой и горячий обед после школы", p: ["Формат вы выбираете сами. Можно взять обед с собой в контейнере — домашняя котлета с гарниром или пирожок в школу вместо булки из буфета. А можно договориться, чтобы горячий обед был готов к возвращению ребёнка домой: пришёл с уроков — а на столе домашний суп, а не разогретые полуфабрикаты.", "Многие повара готовы готовить регулярно — обеды на учебную неделю по понятному расписанию. Обсудите с поваром дни, блюда и время: у вас появится свой человек, который кормит вашего ребёнка домашним, пока вы на работе."] },
        { h: "Безопасность и состав — что важно родителю", p: ["Каждый повар на Селине проходит проверку личности по документам и подтверждает соблюдение санитарных норм на своей кухне. У каждого блюда открыт состав, а про аллергены — орехи, молоко, глютен — можно спросить повара напрямую в чате до заказа. Это особенно важно, когда готовят для ребёнка.", "Оплата — наличными при получении: сначала вы получаете и видите заказ, потом платите. Никаких предоплат незнакомому человеку и подписок, которые забыли отменить. Сейчас сервис не берёт комиссий — вся сумма достаётся повару."] },
        { h: "Как начать к 1 сентября", p: ["Откройте Селину, выберите город и посмотрите, кто готовит рядом. Закажите пробный обед — убедитесь, что вкус ребёнку нравится. Понравилось — напишите повару и договоритесь о регулярности на учебную неделю: какие дни, какие блюда, к какому времени.", "Если поваров в вашем районе пока мало — загляните через пару дней или расскажите о Селине соседке, чьи сырники и котлеты знает весь двор. С неё в вашем подъезде всё и начнётся — и к сентябрю у вашего школьника будет свой домашний обед."] },
      ],
    },
    en: {
      title: "Homemade Food for a Schoolchild: Feeding Your Kid When There's No Time to Cook",
      excerpt:
        "September 1st is near. How to feed your child real home cooking — soup, cutlets, syrniki — when parents have no time to cook: meals from neighbor cooks by delivery or pickup.",
      body: [
        { p: ["Late summer means not only notebooks and a new uniform, but also the eternal parental question: what to feed a schoolchild when the whole day is planned to the minute. From September 1st the routine kicks in — early mornings, lessons, clubs — and working parents often simply have no time to stand at the stove. On Celina you can share this care with a neighbor: a verified cook from your own district cooks home food for your child, the way they'd cook for their own kids."] },
        { h: "Why home cooking matters for a schoolchild", p: ["A growing child needs a proper hot lunch, not a dry snack between lessons. Homemade soup, a cutlet with a side, a casserole, syrniki for breakfast — familiar, honest food without preservatives or flavor enhancers: only what the cook put in the pot today. We don't promise 'correct macros' and don't replace a dietitian — it's simply honest home cooking, not a conveyor belt or a supermarket counter.", "Another key thing is a familiar taste. A child eats more willingly what resembles food from home: not a 'dish from a hundred-item menu', but soup and cutlets cooked in a small batch just for them."] },
        { h: "What people order for kids", p: ["Home comfort classics kids eat without coaxing: chicken noodle soup, cutlets or meatballs with mashed potatoes, curd casserole, syrniki, homemade blini, lazy vareniki. The cook makes small batches, so it's easy to ask for a child's version: no hot spices, no onion, a smaller portion, steamed sides instead of fried.", "If your child is a picky eater, it's solved simply — by talking to a person, not by a 'note to the order'. Message the cook, tell them what your child likes and won't eat, and agree on a menu built around them."] },
        { h: "A packed lunch or a hot meal after school", p: ["You choose the format. Take lunch in a container — a homemade cutlet with a side or a pirozhok for school instead of a canteen bun. Or arrange for a hot meal ready by the time your child gets home: back from lessons, and there's home soup on the table, not reheated convenience food.", "Many cooks are happy to cook regularly — lunches for the school week on a clear schedule. Discuss the days, dishes and timing with the cook: you get your own person feeding your child home food while you're at work."] },
        { h: "Safety and ingredients — what matters to a parent", p: ["Every cook on Celina passes identity verification with documents and confirms sanitary compliance in their kitchen. Every dish lists its ingredients, and you can ask the cook directly in the chat about allergens — nuts, milk, gluten — before ordering. That matters especially when cooking for a child.", "Payment is cash on receipt: first you get and see the order, then you pay. No prepayments to a stranger and no subscriptions you forgot to cancel. Right now the service charges no commission — the cook keeps the full amount."] },
        { h: "How to start before September 1st", p: ["Open Celina, pick your city and see who cooks nearby. Order a trial lunch — make sure your child likes the taste. If they do, message the cook and agree on regularity for the school week: which days, which dishes, by what time.", "Few cooks in your area yet? Check back soon or tell the neighbor whose syrniki and cutlets the whole yard knows about Celina. That's how it starts in your stairwell — and by September your schoolchild will have their own home-cooked lunch."] },
      ],
    },
  },
  {
    slug: "gotovaya-eda-na-nedelyu",
    cover: "/images/syrniki.jpg",
    date: "2026-07-22",
    readMin: 5,
    tags: ["готовая еда", "еда на неделю", "обеды", "домашняя еда"],
    links: [
      { to: "/eda-na-nedelyu", label: "Заказать готовую еду на неделю" },
      { to: "/obedy", label: "Домашние обеды с доставкой" },
      { to: "/blog/chto-prigotovit-na-obed", label: "Что приготовить на обед: 15 идей" },
      { to: "/blog/skolko-stoit-domashnyaya-eda", label: "Сколько стоит домашняя еда" },
      { to: "/", label: "Повара рядом с вами" },
    ],
    ru: {
      title: "Готовая еда на неделю: как перестать готовить и не разориться",
      excerpt:
        "Рационы, кулинария супермаркета или сосед-повар? Честное сравнение способов есть готовое всю неделю — по цене, составу и вкусу.",
      body: [
        { p: ["Готовая еда на неделю — мечта занятого человека: открыл холодильник, разогрел, поел. Способов добиться этого три: подписочные рационы, кулинария супермаркета и домашний повар по соседству. Сравниваем честно — по цене, составу и вкусу."] },
        { h: "Рационы по подписке: удобно, но конвейер", p: ["Сервисы готовых рационов привозят контейнеры на неделю вперёд. Плюсы: посчитаны калории, ничего решать не надо. Минусы: цена ощутимо выше домашней, вкус «столовский» — еда готовится на производстве за сутки-двое до вас, а меню повторяется через пару недель.", "Главное: это еда без человека. Никто не готовил её именно вам — и это чувствуется."] },
        { h: "Кулинария супермаркета: быстро, но с составом на полстраницы", p: ["Готовая еда из магазина выручает вечером, но у неё два хронических недостатка: консерванты и время на витрине. Салат, заправленный утром, к вечеру — уже другой салат. Про котлеты, которые жарились неизвестно когда, и говорить нечего."] },
        { h: "Сосед-повар: домашняя еда по расписанию", p: ["Третий способ — договориться с домашним поваром рядом: он готовит вам обеды на несколько дней или собирает набор на неделю. Получается настоящая домашняя еда — борщ «на кастрюлю», котлеты, гарниры — приготовленная сегодня, из продуктов, которые повар выбрал сам.", "На Селине это устроено просто: напишите повару в чат, обсудите меню, дни и объём — и у вас появится свой человек, который кормит вас всю неделю. Оплата наличными при получении, сейчас — без комиссий, поэтому по цене это обычно дешевле рационов при заметно лучшем составе.", "Бонус, которого нет ни у рационов, ни у супермаркета: меню подстраивается под вас. Без лука? Поострее? Ребёнку без специй? Это просто разговор с человеком, а не «пожелания в комментарии к заказу»."] },
        { h: "Как собрать свою «неделю» на Селине", p: ["1. Откройте ленту и найдите 1–2 поваров рядом с подходящим меню. 2. Закажите пробный обед — убедитесь, что вкус ваш. 3. Напишите повару и договоритесь о регулярности: какие дни, какие блюда, к какому времени. 4. Живите неделю, не думая, что на обед.", "Если в вашем районе поваров пока мало — загляните через пару дней или позовите готовящих соседей присоединиться."] },
      ],
    },
    en: {
      title: "Ready Meals for the Week: How to Stop Cooking Without Going Broke",
      excerpt:
        "Subscription meal plans, supermarket deli or a neighbor cook? An honest comparison of eating ready food all week — by price, ingredients and taste.",
      body: [
        { p: ["Ready food for the whole week is the busy person's dream: open the fridge, reheat, eat. There are three ways to get there: subscription meal plans, the supermarket deli, and a home cook nearby. An honest comparison — price, ingredients, taste."] },
        { h: "Subscription plans: convenient, but conveyor-belt", p: ["Meal-plan services deliver containers a week ahead. Pros: calories counted, nothing to decide. Cons: noticeably pricier than home food, canteen-like taste — cooked at a facility a day or two before you, with menus repeating every couple of weeks.", "The main thing: it's food without a person. Nobody cooked it for you specifically — and you can taste that."] },
        { h: "Supermarket deli: fast, but check the label", p: ["Store-bought ready food saves an evening, but has two chronic flaws: preservatives and counter time. A salad dressed in the morning is a different salad by evening."] },
        { h: "A neighbor cook: home food on schedule", p: ["The third way — arrange with a home cook nearby: they cook your lunches for several days or assemble a weekly set. You get real home food — big-pot borscht, cutlets, sides — cooked today, from ingredients the cook picked themselves.", "On Celina it's simple: message the cook, agree on the menu, days and volume — and you have your own person feeding you all week. Cash on receipt, no commissions right now, so it usually costs less than meal plans with noticeably better ingredients.", "A bonus neither plans nor the supermarket have: the menu adapts to you. No onions? Spicier? Mild for the kid? It's a conversation with a person, not a 'note to the order'."] },
        { h: "How to build your week on Celina", p: ["1. Open the feed and find 1–2 cooks nearby with a menu you like. 2. Order a trial lunch — make sure the taste is yours. 3. Message the cook and agree on regularity: which days, which dishes, by what time. 4. Live a week without thinking about lunch.", "Few cooks in your area yet? Check back soon or invite neighbors who cook to join."] },
      ],
    },
  },
  {
    slug: "novogodniy-stol-menyu",
    cover: "/images/olivier-salad.jpg",
    date: "2026-07-23",
    readMin: 7,
    tags: ["новый год", "новогодний стол", "меню", "праздник", "домашняя еда"],
    links: [
      { to: "/gatherings", label: "Соседские застолья" },
      { to: "/vstrechi", label: "С кем встретить праздник: встречи с соседями" },
      { to: "/obedy", label: "Домашние обеды с доставкой" },
      { to: "/blog/menyu-na-den-rozhdeniya-bez-gotovki", label: "Праздничное меню без готовки" },
    ],
    ru: {
      title: "Новогодний стол 2027: полное меню — и как его не готовить самому",
      excerpt:
        "Классика, которую ждут: оливье, селёдка под шубой, горячее и пироги. Полный план новогоднего стола — с тайм-лайном готовки и честным планом Б.",
      body: [
        { p: ["Новогодний стол — главный ужин года и главный марафон года: три дня закупок, два дня у плиты, и всё равно в полночь хозяйка без сил. Вот полное меню классического новогоднего стола, тайм-лайн, который спасает силы, — и план Б для тех, кто в этом году решил праздник ПРАЗДНОВАТЬ."] },
        { h: "Холодные закуски: без них Новый год не начинается", p: ["Оливье — без него стола не существует: спорят только о колбасе против курицы и о том, чья бабушка делала правильнее. Селёдка под шубой — второй обязательный пункт. Дальше — холодец с горчицей, мясная и сырная тарелки, домашние соленья.", "Секрет: почти все закуски готовятся 30-го числа и ночуют в холодильнике. 31-го их останется только достать — оливье за ночь даже вкуснее."] },
        { h: "Горячее: одно, но безупречное", p: ["Ошибка новогоднего стола — три горячих блюда, которые никто не доедает. Правильный ход — одно, но парадное: запечённая утка с яблоками, буженина, курица в духовке с картошкой или рыба целиком. Ставите в духовку в девять вечера — к одиннадцати дом пахнет праздником."] },
        { h: "Пироги и десерт", p: ["Домашняя выпечка делает стол тёплым: пирожки к холодцу, большой пирог с капустой или мясом, а к чаю после полуночи — «Наполеон» или медовик. Их тоже пекут заранее: торту вообще нужна ночь на пропитку."] },
        { h: "Тайм-лайн, который спасает праздник", p: ["29 декабря — закупка. 30-е — салаты, холодец, торт, тесто. 31-е утром — выпечка; днём — горячее в духовку; в 22:00 — накрыть стол; в 23:00 — сесть красивой и отдохнувшей. Главное правило: всё, что можно сделать заранее, делается заранее."] },
        { h: "План Б: новогодний стол, который готовит соседка", p: ["А теперь честно: можно встретить Новый год без марафона вообще. На Селине домашние повара принимают праздничные заказы: тот же оливье, тот же холодец, та же утка — приготовленные руками, а не цехом, в паре кварталов от вас. Закажите заранее, заберите 31-го — и весь день ваш.", "Это не «доставка из ресторана»: готовит сосед с именем и отзывами, оплата наличными при получении, а сейчас сервис не берёт комиссий. Праздничный стол от человека — это и есть новогоднее чудо, просто по-соседски.", "И если встречать не с кем — загляните в соседские застолья: в новогодние дни соседи накрывают общие столы. Иногда лучший Новый год — за столом, где тебя ждали."] },
      ],
    },
    en: {
      title: "Russian New Year's Table 2027: the Full Menu — and How to Skip Cooking It",
      excerpt:
        "The classics everyone waits for: olivier, herring under fur coat, a festive main and pies. The full plan with a timeline — and an honest plan B.",
      body: [
        { p: ["The New Year's table is Russia's main dinner of the year — and its main marathon: three days of shopping, two days at the stove. Here's the full classic menu, a sanity-saving timeline, and a plan B for those who decided to actually celebrate this year."] },
        { h: "Cold starters: the New Year doesn't start without them", p: ["Olivier — the table doesn't exist without it. Herring under a fur coat is the second must. Then kholodets with mustard, meat and cheese boards, homemade pickles.", "The secret: almost all starters are made on the 30th and spend the night in the fridge — olivier is even better the next day."] },
        { h: "The main: one, but flawless", p: ["The classic mistake is three mains nobody finishes. The right move is one showpiece: duck baked with apples, buzhenina, oven chicken with potatoes, or a whole fish. Into the oven at nine — by eleven the house smells like celebration."] },
        { h: "Pies and dessert", p: ["Home baking makes the table warm: pirozhki, a big cabbage or meat pie, and Napoleon or honey cake for after-midnight tea. Baked in advance too — the cake needs a night to soak anyway."] },
        { h: "The timeline that saves the holiday", p: ["Dec 29 — shopping. Dec 30 — salads, kholodets, cake. Dec 31 morning — baking; afternoon — the main into the oven; 22:00 — set the table; 23:00 — sit down rested. The rule: everything that can be done ahead, is done ahead."] },
        { h: "Plan B: a New Year's table cooked by your neighbor", p: ["Honestly — you can skip the marathon entirely. On Celina, home cooks take holiday orders: the same olivier, kholodets and duck — made by hand a couple of blocks away. Order ahead, pick up on the 31st, and the day is yours.", "It's not restaurant delivery: a neighbor with a name and reviews cooks it, you pay cash on receipt, no commissions right now.", "And if you have no one to celebrate with — check the neighbor gatherings: on New Year's days neighbors set shared tables. Sometimes the best New Year is at a table where you were expected."] },
      ],
    },
  },
  {
    slug: "chto-poest-s-pohmelya",
    cover: "/images/borscht.jpg",
    date: "2026-07-23",
    readMin: 4,
    tags: ["похмелье", "что поесть", "суп", "доставка"],
    links: [
      { to: "/obedy", label: "Домашние обеды с доставкой" },
      { to: "/dostavka", label: "Доставка домашней еды" },
      { to: "/", label: "Повара рядом с вами" },
    ],
    ru: {
      title: "Что поесть с похмелья: меню спасения, которое можно не готовить",
      excerpt:
        "Наваристый суп, солёное, кисломолочное и много жидкости — вот что реально помогает. Полный список и способ получить всё это, не вставая с дивана.",
      body: [
        { p: ["С похмелья организму нужны три вещи: жидкость, соль и горячий наваристый бульон. Лучшая еда — куриный суп или борщ, рассольник, солянка, кисломолочное и минералка. Разбираем, что работает и почему — и как получить тарелку спасения, не подходя к плите."] },
        { h: "Почему суп — главное лекарство", p: ["Горячий бульон возвращает жидкость и электролиты одновременно — именно их не хватает после вечера. Куриный суп с лапшой, наваристый борщ со сметаной, рассольник или солянка — классика не случайна: солёная основа восполняет натрий, тёплое успокаивает желудок, а сам процесс возвращает веру в жизнь.", "Важно: суп должен быть настоящим, сваренным на кости, а не растворённым из пакетика. Разница в действии — как между лекарством и плацебо."] },
        { h: "Что ещё помогает", p: ["Кисломолочное — кефир, айран, тан: восстанавливают желудок и микрофлору. Солёные огурцы и квашеная капуста — быстрый натрий (рассол работает, это не миф). Яичница или омлет — цистеин помогает печени. Углеводы — хлеб, каша, картошка — возвращают энергию. И вода, много воды, лучше минеральной.", "Чего избегать: жирный фастфуд (добьёт желудок), кофе натощак (обезвоживает ещё сильнее) и «клин клином» — это путь по кругу."] },
        { h: "Как получить всё это, не вставая с дивана", p: ["Готовить суп с похмелья — задача из области фантастики. Хорошая новость: у соседей-поваров на Селине суп уже сварен — настоящий, домашний, на кости. Откройте ленту, выберите повара рядом, закажите борщ или куриный суп с доставкой до двери — и через минуты у вас тарелка спасения, приготовленная человеком, который варил её как для своих.", "Оплата наличными при получении, без предоплат и комиссий. Голова пройдёт — а хорошего повара по соседству вы уже будете знать."] },
      ],
    },
    en: {
      title: "What to Eat When Hungover: a Rescue Menu You Don't Have to Cook",
      excerpt:
        "Rich broth, something salty, fermented dairy and lots of fluids — what actually works, and how to get it delivered to your couch.",
      body: [
        { p: ["A hungover body needs three things: fluids, salt and hot rich broth. The best food is chicken soup or borscht, rassolnik, solyanka, fermented dairy and mineral water. Here's what works, why — and how to get a plate of salvation without touching the stove."] },
        { h: "Why soup is the main medicine", p: ["Hot broth restores fluids and electrolytes at once — exactly what's missing. Chicken noodle soup, rich borscht with smetana, rassolnik or solyanka: the salty base replenishes sodium, the warmth calms the stomach. It must be real soup cooked on bones, not powder from a packet."] },
        { h: "What else helps", p: ["Fermented dairy — kefir, ayran. Pickles and sauerkraut — fast sodium (brine works; not a myth). Eggs — cysteine helps the liver. Carbs and lots of water. Avoid greasy fast food, coffee on an empty stomach, and 'hair of the dog'."] },
        { h: "How to get it without leaving the couch", p: ["Cooking soup while hungover is science fiction. Good news: neighbor cooks on Celina already made it — real, homemade, on the bone. Order borscht or chicken soup to your door, pay cash on receipt. Your head will clear — and you'll know a good cook nearby forever."] },
      ],
    },
  },
  {
    slug: "kak-poznakomitsya-s-sosedyami",
    cover: "/images/pirozhki.jpg",
    date: "2026-07-23",
    readMin: 5,
    tags: ["соседи", "знакомство", "застолья", "сообщество"],
    links: [
      { to: "/vstrechi", label: "С кем поужинать: встречи с соседями" },
      { to: "/gatherings", label: "Соседские застолья" },
      { to: "/blog/zastolye-s-sosedyami-kak-organizovat", label: "Как организовать застолье" },
      { to: "/", label: "Повара рядом с вами" },
    ],
    ru: {
      title: "Как познакомиться с соседями: 7 способов, которые не выглядят странно",
      excerpt:
        "Мы годами живём стенка в стенку с людьми, чьих имён не знаем. Семь естественных поводов познакомиться — от лифта до общего стола.",
      body: [
        { p: ["Самый простой способ познакомиться с соседями — общий повод: еда, помощь или общее дело. Психологи называют это «средой без давления»: когда есть предлог, знакомство происходит само. Вот семь работающих способов — от банальных до самого вкусного."] },
        { h: "Семь естественных поводов", p: ["1. Здоровайтесь в лифте — банально, но через месяц вы «свой». 2. Попросите о мелкой помощи: соль, дрель, совет — просьба сближает сильнее одолжения. 3. Заведите собаку или гуляйте с чужой — собачники знают всех. 4. Субботник или чат дома — общее дело даёт тему. 5. Угостите выпечкой после переезда — работает сто лет. 6. Детская площадка — родители знакомятся сами. 7. Общий стол — самый быстрый и человеческий способ, о нём подробнее."] },
        { h: "Почему еда работает лучше всего", p: ["За общим столом статусы исчезают: неважно, кто вы по профессии, — важно, что борщ горячий и разговор живой. Совместная еда — древнейший ритуал доверия: с человеком, с которым вы ели, психологически невозможно оставаться чужим.", "Именно поэтому соседские застолья возвращаются в города: люди устали жить среди незнакомцев."] },
        { h: "Где найти общий стол рядом с домом", p: ["На Селине соседи собираются за настоящими столами: кто-то устраивает ужин с борщом, кто-то грузинский вечер, кто-то чаепитие. Хозяин проходит проверку личности, у встреч открытые страницы и отзывы — вы всегда знаете, к кому идёте. Забронируйте место на ближайшей встрече — или накройте стол сами и станьте тем соседом, которого знает весь дом.", "А начать можно ещё проще: закажите домашнюю еду у повара из соседнего подъезда. Одна тарелка борща — и у вас уже есть знакомый сосед, который готовит."] },
      ],
    },
    en: {
      title: "How to Meet Your Neighbors: 7 Ways That Don't Feel Awkward",
      excerpt:
        "We live wall-to-wall with people whose names we don't know. Seven natural ways to change that — from the elevator to a shared table.",
      body: [
        { p: ["The easiest way to meet neighbors is a shared excuse: food, a favor, or a common cause. With a pretext, the acquaintance happens by itself. Seven ways that work — ending with the tastiest one."] },
        { h: "Seven natural excuses", p: ["1. Say hi in the elevator. 2. Ask for small help — salt, a drill: asking bonds more than lending. 3. Walk a dog — dog people know everyone. 4. Building chat or yard cleanup. 5. Bring pastry after moving in — works for a century. 6. The playground — parents meet automatically. 7. A shared table — the fastest and most human way."] },
        { h: "Why food works best", p: ["At a shared table, statuses disappear — what matters is that the borscht is hot and the talk is alive. Eating together is the oldest trust ritual: you can't stay strangers with someone you've shared a meal with."] },
        { h: "Where to find a shared table nearby", p: ["On Celina neighbors gather at real tables: a borscht dinner, a Georgian evening, a tea party. Hosts pass identity verification; meetups have open pages and reviews. Book a seat — or set your own table and become the neighbor the whole building knows. Or start simpler: order home food from the cook next door. One plate of borscht — and you already know a neighbor who cooks."] },
      ],
    },
  },
  {
    slug: "gde-zakazat-nastoyashchiy-borshch",
    cover: "/images/borscht.jpg",
    date: "2026-07-23",
    readMin: 4,
    tags: ["борщ", "заказать", "домашняя еда", "доставка"],
    links: [
      { to: "/dostavka", label: "Доставка домашней еды" },
      { to: "/obedy", label: "Домашние обеды с доставкой" },
      { to: "/zagotovki", label: "Квашеная капуста и соленья на заказ" },
      { to: "/blog/chto-poest-s-pohmelya", label: "Что поесть с похмелья" },
      { to: "/", label: "Повара рядом с вами" },
    ],
    ru: {
      title: "Где заказать настоящий домашний борщ: не ресторанный, а как у мамы",
      excerpt:
        "Настоящий борщ варится три часа на кости и настаивается ночь — ресторанная кухня так не работает. Где найти тот самый борщ с доставкой.",
      body: [
        { p: ["Настоящий домашний борщ можно заказать у домашнего повара по соседству: на Селине его варят так, как варят для своей семьи — на костном бульоне, с ночным настаиванием. Ресторан и агрегатор такого не привезут — и вот почему."] },
        { h: "Почему ресторанный борщ — не тот", p: ["Настоящий борщ — это три часа: костный бульон, овощи, которые тушатся отдельно, свёкла, добавленная в правильный момент, и — главный секрет — ночь в холодильнике, после которой вкусы женятся. Ресторанная кухня работает потоком: бульон из концентрата, всё в одну кастрюлю, подача через 20 минут после заказа. Получается суп со свёклой, но не борщ.", "Дома борщ варит человек, который будет есть его сам — и это меняет всё: от качества мяса до количества чеснока в заправке."] },
        { h: "Как заказать борщ у соседки", p: ["Откройте Селину, выберите город и найдите повара рядом, у которого борщ в меню — с фото, составом и отзывами соседей. Закажите с доставкой до двери или заберите сами — часто повар живёт в паре минут, и борщ доедет горячим, со сметаной и, если повезёт, с пампушками.", "Оплата наличными при получении: сначала видите и нюхаете — потом платите. Сейчас сервис не берёт комиссий, так что цена честная: обычно как бизнес-ланч, только это настоящий борщ на два дня."] },
        { h: "Сколько стоит домашний борщ на заказ?", p: ["Цену задаёт повар; порция или литровая банка домашнего борща обычно стоит как суп в кафе — при несравнимом качестве. Многие повара варят «на кастрюлю»: берёте банку на семью, и обед на два дня решён."] },
      ],
    },
    en: {
      title: "Where to Order Real Homemade Borscht — Not the Restaurant Kind",
      excerpt:
        "Real borscht takes three hours on the bone and a night to rest — restaurant kitchens don't work that way. Where to find the real thing delivered.",
      body: [
        { p: ["Real homemade borscht can be ordered from a home cook nearby: on Celina it's cooked the way it's cooked for family — bone broth, overnight rest. A restaurant can't deliver that — here's why."] },
        { h: "Why restaurant borscht isn't it", p: ["Real borscht is three hours: bone broth, vegetables stewed separately, beets added at the right moment, and — the main secret — a night in the fridge where the flavors marry. Restaurant lines work in flow: concentrate broth, everything in one pot, served in 20 minutes. That's beet soup, not borscht."] },
        { h: "How to order from a neighbor", p: ["Open Celina, find a cook nearby with borscht on the menu — photo, ingredients, neighbors' reviews. Delivery to your door or pickup minutes away, hot, with smetana. Cash on receipt: see it, smell it, then pay. No commissions right now — usually the price of a café lunch, but it's real borscht for two days."] },
      ],
    },
  },
  {
    slug: "uzhin-na-dvoih-doma",
    cover: "/images/khachapuri.jpg",
    date: "2026-07-23",
    readMin: 4,
    tags: ["ужин на двоих", "свидание", "романтика", "домашняя еда"],
    links: [
      { to: "/obedy", label: "Домашние обеды с доставкой" },
      { to: "/blog/chto-prigotovit-na-uzhin", label: "Что приготовить на ужин: 20 идей" },
      { to: "/dostavka", label: "Доставка домашней еды" },
    ],
    ru: {
      title: "Ужин на двоих дома: романтика без плиты и без ресторанных цен",
      excerpt:
        "Лучший ужин на двоих — дома: свои свечи, своя музыка и никого вокруг. Как накрыть красивый стол, не проведя вечер у плиты.",
      body: [
        { p: ["Идеальный ужин на двоих дома — это горячее, которое не стыдно поставить в центр стола, пара закусок и десерт. Приготовить всё это после работы — значит встретить вечер уставшим. Есть способ лучше: заказать домашнее у соседа-повара и потратить вечер друг на друга."] },
        { h: "Почему дома лучше ресторана", p: ["В ресторане — счёт с тремя нулями, столик на 19:30 и соседи в полуметре. Дома — свои свечи, своя музыка, свой темп и диван после ужина. Единственный минус домашнего свидания — кто-то должен готовить. Именно его мы и убираем."] },
        { h: "Меню ужина на двоих, которое работает", p: ["Горячее-звезда: хачапури по-аджарски (его разламывают вдвоём — уже ритуал), утка с яблоками или паста. Закуски: сырная тарелка, домашние соленья, тёплые пирожки. Десерт: медовик или наполеон от домашней мастерицы — такого в кофейне нет. Всё это готовят повара Селины в вашем же районе.", "Закажите к нужному часу: повар приготовит так, чтобы горячее приехало горячим. Останется зажечь свечи."] },
        { h: "Во сколько обойдётся домашний ужин на двоих?", p: ["Обычно — в треть ресторанного счёта: вы платите за еду, а не за аренду зала и наценку. Оплата наличными при получении, сейчас без комиссий. А если хочется ужина в компании — загляните на соседские застолья: иногда лучшее свидание — это стол, где смеются шестеро."] },
      ],
    },
    en: {
      title: "Dinner for Two at Home: Romance Without the Stove or Restaurant Prices",
      excerpt:
        "The best date dinner is at home: your candles, your music, nobody around. How to set a beautiful table without spending the evening cooking.",
      body: [
        { p: ["The perfect dinner for two at home is one showpiece hot dish, a couple of starters and a dessert. Cooking it all after work means meeting the evening exhausted. The better way: order homemade from a neighbor cook and spend the evening on each other."] },
        { h: "Why home beats a restaurant", p: ["A restaurant means a three-digit bill, a 7:30 slot and strangers half a meter away. Home means your candles, your pace, and a couch after dinner. The only downside is that someone has to cook — that's the part we remove."] },
        { h: "A menu that works", p: ["The star: Adjarian khachapuri (you break it together — a ritual), duck with apples, or pasta. Starters: cheese board, homemade pickles, warm pirozhki. Dessert: honey cake from a home master. All cooked by Celina cooks in your district, timed so the hot dish arrives hot. You just light the candles.", "It usually costs a third of a restaurant bill: you pay for food, not for the room. Cash on receipt, no commissions right now."] },
      ],
    },
  },
  {
    slug: "domashniy-zavtrak-s-dostavkoy",
    cover: "/images/syrniki.jpg",
    date: "2026-07-23",
    readMin: 4,
    tags: ["завтрак", "сырники", "блины", "доставка"],
    links: [
      { to: "/dostavka", label: "Доставка домашней еды" },
      { to: "/obedy", label: "Домашние обеды с доставкой" },
      { to: "/blog/domashnyaya-vypechka-na-zakaz", label: "Домашняя выпечка на заказ" },
    ],
    ru: {
      title: "Домашний завтрак с доставкой: сырники, блины и каша как в детстве",
      excerpt:
        "Сырники со сметаной, стопка блинов, тёплая каша — завтрак, ради которого хочется просыпаться. Как получить его к утру, не вставая к плите.",
      body: [
        { p: ["Домашний завтрак с доставкой — это сырники, блины, каши и запеканки от домашних поваров по соседству: закажите с вечера, и к утру у двери будет завтрак как в детстве. Вот как это устроено и что заказывать."] },
        { h: "Что заказать на завтрак", p: ["Сырники — короли утра: пышные, со сметаной или сгущёнкой, от домашней мастерицы они другие в принципе. Блины — стопкой, с маслом, с начинками. Каши — та самая манная без комочков или овсяная на молоке. Запеканка творожная, ватрушки к кофе, домашний хлеб. У поваров Селины всё это — не позиции меню, а семейные рецепты.", "Совет: закажите с вечера на утро — повар приготовит к согласованному часу, и завтрак приедет тёплым."] },
        { h: "Чем домашний завтрак лучше кофейни", p: ["В кофейне сырники жарились неизвестно когда и разогреты в микроволновке. У соседки они сняты со сковороды за десять минут до вас. Плюс цена: домашний завтрак обычно дешевле сет-меню кофейни — сейчас Селина не берёт комиссий, вся сумма повару.", "И главное — воскресный завтрак без готовки: семья спит, а вы уже накрыли стол сырниками, за которые обычно платят любовью."] },
        { h: "Как заказать завтрак к утру?", p: ["Откройте ленту, найдите повара рядом с выпечкой и завтраками в меню, выберите время доставки на утро — и оформите. Оплата наличными при получении. Один такой завтрак — и подписка на «своего» повара по субботам оформится сама собой."] },
      ],
    },
    en: {
      title: "Homemade Breakfast Delivered: Syrniki, Blini and Porridge Like Childhood",
      excerpt:
        "Fluffy syrniki with smetana, a stack of blini, warm porridge — a breakfast worth waking up for. How to get it by morning without touching the stove.",
      body: [
        { p: ["Homemade breakfast delivery means syrniki, blini, porridges and casseroles from home cooks nearby: order in the evening, and by morning breakfast like childhood is at your door."] },
        { h: "What to order", p: ["Syrniki — kings of the morning, fluffy, with smetana. Blini in a stack. The very semolina porridge without lumps. Cottage-cheese casserole, vatrushki for coffee. For Celina cooks these aren't menu items — they're family recipes. Order the night before for a set morning hour, and it arrives warm."] },
        { h: "Why it beats the café", p: ["Café syrniki were fried who-knows-when and microwaved. Your neighbor's came off the pan ten minutes before you. Usually cheaper than a café set too — no commissions right now. And the best part: Sunday breakfast without cooking, while the family still sleeps."] },
      ],
    },
  },
  {
    slug: "gotovit-ili-zakazyvat-chto-deshevle",
    cover: "/images/pelmeni.jpg",
    date: "2026-07-23",
    readMin: 5,
    tags: ["сравнение", "цены", "экономия", "домашняя еда"],
    links: [
      { to: "/blog/skolko-stoit-domashnyaya-eda", label: "Сколько стоит домашняя еда" },
      { to: "/obedy", label: "Домашние обеды с доставкой" },
      { to: "/blog/gotovaya-eda-na-nedelyu", label: "Готовая еда на неделю" },
    ],
    ru: {
      title: "Готовить самому или заказывать: честная математика домашней еды",
      excerpt:
        "Считаем по-настоящему: продукты, время у плиты, мытьё посуды — против цены готового домашнего обеда от соседа. Результат удивляет.",
      body: [
        { p: ["Короткий ответ: готовить самому дешевле деньгами, но дороже временем — два-три часа в день у плиты стоят больше, чем разница в цене. Домашняя еда от соседа-повара — золотая середина: домашнее качество по цене, близкой к себестоимости продуктов. Считаем честно."] },
        { h: "Сколько стоит готовить самому", p: ["Продукты на обед из супа и второго на семью — заметная сумма, но главное не это. Добавьте время: закупка, готовка, мытьё — 2–3 часа в день. Умножьте на месяц — получится полноценная рабочая неделя, проведённая у плиты. Если ваш час чего-то стоит, «бесплатная» домашняя готовка — самая дорогая еда в вашей жизни.", "Ещё честнее: посчитайте выброшенное — увядшую зелень, прокисший суп, который не успели доесть. До трети продуктов уходит в мусор."] },
        { h: "Сколько стоит заказывать", p: ["Ресторанная доставка — дорого каждый день: наценка, упаковка, сервис. Рационы по подписке — дешевле ресторана, но конвейер. А домашний обед от соседа-повара обычно стоит как бизнес-ланч: повар готовит «на кастрюлю» и без аренды, персонала и маркетинга в цене — вы платите за продукты и руки.", "Сейчас Селина не берёт комиссий — вся сумма повару, поэтому цены человеческие. А заказ «на кастрюлю» — банка борща, лоток котлет — растягивается на два-три дня и бьёт по цене даже собственную готовку, если честно считать время."] },
        { h: "Итог: когда что выбирать", p: ["Любите готовить и есть время — готовьте, это лучшая медитация. Нет времени, но есть деньги — рестораны. А если хочется домашнего вкуса без потерянных вечеров — закажите у соседа: откройте ленту, посмотрите, кто готовит рядом, и сравните цены сами. Оплата наличными при получении — попробовать ничего не стоит."] },
      ],
    },
    en: {
      title: "Cook or Order: the Honest Math of Home Food",
      excerpt:
        "Groceries, stove hours, dishes — versus the price of a ready homemade lunch from a neighbor. The result is surprising.",
      body: [
        { p: ["Short answer: cooking yourself is cheaper in money but more expensive in time — 2–3 daily stove hours cost more than the price difference. A neighbor cook is the golden middle: home quality at near-grocery prices."] },
        { h: "The real cost of cooking", p: ["Groceries are the smaller part. Add shopping, cooking, dishes — 2–3 hours a day; over a month that's a full working week at the stove. If your hour is worth anything, 'free' home cooking is the most expensive food in your life. Add the third of groceries that ends up in the trash."] },
        { h: "The real cost of ordering", p: ["Restaurant delivery is pricey daily; subscription plans are conveyor food. A neighbor cook's lunch usually costs like a business lunch: no rent, staff or marketing in the price. No commissions right now; a big-pot order stretches over days and beats even your own cooking on honest math."] },
        { h: "The verdict", p: ["Love cooking and have time — cook. No time, plenty of money — restaurants. Want home taste without lost evenings — order from a neighbor: open the feed, compare prices yourself. Cash on receipt — trying costs nothing."] },
      ],
    },
  },
  {
    slug: "eda-na-dachu-i-piknik",
    cover: "/images/pirozhki.jpg",
    date: "2026-07-23",
    readMin: 5,
    tags: ["дача", "пикник", "лето", "еда с собой"],
    links: [
      { to: "/dostavka", label: "Доставка домашней еды" },
      { to: "/blog/chto-poest-v-zharu", label: "Что поесть в жару: лёгкая летняя еда" },
      { to: "/blog/chto-prigotovit-iz-gribov", label: "Что приготовить из грибов: сезон и заготовки" },
      { to: "/zagotovki", label: "Домашние заготовки и соленья на заказ" },
      { to: "/blog/domashnyaya-vypechka-na-zakaz", label: "Домашняя выпечка на заказ" },
      { to: "/gatherings", label: "Соседские застолья" },
      { to: "/", label: "Повара рядом с вами" },
    ],
    ru: {
      title: "Еда на дачу и пикник: что взять с собой и что не готовить самому",
      excerpt:
        "Пирожки, котлеты, окрошка и выпечка в дорогу — список еды, которая переживёт дорогу и накормит компанию. И лайфхак: заберите всё готовым по пути.",
      body: [
        { p: ["Лучшая еда на дачу и пикник — та, что не боится дороги: пирожки и беляши, котлеты, запечённое мясо, овощи, окрошка в банке и выпечка к чаю. Собирать такой набор с вечера — потерять полдня. Лайфхак сезона: заказать всё у домашнего повара и забрать по пути на трассу."] },
        { h: "Что взять на пикник: проверенный список", p: ["Пирожки и беляши — главная дорожная еда: не текут, не мнутся, вкусны холодными. Котлеты — в контейнере доедут идеально. Запечённая курица или буженина — режется на месте. Овощи, зелень, домашние соленья. Окрошка — квас отдельно, заправка отдельно, смешать на месте. И пирог к чаю — яблочный или с ягодами.", "Чего не брать: салаты с майонезом (жара!), кремовые торты и всё, что требует холодильника дольше двух часов."] },
        { h: "Как не провести пятницу у плиты", p: ["Классический сценарий: вечер пятницы, чемоданы, а кто-то жарит котлеты на завтра до полуночи. Альтернатива: закажите дорожный набор у соседа-повара на Селине — пирожки горячими к утру, котлеты, пирог. Заберите по пути или закажите доставку к дому — и в машину сядете отдохнувшими.", "Повара часто готовы собрать «дачный набор» под вашу компанию — напишите в чат, обсудите состав и время. Оплата наличными при получении."] },
        { h: "А на самой даче?", p: ["Если дача в одном из городов Селины — посмотрите поваров и там: домашние обеды с доставкой работают и в пригородах, где есть повара. А вечером загляните в застолья — летом соседские столы выходят в сады и на веранды. Лето — лучшее время познакомиться с соседями по даче за одним столом."] },
      ],
    },
    en: {
      title: "Food for the Dacha and Picnic: What to Pack and What Not to Cook Yourself",
      excerpt:
        "Pirozhki, cutlets, okroshka and tea pastry — the list that survives the road and feeds the company. Plus the season's lifehack: pick it all up ready-made.",
      body: [
        { p: ["The best dacha and picnic food doesn't fear the road: pirozhki, cutlets, baked meat, vegetables, okroshka in a jar and pastry for tea. Packing it all the night before costs half a day. The season's lifehack: order it from a home cook and pick it up on the way."] },
        { h: "The proven picnic list", p: ["Pirozhki — the ultimate road food: no leaks, tasty cold. Cutlets travel perfectly in a container. Baked chicken or buzhenina — slice on site. Vegetables, pickles. Okroshka: kvass separate, mix on arrival. A fruit pie for tea. Avoid mayo salads in the heat and anything needing a fridge for over two hours."] },
        { h: "How not to spend Friday at the stove", p: ["The classic: Friday night, suitcases packed, someone frying cutlets till midnight. The alternative: order a road set from a neighbor cook on Celina — pirozhki hot by morning, cutlets, a pie. Pick up on the way out of town. Cooks will often assemble a 'dacha set' for your crew — just message them. Cash on receipt."] },
      ],
    },
  },
  {
    slug: "eda-dlya-mamy-s-malyshom",
    cover: "/images/syrniki.jpg",
    date: "2026-07-23",
    readMin: 5,
    tags: ["мама", "малыш", "декрет", "помощь", "домашняя еда"],
    links: [
      { to: "/obedy", label: "Домашние обеды с доставкой" },
      { to: "/dostavka", label: "Доставка домашней еды" },
      { to: "/blog/kak-poznakomitsya-s-sosedyami", label: "Как познакомиться с соседями" },
    ],
    ru: {
      title: "Еда для мамы с малышом: как питаться по-человечески, когда руки заняты",
      excerpt:
        "Первые месяцы с ребёнком — марафон, в котором мама ест последней и холодным. Как вернуть себе горячие домашние обеды без плиты — по-соседски.",
      body: [
        { p: ["Молодой маме нужна простая понятная еда без экзотики: супы, каши, запеканки, тушёное мясо с гарниром — и главное, чтобы её кто-то приготовил. Первые месяцы с малышом руки заняты 24/7, и мама ест последней. Решение веками было одно — «соседка принесла кастрюлю супа». Оно вернулось."] },
        { h: "Что удобно заказывать в декрете", p: ["Супы «на кастрюлю» — борщ, куриный, овощной: обед на два-три дня, разогрел одной рукой. Запеканки и сырники — завтрак и перекус. Тушёное мясо с гречкой или пюре — ужин без усилий. Домашние котлеты впрок. Всё это — простая, знакомая еда, которую хочется в усталости, и именно её готовят домашние повара.", "Есть ограничения по составу (на грудном вскармливании)? С домашним поваром это просто разговор: «без лука, неострое, поменьше специй» — и повар готовит под вас. Ни один рацион и ни один ресторан так не умеют."] },
        { h: "Почему это безопасно", p: ["Каждый повар Селины проходит проверку личности по документам, у блюд открыт состав, у повара — отзывы соседей. Оплата наличными при получении: сначала видите, потом платите. А повар из соседнего дома — это ещё и человек, которого вы реально знаете в лицо: для мамы с малышом это спокойнее любого курьера.", "Многие повара — сами мамы. Они знают, что такое «есть одной рукой, качая ребёнка», и собирают порции так, чтобы было удобно."] },
        { h: "Как наладить «свою соседку с кастрюлей»", p: ["Откройте ленту, найдите повара в своём районе и закажите пробный обед. Понравилось — договоритесь о регулярности прямо в чате: какие дни, какие блюда. Сейчас сервис не берёт комиссий, так что это дешевле рационов — а вкус домашний в буквальном смысле.", "И когда малыш подрастёт — загляните на соседские встречи: мамы из одного двора находят там друг друга быстрее, чем в любом чате."] },
      ],
    },
    en: {
      title: "Food for a New Mom: How to Eat Properly When Your Hands Are Full",
      excerpt:
        "The first months with a baby are a marathon where mom eats last and cold. How to get hot homemade meals back — the neighborly way.",
      body: [
        { p: ["A new mom needs simple familiar food: soups, porridges, casseroles, stewed meat with sides — and above all, someone else to cook it. For centuries the solution was 'the neighbor brought a pot of soup.' It's back."] },
        { h: "What to order on maternity leave", p: ["Big-pot soups — lunch for two-three days, reheated one-handed. Casseroles and syrniki for breakfast. Stewed meat with buckwheat for effortless dinner. Dietary limits while breastfeeding? With a home cook it's just a conversation: 'no onions, mild, easy on spices' — try that with a restaurant."] },
        { h: "Why it's safe", p: ["Every Celina cook passes identity verification, dishes list ingredients, neighbors leave reviews, and you pay cash on receipt — see first, pay after. A cook from the next building is someone you actually know by face. Many cooks are moms themselves — they pack portions for one-handed eating."] },
        { h: "Setting up 'your neighbor with a pot'", p: ["Order a trial lunch from a cook nearby; if it clicks, arrange regular days in the chat. No commissions right now — cheaper than meal plans, and the taste is literally homemade."] },
      ],
    },
  },
  {
    slug: "chto-poest-v-zharu",
    cover: "/images/olivier-salad.jpg",
    date: "2026-07-23",
    readMin: 4,
    tags: ["лето", "жара", "холодные супы", "окрошка", "доставка"],
    links: [
      { to: "/obedy", label: "Домашние обеды с доставкой" },
      { to: "/dostavka", label: "Доставка домашней еды" },
      { to: "/blog/eda-na-dachu-i-piknik", label: "Еда на дачу и на пикник" },
      { to: "/blog/gde-zakazat-nastoyashchiy-borshch", label: "Где заказать настоящий борщ" },
      { to: "/", label: "Повара рядом с вами" },
    ],
    ru: {
      title: "Что поесть в жару: лёгкая летняя еда, которую можно не готовить",
      excerpt:
        "В жару выручают холодные супы — окрошка, свекольник, холодник — лёгкие салаты, овощи и кисломолочное. Что съесть в зной и как получить всё это, не подходя к горячей плите.",
      body: [
        { p: ["В жару спасают холодные супы (окрошка, свекольник, холодник, гаспачо), лёгкие салаты, свежие овощи, кисломолочное и много прохладной жидкости. Всё это — еда, которую не нужно варить у раскалённой плиты. Разбираем, что съесть в зной, когда не хочется ни готовить, ни есть горячее, — и как получить холодную тарелку домашней еды прямо к двери."] },
        { h: "Почему в жару не хочется готовить", p: ["Когда за окном +30, вставать к плите — последнее, чего хочется: кухня превращается в парилку, а от одной мысли о горячем супе становится ещё жарче. Организм в зной сам просит другого — лёгкого, прохладного, солёного и водянистого, чтобы восполнить то, что уходит с потом.", "Поэтому летнее меню строится вокруг блюд, которые едят холодными и почти не готовят: холодные супы на кефире или квасе, салаты из свежих овощей, зелень, кисломолочное. Меньше жарки, больше свежести — и обязательно вода, морсы, компоты, чтобы не обезвоживаться."] },
        { h: "Холодные супы — главное летнее спасение", p: ["Окрошка — король русского лета: свежие огурцы, редис, варёные яйца, зелень и картошка, залитые холодным квасом или кефиром. Сытно, но легко, и охлаждает изнутри. У каждой хозяйки свой рецепт — кто-то добавляет колбасу или отварное мясо, кто-то делает постную, только на овощах.", "Свекольник и холодник — розовые холодные супы на свёкле со сметаной, огурцом и яйцом: красивые, кислые, освежающие. Гаспачо — испанский холодный томатный суп, который прижился и у нас в жару. Ботвинья — старинный русский суп на квасе с зеленью и рыбой. Все они объединены одним: их подают холодными, и в зной это именно то, что нужно."] },
        { h: "Лёгкая еда, которую не надо варить", p: ["Салаты из свежих овощей — огурцы, помидоры, редис, зелень с ложкой сметаны или масла. Овощная нарезка, малосольные огурцы, отварная картошка с укропом. Кисломолочное — кефир, айран, тан, творог с зеленью — восстанавливает и хорошо идёт в жару.", "Выручают и холодные закуски, которые готовят заранее и едят прохладными: заливное, отварная курица или язык, паштеты, лёгкие салаты вроде оливье или винегрета. Их удобно взять с собой на дачу или на пикник — а дома не нужно включать плиту вовсе."] },
        { h: "Как поесть в жару, не включая плиту", p: ["Самое разумное в зной — не стоять у плиты самому, а заказать холодный суп у соседа-повара, который уже всё приготовил. На Селине откройте ленту, выберите повара рядом и закажите окрошку, свекольник или лёгкий салат с доставкой до двери — прохладным и свежим, приготовленным человеком, который готовил как для своей семьи.", "Оплата наличными при получении, без предоплат и комиссий. А если собираетесь на дачу или на пикник, у соседа удобно заказать сразу дорожный набор — холодные супы и закуски, которые не боятся жары в пути. Кухня останется прохладной, а обед — домашним."] },
      ],
    },
    en: {
      title: "What to Eat in a Heat Wave: Light Summer Food You Don't Have to Cook",
      excerpt:
        "In the heat you want cold soups — okroshka, cold beet soup — light salads, vegetables and fermented dairy. What to eat when it's hot, and how to get it without touching a stove.",
      body: [
        { p: ["In a heat wave the best food is cold soups (okroshka, cold beet soup, gazpacho), light salads, fresh vegetables, fermented dairy and plenty of cool liquid — none of it cooked over a hot stove. Here's what to eat when it's too hot to cook or even to eat something warm, and how to get a cold plate of homemade food delivered to your door."] },
        { h: "Why you don't want to cook in the heat", p: ["When it's 30°C outside, standing over a stove is the last thing you want — the kitchen turns into a sauna. In the heat the body asks for something light, cool, salty and watery to replace what it loses through sweat. So a summer menu is built around dishes eaten cold and barely cooked: chilled soups on kefir or kvass, fresh salads, greens, fermented dairy — plus lots of water and berry drinks."] },
        { h: "Cold soups — the main summer rescue", p: ["Okroshka is the king of Russian summer: fresh cucumber, radish, boiled eggs, herbs and potato in cold kvass or kefir — filling but light, and cooling from the inside. Cold beet soup (svekolnik, kholodnik) is a pink chilled soup with smetana, cucumber and egg. Gazpacho, the Spanish chilled tomato soup, works here too. All are served cold — exactly what a heat wave calls for."] },
        { h: "Light food you don't have to boil", p: ["Fresh vegetable salads, cold cuts of vegetables, lightly salted cucumbers, boiled potato with dill. Fermented dairy — kefir, ayran, tvorog with herbs — restores you and goes down easily in the heat. Cold starters made ahead and eaten chilled — aspic, cold chicken, light salads like olivier or vinegret — are easy to take to the dacha or a picnic, with no stove needed at home."] },
        { h: "How to eat in the heat without a stove", p: ["The smartest move in a heat wave is not to cook yourself but to order a cold soup from a neighbor cook who has already made it. On Celina, open the feed, pick a cook nearby and order okroshka, cold beet soup or a light salad delivered to your door — cool and fresh, made by someone who cooks as if for their own family. Cash on receipt, no prepayment or fees. Heading to the dacha or a picnic? Order a road set of cold soups and starters that won't mind the heat on the way."] },
      ],
    },
  },
  {
    slug: "eda-na-kompaniyu",
    cover: "/images/khinkali.jpg",
    date: "2026-07-24",
    readMin: 5,
    tags: ["еда на компанию", "вечеринка", "застолье", "заказ", "доставка"],
    links: [
      { to: "/eda-na-prazdnik", label: "Еда на праздник: праздничный стол на заказ" },
      { to: "/obedy", label: "Домашние обеды с доставкой" },
      { to: "/gatherings", label: "Соседские застолья" },
      { to: "/blog/menyu-na-den-rozhdeniya-bez-gotovki", label: "Меню на день рождения без готовки" },
      { to: "/blog/zastolye-s-sosedyami-kak-organizovat", label: "Как организовать застолье с соседями" },
      { to: "/", label: "Повара рядом с вами" },
    ],
    ru: {
      title: "Еда на компанию: что заказать на вечеринку без готовки",
      excerpt:
        "На компанию проще заказать несколько сытных блюд «на всех» — горячее, салаты, нарезки, выпечку и закуски — у соседа-повара, чем готовить сутки самому. Сколько брать на человека и что поставить на стол.",
      body: [
        { p: ["Чтобы накрыть стол на компанию без суток у плиты, закажите одно сытное горячее на всех (плов, запечённое мясо, голубцы), два-три салата, мясную и овощную нарезку, домашнюю выпечку и закуски. На человека закладывайте примерно 250–300 г горячего, 150–200 г салатов и пару закусок. Разбираем, что поставить на стол и как получить всё готовым к нужному часу."] },
        { h: "Сколько еды заказывать на компанию", p: ["Простое правило: горячее — 250–300 г на человека с гарниром, салаты — 150–200 г, плюс нарезки и закуски по паре кусочков на каждого. Если гости разные по аппетиту или засидятся допоздна, берите чуть больше — остатки домашнего горячего на следующий день только радуют.", "Считайте по головам, а не «на глаз»: на 8 человек это примерно 2–2,5 кг горячего, 1,5 кг салатов, большая доска нарезки и десерт. Домашние повара готовят под заказ к дате, поэтому точное количество и время лучше согласовать заранее — за день-два."] },
        { h: "Что поставить на стол: проверенный набор", p: ["Горячее — центр стола, одно сытное блюдо, которого точно хватит: плов из казана, запечённая курица или утка, голубцы, жаркое в горшочках. Такое удобно заказывать целиком на компанию и легко разогреть.", "Дальше — салаты и нарезки: классический оливье и винегрет, свежие овощи, мясная и сырная доска, соленья. И обязательно то, что едят руками между тостами: пирожки, осетинские пироги, хачапури, домашняя выпечка. На десерт — торт или чак-чак к чаю. Такой набор закрывает и сытный стол, и лёгкий фуршет."] },
        { h: "Почему домашняя еда лучше кейтеринга и магазина", p: ["Магазинные салаты в пластике и однотипный кейтеринг проигрывают домашнему столу в главном — во вкусе. Сосед-повар готовит небольшими порциями, из своих продуктов, по семейным рецептам, к нужному часу — а не достаёт с общей линии.", "Плюс вы знаете, кто готовил: у каждого повара открытый профиль с именем, фото и отзывами соседей. Для застолья это важно — еду для ваших гостей делает конкретный человек, которому можно написать и уточнить состав, остроту или порции под компанию."] },
        { h: "Как заказать еду на компанию на Селине", p: ["Откройте ленту, выберите поваров рядом и соберите стол: на Селине можно заказать сразу у нескольких поваров — у одного плов, у другого выпечку и салаты. Укажите дату и час, к которому нужно всё приготовить, и выберите доставку до двери или самовывоз.", "Оплата наличными при получении, без предоплат и комиссий на старте. Оформляйте заранее — за день-два до застолья, чтобы повара успели приготовить всё свежим именно к вашему вечеру. А если собираете соседей, загляните в «Застолья»: иногда компания уже собирается рядом с вами."] },
      ],
    },
    en: {
      title: "Food for a Crowd: What to Order for a Party Without Cooking",
      excerpt:
        "For a group it's easier to order a few hearty 'for everyone' dishes — a main, salads, cold cuts, baking and starters — from a neighbor cook than to spend a day at the stove. How much per person and what to put on the table.",
      body: [
        { p: ["To set a table for a crowd without a day at the stove, order one hearty main for everyone (plov, roast meat, cabbage rolls), two or three salads, meat and vegetable platters, homemade baking and starters. Per person, plan on about 250–300 g of the main, 150–200 g of salads and a couple of starters. Here's what to put on the table and how to get it all ready by the right hour."] },
        { h: "How much food to order for a group", p: ["Simple rule: 250–300 g of the main per person with a side, 150–200 g of salads, plus a couple of pieces of cold cuts and starters each. If guests have big appetites or stay late, order a bit more — leftover homemade food the next day is a bonus. For 8 people that's roughly 2–2.5 kg of the main, 1.5 kg of salads, a big platter and a dessert. Home cooks make to order for a date, so agree on the amount and time a day or two ahead."] },
        { h: "What to put on the table: a proven set", p: ["The main is the centerpiece — one filling dish that's sure to be enough: plov from the cauldron, roast chicken or duck, cabbage rolls, stew in pots. Then salads and platters: olivier and vinegret, fresh vegetables, a meat-and-cheese board, pickles. And finger food between toasts: pirozhki, Ossetian pies, khachapuri, homemade baking. For dessert, a cake or chak-chak with tea. This set covers both a hearty table and a light buffet."] },
        { h: "Why homemade beats catering and the store", p: ["Store-bought salads in plastic and one-size-fits-all catering lose to a homemade table on the thing that matters — taste. A neighbor cook makes small batches, from their own ingredients, by family recipes, for the exact hour. Plus you know who cooked it: every cook has an open profile with a name, photo and neighbor reviews, and you can message them to adjust ingredients, spice or portions for your group."] },
        { h: "How to order food for a crowd on Celina", p: ["Open the feed, pick cooks nearby and build your table: on Celina you can order from several cooks at once — plov from one, baking and salads from another. Set the date and hour it should be ready and choose delivery or pickup. Payment is cash on receipt, no prepayment or fees right now. Order a day or two ahead so cooks can make everything fresh for your evening. Gathering the neighbors? Check 'Gatherings' — sometimes a group is already forming near you."] },
      ],
    },
  },
  {
    slug: "yablochnyy-spas-chto-prigotovit",
    cover: "/images/apple-pie.jpg",
    date: "2026-08-10",
    readMin: 6,
    tags: ["Яблочный Спас", "Медовый Спас", "Ореховый Спас", "август", "выпечка", "традиции"],
    links: [
      { to: "/vypechka", label: "Домашняя выпечка на заказ" },
      { to: "/zagotovki", label: "Домашние заготовки: варенье и соленья" },
      { to: "/eda-na-prazdnik", label: "Еда на праздник: стол на заказ" },
      { to: "/blog/domashnyaya-vypechka-na-zakaz", label: "Домашняя выпечка на заказ: пироги и пирожки" },
      { to: "/blog/zastolye-s-sosedyami-kak-organizovat", label: "Как организовать застолье с соседями" },
      { to: "/blog/chto-prigotovit-iz-gribov", label: "Что приготовить из грибов в Успенский пост" },
      { to: "/", label: "Повара рядом с вами" },
    ],
    ru: {
      title: "Медовый, Яблочный и Ореховый Спас: что готовят в августе",
      excerpt:
        "Три Спаса подряд — 14, 19 и 29 августа. Что пекут на каждый, почему до Спаса не ели яблоки, каким получается стол в Успенский пост и где взять яблочный пирог, если печь некогда.",
      body: [
        { p: ["Август в России держится на трёх Спасах: Медовый — 14 августа, Яблочный — 19-го, Ореховый — 29-го. Это не про календарь, а про еду: в эти дни на столе появляются мёд и мак, яблочные пироги и первый хлеб из нового урожая. Ниже — что готовят на каждый Спас, что можно на стол в Успенский пост и как получить домашний пирог, если печь самому в этом году некогда."] },
        { h: "Медовый Спас, 14 августа: мёд, мак и начало поста", p: ["Первый Спас в народе зовут ещё Маковеем или Маковым: в церкви освящают мёд нового сбора, мак и травы. Дома пекут то, что пахнет на всю кухню, — маковники и рулеты с маком, булочки, медовую коврижку, блины и оладьи с мёдом. Пресловутые «маковые головки» тут ни при чём: в рецептах — обычный пищевой мак с рынка, тот же, что в булочках.", "С этого же дня начинается Успенский пост — он идёт с 14 по 27 августа. Поэтому стол на Медовый Спас традиционно постный: тесто без яиц и молока, начинки из мака, яблок, ягоды и мёда. Это не про аскезу, а про то, почему выпечка августа именно такая — лёгкая, фруктовая, без крема."] },
        { h: "Яблочный Спас, 19 августа: пироги, шарлотка и освящённые яблоки", p: ["Второй Спас — главный. По церковному календарю это Преображение Господне, в храмах освящают яблоки, груши и виноград, и по уставу в этот день разрешается рыба. По народной традиции до Спаса яблоки нового урожая не ели — а с 19-го начинали, и сразу помногу: пироги, шарлотка, слоёные штрудели, печёные яблоки с мёдом, пирожки с яблочной начинкой, компоты и первое яблочное варенье.", "Отсюда и поговорка «яблоку негде упасть»: к середине августа урожай идёт валом, и вопрос не «где взять яблоки», а «куда их деть». Классический ответ — испечь. Пирог с яблоками, шарлотка на скорую руку, рулет с корицей, а излишки — в сушку, в повидло и в банки на зиму.", "Если печёте сами, помните простое: для пирога берут кислые сорта (антоновка, симиренко) — сладкие расплываются и дают приторную начинку. Если не печёте — этот же пирог у соседа-повара выйдет вкуснее магазинного, потому что он делает две-три штуки, а не двести."] },
        { h: "Ореховый Спас, 29 августа: хлеб и орехи", p: ["Третий Спас — Ореховый, он же Хлебный и Спас на полотне. К 29 августа Успенский пост уже закончился (27-го), поспевает лесной орех, а из зерна нового урожая пекут хлеб — отсюда второе имя. Стол в этот день самый простой и самый сытный за август: домашний хлеб и пироги, ореховая выпечка, мёд, что осталось от яблок. Заодно это последние тёплые выходные лета — повод собрать соседей за одним столом."] },
        { h: "Что заказать у соседа-повара к Спасу", p: ["К Медовому — маковый рулет, коврижку, булочки с маком, блины с мёдом. К Яблочному — яблочный пирог, шарлотку, штрудель, пирожки с яблоком, печёные яблоки, а из банок — яблочное варенье и повидло. К Ореховому — домашний хлеб, пироги, ореховую выпечку, чак-чак и медовик, если пост уже позади.", "Отдельный сезонный запрос — «постное»: в дни поста повару можно прямо написать в чате «без яиц и молока», и он испечёт на постном тесте. Это тот случай, когда домашняя кухня удобнее любой кондитерской: там состав менять не станут, а сосед — сделает партию под вас.", "И житейский расклад: 19 августа в 2026-м — среда, будний день. Печь пирог вечером после работы соглашаются немногие, а стол при этом хочется. Проще заказать выпечку у того, кто и так завтра растапливает духовку."] },
        { h: "Как заказать", p: ["Откройте Селину, выберите город и посмотрите поваров рядом: у многих в меню как раз выпечка. Не нашли нужного пирога — напишите в чат: к Спасу большинство поваров печёт по заказу, надо только предупредить за день-два. Выбирайте доставку от повара или самовывоз в паре минут от дома и укажите час, к которому нужно всё готовое.", "Оплата — наличными при получении, без предоплат; сейчас сервис не берёт комиссию, и деньги полностью получает повар. А если яблок в этом году, наоборот, некуда девать и вы всё равно печёте на всю семью — поставьте лишний пирог в меню: соседям он нужен ровно так же, как вам не нужен пятый."] },
      ],
      faq: [
        { q: "Какого числа Спасы в 2026 году?", a: "Даты не меняются от года к году: Медовый Спас — 14 августа, Яблочный (Преображение Господне) — 19 августа, Ореховый (Хлебный) — 29 августа. В 2026 году это пятница, среда и суббота соответственно." },
        { q: "Что готовят на Яблочный Спас?", a: "Всё яблочное: пироги и шарлотку, штрудель, пирожки с яблочной начинкой, печёные яблоки с мёдом, компоты, варенье и повидло на зиму. Для пирога лучше брать кислые сорта вроде антоновки — сладкие расплываются в начинке." },
        { q: "Что пекут на Медовый Спас?", a: "Выпечку с мёдом и маком: маковые рулеты и маковники, булочки с маком, медовую коврижку, блины и оладьи с мёдом. В церкви в этот день освящают мёд нового сбора, мак и травы." },
        { q: "Правда ли, что до Спаса нельзя есть яблоки?", a: "Это народная традиция, а не запрет: яблоки нового урожая не ели до Преображения, 19 августа, а с этого дня начинали. Сегодня её соблюдают по желанию — как повод дождаться и устроить из первого пирога маленький праздник." },
        { q: "Постный ли стол на Спас?", a: "Медовый Спас открывает Успенский пост (14–27 августа), поэтому и он, и Яблочный приходятся на постные дни; в Преображение по уставу разрешается рыба. Ореховый Спас, 29 августа, — уже после поста, стол свободный." },
        { q: "Можно ли заказать выпечку к Спасу на Селине?", a: "Да. Посмотрите поваров в своём городе — у многих выпечка есть в меню, а если нужного пирога нет, напишите в чат: к празднику пекут под заказ, предупредить лучше за день-два. Постный вариант без яиц и молока повар сделает по вашей просьбе. Оплата наличными при получении." },
      ],
    },
    en: {
      title: "The Three Saviour Feasts of August: Honey, Apple and Nut Spas",
      excerpt:
        "Russia's August runs on three feasts — 14, 19 and 29 August. What's baked for each, why apples weren't eaten before the Apple Spas, and where to get the pie if there's no time to bake.",
      body: [
        { p: ["Russian August rests on three Saviour feasts: Honey Spas on 14 August, Apple Spas on the 19th and Nut Spas on the 29th. They are less about the calendar than about food: honey and poppy seed, apple pies and the first bread from the new harvest."] },
        { h: "Honey Spas, 14 August", p: ["The first feast is also called Makovey: honey from the new harvest, poppy seed and herbs are blessed in church. At home people bake poppy-seed rolls and buns, honey gingerbread, blini and oladyi with honey. The same day opens the Dormition Fast (14–27 August), which is why August baking is the way it is — light, fruity, no cream: dough without eggs or milk, fillings of poppy seed, apples, berries and honey."] },
        { h: "Apple Spas, 19 August", p: ["The second feast is the big one — the Transfiguration. Apples, pears and grapes are blessed, and fish is permitted on the day. By folk tradition apples from the new harvest weren't eaten until the 19th — and from then on, generously: pies, sharlotka, strudel, apple pirozhki, baked apples with honey, compotes and the first apple jam. A baking note: use tart apples such as antonovka; sweet ones collapse into a cloying filling."] },
        { h: "Nut Spas, 29 August", p: ["The third feast is also called Bread Spas. The fast has ended (on the 27th), hazelnuts ripen, and bread is baked from the new grain — hence the name. The table is the simplest and the most filling of the month: homemade bread and pies, nut baking, honey and whatever the apples left. It also falls on the last warm weekend of summer — a good reason to gather the neighbors."] },
        { h: "What to order from a neighbor cook", p: ["For Honey Spas: poppy-seed rolls, honey gingerbread, blini with honey. For Apple Spas: apple pie, sharlotka, strudel, apple pirozhki, baked apples, plus apple jam from the jar shelf. For Nut Spas: homemade bread, pies, nut baking, chak-chak and medovik. During the fast you can simply message the cook 'no eggs or milk' and they'll bake on lean dough — a bakery won't change its recipe for you, a neighbor will.", "Open Celina, pick your city and look at the cooks nearby; if the pie you want isn't listed, ask in chat — most bake to order with a day or two of notice. Delivery or pickup, cash on receipt, no commission right now. And if it's your apples that have nowhere to go, list the spare pie: your neighbors need it as much as you don't need a fifth one."] },
      ],
      faq: [
        { q: "When are the Spas feasts in 2026?", a: "The dates are fixed every year: Honey Spas on 14 August, Apple Spas (the Transfiguration) on 19 August, Nut Spas on 29 August — in 2026 a Friday, a Wednesday and a Saturday." },
        { q: "What is cooked for Apple Spas?", a: "Everything apple: pies and sharlotka, strudel, apple pirozhki, baked apples with honey, compotes and jam for winter. Tart varieties like antonovka hold their shape best in a pie." },
        { q: "Is the Spas table lean?", a: "Honey Spas opens the Dormition Fast (14–27 August), so it and Apple Spas fall on fast days, with fish permitted on the Transfiguration. Nut Spas on 29 August comes after the fast, so the table is unrestricted." },
      ],
    },
  },
  {
    slug: "chto-prigotovit-iz-gribov",
    cover: "/images/pirozhki.jpg",
    date: "2026-08-11",
    readMin: 7,
    tags: ["грибы", "сезон", "заготовки", "постное", "август", "сентябрь"],
    links: [
      { to: "/zagotovki", label: "Домашние заготовки: соленья и варенье" },
      { to: "/vypechka", label: "Домашняя выпечка на заказ" },
      { to: "/blog/yablochnyy-spas-chto-prigotovit", label: "Медовый, Яблочный и Ореховый Спас" },
      { to: "/blog/eda-na-dachu-i-piknik", label: "Еда на дачу и пикник" },
      { to: "/blog/domashnyaya-eda-v-chelyabinske", label: "Домашняя еда в Челябинске: грузди и заготовки" },
      { to: "/blog/domashnyaya-eda-v-krasnoyarske", label: "Домашняя еда в Красноярске: шишка и грибы" },
      { to: "/pravilnoe-pitanie", label: "Правильное питание на заказ" },
      { to: "/eda-na-nedelyu", label: "Готовая еда на неделю" },
      { to: "/", label: "Повара рядом с вами" },
    ],
    ru: {
      title: "Что приготовить из грибов: сезон, блюда и заготовки",
      excerpt:
        "Тихая охота идёт: белые, лисички, подберёзовики, скоро опята. Что сделать с ведром грибов сегодня, что заморозить и высушить на зиму, почему грибы не закатывают герметично — и где взять грибной суп или пирог, если в лес вы не ходите.",
      body: [
        { p: ["Август — начало главной части грибного сезона. В средней полосе после тёплых дождей идут белые, подберёзовики и подосиновики, вовсю берут лисички, а к сентябрю пойдут опята. У этой поры два лица: одни возвращаются из леса с ведром и не знают, куда всё девать до ночи, другие грибы любят, но в лес не ходят — и покупают уже готовое. Ниже — и то, и другое: что приготовить из свежих грибов, как заготовить их на зиму, чего делать нельзя и что из грибного можно заказать у соседа-повара."] },
        { h: "Сезон: что и когда идёт", p: ["Точных дат у грибов нет — всё решают дожди и тепло, и в каждом регионе свой календарь. Общая рамка для средней полосы такая: основной сбор растягивается с августа по октябрь, белые и подберёзовики идут волнами после дождей всю вторую половину лета и сентябрь, лисички держатся с середины лета до осени, опята — самая поздняя массовая волна, обычно сентябрь и начало октября. На юге сезон длиннее, на севере и в Сибири короче и раньше заканчивается.", "Практический вывод простой: грибы — продукт нескольких недель. Всё, что вы хотите есть зимой, надо сушить, морозить или солить сейчас, а не «потом, когда будет время». Именно поэтому в конце августа и в сентябре кухни в домах пахнут одинаково."] },
        { h: "Что приготовить из свежих грибов сегодня", p: ["Первое и лучшее — жареные грибы с картошкой и луком. Это то блюдо, ради которого в лес и ходят: белые и подберёзовики дают вкус, лисички — плотность, а картошка забирает всё остальное. Второе по частоте — грибной суп: из свежих белых он получается прозрачным и ароматным, из сушёных — темнее и крепче, а если добавить перловку, выйдет уже не суп, а обед.", "Дальше идёт всё, что делают, когда грибов много: жульен в кокотницах или в формочках, грибная икра из ножек и мелочи, начинка для пирожков и пирогов, грибы в сметане, грибная подлива к гречке и картофельному пюре, вареники и пельмени с грибами, каша с грибами. Отдельно — блюда, где грибы играют вторым номером: солянка, жаркое в горшочках, курица с грибами, драники со сметаной и грибами.", "Одно правило на все блюда: грибы не любят спешки в кастрюле, но не любят и ожидания в холодильнике. Свежие лесные грибы перебирают и готовят в тот же день, максимум — на следующий; если разобрать сегодня некогда, лучше сразу отварить и убрать в морозилку, чем оставить ведро до выходных."] },
        { h: "Заготовки: сушка, заморозка, соление", p: ["Сушка — классика для трубчатых: белые, подберёзовики и подосиновики сушат целыми или ломтиками, и зимой из горсти получается суп, который пахнет на всю квартиру. Хранят сушёное в стекле или тканевом мешочке в сухом месте — сырость грибам страшнее времени.", "Заморозка — самый простой способ и самый честный по вкусу. Морозят двумя путями: отваренными (отжать, разложить порциями) или уже обжаренными — второе занимает меньше места и зимой превращается в ужин за десять минут. Лисички чаще именно жарят и морозят: при сушке они становятся жёсткими и горчат.", "Соление и квашение — то, что раньше стояло в каждом погребе: грузди и волнушки холодным или горячим способом, солёные опята. Важная деталь: солёные грибы держат в открытой таре под гнётом и в холоде, а не закатывают под жестяную крышку.", "И то, чего делать не надо: закатывать грибы герметично. Домашние грибные консервы в закрученных банках — самая рискованная категория домашних заготовок, каждый сезон именно из-за них предупреждают о ботулизме. Возбудитель развивается без доступа воздуха и не выдаёт себя ни запахом, ни вкусом, а обычное проваривание на плите его токсин не всегда убирает. Поэтому в заготовках честный порядок такой: сушить, морозить, солить в открытой таре и хранить в холоде."] },
        { h: "Безопасность без паники: три правила", p: ["Первое: не берите незнакомый гриб. Не «похож на съедобный», не «по фото в интернете» — а знаете точно. Самые тяжёлые отравления в России дают бледная поганка (её путают с сыроежкой и шампиньоном) и ложные опята.", "Второе: не собирайте вдоль трасс, у заводов и на свалках — грибы тянут в себя всё, что есть в почве, и хороший белый у обочины хуже плохого в лесу.", "Третье: не давайте лесные грибы маленьким детям и не ешьте сами помногу на ночь — это тяжёлая еда, даже когда всё правильно собрано. Это не запугивание, а те самые вещи, из-за которых сезон у кого-то заканчивается больницей."] },
        { h: "Грибы и Успенский пост", p: ["С 14 по 27 августа идёт Успенский пост, и грибы в эти две недели — главная еда постного стола: они дают ту сытность и «мясной» вкус, которых в пост не хватает. Отсюда весь классический набор: постные пирожки с грибами и капустой, гречка с грибами и луком, грибной суп без сметаны, картошка с грибами, грибная икра на хлеб, вареники с картошкой и грибами.", "Если заказываете к посту у соседа-повара — так и напишите в чате: без яиц, молока и сметаны. Домашняя кухня подстраивается под просьбу, а магазинная витрина — нет. Подробнее про август и его праздники — в нашей статье про три Спаса."] },
        { h: "Что из грибного заказать у соседа-повара", p: ["Грибы — как раз тот продукт, где домашняя кухня выигрывает у общепита с большим отрывом, потому что дело не в рецепте, а в сырье и в терпении: перебрать ведро, почистить, отварить, дождаться. Заказывают обычно грибной суп, жареные грибы с картошкой, жульен, пироги и пирожки с грибами, вареники и пельмени с грибной начинкой, грибную икру, подливу к гарниру, драники с грибами.", "Готового раздела «грибное» в меню нет: повара ставят такие блюда к остальным или пишут о них в описании кухни. Если не видите — просто спросите в чате, готовят ли в этом сезоне из грибов и из каких. Многие в августе и сентябре сами ходят в лес или берут у знакомых и охотно делают партию побольше.", "И обратная сторона: если это вы каждые выходные возвращаетесь с полным ведром, а дома уже некуда, — заведите профиль повара и поставьте в меню то, что и так готовите: суп, икру, пирожки. Соседям грибное ведро нужно ровно так же, как вам не нужно третье."] },
        { h: "Как заказать", p: ["Откройте Селину, выберите город и посмотрите поваров рядом. Дальше как обычно: доставка от повара или самовывоз в паре минут ходьбы, время вы указываете сами. Оплата наличными при получении, без предоплат; сейчас сервис не берёт комиссию, и деньги полностью получает повар.", "Про сроки: грибное лучше заказывать на ближайшие дни, а не «на когда-нибудь». Сезон короткий, и то, что повар готовит из свежих лесных грибов в сентябре, в ноябре он будет делать уже из замороженных — вкусно, но это другая история."] },
      ],
      faq: [
        { q: "Когда сезон грибов?", a: "Точных дат нет — всё зависит от дождей, тепла и региона. В средней полосе основной сбор идёт с августа по октябрь: белые и подберёзовики появляются волнами после дождей, лисички держатся с середины лета до осени, опята — самая поздняя массовая волна, обычно сентябрь и начало октября." },
        { q: "Что приготовить из свежих грибов?", a: "Самое частое — жареные грибы с картошкой и луком и грибной суп. Дальше: жульен, грибная икра, начинка для пирожков и пирогов, грибы в сметане, подлива к гречке и пюре, вареники и пельмени с грибами, солянка, жаркое в горшочках." },
        { q: "Как заготовить грибы на зиму?", a: "Три рабочих способа: сушка (лучше всего для белых, подберёзовиков и подосиновиков), заморозка отваренных или уже обжаренных грибов и соление в открытой таре под гнётом в холоде. Лисички при сушке жестковаты и горчат — их обычно жарят и морозят." },
        { q: "Почему нельзя закатывать грибы в банки герметично?", a: "Домашние грибные консервы в закрученных банках — самая рискованная категория заготовок: возбудитель ботулизма развивается без доступа воздуха и не выдаёт себя ни запахом, ни вкусом. Безопаснее сушить, морозить или солить в открытой таре и держать в холоде." },
        { q: "Сколько хранятся свежие лесные грибы?", a: "Очень недолго: их перебирают и готовят в тот же день, максимум на следующий. Если разобрать сегодня некогда, лучше сразу отварить и заморозить порциями, чем оставлять ведро до выходных." },
        { q: "Можно ли заказать грибные блюда на Селине?", a: "Да, если повар в вашем городе готовит из грибов в этом сезоне. Отдельного раздела «грибное» в меню нет — блюда стоят вместе с остальными, поэтому проще спросить в чате. В Успенский пост (14–27 августа) сразу попросите постный вариант: без яиц, молока и сметаны." },
      ],
    },
    en: {
      title: "What to Cook with Mushrooms: Season, Dishes and Winter Stores",
      excerpt:
        "The quiet hunt is on: ceps, chanterelles, boletes, honey fungus next. What to do with a bucket today, what to freeze and dry for winter, why mushrooms are never sealed airtight — and where to get the soup or the pie if you don't go to the forest.",
      body: [
        { p: ["August opens the main stretch of the Russian mushroom season. After warm rain the ceps, birch and aspen boletes come up, chanterelles are in full swing, and by September the honey fungus follows. The season has two faces: some come home with a full bucket and no idea where to put it before nightfall, others love mushrooms but never go picking — and buy them ready-made."] },
        { h: "The season", p: ["Mushrooms keep no calendar: rain and warmth decide, and every region differs. As a rough frame for central Russia, the main picking runs from August through October — ceps and boletes arrive in waves after rain, chanterelles hold from midsummer into autumn, and honey fungus is the last mass wave, usually September into early October. The practical conclusion: mushrooms are a product of a few weeks. Whatever you want to eat in winter must be dried, frozen or salted now."] },
        { h: "What to cook today", p: ["First and best: mushrooms fried with potatoes and onion — the dish people go to the forest for. Then mushroom soup, clear and fragrant from fresh ceps, darker and stronger from dried ones. After that comes everything you make when there is too much: julienne, mushroom caviar from stalks and small pieces, filling for pies and pirozhki, mushrooms in sour cream, gravy for buckwheat and mashed potato, vareniki and pelmeni with mushrooms.", "One rule for all of it: fresh forest mushrooms are sorted and cooked the same day, next day at the latest. If there's no time today, boil and freeze them rather than leaving the bucket until the weekend."] },
        { h: "Drying, freezing, salting — and what not to do", p: ["Dry the tubular ones: ceps and boletes, whole or sliced, kept in glass or cloth somewhere dry. Freeze either boiled and pressed or already fried — the fried version takes less space and becomes dinner in ten minutes. Chanterelles turn tough and bitter when dried, so they are usually fried and frozen. Salting (milk caps, saffron milk caps, honey fungus) is done in open containers under a weight, kept cold.", "What not to do: never seal mushrooms airtight in screw-top jars. Home-canned mushrooms are the riskiest category of preserving — botulinum develops without air and betrays itself by neither smell nor taste. Dry, freeze, or salt in open containers in the cold."] },
        { h: "Safety in three rules", p: ["Never pick a mushroom you don't know — not 'looks edible', not 'matched a photo'. The death cap (confused with russulas and champignons) and false honey fungus cause the worst poisonings in Russia. Don't pick along motorways, near plants or on dumps: mushrooms absorb whatever is in the soil. And don't give forest mushrooms to small children or eat a lot of them late at night — it is heavy food even when everything was picked correctly."] },
        { h: "Mushrooms and the Dormition Fast", p: ["The Dormition Fast runs 14–27 August, and mushrooms are the backbone of the lean table those two weeks: lean pirozhki with mushrooms and cabbage, buckwheat with mushrooms and onion, soup without sour cream, potatoes with mushrooms, mushroom caviar on bread. If you're ordering for the fast, just say so in chat: no eggs, no milk, no sour cream. A home kitchen adjusts; a shop display doesn't."] },
        { h: "What to order from a neighbor cook", p: ["Mushrooms are where a home kitchen beats catering by a wide margin, because the work is in the sorting and the patience, not the recipe. People order mushroom soup, mushrooms fried with potatoes, julienne, pies and pirozhki with mushrooms, vareniki and pelmeni, mushroom caviar, gravy for a side dish.", "There's no separate 'mushroom' section in the menu — dishes sit with the rest, so just ask in chat whether the cook works with mushrooms this season. Open Celina, choose your city and look at the cooks nearby: delivery or pickup a couple of minutes away, cash on receipt, no commission right now. And if it's you coming back with a full bucket every weekend, list what you already cook — your neighbors need that bucket as much as you don't need a third one."] },
      ],
      faq: [
        { q: "When is mushroom season in Russia?", a: "There are no fixed dates — rain, warmth and region decide. In central Russia the main picking runs from August to October: ceps and boletes come in waves after rain, chanterelles from midsummer into autumn, honey fungus last, usually September into early October." },
        { q: "How do you store mushrooms for winter?", a: "Three working methods: drying (best for ceps and boletes), freezing them boiled or already fried, and salting in open containers under a weight kept cold. Chanterelles go tough and bitter when dried, so they are usually fried and frozen." },
        { q: "Why should mushrooms never be canned in sealed jars?", a: "Home-canned mushrooms in screw-top jars are the riskiest category of preserving: botulinum develops without air and gives away no smell or taste. Dry, freeze or salt in open containers in the cold instead." },
        { q: "Can I order mushroom dishes on Celina?", a: "Yes, if a cook in your city is working with mushrooms this season. There's no separate section for them — dishes sit alongside the rest, so ask in chat. During the Dormition Fast (14–27 August) ask for the lean version: no eggs, milk or sour cream." },
      ],
    },
  },
  {
    slug: "domashnyaya-eda-v-chelyabinske",
    cover: "/images/pelmeni.jpg",
    date: "2026-08-12",
    readMin: 5,
    tags: ["челябинск", "южный урал", "домашняя еда", "доставка", "город"],
    links: [
      { to: "/eda/chelyabinsk", label: "Домашняя еда в Челябинске — страница города" },
      { to: "/blog/domashnyaya-eda-v-ekaterinburge", label: "Домашняя еда в Екатеринбурге" },
      { to: "/blog/domashnyaya-eda-v-krasnoyarske", label: "Домашняя еда в Красноярске" },
      { to: "/blog/chto-prigotovit-iz-gribov", label: "Что приготовить из грибов" },
      { to: "/zagotovki", label: "Домашние заготовки: соленья и варенье" },
      { to: "/obedy", label: "Домашние обеды с доставкой" },
      { to: "/eda-na-nedelyu", label: "Готовая еда на неделю" },
      { to: "/dostavka", label: "Доставка домашней еды" },
    ],
    ru: {
      title: "Домашняя еда в Челябинске: пельмени, шаньги и обеды",
      excerpt:
        "Гид по домашней еде в Челябинске: уральские пельмени, шаньги, груздянка и домашние обеды от соседей-поваров — от ЧТЗ и Чурилово до Северо-Запада, Паркового и АМЗ.",
      body: [
        { p: ["Челябинск — большой рабочий город на Миассе, где обед всерьёз: смены длинные, зима долгая, и еда здесь ценится сытная и настоящая. Домашняя кухня тут не мода последних лет, а привычка — суп на кастрюлю, пельмени, которые лепят всей семьёй, банки на балконе к зиме. Рассказываем, как в Челябинске заказать домашнюю еду: не «домашнюю» из цеха, а приготовленную соседом в вашем же районе."] },
        { h: "Как это работает", p: ["На Селине готовят проверенные соседи-повара. Откройте страницу города, посмотрите, кто готовит рядом — на ЧТЗ, в Чурилово, на Северо-Западе, в Парковом, на АМЗ, в Ленинском или в центре у Кировки, — выберите блюда и оформите заказ с доставкой или самовывозом. Повар живёт в паре кварталов, поэтому обед не едет через весь город по проспекту Ленина: между плитой и вашим столом — минуты.", "Каждый повар проходит проверку личности по документам, у блюд открыт состав, а оплата — наличными при получении: сначала видите заказ, потом платите. Сейчас сервис не берёт комиссий — вся сумма достаётся повару."] },
        { h: "Что заказывают в Челябинске", p: ["Южноуральская домашняя классика — та, которой кормят после смены и в мороз. Первое место у пельменей: на Урале их лепят помногу и морозят впрок, и разница между домашними и магазинными здесь очевидна каждому. Рядом — шаньги с картошкой и творогом к чаю, наваристые щи и борщ на всю кастрюлю, груздянка из солёных груздей, котлеты с пюре, драники, домашние пироги и пирожки.", "Челябинская область граничит с Башкирией, и на столе это видно: эчпочмаки, беляши, бешбармак с домашней лапшой, чак-чак к чаю здесь такие же «свои», как пельмени. У многих семей это кухня бабушки, а не «национальный ресторан», — и готовят её дома именно так.", "Отдельная челябинская история — обед на смену. Заводской и сменный график плохо дружит с готовкой: домой приходят поздно, а есть надо горячее и вовремя. Поэтому здесь часто берут не разовый ужин, а несколько контейнеров сразу — суп, второе, котлеты — и разогревают в течение недели."] },
        { h: "Август: сады, грузди и банки", p: ["Вторая половина августа на Южном Урале — самое хлопотное время года на кухне. С садов везут кабачки, огурцы, вишню, смородину и облепиху, в лесу идут грузди, которые на Урале солят целыми вёдрами, а на плите с утра до ночи стоит таз. У кого-то сад есть, у кого-то нет — и как раз здесь соседская кухня выручает обе стороны.", "Если сад ваш и урожай уже некуда девать, поставьте в меню то, что и так делаете: солёные грузди, аджику, варенье, компоты, лечо. Если сада нет — закажите банку у соседки: домашние заготовки в Челябинске расходятся быстрее, чем появляются. Как заготавливать грибы и почему их не закатывают герметично, мы разобрали в отдельной статье; про соленья и варенье — на странице заготовок.", "Ещё одна августовская тема — Успенский пост с 14 по 27 августа. Постное меню домашняя кухня собирает без проблем: грибной суп, пирожки с капустой, гречка с грибами, вареники с картошкой. Просто напишите повару в чате: без яиц, молока и сметаны."] },
        { h: "Скоро школа", p: ["К сентябрю в Челябинске возвращается вечный родительский вопрос: чем кормить ребёнка в учебные дни, если сами вы на работе до семи. Договориться с соседом-поваром об обедах на учебную неделю — рабочий вариант: у ребёнка горячий суп и котлета вместо булки из буфета, а у вас на одну заботу меньше. Что заказывать и как договариваться — в нашем гиде про домашнюю еду для школьника."] },
        { h: "С чего начать", p: ["Загляните на страницу «Домашняя еда в Челябинске», посмотрите поваров рядом и закажите первый обед. Если в вашем районе поваров пока нет — оставьте заявку или расскажите о Селине соседке, чьи пельмени и шаньги знает весь подъезд. С неё в вашем доме всё и начнётся.", "И если готовите вы сами и делаете это хорошо — заведите профиль повара. На ЧТЗ, в Парковом и Чурилово людей много, кухонь мало, а желающих съесть нормальный домашний суп в среду вечером — весь дом."] },
      ],
      faq: [
        { q: "Как заказать домашнюю еду в Челябинске?", a: "Откройте страницу «Домашняя еда в Челябинске» на Селине, посмотрите поваров рядом с вашим районом — ЧТЗ, Северо-Запад, Парковый, Чурилово, АМЗ, Ленинский, центр, — добавьте блюда в корзину и оформите заказ. Доступны доставка от повара и самовывоз, оплата — наличными при получении." },
        { q: "Сколько стоит домашняя еда в Челябинске?", a: "Цену ставит сам повар, и она обычно ниже ресторанной при большей порции: вы платите за еду, а не за зал и официантов. Сейчас Селина не берёт комиссию, поэтому вся сумма достаётся повару и наценки сервиса в цене нет." },
        { q: "Есть ли доставка домашних обедов на неделю?", a: "Да, это один из самых частых запросов в городе со сменным графиком. С поваром договариваются на несколько контейнеров сразу — суп, второе, гарнир — и забирают их одним заказом. Подробнее — на странице «Готовая еда на неделю»." },
        { q: "Безопасно ли заказывать еду у домашнего повара?", a: "Каждый повар на Селине проходит проверку личности по документам и подтверждает санитарные правила, у блюд открыт состав, а с поваром можно поговорить в чате до заказа — спросить про аллергены, специи и способ приготовления. Оплата при получении делает первый заказ спокойным." },
        { q: "Можно ли заказать в Челябинске башкирскую и татарскую кухню?", a: "Да, если повар рядом с вами её готовит: эчпочмаки, беляши, бешбармак и чак-чак на Южном Урале — домашняя, а не ресторанная еда. Отдельного раздела в меню нет, поэтому проще спросить в чате или посмотреть описание кухни повара." },
        { q: "Как стать домашним поваром в Челябинске?", a: "Заведите профиль повара, пройдите проверку личности и поставьте в меню то, что вы и так готовите: пельмени, шаньги, супы, пироги, заготовки. Сейчас сервис не берёт комиссию — повар получает всю сумму заказа." },
      ],
    },
    en: {
      title: "Homemade Food in Chelyabinsk: Pelmeni, Shangi and Lunches",
      excerpt:
        "A guide to home-cooked food in Chelyabinsk: Ural pelmeni, shangi, salted milk caps and weekday lunches from neighbor cooks — from ChTZ and Churilovo to the North-West, Parkovy and AMZ.",
      body: [
        { p: ["Chelyabinsk is a big working city on the Miass, where lunch is taken seriously: the shifts are long, the winter longer, and food is expected to be filling and real. Home cooking here isn't a recent fashion but a habit — a pot of soup, pelmeni folded by the whole family, jars lined up on the balcony for winter. Here's how to order real homemade food in Chelyabinsk: cooked by a neighbor in your own district, not 'homestyle' out of a plant."] },
        { h: "How it works", p: ["On Celina, verified neighbor cooks do the cooking. Open the city page, see who cooks nearby — in ChTZ, Churilovo, the North-West, Parkovy, AMZ, Leninsky or the centre by Kirovka — pick dishes and order with delivery or pickup. The cook lives a couple of blocks away, so lunch doesn't travel the length of Prospekt Lenina: minutes between the stove and your table.", "Every cook passes identity verification, dishes list their ingredients, and payment is cash on receipt: first you see the order, then you pay. No commissions right now — the cook keeps the full amount."] },
        { h: "What people order in Chelyabinsk", p: ["The South Ural home classics are the ones that feed you after a shift and in a hard frost. Pelmeni come first: in the Urals they are made in bulk and frozen ahead, and the gap between homemade and shop-bought is obvious to everyone here. Alongside them: shangi with potato or curd for tea, big-pot shchi and borscht, gruzdyanka soup from salted milk caps, cutlets with mash, potato pancakes, pies and pirozhki.", "The Chelyabinsk region borders Bashkortostan, and the table shows it: echpochmak, belyash, beshbarmak with hand-rolled noodles and chak-chak for tea are as much 'ours' here as pelmeni — grandmother's cooking rather than restaurant cuisine.", "One local pattern stands out: lunch for the shift. Factory and shift schedules don't leave room for cooking, so people often order not one dinner but several containers at once — soup, a main, cutlets — and reheat them through the week."] },
        { h: "August: gardens, milk caps and jars", p: ["Late August is the busiest kitchen season in the South Urals. Courgettes, cucumbers, cherries, currants and sea buckthorn come in from the dacha gardens, milk caps are out in the forest — salted here by the bucket — and a basin sits on the stove from morning to night.", "If the garden is yours and the harvest has nowhere left to go, list what you already make: salted mushrooms, adjika, jam, compote, lecho. If you have no garden, order a jar from a neighbor. We covered mushroom preserving — and why mushrooms are never sealed airtight — in a separate article.", "The Dormition Fast runs 14–27 August, and a home kitchen handles a lean menu easily: mushroom soup, cabbage pirozhki, buckwheat with mushrooms, potato vareniki. Just tell the cook in chat: no eggs, milk or sour cream."] },
        { h: "School is coming", p: ["By September the old parental question returns: what does the child eat on school days if you're at work until seven. Arranging weekday lunches with a neighbor cook works well — hot soup and a cutlet instead of a canteen bun, and one worry less for you."] },
        { h: "Where to start", p: ["Open the 'Homemade food in Chelyabinsk' page, look at the cooks nearby and order your first meal. If your district has none yet, the service is only launching: leave a request, or tell the neighbor whose pelmeni and shangi the whole stairwell knows about Celina.", "And if you're the one who cooks well — set up a cook profile. In ChTZ, Parkovy and Churilovo there are plenty of people, few kitchens, and a whole building that would like a proper home-cooked soup on a Wednesday evening."] },
      ],
      faq: [
        { q: "How do I order homemade food in Chelyabinsk?", a: "Open the 'Homemade food in Chelyabinsk' page on Celina, look at the cooks near your district — ChTZ, North-West, Parkovy, Churilovo, AMZ, Leninsky, the centre — add dishes to the cart and place the order. Delivery from the cook and pickup are both available, payment is cash on receipt." },
        { q: "What does home-cooked food cost in Chelyabinsk?", a: "The cook sets the price, and it is usually below restaurant level for a larger portion: you pay for the food, not for a dining room and waiters. Right now Celina takes no commission, so there is no service markup in the price." },
        { q: "Can I get a week of lunches delivered?", a: "Yes — it's one of the most common requests in a shift-work city. People arrange several containers at once with a cook — soup, a main, a side — and collect them in one order." },
        { q: "Is it safe to order from a home cook?", a: "Every cook on Celina passes document-based identity verification and confirms the hygiene rules, dishes list their ingredients, and you can talk to the cook in chat before ordering — about allergens, spice level or how something is made. Cash on receipt keeps the first order low-risk." },
        { q: "Can I order Bashkir and Tatar dishes in Chelyabinsk?", a: "Yes, if a cook near you makes them: echpochmak, belyash, beshbarmak and chak-chak are home food in the South Urals, not restaurant food. There's no separate menu section, so ask in chat or check the cook's kitchen description." },
      ],
    },
  },
  {
    slug: "domashnyaya-eda-v-krasnoyarske",
    cover: "/images/pelmeni.jpg",
    date: "2026-08-21",
    readMin: 5,
    tags: ["красноярск", "сибирь", "домашняя еда", "доставка", "город"],
    links: [
      { to: "/eda/krasnoyarsk", label: "Домашняя еда в Красноярске — страница города" },
      { to: "/blog/domashnyaya-eda-v-novosibirske", label: "Домашняя еда в Новосибирске" },
      { to: "/blog/domashnie-pelmeni-po-regionam-rossii", label: "Домашние пельмени по регионам России" },
      { to: "/blog/chto-prigotovit-iz-gribov", label: "Что приготовить из грибов" },
      { to: "/blog/eda-na-dachu-i-piknik", label: "Еда на дачу и пикник" },
      { to: "/blog/domashnyaya-eda-dlya-shkolnika", label: "Домашняя еда для школьника" },
      { to: "/zagotovki", label: "Домашние заготовки: соленья и варенье" },
      { to: "/eda-na-nedelyu", label: "Готовая еда на неделю" },
      { to: "/dostavka", label: "Доставка домашней еды" },
    ],
    ru: {
      title: "Домашняя еда в Красноярске: пельмени, пироги, обеды",
      excerpt:
        "Гид по домашней еде в Красноярске: сибирские пельмени, рыбный пирог, шаньги и обеды от соседей-поваров — от Взлётки и Северного до правого берега.",
      body: [
        { p: ["Красноярск стоит на Енисее, и река делит город надвое: левый берег — центр, проспект Мира и Взлётка, правый — заводской и очень домашний. Тайга начинается сразу за окраиной: до Столбов доезжают городским транспортом. Отсюда и стол — сибирский, сытный, где грибы, ягода и рыба считаются обычными продуктами, а не деликатесом. Рассказываем, как в Красноярске заказать домашнюю еду: не «домашнюю» из цеха, а приготовленную соседом в вашем же районе."] },
        { h: "Как это работает", p: ["На Селине готовят проверенные соседи-повара. Откройте страницу города, посмотрите, кто готовит рядом — на Взлётке, в Северном, Солнечном, Зелёной Роще, Ветлужанке, Академгородке или на правом берегу, в Черёмушках и на Пашенном, — выберите блюда и оформите заказ с доставкой или самовывозом. Повар живёт в паре кварталов, поэтому обед не стоит вместе с вами в пробке на Коммунальном мосту: между плитой и вашим столом — минуты.", "Каждый повар проходит проверку личности по документам, у блюд открыт состав, а оплата — наличными при получении: сначала видите заказ, потом платите. Сейчас сервис не берёт комиссий — вся сумма достаётся повару."] },
        { h: "Что заказывают в Красноярске", p: ["Сибирская домашняя классика начинается с пельменей: их лепят помногу, на несколько вечеров вперёд, и морозят — разницу между домашними и магазинными здесь объяснять никому не нужно. Рядом — щи и борщ на всю кастрюлю, котлеты с пюре, шаньги и ватрушки к чаю, пироги с капустой, с ягодой и с рыбой.", "Красноярским стол делают тайга и река. Черемшу — её здесь чаще зовут колбой — солят весной на весь год и потом кладут в пироги и салаты. Кедровый орех идёт в выпечку и просто к чаю. Брусника и облепиха живут в морозилке и в банках, а рыбный пирог тут не праздничное блюдо, а нормальное воскресное.", "Сильна и среднеазиатская линия: плов, манты, лагман, самса — для многих красноярских семей это домашняя еда, а не ресторанная. И отдельная городская история — обед на смену: заводской и сменный график плохо дружит с готовкой, поэтому здесь часто берут не разовый ужин, а несколько контейнеров сразу и разогревают их всю неделю."] },
        { h: "Конец августа: шишка, грибы и банки", p: ["Осень в Красноярске приходит рано, и вторая половина августа — уже не лето, а сбор. С дач вдоль Енисея везут кабачки, огурцы, смородину и облепиху, в лесу идут маслята, грузди и рыжики, а к концу месяца начинается шишкование — кедровый орех.", "Если урожай девать некуда, поставьте в меню то, что вы и так делаете: солёные грузди, аджику, варенье, компоты, лечо. Если дачи нет — закажите банку у соседки: домашние заготовки расходятся быстрее, чем появляются. Как разбирать и заготавливать грибы, мы разобрали в отдельной статье; про соленья и варенье — на странице заготовок.", "Ещё одна августовская тема — Успенский пост с 14 по 27 августа. Постное меню домашняя кухня собирает без проблем: грибной суп, пирожки с капустой, гречка с грибами, вареники с картошкой. Просто напишите повару в чате: без яиц, молока и сметаны."] },
        { h: "Еда, которую берут с собой", p: ["Красноярская привычка выходного дня — уехать из дома: Столбы, остров Татышев, дача за городом. И почти всегда встаёт один и тот же вопрос: что взять поесть. Пирожки, шаньги, котлеты, варёные яйца и термос — набор, который в рюкзаке не разваливается и не просит холодильника. Договориться о таком заказе с соседом-поваром накануне проще, чем вставать в шесть утра к плите. Что ещё берут с собой на дачу и пикник — в отдельном гиде."] },
        { h: "Скоро школа", p: ["К 1 сентября возвращается вечный родительский вопрос: чем кормить ребёнка в учебные дни, если сами вы на работе до семи. Договориться с соседом-поваром об обедах на учебную неделю — рабочий вариант: у ребёнка горячий суп и котлета вместо булки из буфета, а у вас на одну заботу меньше. Что заказывать и как обсуждать это с поваром — в нашем гиде про домашнюю еду для школьника."] },
        { h: "С чего начать", p: ["Загляните на страницу «Домашняя еда в Красноярске», посмотрите поваров рядом и закажите первый обед. Если в вашем районе поваров пока нет — оставьте заявку или расскажите о Селине соседке, чьи пельмени и шаньги знает весь подъезд. С неё в вашем доме всё и начнётся.", "И если готовите вы сами и делаете это хорошо — заведите профиль повара. На Взлётке, в Северном и Солнечном людей много, кухонь мало, а желающих съесть нормальный домашний суп в среду вечером — весь дом."] },
      ],
      faq: [
        { q: "Как заказать домашнюю еду в Красноярске?", a: "Откройте страницу «Домашняя еда в Красноярске» на Селине и посмотрите, кто готовит рядом с вами — на левом берегу (Взлётка, Северный, Солнечный, Зелёная Роща, Академгородок) или на правом (Черёмушки, Пашенный, Предмостная). Добавьте блюда в корзину и выберите доставку от повара или самовывоз; оплата — наличными при получении." },
        { q: "Сколько стоит домашняя еда в Красноярске?", a: "Цену назначает сам повар. Обычно порция домашней еды выходит дешевле ресторанной и больше по объёму — вы платите за еду, а не за зал и обслуживание. Сейчас Селина не берёт комиссию, поэтому наценки сервиса в цене нет вообще." },
        { q: "Можно ли заказать обеды сразу на неделю?", a: "Да, и в городе со сменным графиком это один из самых частых запросов. С поваром договариваются на несколько контейнеров сразу — суп, второе, гарнир — и забирают их одним заказом. Как это устроить и сколько это стоит, разобрано на странице «Готовая еда на неделю»." },
        { q: "Безопасно ли заказывать у домашнего повара?", a: "Повар подтверждает личность по документам и соглашается с санитарными правилами, у каждого блюда открыт состав, а перед заказом с поваром можно поговорить в чате — про аллергены, остроту, способ приготовления. Оплата после получения делает первый заказ спокойным: сначала вы видите еду, потом платите." },
        { q: "Готовят ли в Красноярске сибирские блюда — с черемшой, кедровым орехом, ягодой?", a: "Если повар рядом с вами их делает — да: солёная черемша (колба), пироги с ягодой и рыбой, выпечка с кедровым орехом для красноярских кухонь обычное дело. Отдельного раздела в меню под них нет, поэтому проще спросить в чате или посмотреть описание кухни повара — многое зависит от сезона и от того, что человек успел заготовить." },
        { q: "Как стать домашним поваром в Красноярске?", a: "Заведите профиль повара, пройдите проверку личности и поставьте в меню то, что вы готовите и так: пельмени, супы, шаньги, пироги, заготовки. Сейчас сервис не берёт комиссию — повар получает всю сумму заказа целиком." },
      ],
    },
    en: {
      title: "Homemade Food in Krasnoyarsk: Pelmeni, Pies and Lunches",
      excerpt:
        "A guide to home-cooked food in Krasnoyarsk: Siberian pelmeni, fish pie, shangi and weekday lunches from neighbor cooks — from Vzlyotka to the right bank.",
      body: [
        { p: ["Krasnoyarsk sits on the Yenisei, and the river splits the city in two: the left bank with the centre, Prospekt Mira and Vzlyotka, the right bank industrial and very domestic. The taiga starts right past the edge of town — you can reach the Stolby by city transport. Hence the table: Siberian, filling, with mushrooms, berries and fish counted as ordinary groceries rather than delicacies. Here's how to order real homemade food in Krasnoyarsk — cooked by a neighbor in your own district, not 'homestyle' out of a plant."] },
        { h: "How it works", p: ["On Celina, verified neighbor cooks do the cooking. Open the city page, see who cooks nearby — in Vzlyotka, Severny, Solnechny, Zelyonaya Roshcha, Vetluzhanka, Akademgorodok, or across the river in Cheryomushki and Pashenny — pick dishes and order with delivery or pickup. The cook lives a couple of blocks away, so lunch doesn't sit in the queue on the Kommunalny bridge with you.", "Every cook passes identity verification, dishes list their ingredients, and payment is cash on receipt: first you see the order, then you pay. No commissions right now — the cook keeps the full amount."] },
        { h: "What people order in Krasnoyarsk", p: ["Siberian home classics start with pelmeni: they're made in bulk, for several evenings ahead, and frozen — nobody here needs the difference from shop-bought explained. Alongside them: big-pot shchi and borscht, cutlets with mash, shangi and vatrushki for tea, pies with cabbage, berries or fish.", "What makes the table specifically Krasnoyarsk is the taiga and the river. Wild garlic — kolba, as it's called here — is salted in spring for the whole year and then goes into pies and salads. Pine nuts go into baking and are eaten plain with tea. Lingonberry and sea buckthorn live in the freezer and in jars, and a fish pie is an ordinary Sunday dish, not a holiday one.", "The Central Asian line is strong too: plov, manty, lagman, samsa — family food rather than restaurant food for many local households. And one local pattern stands out: lunch for the shift. Factory schedules leave no room for cooking, so people often order several containers at once and reheat them through the week."] },
        { h: "Late August: pine cones, mushrooms and jars", p: ["Autumn comes early in Krasnoyarsk, and the second half of August is already harvest rather than summer. Courgettes, cucumbers, currants and sea buckthorn come in from the dacha gardens along the Yenisei, slippery jacks, milk caps and saffron milk caps are out in the forest, and by the end of the month the pine-nut season begins.", "If the harvest has nowhere left to go, list what you already make: salted mushrooms, adjika, jam, compote, lecho. If you have no dacha, order a jar from a neighbor — homemade preserves sell faster than they appear. We covered sorting and preserving mushrooms in a separate article.", "The Dormition Fast runs 14–27 August, and a home kitchen handles a lean menu easily: mushroom soup, cabbage pirozhki, buckwheat with mushrooms, potato vareniki. Just tell the cook in chat: no eggs, milk or sour cream."] },
        { h: "Food you take with you", p: ["The local weekend habit is to leave the house: the Stolby, Tatyshev island, the dacha out of town. And the same question comes up every time — what to take to eat. Pirozhki, shangi, cutlets, boiled eggs and a thermos: a set that survives a backpack and asks for no fridge. Arranging that with a neighbor cook the evening before beats getting up at six to fry it yourself."] },
        { h: "School is coming", p: ["By 1 September the old parental question returns: what does the child eat on school days if you're at work until seven. Arranging weekday lunches with a neighbor cook works well — hot soup and a cutlet instead of a canteen bun, and one worry less for you."] },
        { h: "Where to start", p: ["Open the 'Homemade food in Krasnoyarsk' page, look at the cooks nearby and order your first meal. If your district has none yet, the service is only launching: leave a request, or tell the neighbor whose pelmeni and shangi the whole stairwell knows about Celina.", "And if you're the one who cooks well — set up a cook profile. In Vzlyotka, Severny and Solnechny there are plenty of people, few kitchens, and a whole building that would like a proper home-cooked soup on a Wednesday evening."] },
      ],
      faq: [
        { q: "How do I order homemade food in Krasnoyarsk?", a: "Open the 'Homemade food in Krasnoyarsk' page on Celina and see who cooks near you — on the left bank (Vzlyotka, Severny, Solnechny, Zelyonaya Roshcha, Akademgorodok) or the right (Cheryomushki, Pashenny, Predmostnaya). Add dishes to the cart and choose delivery from the cook or pickup; payment is cash on receipt." },
        { q: "What does home-cooked food cost in Krasnoyarsk?", a: "The cook sets the price. A home-cooked portion is usually cheaper than a restaurant one and larger — you pay for the food, not for a dining room and service. Right now Celina charges no commission, so there is no service markup in the price at all." },
        { q: "Can I order a whole week of lunches?", a: "Yes, and in a shift-work city it's one of the most common requests. People arrange several containers at once with a cook — soup, a main, a side — and collect them in one order." },
        { q: "Is it safe to order from a home cook?", a: "The cook verifies their identity with documents and agrees to the hygiene rules, every dish lists its ingredients, and you can talk to the cook in chat before ordering — about allergens, spice level, how something is made. Paying on receipt keeps the first order low-risk." },
        { q: "Do cooks in Krasnoyarsk make Siberian dishes — wild garlic, pine nuts, berries?", a: "If a cook near you makes them, yes: salted kolba, berry and fish pies, pine-nut baking are ordinary things in a Krasnoyarsk kitchen. There's no separate menu section for them, so ask in chat or read the cook's kitchen description — much depends on the season and on what the person managed to put up." },
        { q: "How do I become a home cook in Krasnoyarsk?", a: "Set up a cook profile, pass identity verification and list what you already cook: pelmeni, soups, shangi, pies, preserves. Right now the service takes no commission — the cook keeps the whole order amount." },
      ],
    },
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

/** Контент поста на нужном языке (RU по умолчанию). */
export function postL(post: BlogPost, lang: Lang): BlogLocale {
  return lang === "en" ? post.en : post.ru;
}
