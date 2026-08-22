import { lazy, Suspense, useEffect, type ReactNode } from "react";
import { Navigate, Outlet, useLocation, type RouteObject } from "react-router-dom";
import { LanguageProvider } from "./i18n";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import { CartProvider } from "./cart/CartContext";
import { RealtimeProvider } from "./realtime/RealtimeContext";
import { CallScreen } from "./components/CallScreen";
import { IncomingCall } from "./components/IncomingCall";
import { Layout } from "./components/Layout";
import { Spinner } from "./components/ui";
import { COOK_ACTIVATION_FEE_ENABLED } from "./config";
import { Seo, siteJsonLd } from "./components/Seo";
import { Metrica } from "./components/Metrica";
import { CookieConsent } from "./components/CookieConsent";
import { DayThemeProvider } from "./theme/DayThemeProvider";
import { IdleLogout } from "./components/IdleLogout";
import type { Role } from "./types";

// Публичные / SEO-страницы грузим сразу (eager): только так пререндер (SSG)
// отдаёт готовый HTML, а не заглушку <Spinner/> из Suspense.
import { Login } from "./pages/Login";
import { Feed } from "./pages/buyer/Feed";
import { HomeSeoSection } from "./components/HomeSeoSection";
import { NotFound } from "./pages/NotFound";
import { CookProfilePage } from "./pages/buyer/CookProfilePage";
import { About } from "./pages/About";
import { Contact } from "./pages/Contact";
import { Story } from "./pages/Story";
import { GatheringDetail } from "./pages/gatherings/GatheringDetail";

// Тяжёлые публичные страницы (блог 230KB, политика 185KB, лендинги 47KB) —
// route-level lazy: vite-react-ssg пререндерит их В ПОЛНЫЙ HTML (SEO не страдает),
// а в клиентский бандл они попадают отдельными чанками и грузятся по переходу.
// Это главное лекарство от «тяжёлого первого экрана» на мобильных.

// helper: ленивая загрузка страницы по её именованному экспорту
function lz(loader: () => Promise<Record<string, unknown>>, key: string) {
  return lazy(() => loader().then((m) => ({ default: m[key] as React.ComponentType })));
}

// Приватные (за авторизацией) страницы — по требованию (code-splitting).
const Cart = lz(() => import("./pages/buyer/Cart"), "Cart");
const MyOrders = lz(() => import("./pages/buyer/MyOrders"), "MyOrders");
const OrderTracking = lz(() => import("./pages/buyer/OrderTracking"), "OrderTracking");
const JustPlacedOrders = lz(() => import("./pages/buyer/JustPlacedOrders"), "JustPlacedOrders");
const Profile = lz(() => import("./pages/Profile"), "Profile");
const Verify = lz(() => import("./pages/Verify"), "Verify");
const Founder = lz(() => import("./pages/Founder"), "Founder");
const Dashboard = lz(() => import("./pages/cook/Dashboard"), "Dashboard");
const Menu = lz(() => import("./pages/cook/Menu"), "Menu");
const CookOrders = lz(() => import("./pages/cook/CookOrders"), "CookOrders");
const Kitchen = lz(() => import("./pages/cook/Kitchen"), "Kitchen");
const CookActivation = lz(() => import("./pages/cook/CookActivation"), "CookActivation");
const GatheringCreate = lz(() => import("./pages/gatherings/GatheringCreate"), "GatheringCreate");
const Invite = lz(() => import("./pages/Invite"), "Invite");

// Главная: для повара домашняя страница — его кабинет, а не лента покупателя.
// Покупатель/гость видят ленту.
function Home() {
  const { user } = useAuth();
  if (user?.role === "COOK") return <Navigate to="/cook" replace />;
  return (
    <>
      <Seo
        title="Домашняя еда с доставкой на заказ от соседей-поваров — Celina"
        titleEn="Homemade food delivery, made to order by neighbor cooks — Celina"
        description="Домашняя еда с доставкой или самовывозом от проверенных соседей-поваров: борщ, пельмени, выпечка. Закажите на Celina — соседи кормят соседей."
        descriptionEn="Homemade food, delivery or pickup, from verified neighbor cooks — borscht, pelmeni, baking and more. Order on Celina: neighbors feeding neighbors."
        path="/"
        jsonLd={siteJsonLd}
      />
      <Feed />
      <HomeSeoSection />
    </>
  );
}

