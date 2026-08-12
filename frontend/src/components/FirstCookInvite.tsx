import { Link } from "react-router-dom";
import { useT, useLang } from "../i18n";
import { CheckIcon, PlateIcon, BasketIcon } from "./icons";

/**
 * Что видит человек, когда поваров в ленте ещё нет.
 *
 * Раньше здесь стояло «Мы только открылись — станьте первым». Это худшее, что
 * можно сказать: фраза про НАС, а читает её повар, и слышит «тут никого нет».
 * Пустой маркетплейс не должен объявлять о своей пустоте — он должен объяснять,
 * почему выгодно прийти именно сейчас.
 *
 * Поэтому блок построен наоборот:
 *  1) зеркало вместо статуса — про её ситуацию, а не про наш запуск;
 *  2) сравнение порога входа с конкурентом (цифры проверены на mypovar.ru);
 *  3) «первый» как приз, а не как извинение: у первого повара района ноль
 *     конкурентов и все первые заказы;
 *  4) снятие риска: наличными в руки, без комиссии и без обязательств.
 *
 * Ничего не выдумываем: про число поваров и заказов не говорим ни слова.
 */
export function FirstCookInvite() {
  const t = useT();
  const { lang } = useLang();
  const c = lang === "en" ? EN : RU;

  return (
    // Отступ сверху — свой, а не наследованный: блок рендерится и сразу
    // после полноширинного прилавка, и на пустой ленте в одиночку.
    <div className="mx-auto mt-4 max-w-3xl">
      {/* зеркало: первая строка должна попасть в человека, а не описать нас */}
      <div className="card rounded-3xl p-6 shadow-[var(--e2)] sm:p-9">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#e0860c]">{c.kicker}</p>
        <h2 className="mt-2 text-2xl font-black leading-tight text-[#e0860c] sm:text-3xl">{c.mirror}</h2>
        <p className="mt-3 max-w-xl leading-relaxed text-[#e0860c]">{c.sub}</p>

        {/* три причины, каждая — проверяемый факт, без обещаний дохода */}
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {c.points.map((p) => (
            <div key={p.t} className="rounded-2xl bg-orange-50 p-4">
              <div className="text-2xl font-black text-[#e0860c]">{p.big}</div>
              <div className="mt-1 text-sm font-semibold text-[#e0860c]">{p.t}</div>
              <div className="mt-1 text-xs leading-relaxed text-[#e0860c]/80">{p.d}</div>
            </div>
          ))}
        </div>

        {/* сравнение порога входа: самый сильный аргумент, и он полностью правдив */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-[var(--hairline)]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-orange-50 text-[#e0860c]">
                <th className="px-3 py-2 font-semibold sm:px-4">{c.table.head}</th>
                <th className="px-3 py-2 font-semibold sm:px-4">{c.table.them}</th>
                <th className="px-3 py-2 font-semibold text-[#e0860c] sm:px-4">{c.table.us}</th>
              </tr>
            </thead>
            <tbody className="text-[#e0860c]">
              {c.table.rows.map((r) => (
                <tr key={r[0]} className="border-t border-orange-100 align-top">
                  <td className="px-3 py-2.5 sm:px-4">{r[0]}</td>
                  <td className="px-3 py-2.5 text-[#e0860c]/70 sm:px-4">{r[1]}</td>
                  <td className="px-3 py-2.5 font-semibold sm:px-4">{r[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-[#e0860c]/70">{c.table.note}</p>

        {/* «первый» как приз, а не как оправдание */}
        <div className="mt-6 rounded-2xl border-2 border-dashed border-orange-300 bg-orange-50/60 p-4">
          <p className="font-semibold text-[#e0860c]">{c.firstTitle}</p>
          <p className="mt-1 text-sm leading-relaxed text-[#e0860c]">{c.firstText}</p>
        </div>

        <div className="mt-6 flex flex-wrap gap-2.5">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-xl bg-[#e0860c] px-6 py-3 font-semibold text-white shadow-sm transition hover:brightness-105 active:scale-95"
          >
            <PlateIcon size={18} /> {c.ctaCook}
          </Link>
          <Link
            to="/kontakty"
            className="inline-flex items-center gap-2 rounded-xl border border-orange-200 px-5 py-3 font-medium text-[#e0860c] transition hover:bg-orange-50 active:scale-95"
          >
            {c.ctaAsk}
          </Link>
        </div>
        <p className="mt-3 flex items-start gap-1.5 text-xs leading-relaxed text-[#e0860c]/75">
          <span className="mt-0.5 shrink-0"><CheckIcon size={13} /></span>
          {c.riskFree}
        </p>
      </div>

      {/* покупателю тоже есть что сделать: он не уходит с пустыми руками */}
      <div className="card mt-4 rounded-3xl p-5 text-center sm:p-6">
        <p className="inline-flex items-center gap-2 font-semibold text-[#e0860c]">
          <BasketIcon size={18} /> {c.buyerTitle}
        </p>
        <p className="mx-auto mt-1 max-w-lg text-sm leading-relaxed text-[#e0860c]">{c.buyerText}</p>
        <Link
          to="/vstrechi"
          className="mt-3 inline-block rounded-xl border border-orange-200 px-5 py-2.5 text-sm font-medium text-[#e0860c] transition hover:bg-orange-50"
        >
          {c.buyerCta} →
        </Link>
      </div>
    </div>
  );
}

const RU = {
  kicker: "Поварам",
  mirror: "Ваш подъезд знает, как вы готовите. Больше — никто.",
  sub:
    "Селина — витрина для домашнего повара: соседи видят ваши блюда, состав и отзывы и заказывают у вас напрямую. Без аренды, без посредников, без переписки «а из чего это?» с каждым новым человеком.",
  points: [
    { big: "0%", t: "комиссия на пилоте", d: "Цену ставите вы. Всё, что платит клиент, остаётся у вас." },
    { big: "3–5", t: "блюд, чтобы начать", d: "Не нужно собирать большое меню и держать всё в наличии." },
    { big: "₽", t: "наличными в руки", d: "Расчёт при передаче заказа. Деньги через сервис не проходят." },
  ],
  table: {
    head: "Чтобы начать",
    them: "Похожие сервисы",
    us: "Селина",
    rows: [
      ["Комиссия с заказа", "19% (15% сервис + 4% эквайринг)", "0% на время пилота"],
      ["Меню на старте", "минимум 30 блюд", "3–5 блюд"],
      ["Дегустация", "3–6 порций за свой счёт", "не нужна"],
      ["Проверка кухни", "видеотур по критериям сервиса", "самодекларация правил"],
      ["Витрина и фото", "оформляете сами", "оформлю вместе с вами за один разговор"],
    ],
    note: "Условия конкурентов — с их публичной страницы для поваров, проверено 08.2026.",
  },
  firstTitle: "Почему выгодно прийти сейчас, а не через полгода",
  firstText:
    "Скажу прямо: поваров в вашем районе пока нет. Именно поэтому у первого — ноль конкурентов, все первые заказы района и отзывы, которые копятся ему, пока остальные раздумывают. Через полгода это место будет занято.",
  ctaCook: "Стать поваром",
  ctaAsk: "Задать вопрос",
  riskFree: "Без вложений и без обязательств: можно завести витрину, попробовать и уйти в любой момент. Налог самозанятого вы платите сами, Селина ничего не удерживает.",
  buyerTitle: "А если вы пришли поесть?",
  buyerText:
    "Пока повара в вашем городе не появились, посмотрите соседские застолья — там уже собираются за общим столом. И расскажите о Селине тому, чьи пироги знает весь дом: с него всё и начнётся.",
  buyerCta: "Посмотреть застолья",
};

const EN = {
  kicker: "For cooks",
  mirror: "Your building knows how you cook. Nobody else does.",
  sub:
    "Celina is a storefront for a home cook: neighbours see your dishes, ingredients and reviews, and order from you directly. No rent, no middlemen, no re-explaining what is in the dish to every new person.",
  points: [
    { big: "0%", t: "commission in the pilot", d: "You set the price. Whatever the customer pays stays with you." },
    { big: "3–5", t: "dishes to start", d: "No need to build a large menu or keep everything in stock." },
    { big: "₽", t: "cash on handover", d: "Paid when you hand the order over. Money never passes through us." },
  ],
  table: {
    head: "To get started",
    them: "Similar services",
    us: "Celina",
    rows: [
      ["Commission per order", "19% (15% service + 4% acquiring)", "0% during the pilot"],
      ["Menu at launch", "at least 30 dishes", "3–5 dishes"],
      ["Tasting", "3–6 portions at your own cost", "not required"],
      ["Kitchen check", "video tour to their criteria", "self-declaration of the rules"],
      ["Storefront and photos", "you do it yourself", "I set it up with you in one call"],
    ],
    note: "Competitor terms taken from their public page for cooks, checked 08.2026.",
  },
  firstTitle: "Why it pays to come now rather than in six months",
  firstText:
    "Plainly: there are no cooks in your area yet. That is exactly why the first one has no competition, gets every first order in the district, and collects the reviews while everyone else is still thinking about it. In six months that place is taken.",
  ctaCook: "Become a cook",
  ctaAsk: "Ask a question",
  riskFree: "No investment and no commitment: set up a storefront, try it, leave whenever you like. You pay your own self-employed tax; Celina withholds nothing.",
  buyerTitle: "Here to eat instead?",
  buyerText:
    "Until cooks appear in your city, take a look at the neighbour gatherings — people are already sitting down together. And tell someone whose pies the whole building knows: that is where it starts.",
  buyerCta: "See gatherings",
};
