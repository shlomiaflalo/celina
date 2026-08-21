import { useParams, Link, useNavigate } from "react-router-dom";
import { Seo, SITE_URL } from "../../components/Seo";
import { cityImage } from "../../lib/cityImage";
import { getCity, cooksInCity, seoCities, seoCategories, cooksInCityByCategory, cap, type SeoCook, type SeoCity } from "../../lib/seoData";
import { getCityStatic, CITY_CATALOG } from "../../lib/cityCatalog";
import { useTr , plRu, useT } from "../../i18n";
import { NotFound } from "../NotFound";
import { WaitlistForm } from "../../components/WaitlistForm";
import { cityContent } from "../../data/cityContent";
import { COUNTRIES } from "../../lib/cityCatalog";
import { StarIcon } from "../../components/icons";

// Городские гиды блога — обратная перелинковка «страница города → гид»
// (гиды уже ссылаются сюда; двусторонние ссылки усиливают весь кластер).
const CITY_GUIDES: Record<string, string> = {
  moskva: "gde-zakazat-domashnyuyu-edu-v-moskve",
  "sankt-peterburg": "domashnyaya-eda-v-sankt-peterburge",
  novosibirsk: "domashnyaya-eda-v-novosibirske",
  ekaterinburg: "domashnyaya-eda-v-ekaterinburge",
  kazan: "domashnyaya-eda-v-kazani",
  "nizhniy-novgorod": "domashnyaya-eda-v-nizhnem-novgorode",
  krasnodar: "domashnyaya-eda-v-krasnodare",
  "rostov-na-donu": "domashnyaya-eda-v-rostove-na-donu",
  ufa: "domashnyaya-eda-v-ufe",
  chelyabinsk: "domashnyaya-eda-v-chelyabinske",
  krasnoyarsk: "domashnyaya-eda-v-krasnoyarske",
};

