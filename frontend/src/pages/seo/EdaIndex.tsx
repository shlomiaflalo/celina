import { Link } from "react-router-dom";
import { Seo } from "../../components/Seo";
import { CITY_CATALOG, COUNTRIES, type CountryCode } from "../../lib/cityCatalog";
import { CITY_CONTENT_SLUGS, COUNTRY_CONTENT_SLUGS } from "../../data/contentIndex";

/**
 * /eda — хаб городского кластера: «Домашняя еда по городам».
 *
 * Зачем. До него у 36 городских страниц и 4 страниц стран не было общей
 * точки входа: с главной — по одной ссылке, между собой — только чипы
 * соседей. Кластер без хаба читается поисковиком как кольцо, а не каталог,
 * и человеку негде увидеть географию сервиса целиком.
 *
 * URL /eda раньше отдавал 301 в никуда: маршрута не существовало, а
 * express.static редиректил на каталог. Теперь это настоящая страница.
 */
export function EdaIndex() {
  const groups = (Object.keys(COUNTRIES) as CountryCode[])
    .map((code) => ({
      co: COUNTRIES[code],
      cities: CITY_CATALOG.filter((c) => c.country === code && CITY_CONTENT_SLUGS.has(c.slug)),
    }))
    .filter((g) => g.cities.length > 0);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Селина", item: "https://celinaeda.ru/" },
        { "@type": "ListItem", position: 2, name: "Домашняя еда по городам" },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Домашняя еда по городам",
      itemListElement: groups.flatMap((g) => g.cities).map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: c.name,
        url: `https://celinaeda.ru/eda/${c.slug}`,
      })),
    },
  ];

  return (
    <div>
      <Seo
        title="Домашняя еда по городам — где работает Селина"
        titleEn="Homemade food by city — where Celina operates"
        description="Все города Селины на одной странице: Россия — от Москвы до Владивостока, плюс страницы Беларуси, Казахстана, Узбекистана и Армении. Выберите свой город и посмотрите, кто готовит рядом."
        path="/eda"
        jsonLd={jsonLd}
      />
      <h1 className="t-h1 mb-3">Домашняя еда по городам</h1>
      <p className="t-lead mb-8 max-w-3xl">
        Селина работает в России с июня 2026 года; в соседних странах мы пока собираем список
        ожидания. Выберите город — на его странице видно, кто готовит рядом, а если поваров
        ещё нет, там можно отметить свой район.
      </p>

      <div className="space-y-8">
        {groups.map(({ co, cities }) => (
          <section key={co.code}>
            <h2 className="t-h2 mb-1">
              {COUNTRY_CONTENT_SLUGS.has(co.slug) ? (
                <Link to={`/strana/${co.slug}`} className="underline-offset-4 hover:underline">
                  {co.name}
                </Link>
              ) : (
                co.name
              )}
            </h2>
            {!co.operates && (
              <p className="mb-2 text-sm text-[#e0860c]/75">
                Сервис здесь пока не работает — страницы собирают список ожидания.
              </p>
            )}
            <div className="mt-2 flex flex-wrap gap-2">
              {cities.map((c) => (
                <Link
                  key={c.slug}
                  to={`/eda/${c.slug}`}
                  className="rounded-full bg-white px-3.5 py-1.5 text-sm font-medium text-[#e0860c] border border-[var(--hairline)] transition hover:bg-orange-50"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
