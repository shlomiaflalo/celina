import { Link } from "react-router-dom";
import { Head } from "vite-react-ssg";
import { seoCities, seoCategories, seoCooks } from "../lib/seoData";
import { CITY_CATALOG, COUNTRIES } from "../lib/cityCatalog";
import { CITY_CONTENT_SLUGS, COUNTRY_CONTENT_SLUGS } from "../data/contentIndex";
import { useT, useTr } from "../i18n";

/**
 * Всегда-пререндеримый содержательный блок главной страницы. Feed выше грузит
 * поваров на клиенте (в SSG-HTML — только спиннер), поэтому без этого блока
 * главная — самая важная страница сайта — попадала краулерам Яндекса/Google
 * пустой. Здесь мы из статического снимка (seo-data.json) отдаём реальный
 * H1/H2, продающий текст и плотную внутреннюю перелинковку: города, категории,
 * популярные блюда и проверенные кухни. Это одновременно и SEO, и удобная
 * навигация «по городам/блюдам» для пользователя.
 */
export function HomeSeoSection() {
  const t = useT();
  const tr = useTr();

  const dishes = seoCooks
    .flatMap((c) => c.dishes.map((d) => ({ ...d, city: c.city })))
    .slice(0, 12);
  const topCooks = [...seoCooks].sort((a, b) => b.rating - a.rating).slice(0, 6);

  const linkCls =
    "rounded-full bg-white/90 px-3.5 py-1.5 text-sm font-medium text-[#e0860c] border border-[var(--hairline)] transition hover:bg-white";

  return (
    <section className="mt-14 border-t border-[var(--hairline)] pt-10 text-[#e0860c]">
      <h2 className="t-h2">{t.homeSeo.h1}</h2>
      <p className="mt-2 max-w-3xl leading-relaxed text-[#e0860c]/85">{t.homeSeo.intro}</p>

      {/* Точка входа в городской кластер.
          Раньше список брался из seoCities — снимка каталога, который сейчас
          пуст, поэтому блок не рендерился вовсе: в dist/index.html не было НИ
          ОДНОЙ ссылки href="/eda/". Кластер из десятков похожих страниц,
          достижимый только из sitemap.xml, — это структура дорвейной сети.
          Берём города из CITY_CATALOG (охват), а не из снимка (наличие
          поваров), и показываем только те, у кого есть свой текст. */}
      {(() => {
        const byCountry = Object.values(COUNTRIES)
          .map((co) => ({ co, cities: CITY_CATALOG.filter((c) => c.country === co.code && CITY_CONTENT_SLUGS.has(c.slug)) }))
          .filter((g) => g.cities.length > 0);
        if (byCountry.length === 0) return null;
        return (
          <div className="mt-8 space-y-5">
            {byCountry.map(({ co, cities }) => (
              <div key={co.code}>
                <h3 className="t-h3 mb-2">
                  {COUNTRY_CONTENT_SLUGS.has(co.slug) ? (
                    <Link to={`/strana/${co.slug}`} className="underline-offset-4 hover:underline">
                      {t.homeSeo.foodIn} {tr(co.prep)}
                    </Link>
                  ) : (
                    <>{t.homeSeo.foodIn} {tr(co.prep)}</>
                  )}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {cities.map((c) => (
                    <Link key={c.slug} to={`/eda/${c.slug}`} className={linkCls}>
                      {tr(c.name)}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      })()}

      {seoCategories.length > 0 && (
        <div className="mt-8">
          <h3 className="t-h3 mb-2">{t.homeSeo.byCategory}</h3>
          <div className="flex flex-wrap gap-2">
            {seoCategories.map((cat) => (
              <Link key={cat.slug} to={`/eda/${seoCities[0]?.slug ?? "moskva"}/${cat.slug}`} className={linkCls}>
                {t.categories[cat.name] || cat.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {dishes.length > 0 && (
        <div className="mt-8">
          <h3 className="t-h3 mb-2">{t.homeSeo.popularDishes}</h3>
          <div className="flex flex-wrap gap-2">
            {dishes.map((d) => (
              <Link key={d.slug} to={`/blyudo/${d.slug}`} className={linkCls}>
                {tr(d.title)}
              </Link>
            ))}
          </div>
        </div>
      )}

      {topCooks.length > 0 && (
        <div className="mt-8">
          <h3 className="t-h3 mb-2">{t.homeSeo.verifiedCooks}</h3>
          <div className="flex flex-wrap gap-2">
            {topCooks.map((c) => (
              <Link key={c.id} to={`/cooks/${c.id}`} className={linkCls}>
                {tr(c.kitchenName)} · {tr(c.city)}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {[t.homeSeo.why1, t.homeSeo.why2, t.homeSeo.why3].map((w, i) => (
          <div key={i} className="card p-4">
            <h3 className="font-semibold">{w.title}</h3>
            <p className="mt-1 text-sm text-[#e0860c]/80">{w.text}</p>
          </div>
        ))}
      </div>

      {/* Полезные разделы — внутренняя перелинковка на новые SEO-лендинги */}
      <div className="mt-8">
        <h3 className="t-h3 mb-2">{t.homeSeo.usefulTitle}</h3>
        <div className="flex flex-wrap gap-2">
          {t.homeSeo.usefulLinks.map((l) => (
            <Link key={l.to} to={l.to} className={linkCls}>
              {l.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Как это работает — 3 шага (для покупателя) */}
      <div className="mt-12">
        <h3 className="t-h3 mb-3">{t.homeSeo.howTitle}</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          {t.homeSeo.steps.map((s, i) => (
            <div key={i} className="card p-4">
              <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#e0860c] text-sm font-bold text-white">{i + 1}</div>
              <h3 className="font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-[#e0860c]/80">{s.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Частые вопросы + FAQPage-разметка (расширенный сниппет в Яндексе/Google) */}
      <div className="mt-12">
        <h3 className="t-h3 mb-3">{t.homeSeo.faqTitle}</h3>
        <div className="space-y-2.5">
          {t.homeSeo.faqs.map((f, i) => (
            <details key={i} className="card p-4">
              <summary className="cursor-pointer font-semibold marker:text-[#e0860c]/60">{f.q}</summary>
              <p className="mt-2 text-sm leading-relaxed text-[#e0860c]/80">{f.a}</p>
            </details>
          ))}
        </div>
      </div>

      <Head>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: t.homeSeo.faqs.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          })}
        </script>
      </Head>
    </section>
  );
}
