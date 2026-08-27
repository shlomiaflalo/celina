import { Link, useParams } from "react-router-dom";
import { Seo } from "../../components/Seo";
import { NotFound } from "../NotFound";
import { COUNTRIES, CITY_CATALOG, type CountryEntry } from "../../lib/cityCatalog";
import { countryContent } from "../../data/countryContent";
import { WaitlistForm } from "../../components/WaitlistForm";

/**
 * Хаб страны: /strana/:slug.
 *
 * Зачем. До него городской кластер не имел человеческой точки входа —
 * dist/index.html не содержал ни одной ссылки href="/eda/", и попасть на
 * /eda/gomel можно было только из sitemap.xml или из чипа на соседней
 * городской странице. Кольцо однотипных страниц, найти которое можно лишь
 * по карте сайта, — это структура дорвейной сети, а не каталога.
 *
 * Почему /strana/, а не /eda/:country/:city. Сегмент страны физически занят:
 * маршрут /eda/:citySlug/:categorySlug уже существует, и /eda/kz/almaty
 * совпал бы с ним — getCategory("almaty") вернёт undefined, и КАЖДЫЙ такой
 * URL отрендерился бы страницей 404 в пререндере.
 */
export function CountryPage() {
  const { countrySlug = "" } = useParams();
  const country: CountryEntry | undefined = Object.values(COUNTRIES).find((c) => c.slug === countrySlug);
  const copy = country ? countryContent(country.slug) : null;
  // Нет текста — нет страницы. То же правило, что у городов: страна без
  // собственного содержания была бы очередным шаблоном.
  if (!country || !copy) return <NotFound />;

  const cities = CITY_CATALOG.filter((c) => c.country === country.code);
  const foreign = !country.operates;
  const title = foreign
    ? `Домашняя еда в ${country.prep} — Селина собирает список ожидания`
    : `Домашняя еда в ${country.prep} — Селина`;

  // Своя картинка шаринга на каждый хаб — иначе четыре хаба делят одну
  // og-default и в превью неотличимы. Честные фото блюд, не «фото страны».
  const HUB_IMAGE: Record<string, string> = {
    belarus: "/images/dishes/draniki.jpg",
    kazakhstan: "/images/dishes/manty.jpg",
    uzbekistan: "/images/dishes/plov.jpg",
    armeniya: "/images/dishes/shashlik.jpg",
    ukraina: "/images/borscht.jpg",
    kyrgyzstan: "/images/dishes/manty.jpg",
    moldova: "/images/dishes/golubtsy.jpg",
    gruziya: "/images/khinkali.jpg",
    azerbaydzhan: "/images/dishes/shashlik.jpg",
    tadzhikistan: "/images/dishes/plov.jpg",
  };

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Селина", item: "https://celinaeda.ru/" },
        { "@type": "ListItem", position: 2, name: `Домашняя еда в ${country.prep}` },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: copy.faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];
  // Намеренно НЕТ Service/LocalBusiness/areaServed: это операционные
  // заявления, а сервис в этой стране не работает.

  return (
    <div>
      <Seo title={title} description={copy.lead.slice(0, 200)} path={`/strana/${country.slug}`} image={HUB_IMAGE[country.slug]} jsonLd={jsonLd} />

      <h1 className="t-h1 mb-3">Домашняя еда в {country.prep}</h1>
      <p className="t-lead mb-6 max-w-3xl">{copy.lead}</p>

      <div className="mb-8 space-y-4 max-w-3xl">
        <p className="leading-relaxed">{copy.why}</p>
        <p className="leading-relaxed">{copy.cuisine}</p>
      </div>

      <h2 className="t-h2 mb-3">Города</h2>
      <div className="mb-8 flex flex-wrap gap-2">
        {cities.map((c) => (
          <Link
            key={c.slug}
            to={`/eda/${c.slug}`}
            className="inline-flex min-h-11 items-center rounded-full bg-white px-3.5 py-1.5 text-sm font-medium text-[#e0860c] border border-[var(--hairline)] transition hover:bg-orange-50"
          >
            {c.name}
          </Link>
        ))}
      </div>

      {foreign && (
        <div className="card mb-8 p-5">
          <h2 className="t-h3 mb-2">Почему Селина здесь пока не работает</h2>
          <p className="leading-relaxed">{copy.legal}</p>
        </div>
      )}

      {/* Раньше здесь стоял cities[0].name — то есть заявка из Самарканда
          записывалась как «Ташкент», а из Гомеля как «Минск». Карта спроса,
          ради которой эти страницы и существуют, показывала бы один город на
          всю страну. На хабе страны город не угадываем: пишем страну. */}
      <WaitlistForm city={country.name} allowsContact={country.allowsContact} />

      <div className="mt-10">
        <h2 className="t-h2 mb-3">Частые вопросы</h2>
        <div className="space-y-2.5">
          {copy.faq.map((f, i) => (
            <details key={i} className="card p-4">
              <summary className="cursor-pointer font-semibold marker:text-[#e0860c]/60">{f.q}</summary>
              <p className="mt-2 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