// Карточка повара — те же классы оформления, что в ленте (дизайн не меняем).
export function CookCard({ cook }: { cook: SeoCook }) {
  const tr = useTr();
  return (
    <Link
      to={`/cooks/${cook.id}`}
      className="group block overflow-hidden rounded-3xl bg-white shadow-[0_6px_24px_rgba(176,104,8,0.10)] ring-1 ring-orange-100 transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_44px_rgba(176,104,8,0.20)]"
    >
      <div className="relative h-44 overflow-hidden bg-orange-50">
        <img
          src={cook.dishes?.[0]?.photoUrl || cityImage(cook.city)}
          alt={`${cook.kitchenName} — домашняя еда в городе ${cook.city}`}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition duration-[600ms] group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-[#e0860c] shadow-sm">
          <StarIcon size={13} /> {cook.rating.toFixed(1)}
        </span>
        <div className="absolute inset-x-4 bottom-3">
          <h2 className="truncate text-lg font-bold text-white drop-shadow">{tr(cook.kitchenName)}</h2>
        </div>
      </div>
      <div className="p-4">
        {cook.bio && <p className="line-clamp-1 text-sm text-[#e0860c]">{tr(cook.bio)}</p>}
        <div className="mt-2 flex flex-wrap gap-1.5">
          {cook.cuisine.slice(0, 3).map((c) => (
            <span key={c} className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-medium text-[#e0860c]">{c}</span>
          ))}
        </div>
        {cook.dishes.length > 0 && (
          <p className="mt-2 line-clamp-1 text-xs text-[#e0860c]">
            {cook.dishes.slice(0, 4).map((d) => tr(d.title)).join(" · ")}
          </p>
        )}
      </div>
    </Link>
  );
}

export function CityPage() {
  const { citySlug = "" } = useParams();
  const t = useT();
  const navigate = useNavigate();
  const cooks = cooksInCity(citySlug);
  // город берём из живого каталога, иначе — из статического списка приоритетных
  // городов. Так «Домашняя еда в <городе>» существует и индексируется даже без
  // поваров: показываем полноценный SEO-текст + мягкое приглашение стать первым.
  const stat = getCityStatic(citySlug);
  const city: SeoCity | undefined = getCity(citySlug) ?? (stat ? { name: stat.name, prep: stat.prep, slug: stat.slug, cookCount: 0 } : undefined);
  if (!city) return <NotFound />;
  const empty = cooks.length === 0;
  // Уникальный текст города. Без него страница — шаблон с подставленным
  // названием; см. комментарий в data/cityContent.ts. Города без записи в
  // маршруты не попадают, так что на проде copy здесь всегда есть.
  const copy = cityContent(city.slug);
  // SeoCity приходит из снимка и страны не знает — страна живёт в
  // CITY_CATALOG, который и есть источник правды по охвату.
  const entry = CITY_CATALOG.find((c) => c.slug === city.slug);
  const country = COUNTRIES[entry?.country ?? "RU"];
  const foreign = !country.operates;

  const dishWord = cooks.reduce((s, c) => s + c.dishes.length, 0);
  // категории, реально представленные в этом городе — для перелинковки
  const cityCats = seoCategories.filter((cat) => cooksInCityByCategory(citySlug, cat.slug).length > 0);
  // «другие города» — из живого каталога, иначе из статического приоритетного списка
  const otherCities = (seoCities.length ? seoCities : CITY_CATALOG.map((c) => ({ name: c.name, prep: c.prep, slug: c.slug, cookCount: 0 })))
    .filter((c) => c.slug !== citySlug).slice(0, 12);

  // 81 знак не помещался в сниппет Яндекса (~60–70) — хвост обрезался
  // на главных точках входа сайта. Этот шаблон даёт 55–66 на весь каталог.
  // Заголовок обещает ровно то, что страница может дать. «Заказать с
  // доставкой» на городе без единого повара — это гарантированный отказ:
  // человек приходит из поиска за заказом, заказа нет, он уходит назад в
  // выдачу. Для ранжирования это тот же самый сигнал, что и для честности.
  const title = empty
    ? `Домашняя еда в ${city.prep} — Селина собирает список ожидания`
    : `Домашняя еда в ${city.prep} — заказать с доставкой — Селина`;
  const description = empty
    ? `Домашняя еда в ${city.prep} с доставкой на дом от соседей-поваров. Мы запускаемся в ${city.prep} — присоединяйтесь первыми: закажите у соседа или начните готовить сами. Соседи кормят соседей.`
    : `Закажите домашнюю еду в ${city.prep}: ${cooks.length} ${plRu(cooks.length, ["проверенный повар", "проверенных повара", "проверенных поваров"])}, ${dishWord} ${plRu(dishWord, ["блюдо", "блюда", "блюд"])} с доставкой и самовывозом. Свежо, по-домашнему. Соседи кормят соседей.`;

  const faqs = [
    // Все три ответа уходят в FAQPage-разметку, то есть цитируются поисковиком
    // дословно. Пока в городе нет ни одного повара, «добавьте блюда в корзину»
    // и «оплата наличными при получении» — не описание сервиса, а обещание,
    // которое сайт не может выполнить. Проверено на живом /eda/minsk: страница
    // обещала корзину и оплату в стране, где Селина вообще не работает.
    {
      q: empty
        ? `Можно ли уже заказать домашнюю еду в ${city.prep}?`
        : `Как заказать домашнюю еду в ${city.prep}?`,
      a: empty
        ? `Пока нет. В ${city.prep} на Селине ещё нет ни одного повара, поэтому заказать еду и оплатить её через сайт нельзя. Сейчас мы собираем список ожидания, чтобы понять, в каких районах нас ждут.`
        : `Выберите повара в ${city.prep} на Селине, добавьте блюда в корзину и оформите заказ. Повара готовят дома по семейным рецептам, доступны доставка и самовывоз, оплата — наличными при получении.`,
    },
    {
      q: `Безопасно ли заказывать домашнюю еду у соседей в ${city.prep}?`,
      a: empty
        ? `Когда повара появятся — каждый будет проходить проверку личности и подтверждать, что соблюдает санитарные правила, а состав и аллергены будут указаны у каждого блюда. Отзывы сможет оставить только тот, кто действительно сделал заказ.`
        : `Каждый повар на Селине проходит проверку личности и подтверждает, что соблюдает санитарные правила. Состав и аллергены указаны у каждого блюда, а отзыв может оставить только тот, кто действительно заказывал.`,
    },
    {
      q: `Сколько домашних поваров в ${city.prep}?`,
      a: empty
        ? `Ни одного — Селина в ${city.prep} ещё не работает. Если вы готовите дома, отметьтесь в списке ожидания: первым поварам района достаются все первые заказы.`
        : `Сейчас в ${city.prep} ${cooks.length > 1 ? "готовят" : "готовит"} ${cooks.length} ${plRu(cooks.length, ["проверенный повар", "проверенных повара", "проверенных поваров"])}.`,
    },
  ];

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Главная", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: `Домашняя еда в ${city.prep}`, item: `${SITE_URL}/eda/${city.slug}` },
      ],
    },
    // ItemList поваров — только когда они есть (пустой список не размечаем)
    ...(empty ? [] : [{
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `Домашние повара в ${city.prep}`,
      numberOfItems: cooks.length,
      itemListElement: cooks.map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Restaurant",
          name: c.kitchenName,
          servesCuisine: c.cuisine,
          address: { "@type": "PostalAddress", addressLocality: c.city, addressCountry: "RU" },
          aggregateRating: c.ratingsCount > 0 ? { "@type": "AggregateRating", ratingValue: c.rating, reviewCount: c.ratingsCount } : undefined,
          url: `${SITE_URL}/cooks/${c.id}`,
        },
      })),
    }]),
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
  ];

  return (
    <div>
      <Seo title={title} description={description} path={`/eda/${city.slug}`} image={cityImage(city.name)} jsonLd={jsonLd} />

      {/* герой города */}
      <div className="relative z-20 mb-6 overflow-hidden rounded-3xl">
        <img src={cityImage(city.name)} alt={`Домашняя еда в ${city.prep}`} className="absolute inset-0 h-full w-full rounded-3xl object-cover" style={{ objectPosition: "center 42%" }} />
        <div className="absolute inset-0 rounded-3xl" style={{ background: "rgba(224,134,12,0.30)" }} />
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-black/55 via-black/20 to-transparent" />
        <div className="relative px-6 py-10 sm:px-10 sm:py-14">
          <h1 className="text-3xl font-bold text-white drop-shadow sm:text-4xl">Домашняя еда в {city.prep}</h1>
          <p className="mt-2 max-w-xl text-white/90">
            {empty
              ? `Селина здесь пока не работает: поваров в ${city.prep} ещё нет. Собираем список ожидания — отметьте свой район.`
              : `${cooks.length} ${plRu(cooks.length, ["проверенный повар", "проверенных повара", "проверенных поваров"])} рядом — заказывайте свежую домашнюю еду с доставкой и самовывозом.`}
          </p>
        </div>
      </div>

      {/* Вводный абзац. В пустом городе нельзя писать «Селина объединяет
          поваров в X» — это настоящее время о том, чего нет. */}
      <p className="mb-6 leading-relaxed text-white/95 drop-shadow-sm">
        {empty
          ? `Селина — сервис, где соседи готовят домашнюю еду для соседей. В ${city.prep} он пока не запущен: поваров здесь нет, заказать еду через сайт нельзя, оплату мы не принимаем. Мы собираем список ожидания, чтобы понять, где нас ждут.`
          : `Селина объединяет домашних поваров в ${city.prep} и соседей, которые ценят настоящую еду — приготовленную дома, с душой, по семейным рецептам. Выбирайте кухню по душе, читайте отзывы соседей и заказывайте напрямую у повара.`}
      </p>

      {/* категории города (перелинковка) */}
      {cityCats.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {cityCats.map((cat) => (
            <Link key={cat.slug} to={`/eda/${city.slug}/${cat.slug}`} className="rounded-full bg-orange-50 px-3.5 py-1.5 text-sm font-medium text-[#e0860c] ring-1 ring-orange-100 transition hover:bg-orange-100">
              {cap(cat.name)} в {city.prep}
            </Link>
          ))}
        </div>
      )}

      {/* Уникальная часть страницы: районы, рынки, чем город кормится и кто
          уже возит сюда еду. Это то, чего не может быть у шаблона, и то,
          ради чего страница вообще имеет право существовать. */}
      {copy && (
        <div className="mb-8 space-y-4">
          <p className="leading-relaxed">{copy.local}</p>
          <p className="leading-relaxed">{copy.market}</p>
        </div>
      )}

      {/* список поваров, либо список ожидания, если поваров в городе ещё нет:
          честно копим спрос по районам вместо «пустой витрины» */}
      {empty ? (
        <>
          {copy && (
            <div className="card mb-4 p-5">
              <h2 className="t-h3 mb-2">Готовите дома?</h2>
              <p className="leading-relaxed">{copy.cook}</p>
            </div>
          )}
          <WaitlistForm city={city.name} />
          {/* Дисклеймер обязателен на каждой странице вне России: страница
              на русском языке, названная по чужому городу, иначе читается
              как предложение услуги в этой стране. */}
          {foreign && (
            <p className="mt-4 text-sm leading-relaxed text-[#e0860c]/75">
              Сейчас Селина работает только в России. Запуск в {country.prep} потребует
              отдельного решения и выполнения требований местного законодательства: своя
              юрисдикция, свой закон о персональных данных, свой налоговый статус повара.
            </p>
          )}
        </>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {cooks.map((cook) => <CookCard key={cook.id} cook={cook} />)}
        </div>
      )}

      {/* гид по городу — обратная перелинковка блог ↔ страница города */}
      {CITY_GUIDES[city.slug] && (
        <section className="mt-8">
          <Link
            to={`/blog/${CITY_GUIDES[city.slug]}`}
            className="block rounded-2xl border border-orange-100 bg-white p-5 shadow-sm transition hover:bg-orange-50"
          >
            <span className="text-sm font-medium text-[#e0860c]/70">Гид Селины</span>
            <span className="mt-0.5 block font-semibold text-[#e0860c]">
              Домашняя еда в {city.prep}: как заказать, что попробовать →
            </span>
          </Link>
        </section>
      )}

      {/* FAQ (видимый + в schema) */}
      <section className="mt-10">
        <h2 className="mb-4 text-2xl font-bold text-white drop-shadow">Частые вопросы</h2>
        <div className="space-y-3">
          {faqs.map((f) => (
            <div key={f.q} className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
              <h3 className="font-semibold text-[#e0860c]">{f.q}</h3>
              <p className="mt-1 text-sm text-[#e0860c]">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* другие города */}
      {otherCities.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 text-xl font-bold text-white drop-shadow">Домашняя еда в других городах</h2>
          <div className="flex flex-wrap gap-2">
            {otherCities.map((c) => (
              <Link key={c.slug} to={`/eda/${c.slug}`} className="rounded-full bg-white px-3.5 py-1.5 text-sm font-medium text-[#e0860c] ring-1 ring-orange-100 transition hover:bg-orange-50">
                {c.name}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