function Guard({ role, children }: { role?: Role; children: ReactNode }) {
  const { user, loading } = useAuth();
  const loc = useLocation();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role)
    return <Navigate to={user.role === "COOK" ? "/cook" : "/"} replace />;
  // повар обязан активировать аккаунт (разовый $1) перед работой —
  // на время бесплатного запуска сбор отключён (см. COOK_ACTIVATION_FEE_ENABLED)
  if (COOK_ACTIVATION_FEE_ENABLED && user.role === "COOK" && !user.cookProfile?.activationPaidAt && loc.pathname !== "/cook/activate")
    return <Navigate to="/cook/activate" replace />;
  return <>{children}</>;
}

// Панель основателя не существует для всех, кроме основателя:
// любой другой (в т.ч. неавторизованный) получает 404, а не редирект.
function FounderRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (user?.isFounder) return <>{children}</>;
  return <NotFound />;
}

// Корневой layout: все провайдеры + хром (звонки) + Suspense вокруг страниц.
// Вынесен в маршрут, чтобы провайдеры оборачивали и SSG-, и клиентский рендер.
function Providers() {
  const { pathname } = useLocation();
  // реферальная ссылка ?ref=CODE → запоминаем, чтобы привязать при регистрации
  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref")?.toUpperCase().trim();
    // сохраняем только валидный код — испорченная ссылка не должна ломать будущую регистрацию
    try {
      if (ref && /^[A-Z0-9]{1,16}$/.test(ref)) localStorage.setItem("celina_ref", ref);
    } catch {
      /* приватный режим Safari / блокировка хранилища: реферал просто не запомнится.
         Без catch исключение из эффекта роняло бы всё дерево — белый экран у того,
         кто пришёл по реферальной ссылке. */
    }
  }, []);
  // при каждом переходе на новую страницу прокручиваем наверх — иначе новая
  // страница (например вход) открывается с прежней позиции прокрутки.
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, [pathname]);

  return (
    <LanguageProvider>
      <AuthProvider>
        <RealtimeProvider>
          <CartProvider>
            <DayThemeProvider />
            <Metrica />
            <CookieConsent />
            <IdleLogout />
            <CallScreen />
            <IncomingCall />
            <Suspense fallback={<Spinner />}>
              <Outlet />
            </Suspense>
          </CartProvider>
        </RealtimeProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

// Дерево маршрутов в формате data-router (нужно для vite-react-ssg).
// Состав и поведение маршрутов идентичны прежнему JSX — ничего не удалено.
export const routes: RouteObject[] = [
  {
    element: <Providers />,
    children: [
      { path: "/login", element: <Login /> },
      { path: "/story", element: <Story /> },
      {
        element: <Layout />,
        children: [
          // Покупатель
          { path: "/", element: <Home /> },
          { path: "/cooks/:id", element: <CookProfilePage /> },
          // программные SEO-страницы (города и категории×город) — пререндерятся из снимка
          // Лениво, как и прочие SEO-страницы. Статический импорт затягивал
          // cityContent.ts (180 КБ прозы про районы) в ОБЩИЙ чанк, то есть
          // каждый посетитель главной скачивал тексты всех 36 городов.
          // Хаб кластера: /eda без слага — «Домашняя еда по городам».
          { path: "/eda", lazy: async () => ({ Component: (await import("./pages/seo/EdaIndex")).EdaIndex }) },
          { path: "/eda/:citySlug", lazy: async () => ({ Component: (await import("./pages/seo/CityPage")).CityPage }) },
          // Хаб страны. /strana/, а не сегмент внутри /eda/: /eda/kz/almaty
          // совпал бы с уже существующим /eda/:citySlug/:categorySlug.
          { path: "/strana/:countrySlug", lazy: async () => ({ Component: (await import("./pages/seo/CountryPage")).CountryPage }) },
          { path: "/eda/:citySlug/:categorySlug", lazy: async () => ({ Component: (await import("./pages/seo/CategoryCityPage")).CategoryCityPage }) },
          { path: "/blyudo/:dishSlug", lazy: async () => ({ Component: (await import("./pages/seo/DishPage")).DishPage }) },
          // SEO-лендинги под конкретные поисковые интенты (доставка / посиделки)
          { path: "/dostavka", lazy: async () => ({ Component: (await import("./pages/seo/Dostavka")).Dostavka }) },
          { path: "/vypit-vmeste", lazy: async () => ({ Component: (await import("./pages/seo/VypitVmeste")).VypitVmeste }) },
          { path: "/vstrechi", lazy: async () => ({ Component: (await import("./pages/seo/Vstrechi")).Vstrechi }) },
          { path: "/obedy", lazy: async () => ({ Component: (await import("./pages/seo/Obedy")).Obedy }) },
          { path: "/vypechka", lazy: async () => ({ Component: (await import("./pages/seo/Vypechka")).Vypechka }) },
          { path: "/eda-na-nedelyu", lazy: async () => ({ Component: (await import("./pages/seo/EdaNaNedelyu")).EdaNaNedelyu }) },
          { path: "/pravilnoe-pitanie", lazy: async () => ({ Component: (await import("./pages/seo/PravilnoePitanie")).PravilnoePitanie }) },
          { path: "/eda-na-prazdnik", lazy: async () => ({ Component: (await import("./pages/seo/EdaNaPrazdnik")).EdaNaPrazdnik }) },
          { path: "/zagotovki", lazy: async () => ({ Component: (await import("./pages/seo/Zagotovki")).Zagotovki }) },
          // единственный лендинг для повара, а не для покупателя
          { path: "/povaram", lazy: async () => ({ Component: (await import("./pages/seo/Povaram")).Povaram }) },
          { path: "/halal", lazy: async () => ({ Component: (await import("./pages/seo/Halal")).Halal }) },
          // застолья (социальный слой) — список и детали публичны, создание за входом
          { path: "/gatherings", lazy: async () => ({ Component: (await import("./pages/gatherings/GatheringsList")).GatheringsList }) },
          { path: "/gatherings/new", element: <Guard><GatheringCreate /></Guard> },
          { path: "/gatherings/:id", element: <GatheringDetail /> },
          { path: "/blog", lazy: async () => ({ Component: (await import("./pages/blog/BlogList")).BlogList }) },
          { path: "/blog/:slug", lazy: async () => ({ Component: (await import("./pages/blog/BlogPost")).BlogPost }) },
          { path: "/about", element: <About /> },
          { path: "/manifest", lazy: async () => ({ Component: (await import("./pages/Manifest")).Manifest }) },
          { path: "/contact", element: <Contact /> },
          { path: "/privacy", lazy: async () => ({ Component: (await import("./pages/Privacy")).Privacy }) },
          { path: "/founder", element: <FounderRoute><Founder /></FounderRoute> },
          { path: "/verify", element: <Guard><Verify /></Guard> },
          { path: "/cart", element: <Cart /> },
          { path: "/profile", element: <Guard><Profile /></Guard> },
          { path: "/invite", element: <Guard><Invite /></Guard> },
          { path: "/orders", element: <Guard role="BUYER"><MyOrders /></Guard> },
          { path: "/orders/placed", element: <Guard role="BUYER"><JustPlacedOrders /></Guard> },
          { path: "/orders/:id", element: <Guard role="BUYER"><OrderTracking /></Guard> },
          // Повар
          { path: "/cook/activate", element: <Guard role="COOK"><CookActivation /></Guard> },
          { path: "/cook", element: <Guard role="COOK"><Dashboard /></Guard> },
          { path: "/cook/menu", element: <Guard role="COOK"><Menu /></Guard> },
          { path: "/cook/kitchen", element: <Guard role="COOK"><Kitchen /></Guard> },
          { path: "/cook/orders", element: <Guard role="COOK"><CookOrders /></Guard> },
          // любой неизвестный адрес → креативная 404 (внутри chrome приложения)
          { path: "*", element: <NotFound /> },
        ],
      },
    ],
  },
];
