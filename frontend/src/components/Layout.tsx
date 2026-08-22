import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useCart } from "../cart/CartContext";
import { LangSwitch } from "./LangSwitch";
import { CartIcon } from "./icons";
import { NotificationBell } from "./NotificationBell";
import { Fab } from "./Fab";
import { VerifiedBadge } from "./VerifiedBadge";
import { BowlMark } from "./Logo";
import { ConfirmModal } from "./ui";
import { ToastHost, toast } from "./Toast";
import { useT, useLang } from "../i18n";

/**
 * Маршруты, переведённые на бумажную подложку.
 *
 * Зачем список, а не «переключили и всё». В проекте 186 классов text-white в
 * 44 файлах: они написаны в расчёте на оранжевую заливку страницы и на муке
 * становятся невидимыми. Переводить всё разом — это один деплой, на котором
 * половина сайта пустая. Поэтому на бумагу выходят по маршруту за шаг, а всё
 * остальное продолжает нести исторический оранжевый на <main> и выглядит
 * ровно как вчера. Каждый следующий шаг добавляет сюда одну регулярку;
 * когда список покроет всё, и он, и .band-brand отсюда уедут.
 */
const PAPER: RegExp[] = [/^\/$/];

export function Layout() {
  const t = useT();
  const { lang } = useLang();
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const paper = PAPER.some((re) => re.test(pathname));
  const [showLogout, setShowLogout] = useState(false);
  const isCook = user?.role === "COOK";

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `shrink-0 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium ${
      isActive ? "bg-orange-50 text-[#e0860c]" : " "
    }`;

  const baseLinks = isCook
    ? [
        { to: "/cook", label: t.nav.dashboard, end: true },
        { to: "/cook/menu", label: t.nav.menu },
        { to: "/cook/orders", label: t.nav.orders },
        { to: "/cook/kitchen", label: t.nav.kitchen },
        { to: "/gatherings", label: t.nav.gatherings, end: false },
      ]
    : [
        { to: "/", label: t.nav.feed, end: true },
        { to: "/gatherings", label: t.nav.gatherings, end: false },
        ...(user ? [{ to: "/orders", label: t.nav.myOrders, end: false }] : []),
      ];
  const withInvite = user
    ? [...baseLinks, { to: "/invite", label: t.nav.invite, end: false }]
    : baseLinks;
  const links = user?.isFounder
    ? [...withInvite, { to: "/founder", label: t.founder.nav, end: false }]
    : withInvite;

  const navItems = links.map((l) => (
    <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
      {l.label}
    </NavLink>
  ));

  const hour = new Date().getHours();
  const greet =
    hour < 6 ? t.greet.night : hour < 12 ? t.greet.morning : hour < 18 ? t.greet.day : t.greet.evening;
  const firstName = user?.name?.split(" ")[0];

  return (
    <div className="flex min-h-screen flex-col">
      {/* пропустить к содержимому — для клавиатуры/скринридеров (WCAG 2.4.1) */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-[100] focus:rounded-lg focus:bg-[#e0860c] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        {t.common.skipToContent}
      </a>
      <header className="sticky top-0 z-50 border-b border-[var(--hairline)] bg-white shadow-[var(--e1)]">
        <div className="mx-auto max-w-5xl px-4">
          <div className="flex items-center gap-3 py-2">
            {/* На 375px полное слово занимает 112 px из 375, и «Застолья»
                выдавливается за край. До 420px оставляем только знак — тарелку
                с паром, тот же логотип; дальше слово возвращается. */}
            <Link to="/" className="shrink-0" aria-label="Celina">
              <span className="block min-[420px]:hidden"><BowlMark size={24} /></span>
              {/* Высота 18px — как была до 12.08: увеличение до 24–30px
                  основатель забраковал («логотип слишком большой»). Не растить.
                  Логотип следует за языком: RU (по умолчанию) → Селина, EN →
                  Celina. ОБЕ картинки в DOM, переключает CSS: если менять src,
                  то при переходе на EN браузер продолжает показывать «Селину»,
                  пока качает английский PNG, — «логотип остался русским». Обе
                  версии грузятся один раз, дальше переключение мгновенное. */}
              {(["ru", "en"] as const).map((l) => (
                <img
                  key={l}
                  src={l === "en" ? "/images/logo.png" : "/images/logo-ru.png"}
                  alt="Celina"
                  draggable={false}
                  className={`relative -top-[2px] h-[18px] w-auto select-none ${
                    lang === l ? "hidden min-[420px]:block" : "hidden"
                  }`}
                />
              ))}
            </Link>

            {/* Меню в ту же строку, что и логотип, на ВСЕХ ширинах. Раньше на
                телефоне оно уезжало во вторую строку, и шапка съедала 190 px
                из 812 — четверть экрана до того, как человек увидит хоть одно
                блюдо. min-w-0 + overflow-x-auto: при тесноте меню
                прокручивается, а «Войти» и имя остаются на месте. */}
            <nav className="ml-1 flex min-w-0 flex-1 items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{navItems}</nav>

            {user && (
              <div className="hidden flex-1 truncate px-2 text-center text-sm font-medium  xl:block">
                {greet} <span className="text-[#e0860c]">{firstName}</span>
              </div>
            )}

            {/* min-w-0 (вместо shrink-0): даёт имени сжиматься с многоточием,
                а не выталкиваться за край экрана при тесной панели */}
            <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
              <LangSwitch />
              {user && <NotificationBell />}
              {user && !isCook && (
                <Link
                  to="/cart"
                  aria-label={t.cart.title}
                  className="relative flex h-8 w-8 items-center justify-center rounded-full text-[#e0860c] transition hover:bg-orange-50"
                >
                  <CartIcon size={22} color="#e0860c" />
                  {count > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#e0860c] px-1 text-[10px] font-bold text-white">
                      {count > 9 ? "9+" : count}
                    </span>
                  )}
                </Link>
              )}
              {user ? (
                <div className="flex min-w-0 items-center gap-2">
                  {/* имя видно ВСЕГДА (это только имя, оно короткое); при нехватке
                      места аккуратно обрезается многоточием, но не исчезает */}
                  <Link to="/profile" className="inline-flex min-w-0 items-center gap-1 text-sm font-medium hover:text-[#e0860c]">
                    {/* max-w растёт с экраном; на очень узких (320px) имя ужимается,
                        но не исчезает и не выталкивает «Выйти» за край */}
                    <span className="max-w-[4rem] truncate sm:max-w-[7rem]">{firstName}</span>
                    {user.isVerified && <span className="shrink-0"><VerifiedBadge size={15} /></span>}
                  </Link>
                  <button
                    onClick={() => setShowLogout(true)}
                    className="whitespace-nowrap text-sm  hover:opacity-70"
                  >
                    {t.nav.logout}
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="btn-solid whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium"
                >
                  {t.nav.login}
                </Link>
              )}
            </div>
          </div>

        </div>
      </header>

      {user && !user.isVerified && (
        <div className="border-b border-orange-200 bg-orange-50">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-2 px-4 py-2.5 text-sm">
            {/* Повару говорим про ЕЁ последствие: до верификации кухни нет в
                каталоге и заказов не будет. Покупателю — про его. */}
            <span className="font-semibold text-[#e0860c]">{isCook ? t.verify.gateTitleCook : t.verify.gateTitle}.</span>
            <span className="font-medium text-[#e0860c]">{isCook ? t.verify.gateTextCook : t.verify.gateText}</span>
            <Link
              to="/verify"
              className="ml-auto whitespace-nowrap rounded-full bg-[#e0860c] px-3.5 py-1.5 text-xs font-semibold text-white hover:opacity-90"
            >
              {t.verify.goVerify}
            </Link>
          </div>
        </div>
      )}

      {/* <main> больше не колонка, а полотно: секции внутри вправе выходить
          на всю ширину окна через .bleed. Колонка 1024px переехала внутрь. */}
      <main id="main" className={`flex w-full flex-1 flex-col ${paper ? "" : "band-brand"}`}>
        <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
          <Outlet />
        </div>
      </main>

      {/* нижний сервисный бар — в потоке, прижат к низу контента (не перекрывает экран) */}
      <footer className="border-t border-white/50 bg-[#e0860c] text-white shadow-[0_-2px_12px_rgba(0,0,0,0.08)]">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-4 gap-y-1.5 px-4 py-2.5 text-xs">
          {/* соцсети — белый текст внутри */}
          <div className="flex items-center gap-2">
            {[
              { label: "TG", href: "https://t.me/Celina_eda" },
              { label: "VK", href: "https://vk.com/celina_eda" },
              { label: "OK", href: "https://ok.ru/group/70000059720754" },
              ].map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                style={{ color: "#fff" }}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/70 text-[11px] font-bold transition hover:bg-[rgba(255,255,255,0.18)]"
              >
                {s.label}
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
              style={{ color: "#fff" }}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/70 transition hover:bg-[rgba(255,255,255,0.18)]"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>
            </button>
          </div>

          <span className="inline-block h-4 w-px bg-white/40" />
          {/* Разделы. Подвал пререндерится на всех ~110 страницах, поэтому
              каждая ссылка отсюда — это ~110 внутренних входящих и глубина 1.
              До этого 9 из 11 денежных лендингов не имели ссылки с главной,
              четыре сидели на глубине 3, а /privacy и /story были сиротами:
              в sitemap — да, входящих ссылок по всему сайту — ноль. */}
          <Link to="/eda" className="hover:underline">{lang === "en" ? "Cities" : "Города"}</Link>
          <span className="inline-block h-3 w-px bg-white/40" />
          <Link to="/dostavka" className="hover:underline">{lang === "en" ? "Delivery" : "Доставка"}</Link>
          <span className="inline-block h-3 w-px bg-white/40" />
          <Link to="/obedy" className="hover:underline">{lang === "en" ? "Lunches" : "Обеды"}</Link>
          <span className="inline-block h-3 w-px bg-white/40" />
          <Link to="/vypechka" className="hover:underline">{lang === "en" ? "Baking" : "Выпечка"}</Link>
          <span className="inline-block h-3 w-px bg-white/40" />
          <Link to="/eda-na-nedelyu" className="hover:underline">{lang === "en" ? "Weekly meals" : "Еда на неделю"}</Link>
          <span className="inline-block h-3 w-px bg-white/40" />
          <Link to="/pravilnoe-pitanie" className="hover:underline">{lang === "en" ? "Healthy eating" : "Правильное питание"}</Link>
          <span className="inline-block h-3 w-px bg-white/40" />
          <Link to="/eda-na-prazdnik" className="hover:underline">{lang === "en" ? "Holiday table" : "Праздничный стол"}</Link>
          <span className="inline-block h-3 w-px bg-white/40" />
          <Link to="/zagotovki" className="hover:underline">{lang === "en" ? "Preserves" : "Заготовки"}</Link>
          <span className="inline-block h-3 w-px bg-white/40" />
          <Link to="/halal" className="hover:underline">{lang === "en" ? "Halal" : "Халяль"}</Link>
          <span className="inline-block h-3 w-px bg-white/40" />
          <Link to="/detskoe-menyu" className="hover:underline">{lang === "en" ? "Kids' menu" : "Детское меню"}</Link>
          <span className="inline-block h-3 w-px bg-white/40" />
          <Link to="/vstrechi" className="hover:underline">{lang === "en" ? "Meetups" : "Встречи"}</Link>
          <span className="inline-block h-3 w-px bg-white/40" />
          <Link to="/vypit-vmeste" className="hover:underline">{lang === "en" ? "Get-togethers" : "Посиделки"}</Link>
          <span className="inline-block h-3 w-px bg-white/40" />
          <Link to="/story" className="hover:underline">{lang === "en" ? "How it works" : "Как это работает"}</Link>
          <span className="inline-block h-3 w-px bg-white/40" />
          <Link to="/blog" className="hover:underline">{t.blog.nav}</Link>
          <span className="inline-block h-3 w-px bg-white/40" />
          {/* Единственная ссылка сайта для повара — в подвале, то есть на всех 108
              страницах. Без неё /povaram достижим только с главной. */}
          <Link to="/povaram" className="hover:underline">{lang === "en" ? "Cook & sell" : "Готовить и продавать"}</Link>
          <Link to="/about" className="hover:underline">{t.contact.aboutNav}</Link>
          <span className="inline-block h-3 w-px bg-white/40" />
          <Link to="/manifest" className="hover:underline">{t.contact.manifestNav}</Link>
          <span className="inline-block h-3 w-px bg-white/40" />
          <Link to="/contact" className="hover:underline">{t.contact.nav}</Link>
          <span className="inline-block h-3 w-px bg-white/40" />
          {/* настоящая ссылка вместо кнопки-модалки: краулер видит href */}
          <Link to="/privacy" className="font-semibold text-white hover:underline">{lang === "en" ? "Privacy" : "Конфиденциальность"}</Link>
          <span className="hidden h-3 w-px bg-white/40 sm:inline-block" />
          <span className="hidden text-white/85 sm:inline">{t.landing.rights}</span>
        </div>
      </footer>

      <Fab />

      <ConfirmModal
        open={showLogout}
        title={t.nav.logoutConfirm}
        confirmLabel={t.nav.logout}
        onConfirm={() => { setShowLogout(false); logout(); navigate("/login"); }}
        onClose={() => setShowLogout(false)}
      />

      {/* наши всплывающие сообщения вместо системного alert() */}
      <ToastHost />
    </div>
  );
}
