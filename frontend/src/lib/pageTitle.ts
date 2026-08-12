// Кто владеет <title> вкладки: страница со своим <Seo> или язык по умолчанию.
//
// Зачем: эффект LanguageProvider — РОДИТЕЛЬСКИЙ, а React выполняет эффекты снизу
// вверх, поэтому он отрабатывал ПОСЛЕ <Head> страницы и после гидратации перетирал
// точный SEO-заголовок дефолтным «Селина — Соседи кормят соседей». В отдаваемом
// HTML title был правильный, но Яндекс и Google рендерят JS — при рендеринге они
// видели у всех 80+ страниц один и тот же заголовок, то есть терялся самый сильный
// on-page фактор. Реестр ниже даёт провайдеру узнать, задала ли страница title сама.

/** Дефолтный заголовок вкладки — когда у страницы нет своего <Seo>. */
export const DEFAULT_TITLE = {
  ru: "Селина — Соседи кормят соседей",
  en: "Celina — Neighbors feeding neighbors",
} as const;

let owners = 0;

/** true — заголовок задан страницей, трогать его нельзя. */
export function pageOwnsTitle(): boolean {
  return owners > 0;
}

/** Страница забирает title себе; возвращает функцию освобождения (для cleanup). */
export function claimPageTitle(): () => void {
  owners++;
  let released = false;
  return () => {
    if (released) return; // защита от двойного вызова в StrictMode
    released = true;
    owners--;
  };
}
