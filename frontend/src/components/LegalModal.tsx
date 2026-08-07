import { lazy, Suspense, useState } from "react";
import { useDialog } from "../lib/useDialog";
import { getDict, useLang, useT, type Lang } from "../i18n";

// Полный текст политики (~185KB) тяжелее остальной страницы. Ссылка на модалку
// есть в футере КАЖДОЙ страницы, поэтому текст грузим лениво по открытию,
// а не тащим в основной бандл (критично для скорости на мобильных).
const LegalContent = lazy(() =>
  import("./LegalContent").then((m) => ({ default: m.LegalContent }))
);

/** Модальное окно с полным текстом политики + локальный переключатель RU/EN. */
export function LegalModal({ onClose }: { onClose: () => void }) {
  const { lang: globalLang } = useLang();
  const [lang, setLang] = useState<Lang>(globalLang);
  const t = getDict(lang);
  const dialogRef = useDialog<HTMLDivElement>(true, onClose);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={t.legal.privacyAndTerms}
        className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-3xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-orange-100 px-6 py-3">
          <span className="font-semibold text-[#e0860c]">{t.legal.privacyAndTerms}</span>
          <div className="flex items-center gap-3">
            {/* локальное переключение языка — не выходя из окна */}
            <div className="flex items-center gap-1 text-sm">
              {(["ru", "en"] as Lang[]).map((l, i) => (
                <span key={l} className="flex items-center">
                  {i > 0 && <span className="mx-0.5 text-[#e0860c]">/</span>}
                  <button
                    onClick={() => setLang(l)}
                    className={`uppercase transition ${lang === l ? "font-bold text-[#e0860c]" : "text-[#e0860c] hover:text-[#e0860c]"}`}
                  >
                    {l}
                  </button>
                </span>
              ))}
            </div>
            <button onClick={onClose} aria-label={t.legal.close} className="text-2xl leading-none text-[#e0860c] hover:text-[#e0860c]">
              ×
            </button>
          </div>
        </div>
        <div className="overflow-y-auto px-6 py-5">
          <Suspense fallback={<div className="py-10 text-center text-sm opacity-60">…</div>}>
            <LegalContent lang={lang} heading="h2" />
          </Suspense>
        </div>
        <div className="border-t border-orange-100 px-6 py-3 text-right">
          <button
            onClick={onClose}
            className="rounded-xl bg-[#e0860c] px-5 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            {t.legal.close}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Кликабельная ссылка Политика конфиденциальности, открывающая модальное окно.
 * Удобно вставлять в подвал любой страницы.
 */
export function PrivacyLink({ className = "" }: { className?: string }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={`hover:underline ${className}`}>
        {t.legal.privacy}
      </button>
      {open && <LegalModal onClose={() => setOpen(false)} />}
    </>
  );
}
