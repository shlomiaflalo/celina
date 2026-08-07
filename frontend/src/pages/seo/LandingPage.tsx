import { Link } from "react-router-dom";
import { Seo, SITE_URL, breadcrumbJsonLd } from "../../components/Seo";
import { useLang } from "../../i18n";

/**
 * Универсальный SEO-лендинг (/dostavka, /vypit-vmeste): пререндеримый контент
 * под конкретный поисковый интент — H1, разделы, FAQ с разметкой FAQPage
 * (расширенный сниппет в Яндексе/Google) и CTA-кнопки внутрь продукта.
 */
export interface LandingLocale {
  seoTitle: string;
  seoDesc: string;
  h1: string;
  intro: string;
  sections: { h: string; p: string[] }[];
  faqs: { q: string; a: string }[];
}
export interface LandingData {
  path: string;
  ctas: { to: string; label_ru: string; label_en: string; primary?: boolean }[];
  /** Service-разметка (тип услуги) — для страниц-услуг вроде доставки */
  serviceType?: string;
  /** блок «Читайте также» — перелинковка на поддерживающие статьи блога */
  related?: { to: string; label_ru: string; label_en: string }[];
  ru: LandingLocale;
  en: LandingLocale;
}

export function LandingPage({ data }: { data: LandingData }) {
  const { lang } = useLang();
  const L = lang === "en" ? data.en : data.ru;

  const jsonLd: object[] = [
    // хлебные крошки — расширенный сниппет (как у страниц города/блюда)
    breadcrumbJsonLd([{ name: lang === "en" ? "Home" : "Главная", path: "/" }, { name: L.h1, path: data.path }]),
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: L.faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];
  // Service — только для страниц-услуг (доставка): описывает саму услугу и охват
  if (data.serviceType) {
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "Service",
      serviceType: data.serviceType,
      name: L.h1,
      description: L.seoDesc,
      provider: { "@type": "Organization", name: "Celina", url: SITE_URL },
      areaServed: { "@type": "Country", name: "Россия" },
      availableChannel: { "@type": "ServiceChannel", serviceUrl: SITE_URL + data.path },
    });
  }

  return (
    <div className="mx-auto max-w-2xl text-white">
      <Seo
        title={data.ru.seoTitle}
        titleEn={data.en.seoTitle}
        description={data.ru.seoDesc}
        descriptionEn={data.en.seoDesc}
        path={data.path}
        jsonLd={jsonLd}
      />

      <h1 className="text-2xl font-bold drop-shadow sm:text-3xl">{L.h1}</h1>
      <p className="mt-3 leading-relaxed text-white/90">{L.intro}</p>

      <div className="mt-5 flex flex-wrap gap-2.5">
        {data.ctas.map((c) => (
          <Link
            key={c.to}
            to={c.to}
            className={
              c.primary
                ? "inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 font-semibold text-[#e0860c] shadow-sm transition hover:bg-orange-50 active:scale-95"
                : "inline-flex items-center gap-2 rounded-xl border border-white/60 px-5 py-2.5 font-semibold text-white transition hover:bg-white/10 active:scale-95"
            }
          >
            {lang === "en" ? c.label_en : c.label_ru} →
          </Link>
        ))}
      </div>

      {L.sections.map((s, i) => (
        <section key={i} className="mt-7">
          <h2 className="text-xl font-bold drop-shadow">{s.h}</h2>
          {s.p.map((para, j) => (
            <p key={j} className="mt-2 leading-relaxed text-white/90">{para}</p>
          ))}
        </section>
      ))}

      <section className="mt-8">
        <h2 className="mb-3 text-xl font-bold drop-shadow">{lang === "en" ? "Frequently asked questions" : "Частые вопросы"}</h2>
        <div className="space-y-2.5">
          {L.faqs.map((f, i) => (
            <details key={i} className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/20">
              <summary className="cursor-pointer font-semibold">{f.q}</summary>
              <p className="mt-2 text-sm leading-relaxed text-white/85">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* «Читайте также» — двусторонняя перелинковка лендинг ↔ блог (усиливает кластер) */}
      {data.related && data.related.length > 0 && (
        <section className="mt-8 border-t border-white/25 pt-6">
          <h2 className="mb-3 text-lg font-bold drop-shadow">{lang === "en" ? "Read also" : "Читайте также"}</h2>
          <ul className="flex flex-wrap gap-2">
            {data.related.map((r) => (
              <li key={r.to}>
                <Link to={r.to} className="inline-block rounded-full bg-white/90 px-3.5 py-1.5 text-sm font-medium text-[#e0860c] ring-1 ring-orange-100 transition hover:bg-white">
                  {lang === "en" ? r.label_en : r.label_ru}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
