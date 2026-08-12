import { useParams, Link } from "react-router-dom";
import { plRu } from "../../i18n";
import { Seo, SITE_URL } from "../../components/Seo";
import { cityImage } from "../../lib/cityImage";
import { getCity, getCategory, cooksInCityByCategory, seoCities, cap, catAcc } from "../../lib/seoData";
import { CookCard } from "./CityPage";
import { NotFound } from "../NotFound";

/** {Категория} в {Городе} — программная посадочная: повара города с блюдом этой категории. */
export function CategoryCityPage() {
  const { citySlug = "", categorySlug = "" } = useParams();
  const city = getCity(citySlug);
  const cat = getCategory(categorySlug);
  const cooks = cooksInCityByCategory(citySlug, categorySlug);
  if (!city || !cat || cooks.length === 0) return <NotFound />;

  const title = `${cap(cat.name)} в ${city.prep} — заказать домашнюю еду — Селина`;
  const description = `${cap(cat.name)} на заказ в ${city.prep}: ${cooks.length} ${plRu(cooks.length, ["домашний повар готовит", "домашних повара готовят", "домашних поваров готовят"])} по семейным рецептам. Доставка и самовывоз. Соседи кормят соседей.`;

  // соседние города, где есть эта же категория — перелинковка
  const sameCatCities = seoCities
    .filter((c) => c.slug !== citySlug && cooksInCityByCategory(c.slug, categorySlug).length > 0)
    .slice(0, 10);

  const faqs = [
    { q: `Где заказать ${catAcc(cat.name)} в ${city.prep}?`, a: `На Celina ${cooks.length} ${plRu(cooks.length, ["проверенный домашний повар", "проверенных домашних повара", "проверенных домашних поваров"])} в ${city.prep} ${plRu(cooks.length, ["готовит", "готовят", "готовят"])} ${catAcc(cat.name)}. Выберите повара, добавьте блюда в корзину и оформите доставку или самовывоз.` },
    { q: `Можно ли заказать ${catAcc(cat.name)} с доставкой?`, a: `Да, большинство поваров в ${city.prep} предлагают доставку, либо удобный самовывоз рядом с вами.` },
  ];

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Главная", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: `Домашняя еда в ${city.prep}`, item: `${SITE_URL}/eda/${city.slug}` },
        { "@type": "ListItem", position: 3, name: `${cap(cat.name)} в ${city.prep}`, item: `${SITE_URL}/eda/${city.slug}/${cat.slug}` },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
  ];

  return (
    <div>
      <Seo title={title} description={description} path={`/eda/${city.slug}/${cat.slug}`} image={cityImage(city.name)} jsonLd={jsonLd} />

      <nav className="mb-4 text-sm text-white/80">
        <Link to={`/eda/${city.slug}`} className="hover:underline">Домашняя еда в {city.prep}</Link>
        <span className="mx-1.5">/</span>
        <span className="text-white">{cap(cat.name)}</span>
      </nav>

      <h1 className="mb-2 text-3xl font-bold text-white drop-shadow sm:text-4xl">{cap(cat.name)} в {city.prep}</h1>
      <p className="mb-6 max-w-2xl leading-relaxed text-white/95 drop-shadow-sm">
        {cap(cat.name)} на заказ от домашних поваров в {city.prep}. {cooks.length} {plRu(cooks.length, ["проверенная кухня готовит", "проверенные кухни готовят", "проверенных кухонь готовят"])} по семейным рецептам — выбирайте, читайте отзывы и заказывайте напрямую.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {cooks.map((cook) => <CookCard key={cook.id} cook={cook} />)}
      </div>

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

      {sameCatCities.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 text-xl font-bold text-white drop-shadow">{cap(cat.name)} в других городах</h2>
          <div className="flex flex-wrap gap-2">
            {sameCatCities.map((c) => (
              <Link key={c.slug} to={`/eda/${c.slug}/${cat.slug}`} className="rounded-full bg-white px-3.5 py-1.5 text-sm font-medium text-[#e0860c] ring-1 ring-orange-100 transition hover:bg-orange-50">
                {cap(cat.name)} в {c.prep}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
