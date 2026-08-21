import { useState } from "react";
import { Link } from "react-router-dom";
import { useT } from "../i18n";
import { Seo, aboutJsonLd } from "../components/Seo";
import { CheckIcon } from "../components/icons";

const LINKEDIN_COMPANY = "https://www.linkedin.com/company/celina-food/";

export function About() {
  const t = useT();
  const [playing, setPlaying] = useState(false);
  return (
    <div className="mx-auto max-w-3xl">
      <Seo
        title="О Celina — соседи кормят соседей"
        titleEn="About Celina — neighbors feeding neighbors"
        description="Celina — маркетплейс домашней еды в России. Заказывайте блюда у проверенных соседей-поваров и зовите соседей за общий стол. Свежо, по-домашнему, с душой."
        path="/about"
        type="article"
        jsonLd={aboutJsonLd}
      />
      {/* видео сверху: тяжёлый файл (23MB) грузим только по клику — постер до этого */}
      <div className="mb-6 overflow-hidden rounded-3xl shadow-xl ring-1 ring-white/30">
        {playing ? (
          <video
            src="/celina.mp4"
            className="h-[50vh] w-full bg-black object-cover"
            autoPlay
            muted
            loop
            playsInline
            controls
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={t.about.playVideo}
            className="group relative block h-[50vh] w-full"
          >
            <img src="/images/og-default.jpg" alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
            <span className="absolute inset-0 bg-black/30 transition group-hover:bg-black/20" />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white/90 shadow-lg transition group-hover:scale-105">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="#e0860c"><path d="M8 5v14l11-7z" /></svg>
              </span>
            </span>
          </button>
        )}
      </div>

      <h1 className="mb-4 text-3xl font-bold text-white drop-shadow sm:text-4xl">{t.about.title}</h1>

      {/* вступительный абзац — крупнее, задаёт тон */}
      <p className="mb-6 max-w-2xl text-lg leading-relaxed text-white/95 drop-shadow-sm">{t.about.intro}</p>

      <div className="space-y-4">
        <section className="rounded-3xl glass-card p-6 sm:p-8">
          <h2 className="mb-2 text-xl font-bold text-[#e0860c]">{t.about.whatTitle}</h2>
          <p className="leading-relaxed ">{t.about.what}</p>
        </section>

        <section className="rounded-3xl glass-card p-6 sm:p-8">
          <h2 className="mb-2 text-xl font-bold text-[#e0860c]">{t.about.whyTitle}</h2>
          <p className="leading-relaxed ">{t.about.why}</p>
        </section>

        {/* чем отличаемся + ценности */}
        <section className="rounded-3xl glass-card p-6 sm:p-8">
          <h2 className="mb-2 text-xl font-bold text-[#e0860c]">{t.about.diffTitle}</h2>
          <p className="leading-relaxed ">{t.about.diff}</p>
          <ul className="mt-4 space-y-2.5">
            {t.about.points.map((point) => (
              <li key={point} className="flex items-start gap-2.5 leading-relaxed">
                <span className="mt-0.5 shrink-0 text-[#e0860c]"><CheckIcon size={18} /></span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* для кого */}
        <section className="rounded-3xl glass-card p-6 sm:p-8">
          <h2 className="mb-2 text-xl font-bold text-[#e0860c]">{t.about.forWhoTitle}</h2>
          <p className="leading-relaxed ">{t.about.forWho}</p>
        </section>

        {/* призыв к действию */}
        <section className="rounded-3xl glass-card p-6 text-center sm:p-8">
          <h2 className="mb-2 text-xl font-bold text-[#e0860c]">{t.about.ctaTitle}</h2>
          <p className="mx-auto mb-5 max-w-xl leading-relaxed ">{t.about.ctaText}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl bg-[#e0860c] px-6 py-3 font-semibold text-white shadow-sm transition hover:brightness-105 active:scale-95"
          >
            {t.about.ctaButton} →
          </Link>
        </section>
      </div>

      {/* ссылки о самом сервисе: контакты и страница Celina в LinkedIn */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-center">
        <Link to="/contact" className="text-sm font-medium text-white/90 underline-offset-2 hover:underline">
          {t.contact.title} →
        </Link>
        <a
          href={LINKEDIN_COMPANY}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-white/90 underline-offset-2 hover:underline"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M4.98 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21H17v-5.3c0-1.27-.02-2.9-1.77-2.9-1.77 0-2.04 1.38-2.04 2.8V21H9z" />
          </svg>
          {t.about.linkedinCompany}
        </a>
      </div>
    </div>
  );
}
