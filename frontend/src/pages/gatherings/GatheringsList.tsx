import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import type { Gathering } from "../../types";
import { Spinner, ErrorState } from "../../components/ui";
import { PinIcon, ClockIcon } from "../../components/icons";
import { cityImage } from "../../lib/cityImage";
import { useAuth } from "../../auth/AuthContext";
import { useT, useLang, useTr } from "../../i18n";
import { Seo } from "../../components/Seo";
import { GATHERINGS_SEO } from "../../data/landingPages";

export function GatheringsList() {
  const t = useT();
  const { lang } = useLang();
  const tr = useTr();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<Gathering[] | null>(null);
  const [failed, setFailed] = useState(false);

  // ошибка сети НЕ маскируется под честное «застолий пока нет»: человек на
  // плохом соединении должен увидеть «Повторить», а не ложную пустоту
  function load() {
    setFailed(false);
    api.get<{ gatherings: Gathering[] }>("/gatherings?upcoming=true").then((r) => setItems(r.gatherings)).catch(() => setFailed(true));
  }
  useEffect(load, []);

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleString(lang === "en" ? "en-GB" : "ru-RU", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });

  if (failed) return <ErrorState onRetry={load} />;

  return (
    <div>
      <Seo
        title={GATHERINGS_SEO.ru.seoTitle}
        titleEn={GATHERINGS_SEO.en.seoTitle}
        description={GATHERINGS_SEO.ru.seoDesc}
        descriptionEn={GATHERINGS_SEO.en.seoDesc}
        path="/gatherings"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: (lang === "en" ? GATHERINGS_SEO.en : GATHERINGS_SEO.ru).faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }}
      />

      {/* герой */}
      <div className="relative z-20 mb-6 overflow-hidden rounded-3xl">
        <picture>
                    <img src="/images/gatherings/tablespread.jpg" alt="" {...({ fetchpriority: "high" } as object)} decoding="async" className="absolute inset-0 h-full w-full rounded-3xl object-cover" />
        </picture>
        <div className="absolute inset-0 rounded-3xl" style={{ background: "rgba(224,134,12,0.30)" }} />
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-black/55 via-black/20 to-transparent" />
        <div className="relative px-6 py-10 sm:px-10 sm:py-14">
          <h1 className="text-3xl font-bold text-white drop-shadow sm:text-4xl">
            {t.gatherings.title}
          </h1>
          <p className="mt-1 text-white/90">{t.gatherings.subtitle}</p>
          <button
            onClick={() => navigate(user ? "/gatherings/new" : "/login")}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-[#e0860c] shadow-sm transition hover:bg-orange-50 active:scale-95"
          >
            {t.gatherings.create}
          </button>
        </div>
      </div>

      {!items ? (
        <Spinner />
      ) : items.length === 0 ? (
        <p className="rounded-2xl bg-white/70 p-6 text-center text-[#e0860c]">{t.gatherings.empty}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((g) => (
            <Link
              key={g.id}
              to={`/gatherings/${g.id}`}
              className="group block overflow-hidden rounded-3xl bg-white shadow-[0_6px_24px_rgba(176,104,8,0.10)] ring-1 ring-[var(--hairline)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_44px_rgba(176,104,8,0.20)]"
            >
              <div className="relative h-40 overflow-hidden bg-orange-50">
                <img src={g.coverUrl || cityImage(g.city)} alt={tr(g.title)} loading="lazy" className="h-full w-full object-cover transition duration-[600ms] group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-[#e0860c] shadow-sm">
                  {g.seatsLeft > 0 ? `${g.seatsLeft} ${t.gatherings.seatsLeft(g.seatsLeft)}` : t.gatherings.full}
                </span>
                <h2 className="absolute inset-x-4 bottom-3 truncate text-lg font-bold text-white drop-shadow">{tr(g.title)}</h2>
              </div>
              <div className="p-4 text-sm text-[#e0860c]">
                <div className="flex items-center gap-1.5"><ClockIcon size={14} /> {fmtDate(g.startsAt)}</div>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <span className="inline-flex min-w-0 items-center gap-1.5"><PinIcon size={14} /> <span className="truncate">{tr(g.city) || "—"}</span></span>
                  <span className="shrink-0 whitespace-nowrap font-semibold text-[#e0860c]">{g.pricePerGuest > 0 ? `${g.pricePerGuest} ₽ / ${t.gatherings.perGuest}` : t.gatherings.free}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* SEO-контент: что такое застолья, как создать/присоединиться, правила + FAQ.
          Пререндерится — страница содержательна для Яндекса/Google даже при пустом списке. */}
      {(() => {
        const S = lang === "en" ? GATHERINGS_SEO.en : GATHERINGS_SEO.ru;
        return (
          <section className="mt-12 border-t border-white/25 pt-8 text-white">
            <h2 className="text-2xl font-bold drop-shadow">{S.h1}</h2>
            <p className="mt-2 leading-relaxed text-white/90">{S.intro}</p>
            {S.sections.map((s, i) => (
              <div key={i} className="mt-6">
                <h3 className="text-lg font-bold drop-shadow">{s.h}</h3>
                {s.p.map((para, j) => (
                  <p key={j} className="mt-2 leading-relaxed text-white/90">{para}</p>
                ))}
              </div>
            ))}
            <h3 className="mb-3 mt-8 text-lg font-bold drop-shadow">{lang === "en" ? "Frequently asked questions" : "Частые вопросы"}</h3>
            <div className="space-y-2.5">
              {S.faqs.map((f, i) => (
                <details key={i} className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/20">
                  <summary className="cursor-pointer font-semibold">{f.q}</summary>
                  <p className="mt-2 text-sm leading-relaxed text-white/85">{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        );
      })()}
    </div>
  );
}
