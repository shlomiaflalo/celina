import { useState } from "react";
import { useNavigate, Navigate, Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { toast } from "../components/Toast";
import { PasswordField } from "../components/PasswordField";
import { Button } from "../components/ui";
import { LangSwitch } from "../components/LangSwitch";
import { BuyerIcon, CookIcon } from "../components/icons";
import { NotifScene } from "../components/NotifScene";
import { FoodBackground } from "../components/FoodBackground";
import { LandingSections } from "../components/LandingSections";
import { LegalModal } from "../components/LegalModal";
import { ForgotPassword } from "../components/ForgotPassword";
import { metricaGoal } from "../components/Metrica";
import { RoundCheck } from "../components/RoundCheck";
import { RU_CITIES } from "../lib/ruCities";
import { cityCoords, haversineM } from "../lib/cityCoords";
import { geocodeInCity } from "../lib/geocode";
import { PinIcon, CheckIcon } from "../components/icons";
import { useT, useLang, useTr } from "../i18n";

export function Login() {
  const t = useT();
  const tr = useTr();
  const { lang } = useLang();
  const { login, register, user } = useAuth();
  const navigate = useNavigate();
  // Экран открывается в том состоянии, в котором его позвали.
  //
  // До этого он всегда открывался как «Вход» с ролью «Покупатель», куда бы
  // человек ни нажал. То есть женщина, которая только что решила попробовать
  // продавать свои пироги и нажала «Стать поваром», видела форму входа в
  // аккаунт, которого у неё нет, в роли покупателя — и между её решением и
  // аккаунтом оставалось ещё три правильных клика, каждый из которых можно
  // не сделать. Ссылки-приглашения для повара несут ?mode=register&role=cook.
  const [params] = useSearchParams();
  const wantsCook = params.get("role") === "cook";
  const [mode, setMode] = useState<"login" | "register">(
    params.get("mode") === "register" || wantsCook ? "register" : "login"
  );
  const [role, setRole] = useState<"BUYER" | "COOK">(wantsCook ? "COOK" : "BUYER");
  const [form, setForm] = useState({
    phone: "",
    password: "",
    name: "",
    kitchenName: "",
    city: "",
    address: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  // лимит устройств: список активных сессий, из которых нужно выбрать, что отключить
  const [deviceLimit, setDeviceLimit] = useState<{ id: string; device: string; location?: string | null; lastSeenAt: string }[] | null>(null);
  const [policyOk, setPolicyOk] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  // причина выхода (напр. авто-выход по неактивности) → баннер на странице входа
  const [signoutReason] = useState<string | null>(() => {
    try {
      const r = sessionStorage.getItem("celina_signout_reason");
      if (r) sessionStorage.removeItem("celina_signout_reason");
      return r;
    } catch { return null; }
  });
  // подтверждённое местоположение: GPS обязан попасть в выбранный город,
  // иначе — ручной адрес в этом же городе. Координаты сохраняем в профиль.
  const [gps, setGps] = useState<{ lat: number; lng: number } | null>(null);
  const [geoStatus, setGeoStatus] = useState<"idle" | "loading" | "ok" | "denied" | "wrongCity">("idle");
  // ручной адрес: реальная проверка геокодером (находится ли адрес в выбранном городе)
  const [addrStatus, setAddrStatus] = useState<"idle" | "checking" | "ok" | "wrongCity" | "notFound" | "format">("idle");
  const [addrCoords, setAddrCoords] = useState<{ lat: number; lng: number } | null>(null);

  // уже вошли? на страницу входа не пускаем — всегда ведём на свою страницу
  if (user) return <Navigate to={user.role === "COOK" ? "/cook" : "/"} replace />;

  function detectLocation() {
    const target = cityCoords(form.city);
    if (!form.city || !target) { setError(t.auth.chooseCityFirst); return; }
    setError(null);
    if (!navigator.geolocation) { setGeoStatus("denied"); return; }
    setGeoStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const here = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        // местоположение должно быть в выбранном городе (≤60 км от центра)
        if (haversineM(here, target) > 60000) { setGps(null); setGeoStatus("wrongCity"); return; }
        setGps(here); setGeoStatus("ok");
      },
      () => { setGps(null); setGeoStatus("denied"); }, // отказ/ошибка — переходим к ручному адресу
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }

  // ручная проверка адреса: геокодер должен найти конкретную точку В ВЫБРАННОМ городе
  async function checkAddress() {
    const a = form.address.trim();
    if (!form.city) { setError(t.auth.chooseCityFirst); return; }
    if (a.length < 5) { setAddrStatus("idle"); setAddrCoords(null); return; }
    setAddrStatus("checking");
    const r = await geocodeInCity(a, form.city);
    if (r.ok) {
      setAddrStatus("ok");
      setAddrCoords(r.lat != null && r.lng != null ? { lat: r.lat, lng: r.lng } : null);
    } else {
      setAddrStatus(r.reason === "wrongCity" ? "wrongCity" : r.reason === "format" ? "format" : "notFound");
      setAddrCoords(null);
    }
  }

  const gpsOk = !!gps && geoStatus === "ok";
  const addressOk = !gpsOk && addrStatus === "ok";
  // местоположение подтверждено: выбран город И (GPS в этом городе ИЛИ адрес подтверждён геокодером)
  const locationConfirmed = !!form.city && (gpsOk || addressOk);
  // координаты: точные с GPS, иначе из геокодера адреса, иначе центр выбранного города
  const coords = gpsOk ? gps : (addrCoords ?? cityCoords(form.city));

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  // фильтрованный ввод: телефон — только цифры/+, имя — только буквы
  const setFiltered = (k: string, re: RegExp) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value.replace(re, "") });

  // вход (в т.ч. с отключением выбранного устройства при лимите)
  async function doLogin(logoutSessionId?: string) {
    setError(null);
    setBusy(true);
    try {
      const user = await login(form.phone, form.password, logoutSessionId);
      setDeviceLimit(null);
      navigate(user.role === "COOK" ? "/cook" : "/");
    } catch (err) {
      const e = err as Error & { deviceLimit?: boolean; sessions?: typeof deviceLimit };
      if (e.deviceLimit && e.sessions) {
        // достигнут лимит устройств → показываем список, из которого нужно выйти
        setDeviceLimit(e.sessions);
        setError(null);
      } else {
        setError(e.message || t.common.error);
      }
    } finally {
      setBusy(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (mode === "login") { await doLogin(); return; }
    // регистрация: адрес НЕ обязателен при регистрации — его подтверждают при
    // первом заказе (в корзине). Так регистрация проходит без трения, а точный
    // адрес доставки собирается тогда, когда он реально нужен.
    setBusy(true);
    try {
      const user = await register({ ...form, role, policyAccepted: policyOk, lat: coords?.lat, lng: coords?.lng, address: form.address.trim() || undefined, ref: localStorage.getItem("celina_ref") || undefined });
      localStorage.removeItem("celina_ref");
      // KPI-воронка: регистрация (и отдельно — регистрация повара)
      metricaGoal("register");
      if (user.role === "COOK") metricaGoal("cook_signup");
      navigate(user.role === "COOK" ? "/cook" : "/");
      // индикация создания кухни: тост после перехода в кабинет повара
      if (user.role === "COOK") setTimeout(() => toast(t.auth.kitchenCreated), 600);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.error);
    } finally {
      setBusy(false);
    }
  }

  const input =
    "w-full rounded-xl border border-orange-100 bg-orange-50/40 px-3.5 py-2.5 text-sm outline-none transition focus:border-orange-300 focus:bg-white focus:ring-2 focus:ring-orange-200";

  return (
    <div>
    <section className="grid min-h-viewport lg:grid-cols-2">
      {/* ── Левая сторона: фон со сменой блюд + пуш-уведомления ── */}
      <div className="relative hidden flex-col justify-between overflow-hidden p-10 lg:flex">
        <FoodBackground />

        <div className="relative z-10 flex flex-1 items-center justify-center">
          <NotifScene />
        </div>

        <div className="animate-fade-up relative z-10 text-white" style={{ animationDelay: "0.15s" }}>
          <h2 className="text-4xl font-extrabold leading-tight drop-shadow sm:text-5xl">{t.auth.heroTitle}</h2>
          <p className="mt-3 max-w-md text-lg text-white/90 drop-shadow">{t.auth.heroSub}</p>
          <button
            type="button"
            onClick={() => document.getElementById("learn-more")?.scrollIntoView({ behavior: "smooth" })}
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-white/85 transition hover:text-white"
          >
            <span className="animate-bounce">↓</span> {t.landing.scroll}
          </button>
        </div>
      </div>

      {/* ── Правая сторона: форма ── */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm animate-fade-up">
          {/* 1) переключатель языка. Правая половина теперь на бумаге, а не на
                 оранжевом — белый здесь был бы невидим. */}
          <div className="mb-3 flex justify-center sm:mb-4">
            <LangSwitch />
          </div>
          {/* 2) Логотип следует за языком: RU (по умолчанию) → Селина, EN → Celina.
                 Обе картинки в DOM, переключает CSS — при смене src браузер
                 показывал бы старую «Селину», пока качается английский PNG. */}
          <div className="mb-4 flex justify-center sm:mb-6">
            {(["ru", "en"] as const).map((l) => (
              <img
                key={l}
                src={l === "en" ? "/images/logo.png" : "/images/logo-ru.png"}
                alt={l === "en" ? "Celina" : "Селина"}
                draggable={false}
                className={`h-auto w-[136px] select-none sm:w-[156px] ${lang === l ? "" : "hidden"}`}
              />
            ))}
          </div>

          <div className="rounded-3xl border border-orange-100 bg-white p-5 shadow-xl shadow-orange-500/10 sm:p-7">
            {/* единственный <h1> страницы входа: заголовок карточки формы.
                Герой слева скрыт на мобильных (hidden lg:flex), поэтому h1
                ставим здесь — он виден на всех размерах. Классы не меняются. */}
            <h1 className="mb-4 ml-1.5 text-left text-2xl font-bold">
              {mode === "login" ? t.auth.login : t.auth.register}
            </h1>
            {/* причина авто-выхода (неактивность 1 час) — понятный баннер */}
            {signoutReason === "idle" && (
              <p className="mb-4 rounded-xl border border-orange-200 bg-orange-50 px-3 py-2.5 text-sm font-medium text-[#e0860c]">
                🔒 {t.auth.autoLogout}
              </p>
            )}
            {mode === "login" && (
              <p className="mb-4 rounded-xl bg-orange-50/70 px-3 py-2 text-sm leading-snug ">
                {t.auth.valueProp}
              </p>
            )}

            <form onSubmit={submit} className="space-y-3">
              {mode === "register" && (
                <>
                  <div className="flex gap-2">
                    <RoleTab active={role === "BUYER"} onClick={() => setRole("BUYER")}>
                      <BuyerIcon size={30} />
                      {t.auth.buyer}
                    </RoleTab>
                    <RoleTab active={role === "COOK"} onClick={() => setRole("COOK")}>
                      <CookIcon size={30} />
                      {t.auth.cook}
                    </RoleTab>
                  </div>
                  <input className={input} placeholder={t.auth.name} value={form.name} aria-label={t.auth.name}
                    onChange={setFiltered("name", /[^\p{L}\s'-]/gu)} autoComplete="name" required />
                  {role === "COOK" && (
                    <input className={input} placeholder={t.auth.kitchenName} value={form.kitchenName} onChange={set("kitchenName")} aria-label={t.auth.kitchenName} />
                  )}
                  <select className={input} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} aria-label={t.auth.city} required>
                    <option value="" disabled>{t.auth.city}</option>
                    {/* value — канонический русский город, подпись переводим */}
                    {RU_CITIES.map((c) => (
                      <option key={c} value={c}>{tr(c)}</option>
                    ))}
                  </select>

                  {/* Адрес доставки НЕОБЯЗАТЕЛЕН: его можно добавить позже, при
                      первом заказе. Развёрнутым этот блок занимал 208 px из 708 —
                      почти треть формы уходила на то, что можно пропустить, и
                      регистрация переставала помещаться в экран телефона.
                      Свёрнутый — 44 px, и порядок полей не меняется. */}
                  <details className="group rounded-xl border border-orange-100 bg-orange-50/40 p-3 [&[open]>summary]:mb-2">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-xs font-medium text-[#e0860c]/80">
                      <span>{t.auth.addressOptional}</span>
                      <span aria-hidden className="text-base leading-none transition-transform group-open:rotate-45">+</span>
                    </summary>
                    <button
                      type="button"
                      onClick={detectLocation}
                      disabled={geoStatus === "loading"}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-[#e0860c] ring-1 ring-orange-200 transition active:scale-95 disabled:opacity-60"
                    >
                      <PinIcon size={16} />
                      {geoStatus === "loading" ? t.auth.locating : t.auth.detectLocation}
                    </button>

                    {gpsOk ? (
                      <p className="mt-2 flex items-center justify-center gap-1.5 text-xs font-medium text-[#e0860c]">
                        <CheckIcon size={14} /> {t.auth.locationConfirmed}
                      </p>
                    ) : (
                      <>
                        {geoStatus === "wrongCity" && (
                          <p className="mt-2 text-center text-xs font-medium text-[#e0860c]">{t.auth.locationWrongCity}</p>
                        )}
                        {geoStatus === "denied" && (
                          <p className="mt-2 text-center text-xs font-medium text-[#e0860c]">{t.auth.locationDenied}</p>
                        )}
                        {/* ручной ввод адреса доставки в выбранном городе */}
                        <p className="mt-2 mb-1 text-xs font-medium text-[#e0860c]">{t.auth.locationOr}</p>
                        <input
                          className={input}
                          placeholder={t.auth.addressPlaceholder}
                          value={form.address}
                          onChange={(e) => { setForm({ ...form, address: e.target.value }); setAddrStatus("idle"); setAddrCoords(null); }}
                          onBlur={checkAddress}
                          aria-label={t.auth.addressLabel}
                        />
                        {addrStatus === "checking" && (
                          <p className="mt-1 text-xs font-medium text-[#e0860c]">{t.auth.addressChecking}</p>
                        )}
                        {addrStatus === "wrongCity" && (
                          <p className="mt-1 text-xs font-medium text-[#e0860c]">{t.auth.addressWrongCity}</p>
                        )}
                        {addrStatus === "notFound" && (
                          <p className="mt-1 text-xs font-medium text-[#e0860c]">{t.auth.addressNotFound}</p>
                        )}
                        {addrStatus === "format" && (
                          <p className="mt-1 text-xs font-medium text-[#e0860c]">{t.auth.addressFormat}</p>
                        )}
                        {addressOk && (
                          <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-[#e0860c]">
                            <CheckIcon size={13} /> {t.auth.addressHint}
                          </p>
                        )}
                      </>
                    )}
                  </details>
                </>
              )}
              <input className={input} type="tel" inputMode="tel" placeholder={t.auth.phone} value={form.phone} aria-label={t.auth.phone}
                onChange={setFiltered("phone", /[^\d+()\-\s]/g)} autoComplete="tel" required />
              {/* при регистрации — умное поле (предложить/показать/копировать),
                  при входе — обычное поле пароля */}
              {mode === "register" ? (
                <PasswordField className={input} placeholder={t.auth.password} value={form.password} onChange={(v) => setForm({ ...form, password: v })} autoComplete="new-password" />
              ) : (
                <input className={input} type="password" placeholder={t.auth.password} value={form.password} onChange={set("password")} autoComplete="current-password" aria-label={t.auth.password} required />
              )}

              {mode === "register" && (
                <RoundCheck checked={policyOk} onChange={setPolicyOk}>
                  {t.legal.agreeLead}{" "}
                  <button
                    type="button"
                    onClick={() => setShowPolicy(true)}
                    className="inline text-left font-semibold underline underline-offset-2"
                  >
                    {t.legal.privacyAndTermsAcc}
                  </button>
                </RoundCheck>
              )}

              {error && (
                <p className="rounded-lg bg-orange-50 px-3 py-2 text-sm text-[#e0860c] font-semibold">{error}</p>
              )}

              <Button type="submit" full disabled={busy || (mode === "register" && !policyOk)}>
                {busy ? "…" : mode === "login" ? t.auth.submitLogin : t.auth.submitRegister}
              </Button>
              {mode === "register" && !policyOk && (
                <p className="text-center text-xs font-medium text-[#e0860c]">{t.legal.readFirst}</p>
              )}
            </form>

            <button
              onClick={() => setMode(mode === "login" ? "register" : "login")}
              className="mt-4 w-full text-center text-sm font-medium hover:underline"
              style={{ color: "#e0860c" }}
            >
              {mode === "login" ? t.auth.noAccount : t.auth.haveAccount}
            </button>
            {mode === "login" && (
              <button
                onClick={() => setShowForgot(true)}
                className="mt-2 w-full text-center text-xs font-medium text-[#e0860c] hover:underline"
              >
                {t.auth.forgot}
              </button>
            )}
          </div>

          {/* под карточкой — белая кнопка Посмотреть поваров (можно смотреть без входа) */}
          <Link
            to="/"
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 font-semibold text-[#e0860c] shadow-sm transition hover:bg-orange-50 active:scale-95"
          >
            {t.auth.seeCooks}
          </Link>
        </div>
      </div>
    </section>

    <div id="learn-more">
      <LandingSections />
    </div>
    {showPolicy && <LegalModal onClose={() => setShowPolicy(false)} />}
    {showForgot && <ForgotPassword onClose={() => setShowForgot(false)} />}

    {/* Лимит устройств: выберите, на каком выйти, чтобы войти здесь */}
    {deviceLimit && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setDeviceLimit(null)}>
        <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <div className="mb-1 flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#e0860c]">{t.auth.deviceLimitTitle}</h2>
            <button onClick={() => setDeviceLimit(null)} aria-label={t.a11y.close} className="text-2xl leading-none text-[#e0860c]">×</button>
          </div>
          <p className="mb-4 text-sm text-[#e0860c]/85">{t.auth.deviceLimitDesc}</p>
          <div className="space-y-2">
            {deviceLimit.map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-3 rounded-2xl border border-orange-100 bg-orange-50/40 p-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-[#e0860c]">{s.device}</div>
                  <div className="truncate text-xs text-[#e0860c]/70">
                    {s.location ? `${s.location} · ` : ""}{new Date(s.lastSeenAt).toLocaleString(lang === "en" ? "en-GB" : "ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
                <button
                  onClick={() => doLogin(s.id)}
                  disabled={busy}
                  className="shrink-0 rounded-xl bg-[#e0860c] px-3.5 py-2 text-xs font-semibold text-white transition hover:opacity-90 active:scale-95 disabled:opacity-50"
                >
                  {t.auth.logoutAndEnter}
                </button>
              </div>
            ))}
          </div>
          {error && <p className="mt-3 text-sm font-semibold text-[#e0860c]">{error}</p>}
        </div>
      </div>
    )}
    </div>
  );
}

function RoleTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-1 flex-col items-center gap-1 rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
        active
          ? "border-orange-400 bg-orange-50 text-[#e0860c] shadow-sm"
          : "border-orange-100  hover:border-orange-200"
      }`}
    >
      {children}
    </button>
  );
}
