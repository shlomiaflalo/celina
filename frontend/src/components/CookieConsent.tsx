import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAnalyticsConsent, setAnalyticsConsent } from "../lib/consent";
import { useT } from "../i18n";

/**
 * Баннер согласия на аналитические cookie (Яндекс.Метрика). Показывается, пока
 * пользователь не сделал выбор. До «Принять» Метрика не загружается (см. Metrica.tsx),
 * что требуется по практике Роскомнадзора и ToS Метрики.
 */
export function CookieConsent() {
  const t = useT();
  const [decided, setDecided] = useState(true); // по умолчанию скрыт (SSG/до маунта)

  useEffect(() => {
    setDecided(getAnalyticsConsent() !== null);
  }, []);

  if (decided) return null;

  const choose = (v: "yes" | "no") => { setAnalyticsConsent(v); setDecided(true); };

  return (
    <div className="fixed inset-x-0 bottom-0 z-[80] p-3 sm:p-4">
      <div className="mx-auto flex max-w-3xl flex-col gap-3 rounded-2xl bg-white p-4 shadow-2xl ring-1 ring-orange-100 sm:flex-row sm:items-center">
        <p className="flex-1 text-sm leading-relaxed text-[#e0860c]">
          {t.cookies.text}{" "}
          <Link to="/privacy" className="font-semibold underline hover:opacity-80">{t.cookies.moreLink}</Link>
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={() => choose("no")}
            className="rounded-full border border-orange-200 px-4 py-2 text-sm font-semibold text-[#e0860c] transition hover:bg-orange-50"
          >
            {t.cookies.decline}
          </button>
          <button
            onClick={() => choose("yes")}
            className="rounded-full bg-[#e0860c] px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          >
            {t.cookies.accept}
          </button>
        </div>
      </div>
    </div>
  );
}
