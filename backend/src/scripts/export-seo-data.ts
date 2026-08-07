/**
 * Экспорт данных для программного SEO (статический снимок для пререндера фронта).
 * Запуск:  npm run seo:export   →   пишет frontend/src/data/seo-data.json
 *
 * Снимок читается на сборке (vite-react-ssg), чтобы у страниц поваров/блюд/городов
 * был реальный HTML для краулеров. Сервер при сборке поднимать не нужно.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ── транслит RU→LAT для читаемых ЧПУ-слагов ──
const RU2LAT: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i",
  й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t",
  у: "u", ф: "f", х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y",
  ь: "", э: "e", ю: "yu", я: "ya",
};
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .split("")
    .map((ch) => (ch in RU2LAT ? RU2LAT[ch] : ch))
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

// Предложный падеж («в …») для корректной грамматики на SEO-страницах.
const CITY_PREP: Record<string, string> = {
  "Москва": "Москве", "Санкт-Петербург": "Санкт-Петербурге", "Новосибирск": "Новосибирске",
  "Екатеринбург": "Екатеринбурге", "Казань": "Казани", "Нижний Новгород": "Нижнем Новгороде",
  "Челябинск": "Челябинске", "Самара": "Самаре", "Омск": "Омске", "Ростов-на-Дону": "Ростове-на-Дону",
  "Уфа": "Уфе", "Красноярск": "Красноярске", "Воронеж": "Воронеже", "Пермь": "Перми",
  "Волгоград": "Волгограде", "Краснодар": "Краснодаре", "Саратов": "Саратове", "Тюмень": "Тюмени",
  "Тольятти": "Тольятти", "Ижевск": "Ижевске", "Барнаул": "Барнауле", "Ульяновск": "Ульяновске",
  "Иркутск": "Иркутске", "Хабаровск": "Хабаровске", "Ярославль": "Ярославле", "Владивосток": "Владивостоке",
  "Махачкала": "Махачкале", "Томск": "Томске", "Оренбург": "Оренбурге", "Кемерово": "Кемерове",
  "Новокузнецк": "Новокузнецке", "Рязань": "Рязани", "Астрахань": "Астрахани",
  "Набережные Челны": "Набережных Челнах", "Пенза": "Пензе", "Липецк": "Липецке", "Киров": "Кирове",
  "Чебоксары": "Чебоксарах", "Тула": "Туле", "Калининград": "Калининграде", "Курск": "Курске",
  "Ставрополь": "Ставрополе", "Улан-Удэ": "Улан-Удэ", "Тверь": "Твери", "Магнитогорск": "Магнитогорске",
  "Сочи": "Сочи", "Иваново": "Иванове", "Брянск": "Брянске", "Белгород": "Белгороде", "Сургут": "Сургуте",
  "Владимир": "Владимире", "Архангельск": "Архангельске", "Чита": "Чите", "Калуга": "Калуге",
  "Смоленск": "Смоленске", "Волжский": "Волжском", "Якутск": "Якутске", "Саранск": "Саранске",
  "Череповец": "Череповце", "Вологда": "Вологде", "Курган": "Кургане", "Орёл": "Орле",
  "Грозный": "Грозном", "Мурманск": "Мурманске", "Тамбов": "Тамбове", "Петрозаводск": "Петрозаводске",
  "Нижневартовск": "Нижневартовске", "Кострома": "Костроме", "Новороссийск": "Новороссийске",
  "Йошкар-Ола": "Йошкар-Оле", "Таганрог": "Таганроге", "Сыктывкар": "Сыктывкаре", "Нальчик": "Нальчике",
};

async function main() {
  // те же правила, что и в ленте: только верифицированные повара с доступным блюдом+фото
  const cooks = await prisma.cookProfile.findMany({
    where: {
      user: { isVerified: true },
      dishes: { some: { isAvailable: true, photoUrl: { not: null } } },
    },
    include: {
      dishes: { where: { isAvailable: true } },
      user: { select: { name: true, city: true, lat: true, lng: true } },
      // последние отзывы с текстом → для Review-schema на странице повара (rich snippets)
      reviews: {
        where: { comment: { not: null } },
        orderBy: { createdAt: "desc" },
        take: 12,
        select: { rating: true, comment: true, createdAt: true, buyer: { select: { name: true } } },
      },
    },
    orderBy: [{ rating: "desc" }],
  });

  const csv = (s: string | null | undefined) => (s ? s.split(",").map((x) => x.trim()).filter(Boolean) : []);

  const cookData = cooks.map((c) => ({
    id: c.id,
    slug: slugify(c.kitchenName || "kitchen") + "-" + c.id.slice(-6),
    kitchenName: c.kitchenName,
    ownerName: c.user?.name ?? "",
    bio: c.bio ?? "",
    city: c.city ?? c.user?.city ?? "",
    cuisine: csv(c.cuisine),
    rating: c.rating,
    ratingsCount: c.ratingsCount,
    lat: c.user?.lat ?? null,
    lng: c.user?.lng ?? null,
    dishes: c.dishes.map((d) => ({
      id: d.id,
      slug: slugify(d.title || "dish") + "-" + d.id.slice(-6),
      title: d.title,
      category: d.category,
      price: d.price,
      photoUrl: d.photoUrl,
      description: d.description ?? "",
    })),
    reviews: c.reviews.map((r) => ({
      rating: r.rating,
      comment: r.comment ?? "",
      createdAt: r.createdAt.toISOString(),
      buyerName: r.buyer?.name ?? "",
    })),
  }));

  // города (из реальных поваров) + категории — для программных страниц
  const cityMap = new Map<string, number>();
  const catMap = new Map<string, number>();
  for (const c of cookData) {
    if (c.city) cityMap.set(c.city, (cityMap.get(c.city) ?? 0) + 1);
    for (const d of c.dishes) if (d.category) catMap.set(d.category, (catMap.get(d.category) ?? 0) + 1);
  }
  const cities = [...cityMap.entries()].map(([name, cookCount]) => ({ name, prep: CITY_PREP[name] ?? name, slug: slugify(name), cookCount }))
    .sort((a, b) => b.cookCount - a.cookCount);
  const categories = [...catMap.entries()].map(([name, count]) => ({ name, slug: slugify(name), count }))
    .sort((a, b) => b.count - a.count);

  const out = { generatedAt: new Date().toISOString(), cooks: cookData, cities, categories };

  const here = dirname(fileURLToPath(import.meta.url));
  const dest = resolve(here, "../../../frontend/src/data/seo-data.json");
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, JSON.stringify(out, null, 2), "utf8");
  console.log(`✅ SEO snapshot: ${cookData.length} поваров, ${cities.length} городов, ${categories.length} категорий → ${dest}`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
