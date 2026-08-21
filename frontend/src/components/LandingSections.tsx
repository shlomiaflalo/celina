import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { PrivacyLink } from "./LegalModal";
import { VerifiedBadge } from "./VerifiedBadge";
import { Reveal } from "./Reveal";
import { MatryoshkaGallery } from "./MatryoshkaGallery";
import { toast } from "./Toast";
import { useT } from "../i18n";

interface Stats { cooks: number; buyers: number; dishes: number; orders: number; cities: string[]; }

/** Плавная анимация числа 0 → value (count-up) при появлении. */
function CountUp({ value }: { value: number | undefined }) {
  const [n, setN] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (value == null || started.current) return;
    started.current = true;
    const dur = 1200;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(eased * value));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value]);
  return <>{value == null ? "—" : n}</>;
}

export function LandingSections() {
  const t = useT();
  const [s, setS] = useState<Stats | null>(null);

  useEffect(() => {
    api.get<Stats>("/stats").then(setS).catch(() => {});
  }, []);

  const stat = (n: number | undefined, label: string) => (
    <div className="text-center text-[#e0860c]">
      <div className="text-4xl font-extrabold sm:text-5xl">
        <CountUp value={n} />+
      </div>
      <div className="mt-1 text-sm font-medium text-[#e0860c]/85">{label}</div>
    </div>
  );

  const trust = [
    { icon: <VerifiedBadge size={30} />, title: t.landing.trustVerifiedTitle, text: t.landing.trustVerifiedText },
    { icon: <ShieldIcon />, title: t.landing.trustFoodTitle, text: t.landing.trustFoodText },
    { icon: <LockIcon />, title: t.landing.trustPayTitle, text: t.landing.trustPayText },
  ];

  const steps = [
    { title: t.landing.how1Title, text: t.landing.how1Text },
    { title: t.landing.how2Title, text: t.landing.how2Text },
    { title: t.landing.how3Title, text: t.landing.how3Text },
  ];

  const vision = [
    { stat: t.landing.visionStat1, label: t.landing.visionStat1Label },
    { stat: t.landing.visionStat2, label: t.landing.visionStat2Label },
    { stat: t.landing.visionStat3, label: t.landing.visionStat3Label },
  ];

  return (
    <div className="border-t border-[var(--hairline)]">
      {/* статистика. Живые счётчики показываем, только когда цифры уже
          впечатляют (все двузначные) — «0+ поваров» на витрине отпугивает
          («эффект пустого ресторана»). Пока площадка молодая — честные
          ценностные факты в том же стиле; счётчики вернутся сами. */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <Reveal>
          {s && s.cooks >= 10 && s.buyers >= 10 && s.dishes >= 10 ? (
            <>
              <h2 className="text-center text-2xl font-bold text-[#e0860c] sm:text-3xl">{t.landing.statsTitle}</h2>
              <p className="mb-10 mt-1 text-center text-sm text-[#e0860c]/75">{t.landing.growth}</p>
              <div className="grid grid-cols-3 gap-6">
                {stat(s?.cooks, t.landing.cooks)}
                {stat(s?.buyers, t.landing.buyers)}
                {stat(s?.dishes, t.landing.dishes)}
              </div>
            </>
          ) : (
            <>
              <h2 className="text-center text-2xl font-bold text-[#e0860c] sm:text-3xl">{t.landing.valueTitle}</h2>
              <p className="mb-10 mt-1 text-center text-sm text-[#e0860c]/75">{t.landing.valuePilotNote}</p>
              {/* три колонки на узком экране = ~100px на ячейку: значение должно
                  быть КОРОТКИМ токеном (100%, 0 ₽, 1 мин), иначе оно вылезает из
                  ячейки и уводит всю страницу вбок. min-w-0 + break-words —
                  страховка на случай длинного перевода. */}
              <div className="grid grid-cols-3 gap-3 sm:gap-6">
                <div className="min-w-0 text-center text-[#e0860c]">
                  <div className="break-words text-[clamp(1.25rem,7vw,1.875rem)] font-extrabold sm:text-5xl">{t.landing.value1}</div>
                  <div className="mt-1 break-words text-xs font-medium text-[#e0860c]/85 sm:text-sm">{t.landing.value1Label}</div>
                </div>
                <div className="min-w-0 text-center text-[#e0860c]">
                  <div className="break-words text-[clamp(1.25rem,7vw,1.875rem)] font-extrabold sm:text-5xl">{t.landing.value2}</div>
                  <div className="mt-1 break-words text-xs font-medium text-[#e0860c]/85 sm:text-sm">{t.landing.value2Label}</div>
                </div>
                <div className="min-w-0 text-center text-[#e0860c]">
                  <div className="break-words text-[clamp(1.25rem,7vw,1.875rem)] font-extrabold sm:text-5xl">{t.landing.value3}</div>
                  <div className="mt-1 break-words text-xs font-medium text-[#e0860c]/85 sm:text-sm">{t.landing.value3Label}</div>
                </div>
              </div>
            </>
          )}
        </Reveal>
      </section>

      {/* вкусная витрина — матрёшки с фото блюд */}
      <section className="border-t border-[var(--hairline)] py-12">
        <h2 className="mb-10 text-center text-2xl font-bold text-[#e0860c] sm:text-3xl">{t.landing.tasteTitle}</h2>
        <MatryoshkaGallery />
      </section>

      {/* размер рынка / видение */}
      <section className="border-t border-[var(--hairline)] px-6 py-16">
        <Reveal className="mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-bold text-[#e0860c] sm:text-3xl">{t.landing.visionTitle}</h2>
          <p className="mx-auto mb-10 mt-2 max-w-2xl text-center text-[#e0860c]/85">{t.landing.visionText}</p>
          <div className="grid gap-6 sm:grid-cols-3">
            {vision.map((v) => (
              <div key={v.label} className="text-center text-[#e0860c]">
                <div className="text-4xl font-extrabold sm:text-5xl">{v.stat}</div>
                <div className="mx-auto mt-1 max-w-[14rem] text-sm font-medium text-[#e0860c]/85">{v.label}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>


      {/* доверие и безопасность — наш ров */}
      <section className="border-t border-[var(--hairline)] px-6 py-14">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-bold text-[#e0860c] sm:text-3xl">{t.landing.trustTitle}</h2>
          <p className="mx-auto mb-9 mt-2 max-w-xl text-center text-[#e0860c]/85">{t.landing.trustSubtitle}</p>
          <div className="grid gap-4 sm:grid-cols-3">
            {trust.map((c) => (
              <div key={c.title} className="rounded-3xl glass-card p-6 text-center">
                <div className="mb-3 flex justify-center">{c.icon}</div>
                <div className="mb-1.5 text-lg font-bold text-[#e0860c]">{c.title}</div>
                <p className="text-sm leading-relaxed">{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* как это работает */}
      <section className="border-t border-[var(--hairline)] px-6 py-14">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-9 text-center text-2xl font-bold text-[#e0860c] sm:text-3xl">{t.landing.howTitle}</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {steps.map((st, i) => (
              <div key={st.title} className="rounded-3xl glass-card p-6">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#e0860c] text-lg font-bold text-white">{i + 1}</div>
                <div className="mb-1 font-bold text-[#e0860c]">{st.title}</div>
                <p className="text-sm leading-relaxed">{st.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* факты о России */}
      <section className="border-t border-[var(--hairline)] px-6 py-12">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-8 text-center text-2xl font-bold text-[#e0860c] sm:text-3xl">{t.landing.factsTitle}</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {[t.landing.fact1, t.landing.fact2, t.landing.fact3].map((f, i) => (
              <div key={i} className="rounded-2xl glass-card p-5">
                <div className="mb-2 text-2xl font-extrabold text-[#e0860c]">{i + 1}</div>
                <p className="text-sm leading-relaxed">{f}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* CTA */}
      <section className="border-t border-[var(--hairline)] px-6 py-16 text-center text-[#e0860c]">
        {/* «Присоединяйтесь» — длинное слово: на 320px оно на 3px шире колонки
            и обрезалось по краю. Плавный размер + перенос по слогам. */}
        <h2 className="break-words text-[clamp(1.5rem,7.5vw,1.875rem)] font-extrabold sm:text-4xl">{t.landing.ctaTitle}</h2>
        <p className="mx-auto mt-3 max-w-lg text-[#e0860c]/90">{t.landing.ctaText}</p>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="btn-glass mt-7 rounded-full px-8 py-3 text-base font-semibold"
        >
          {t.landing.ctaButton}
        </button>
      </section>

      {/* о нас + контакты */}
      <div className="border-t border-[var(--hairline)]">
      <section className="mx-auto max-w-3xl px-6 py-12 text-center text-[#e0860c]">
        <h2 className="mb-3 text-2xl font-bold">{t.landing.aboutTitle}</h2>
        <p className="mx-auto max-w-xl text-[#e0860c]/90">{t.landing.about}</p>

        <div className="mt-8 text-sm text-[#e0860c]/70">{t.landing.contact}</div>
        <div className="mt-3 flex justify-center gap-3">
          {[
            { label: "TG", href: "https://t.me/Celina_eda" },
            { label: "VK", href: "https://vk.com/celina_eda" },
            { label: "OK", href: "https://ok.ru/group/70000059720754" },
          ].map((soc) => (
            <a
              key={soc.label}
              href={soc.href}
              target="_blank"
              rel="noreferrer"
                            className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--hairline)] text-sm font-bold transition hover:bg-orange-50"
            >
              {soc.label}
            </a>
          ))}
          {/* кнопка e-mail: копирует адрес в буфер обмена и показывает тост */}
          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(t.landing.email);
              toast(`${t.landing.emailCopied}: ${t.landing.email}`);
            }}
            aria-label={`${t.landing.copyEmail}: ${t.landing.email}`}
            title={t.landing.email}
                        className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--hairline)] transition hover:bg-orange-50"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>
          </button>
        </div>
      </section>
      </div>

      <footer className="border-t border-[var(--hairline)] py-6 text-center text-xs text-[#e0860c]/80">
        {/* flex-wrap обязателен: на узких экранах (320px) ссылки не помещаются
            в одну строку и без переноса просто обрезались бы по краю */}
        <div className="mb-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm font-medium text-[#e0860c]">
          <Link to="/about" className="hover:underline">{t.contact.aboutNav}</Link>
          <Link to="/manifest" className="hover:underline">{t.contact.manifestNav}</Link>
          <Link to="/contact" className="hover:underline">{t.contact.nav}</Link>
          <PrivacyLink className="text-[#e0860c]" />
        </div>
        {t.landing.rights}
      </footer>
    </div>
  );
}

function ShieldIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#e0860c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l8 3v6c0 5-3.5 8.5-8 11-4.5-2.5-8-6-8-11V5z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#e0860c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      <circle cx="12" cy="15.5" r="1.4" fill="#e0860c" stroke="none" />
    </svg>
  );
}
