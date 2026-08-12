import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const pw = (s: string) => bcrypt.hashSync(s, 10);

// все демо-пользователи прошли верификацию и приняли политику
const verified = {
  isVerified: true,
  verificationStatus: "VERIFIED",
  verifiedAt: new Date(),
  policyAcceptedAt: new Date(),
};

const img = (p: string) => `/images/${p}`;

// поля безопасности пищи для верифицированного повара
const cookSafety = {
  hygieneAccepted: true,
  kitchenPhotos: "/images/borscht.jpg",
  foodSafetySignedAt: new Date(),
};

async function main() {
  // очистка
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.dish.deleteMany();
  await prisma.cookProfile.deleteMany();
  await prisma.user.deleteMany();

  // ОСНОВАТЕЛЬ — доступ к панели и одобрению верификаций (только Шломи)
  await prisma.user.create({
    data: {
      phone: "+972545594088",
      email: "shlomiaflalo88@gmail.com",
      name: "Shlomi Aflalo — Founder",
      passwordHash: pw(process.env.FOUNDER_PASSWORD || "change-me-in-env"),
      role: "BUYER",
      isFounder: true,
      city: "Москва",
      ...verified,
    },
  });

  // покупатель для демо
  await prisma.user.create({
    data: {
      phone: "+79990000001",
      name: "Анна",
      passwordHash: pw("1234"),
      role: "BUYER",
      city: "Москва",
      address: "ул. Тверская, 10",
      ...verified,
    },
  });

  // повар 1 — Мария, русская кухня
  await prisma.user.create({
    data: {
      phone: "+79990000010",
      name: "Мария Иванова",
      passwordHash: pw("1234"),
      role: "COOK",
      city: "Москва",
      ...verified,
      cookProfile: {
        create: {
          kitchenName: "Домашняя кухня Марии",
          activationPaidAt: new Date(),
          bio: "Готовлю как бабушка учила — щи, борщи, пельмени ручной лепки.",
          cuisine: "русская,домашняя",
          isOnline: true,
          deliveryFee: 250,
          minOrder: 600,
          rating: 4.8,
          ratingsCount: 42,
          city: "Москва",
          ...cookSafety,
          dishes: {
            create: [
              {
                title: "Борщ украинский",
                description: "Наваристый борщ со сметаной и пампушками.",
                price: 390,
                category: "супы",
                portions: 8,
                prepTimeMin: 40,
                tags: "горячее",
                ingredients: "Свёкла, капуста, картофель, морковь, говядина, сметана",
                allergens: "молоко,сельдерей",
                photoUrl: img("borscht.jpg"),
                photos: "/images/borscht.jpg",
              },
              {
                title: "Пельмени домашние",
                description: "Ручная лепка, говядина и свинина. Порция 15 шт.",
                price: 490,
                category: "горячее",
                portions: 12,
                prepTimeMin: 25,
                ingredients: "Мука, яйца, говядина, свинина, лук",
                allergens: "глютен,яйца",
                photoUrl: img("pelmeni.jpg"),
                photos: "/images/pelmeni.jpg",
              },
              {
                title: "Блины с начинкой",
                description: "Тонкие блины с творогом или мясом, 5 шт.",
                price: 350,
                category: "горячее",
                portions: 10,
                prepTimeMin: 30,
                photoUrl: img("blini.jpg"),
                photos: "/images/blini.jpg",
              },
              {
                title: "Салат Оливье",
                description: "Классический оливье по домашнему рецепту.",
                price: 380,
                category: "салаты",
                portions: 8,
                prepTimeMin: 25,
                tags: "вегетарианское",
                photoUrl: img("olivier-salad.jpg"),
                photos: "/images/olivier-salad.jpg",
              },
              {
                title: "Сырники со сметаной",
                description: "Нежные творожные сырники, 4 шт.",
                price: 320,
                category: "десерты",
                portions: 10,
                prepTimeMin: 20,
                tags: "вегетарианское",
                photoUrl: img("syrniki.jpg"),
                photos: "/images/syrniki.jpg",
              },
            ],
          },
        },
      },
    },
  });

  // повар 2 — Георгий, грузинская кухня
  await prisma.user.create({
    data: {
      phone: "+79990000011",
      name: "Георгий",
      passwordHash: pw("1234"),
      role: "COOK",
      city: "Москва",
      ...verified,
      cookProfile: {
        create: {
          kitchenName: "Грузинский дворик",
          activationPaidAt: new Date(),
          bio: "Настоящие хинкали и хачапури по семейным рецептам из Тбилиси.",
          cuisine: "грузинская",
          isOnline: true,
          deliveryFee: 300,
          minOrder: 800,
          rating: 4.9,
          ratingsCount: 67,
          city: "Москва",
          ...cookSafety,
          dineInEnabled: true,
          dineInPrice: 1200,
          dineInSeats: 4,
          dineInDesc:
            "Зову на чай с домашней выпечкой и душевный разговор. Грузинское гостеприимство — по-соседски!",
          dishes: {
            create: [
              {
                title: "Хинкали (5 шт.)",
                description: "Сочные хинкали с говядиной и зеленью.",
                price: 550,
                category: "горячее",
                portions: 20,
                prepTimeMin: 30,
                photoUrl: img("khinkali.jpg"),
                photos: "/images/khinkali.jpg",
              },
              {
                title: "Хачапури по-аджарски",
                description: "Лодочка с сыром сулугуни и яйцом.",
                price: 650,
                category: "выпечка",
                portions: 6,
                prepTimeMin: 35,
                tags: "вегетарианское",
                ingredients: "Мука, сыр сулугуни, яйцо, масло",
                allergens: "глютен,молоко,яйца",
                photoUrl: img("khachapuri.jpg"),
                photos: "/images/khachapuri.jpg",
              },
            ],
          },
        },
      },
    },
  });

  // повар 3 — Ольга, выпечка (офлайн сейчас)
  await prisma.user.create({
    data: {
      phone: "+79990000012",
      name: "Ольга",
      passwordHash: pw("1234"),
      role: "COOK",
      city: "Санкт-Петербург",
      ...verified,
      cookProfile: {
        create: {
          kitchenName: "Пироги от Ольги",
          activationPaidAt: new Date(),
          bio: "Домашняя выпечка: пироги, ватрушки, торты на заказ.",
          cuisine: "выпечка,домашняя",
          isOnline: false,
          deliveryFee: 200,
          minOrder: 500,
          rating: 4.7,
          ratingsCount: 23,
          city: "Санкт-Петербург",
          ...cookSafety,
          dishes: {
            create: [
              {
                title: "Пирог с яблоками",
                description: "Песочный пирог с антоновкой.",
                price: 850,
                category: "выпечка",
                portions: 4,
                prepTimeMin: 60,
                tags: "вегетарианское",
                photoUrl: img("apple-pie.jpg"),
                photos: "/images/apple-pie.jpg",
              },
              {
                title: "Пирожки печёные (6 шт.)",
                description: "С капустой, картошкой и яблоком — на выбор.",
                price: 360,
                category: "выпечка",
                portions: 8,
                prepTimeMin: 45,
                tags: "вегетарианское",
                photoUrl: img("pirozhki.jpg"),
                photos: "/images/pirozhki.jpg",
              },
            ],
          },
        },
      },
    },
  });

  // ── отзывы (через доставленные заказы) ──
  const buyer = await prisma.user.findUnique({ where: { phone: "+79990000001" } });
  const reviewSeed = [
    { kitchen: "Грузинский дворик", rating: 5, comment: "Хинкали — просто космос! Сочные, горячие. Закажу ещё." },
    { kitchen: "Грузинский дворик", rating: 5, comment: "Хачапури как в Тбилиси. Спасибо, Георгий!" },
    { kitchen: "Домашняя кухня Марии", rating: 5, comment: "Борщ — пальчики оближешь, как у бабушки 🥰" },
    { kitchen: "Домашняя кухня Марии", rating: 4, comment: "Очень вкусно, пельмени домашние. Чуть дольше ждала доставку." },
  ];

  for (const r of reviewSeed) {
    const cook = await prisma.cookProfile.findFirst({
      where: { kitchenName: r.kitchen },
      include: { dishes: true },
    });
    if (!cook || !buyer || cook.dishes.length === 0) continue;
    const dish = cook.dishes[0];
    const order = await prisma.order.create({
      data: {
        buyerId: buyer.id,
        cookProfileId: cook.id,
        status: "DELIVERED",
        fulfillment: "DELIVERY",
        address: "ул. Тверская, 10",
        deliveryFee: cook.deliveryFee,
        total: dish.price + cook.deliveryFee,
        paymentStatus: "PAID",
        paymentMethod: "card",
        paidAt: new Date(),
        items: {
          create: {
            dishId: dish.id,
            titleSnapshot: dish.title,
            priceAtOrder: dish.price,
            qty: 1,
          },
        },
      },
    });
    await prisma.review.create({
      data: {
        orderId: order.id,
        buyerId: buyer.id,
        cookProfileId: cook.id,
        rating: r.rating,
        comment: r.comment,
      },
    });
  }

  // координаты по городу (без внешних API) + детерминированный разброс,
  // чтобы расстояние в ленте было реальным, а повара в одном городе различались
  const allUsers = await prisma.user.findMany({ select: { id: true, city: true } });
  for (const u of allUsers) {
    const c = u.city ? CITY_COORDS[u.city.trim()] : null;
    if (!c) continue;
    const jit = (salt: number) => {
      let h = salt;
      for (let i = 0; i < u.id.length; i++) h = (h * 31 + u.id.charCodeAt(i)) >>> 0;
      return ((h % 600) - 300) / 10000; // ±0.03° ≈ ±3 км
    };
    await prisma.user.update({ where: { id: u.id }, data: { lat: c[0] + jit(7), lng: c[1] + jit(13) } });
  }

  // демо-застолья (соседский социальный слой)
  const someCook = await prisma.user.findFirst({ where: { phone: "+79990000010" } });
  const someBuyer = await prisma.user.findFirst({ where: { phone: "+79990000001" } });
  const future = (days: number, h: number) => { const d = new Date(); d.setDate(d.getDate() + days); d.setHours(h, 0, 0, 0); return d; };
  const allUsersForHost = await prisma.user.findMany({ take: 6, select: { id: true } });
  if (someCook && someBuyer && allUsersForHost.length) {
    const host = (i: number) => allUsersForHost[i % allUsersForHost.length].id;
    // у каждого застолья уникальная и тематически подходящая обложка (без повторов!)
    const G = "/images/gatherings/";
    const D = "/images/dishes/";
    const gatherings = [
      { hostId: someCook.id, title: "Грузинский вечер: хинкали и хачапури", description: "Лепим хинкали вместе, горячие хачапури, тёплая компания соседей.", city: "Москва", address: "ул. Тверская, 12", coverUrl: "/images/khinkali.jpg", startsAt: future(3, 19), maxSeats: 8, pricePerGuest: 700 },
      { hostId: someBuyer.id, title: "Блинный завтрак по-соседски", description: "Воскресные блины с разными начинками, чай из самовара.", city: "Москва", address: "Ленинский пр-т, 30", coverUrl: G + "blini.jpg", startsAt: future(5, 11), maxSeats: 6, pricePerGuest: 0 },
      { hostId: someCook.id, title: "Пельменный мастер-класс", description: "Учимся лепить настоящие сибирские пельмени и сразу ужинаем.", city: "Санкт-Петербург", address: "Невский пр-т, 45", coverUrl: "/images/pelmeni.jpg", startsAt: future(7, 18), maxSeats: 10, pricePerGuest: 500 },
      { hostId: host(0), title: "Пельмени-вечер у Дмитрия", description: "Лепим и едим пельмени, домашний морс, душевные разговоры.", city: "Москва", address: "ул. Арбат, 20", coverUrl: D + "manty.jpg", startsAt: future(2, 19), maxSeats: 8, pricePerGuest: 600 },
      { hostId: host(1), title: "Узбекский плов во дворе", description: "Настоящий плов в казане на костре, лепёшки и зелёный чай.", city: "Казань", address: "ул. Баумана, 5", coverUrl: D + "plov.jpg", startsAt: future(4, 14), maxSeats: 12, pricePerGuest: 800 },
      { hostId: host(2), title: "Грузинское супра", description: "Хинкали, хачапури, домашний лимонад и тосты от тамады.", city: "Сочи", address: "ул. Навагинская, 9", coverUrl: G + "supra.jpg", startsAt: future(5, 18), maxSeats: 10, pricePerGuest: 1000 },
      { hostId: host(3), title: "Шашлык на даче", description: "Жарим шашлык на мангале, овощи-гриль и душевные посиделки.", city: "Краснодар", address: "СНТ Берёзка, уч. 14", coverUrl: D + "shashlik.jpg", startsAt: future(7, 16), maxSeats: 14, pricePerGuest: 700 },
      { hostId: host(4), title: "Сибирский ужин", description: "Уха, пельмени и домашние соленья по семейным рецептам.", city: "Новосибирск", address: "Красный пр-т, 33", coverUrl: G + "dinner_spread.jpg", startsAt: future(8, 19), maxSeats: 8, pricePerGuest: 500 },
      { hostId: host(5), title: "Пикник у реки", description: "Корзинка с домашней едой, плед и закат на берегу.", city: "Нижний Новгород", address: "Нижне-Волжская наб., 1", coverUrl: D + "ponchiki.jpg", startsAt: future(9, 17), maxSeats: 10, pricePerGuest: 0 },
      { hostId: host(0), title: "Кавказское застолье", description: "Большой стол: люля, аджапсандали, зелень и тосты.", city: "Екатеринбург", address: "ул. Вайнера, 12", coverUrl: D + "kotlety.jpg", startsAt: future(10, 18), maxSeats: 12, pricePerGuest: 900 },
      { hostId: host(1), title: "Чаепитие с самоваром", description: "Самовар, варенье, пироги и неспешные разговоры.", city: "Калининград", address: "Ленинский пр-т, 5", coverUrl: D + "medovik.jpg", startsAt: future(11, 16), maxSeats: 8, pricePerGuest: 300 },
      { hostId: host(2), title: "Русское чаепитие", description: "Травяной чай из самовара, домашняя выпечка, тёплый вечер.", city: "Владивосток", address: "ул. Светланская, 22", coverUrl: D + "napoleon.jpg", startsAt: future(12, 18), maxSeats: 6, pricePerGuest: 0 },
      { hostId: host(4), title: "Волжская уха на берегу", description: "Наваристая уха на костре, свежая зелень и закат над Волгой.", city: "Самара", address: "наб. Волги, 7", coverUrl: D + "ukha.jpg", startsAt: future(4, 18), maxSeats: 10, pricePerGuest: 500 },
      { hostId: host(5), title: "Домашние вареники вечер", description: "Лепим вареники с вишней и картошкой, сметана и хорошее настроение.", city: "Воронеж", address: "пр-т Революции, 25", coverUrl: D + "vareniki.jpg", startsAt: future(5, 19), maxSeats: 8, pricePerGuest: 400 },
      { hostId: host(5), title: "Таёжный ужин", description: "Дичь на углях, кедровые орехи, травяной чай и сибирское гостеприимство.", city: "Красноярск", address: "пр-т Мира, 60", coverUrl: D + "beefstrog.jpg", startsAt: future(11, 18), maxSeats: 10, pricePerGuest: 800 },
      { hostId: host(0), title: "Пермские посикунчики", description: "Жарим пермские посикунчики, домашние соленья и душевная беседа.", city: "Пермь", address: "ул. Ленина, 50", coverUrl: D + "cheburek.jpg", startsAt: future(12, 19), maxSeats: 8, pricePerGuest: 450 },
    ];
    for (const g of gatherings) {
      const ex = await prisma.gathering.findFirst({ where: { title: g.title } });
      if (!ex) { await prisma.gathering.create({ data: g }); continue; }
      // существующим застольям обновляем обложку (фикс дублей/неподходящих фото)
      // и прошедшие даты сдвигаем в будущее — демо-застолья не должны выглядеть завершёнными
      const patch: { coverUrl?: string; startsAt?: Date } = {};
      if (ex.coverUrl !== g.coverUrl) patch.coverUrl = g.coverUrl;
      if (ex.startsAt < new Date()) patch.startsAt = g.startsAt;
      if (Object.keys(patch).length) await prisma.gathering.update({ where: { id: ex.id }, data: patch });
    }
  }

  console.log("✅ Seed готов: 1 покупатель, 3 повара, 9 блюд, 4 отзыва, 16 застолий (все верифицированы).");
  console.log("   Покупатель: +79990000001 / 1234");
  console.log("   Повар:      +79990000010 / 1234");
}

// координаты центров городов (минимум для демо-данных)
const CITY_COORDS: Record<string, [number, number]> = {
  "Москва": [55.7558, 37.6173],
  "Санкт-Петербург": [59.9311, 30.3609],
  "Казань": [55.7963, 49.1088],
  "Новосибирск": [55.0084, 82.9357],
  "Екатеринбург": [56.8389, 60.6057],
  "Сочи": [43.6028, 39.7342],
  "Краснодар": [45.0355, 38.9753],
  "Нижний Новгород": [56.2965, 43.9361],
};

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
