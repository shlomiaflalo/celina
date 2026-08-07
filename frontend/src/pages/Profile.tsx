import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { Button, Spinner, ConfirmModal } from "../components/ui";
import { SessionsManager } from "../components/SessionsManager";
import { BuyerIcon, CookIcon } from "../components/icons";
import { RU_CITIES } from "../lib/ruCities";
import { cityCoords } from "../lib/cityCoords";
import { looksLikeAddress } from "../lib/address";
import { geocodeInCity } from "../lib/geocode";
import { useT, useTr } from "../i18n";

export function Profile() {
  const t = useT();
  const tr = useTr();
  const { user, refresh, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: user?.name ?? "",
    phone: user?.phone ?? "",
    city: user?.city ?? "",
    address: user?.address ?? "",
  });
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLogout, setShowLogout] = useState(false);
  // настоящая проверка адреса геокодером (как в корзине): «DSDDS» не пройдёт
  const [addrStatus, setAddrStatus] = useState<"idle" | "checking" | "valid" | "invalid">("idle");
  const [addrReason, setAddrReason] = useState<"format" | "notFound" | "wrongCity" | null>(null);
  const [addrCoords, setAddrCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    const a = form.address.trim();
    if (!a) { setAddrStatus("idle"); setAddrReason(null); setAddrCoords(null); return; }
    if (!looksLikeAddress(a)) { setAddrStatus("invalid"); setAddrReason("format"); setAddrCoords(null); return; }
    setAddrStatus("checking");
    const h = setTimeout(async () => {
      const r = await geocodeInCity(a, form.city || "");
      setAddrStatus(r.ok ? "valid" : "invalid");
      setAddrReason(r.ok ? null : (r.reason ?? "notFound"));
      setAddrCoords(r.ok && r.lat != null && r.lng != null ? { lat: r.lat, lng: r.lng } : null);
    }, 700);
    return () => clearTimeout(h);
  }, [form.address, form.city]);

  if (!user) return <Spinner />;

  const isCook = user.role === "COOK";

  async function save() {
    setBusy(true); setSaved(false); setError(null);
    try {
      // координаты: точные от геокодера адреса, иначе центр города —
      // чтобы расстояние до поваров оставалось точным
      const c = addrCoords ?? cityCoords(form.city);
      await api.put("/auth/me", c ? { ...form, lat: c.lat, lng: c.lng } : form);
      await refresh();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setError(e instanceof Error ? e.message : t.common.error);
    } finally {
      setBusy(false);
    }
  }

  const input =
    "w-full rounded-xl border border-orange-100 bg-orange-50/40 px-3.5 py-2.5 text-sm outline-none transition focus:border-orange-300 focus:bg-white focus:ring-2 focus:ring-orange-100";
  const label = "mb-1 block text-sm font-medium ";
  const onlyLetters = (v: string) => v.replace(/[^\p{L}\s'-]/gu, "");
  const onlyPhone = (v: string) => v.replace(/[^\d+()\-\s]/g, "");

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl glass-card">
          {isCook ? <CookIcon size={30} /> : <BuyerIcon size={30} />}
        </span>
        <div>
          <h1 className="text-2xl font-semibold">{t.profile.title}</h1>
          <p className="text-sm ">{t.profile.subtitle}</p>
        </div>
      </div>

      <div className="space-y-4 rounded-2xl glass-card p-6">
        <div>
          <label htmlFor="profile-name" className={label}>{t.profile.name}</label>
          <input id="profile-name" className={input} value={form.name} onChange={(e) => setForm({ ...form, name: onlyLetters(e.target.value) })} />
        </div>
        <div>
          <label htmlFor="profile-phone" className={label}>{t.profile.phone}</label>
          <input id="profile-phone" className={input} type="tel" inputMode="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: onlyPhone(e.target.value) })} />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="profile-city" className={label}>{t.profile.city}</label>
            {/* выбор города из списка — без свободного ввода, как при регистрации */}
            <select id="profile-city" className={input} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}>
              <option value="" disabled>{t.auth.city}</option>
              {/* value — канонический русский город (его хранит бэкенд),
                  подпись переводим: в EN «Москва» везде в UI выглядит как «Moscow» */}
              {RU_CITIES.map((c) => (
                <option key={c} value={c}>{tr(c)}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="profile-address" className={label}>{t.profile.address}</label>
            <input id="profile-address" className={input} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            {/* живой статус проверки адреса — как в корзине */}
            {form.address.trim() && (
              <p className="mt-1 text-xs font-medium">
                {addrStatus === "checking" ? (
                  <span className="opacity-70">{t.cart.addressChecking}</span>
                ) : addrStatus === "valid" ? (
                  <span className="text-[#e0860c]">✓ {t.cart.addressConfirmed.replace("{city}", form.city || "")}</span>
                ) : addrStatus === "invalid" ? (
                  <span className="text-[#e0860c]">
                    {addrReason === "format" ? t.cart.addressInvalid
                      : addrReason === "wrongCity" ? t.cart.addressWrongCity.replace("{city}", form.city || "")
                      : t.cart.addressNotFound}
                  </span>
                ) : null}
              </p>
            )}
          </div>
        </div>

        {error && <p className="text-sm text-[#e0860c] font-semibold">{error}</p>}

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-3">
            {/* с непроверенным адресом сохранить нельзя (пустой адрес — можно) */}
            <Button onClick={save} disabled={busy || (!!form.address.trim() && addrStatus !== "valid")}>{t.profile.save}</Button>
            {saved && <span className="text-sm font-medium text-[#e0860c]">✓ {t.profile.saved}</span>}
          </div>
          <button
            onClick={() => setShowLogout(true)}
            className="text-sm  hover:opacity-70"
          >
            {t.nav.logout}
          </button>
        </div>
      </div>

      {/* Устройства и безопасность: список сессий + удалённый выход */}
      <div className="mt-5">
        <SessionsManager />
      </div>

      <ConfirmModal
        open={showLogout}
        title={t.nav.logoutConfirm}
        confirmLabel={t.nav.logout}
        onConfirm={() => { setShowLogout(false); logout(); navigate("/login"); }}
        onClose={() => setShowLogout(false)}
      />
    </div>
  );
}
