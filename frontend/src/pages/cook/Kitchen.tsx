import { useState } from "react";
import { api } from "../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { Button } from "../../components/ui";
import { DrinkIcon } from "../../components/icons";
import { useT } from "../../i18n";

export function Kitchen() {
  const t = useT();
  const { user, refresh } = useAuth();
  const cp = user?.cookProfile;
  const [form, setForm] = useState({
    kitchenName: cp?.kitchenName ?? "",
    bio: cp?.bio ?? "",
    cuisine: (Array.isArray(cp?.cuisine) ? cp.cuisine : (cp?.cuisine ? String(cp.cuisine).split(",") : []))
      .map((s) => s.trim())
      .join(", "),
    deliveryFee: cp?.deliveryFee ?? 0,
    minOrder: cp?.minOrder ?? 0,
    dineInPrice: cp?.dineInPrice ?? 0,
    dineInSeats: cp?.dineInSeats ?? 0,
    dineInDesc: cp?.dineInDesc ?? "",
  });
  const [online, setOnline] = useState(cp?.isOnline ?? false);
  const [dineIn, setDineIn] = useState(cp?.dineInEnabled ?? false);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [togglingOnline, setTogglingOnline] = useState(false);

  if (!cp) return null;

  async function save() {
    setBusy(true);
    setSaved(false);
    setError(null);
    try {
      await api.put("/cooks/me", {
        kitchenName: form.kitchenName,
        bio: form.bio,
        cuisine: form.cuisine.split(",").map((s) => s.trim()).filter(Boolean),
        deliveryFee: Number(form.deliveryFee),
        minOrder: Number(form.minOrder),
        dineInEnabled: dineIn,
        dineInPrice: Number(form.dineInPrice),
        dineInSeats: Number(form.dineInSeats),
        dineInDesc: form.dineInDesc,
      });
      await refresh();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      // без catch ошибка сохранения выглядела как «ничего не произошло»
      setError(e instanceof Error ? e.message : t.common.error);
    } finally {
      setBusy(false);
    }
  }

  async function toggleOnline() {
    if (togglingOnline) return; // защита от двойного тапа
    const next = !online;
    setOnline(next); // оптимистично
    setTogglingOnline(true);
    setError(null);
    try {
      await api.patch("/cooks/me/status", { isOnline: next });
      await refresh();
    } catch (e) {
      setOnline(!next); // откат при отказе сервера
      setError(e instanceof Error ? e.message : t.common.error);
    } finally {
      setTogglingOnline(false);
    }
  }

  const input =
    "w-full rounded-xl border border-orange-100 px-3.5 py-2.5 text-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100";
  const label = "mb-1 block text-sm font-medium ";

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-2xl font-semibold">{t.kitchen.title}</h1>
      <p className="mb-5 text-sm ">{t.kitchen.subtitle}</p>

      {/* статус приёма заказов */}
      <div className="mb-5 flex items-center justify-between rounded-2xl border border-orange-100 bg-white p-4 shadow-sm">
        <div>
          <div className="font-medium">{t.kitchen.accepting}</div>
          <div className="text-sm ">{online ? t.cook.online : t.cook.offline}</div>
        </div>
        <button
          onClick={toggleOnline}
          disabled={togglingOnline}
          // переключатель без текста: без role/aria-label скринридер читал просто «кнопка»
          role="switch"
          aria-checked={online}
          aria-label={t.kitchen.accepting}
          className={`relative h-7 w-12 rounded-full transition disabled:opacity-60 ${online ? "bg-[#e0860c]" : "bg-orange-100"}`}
        >
          <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${online ? "left-6" : "left-1"}`} />
        </button>
      </div>

      <div className="space-y-4 rounded-2xl border border-orange-100 bg-white p-6 shadow-sm">
        <div>
          <label htmlFor="kitchen-name" className={label}>{t.kitchen.name}</label>
          <input id="kitchen-name" className={input} value={form.kitchenName} onChange={(e) => setForm({ ...form, kitchenName: e.target.value })} />
        </div>
        <div>
          <label htmlFor="kitchen-bio" className={label}>{t.kitchen.bio}</label>
          <textarea id="kitchen-bio" className={input} rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
        </div>
        <div>
          <label htmlFor="kitchen-cuisine" className={label}>{t.kitchen.cuisine}</label>
          <input id="kitchen-cuisine" className={input} value={form.cuisine} onChange={(e) => setForm({ ...form, cuisine: e.target.value })} placeholder={t.kitchen.cuisinePlaceholder} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="kitchen-delivery-fee" className={label}>{t.kitchen.deliveryFee}</label>
            <input id="kitchen-delivery-fee" type="number" className={input} value={form.deliveryFee} onChange={(e) => setForm({ ...form, deliveryFee: Number(e.target.value) })} />
          </div>
          <div>
            <label htmlFor="kitchen-min-order" className={label}>{t.kitchen.minOrder}</label>
            <input id="kitchen-min-order" type="number" className={input} value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: Number(e.target.value) })} />
          </div>
        </div>

        {/* ── Ужин у повара дома (особая фишка) ── */}
        <div className="mt-2 rounded-xl border-2 border-dashed border-orange-200 bg-orange-50/50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DrinkIcon size={24} />
              <div>
                <div className="font-medium">{t.dineIn.enable}</div>
                <div className="text-xs ">{t.dineIn.enableHint}</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setDineIn((v) => !v)}
              role="switch"
              aria-checked={dineIn}
              aria-label={t.a11y.toggleDineIn}
              className={`relative h-7 w-12 shrink-0 rounded-full transition ${dineIn ? "bg-[#e0860c]" : "bg-orange-100"}`}
            >
              <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${dineIn ? "left-6" : "left-1"}`} />
            </button>
          </div>

          {dineIn && (
            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="dinein-price" className={label}>{t.dineIn.price}</label>
                  <input id="dinein-price" type="number" className={input} value={form.dineInPrice}
                    onChange={(e) => setForm({ ...form, dineInPrice: Number(e.target.value) })} />
                </div>
                <div>
                  <label htmlFor="dinein-seats" className={label}>{t.dineIn.seatsLabel}</label>
                  <input id="dinein-seats" type="number" className={input} value={form.dineInSeats}
                    onChange={(e) => setForm({ ...form, dineInSeats: Number(e.target.value) })} />
                </div>
              </div>
              <div>
                <label htmlFor="dinein-desc" className={label}>{t.dineIn.desc}</label>
                <textarea id="dinein-desc" className={input} rows={2} value={form.dineInDesc}
                  onChange={(e) => setForm({ ...form, dineInDesc: e.target.value })} />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 pt-1">
          <Button onClick={save} disabled={busy}>{t.kitchen.save}</Button>
          {saved && <span className="text-sm font-medium text-[#e0860c]">✓ {t.kitchen.saved}</span>}
          {error && <span className="text-sm font-medium text-[#e0860c]">{error}</span>}
        </div>
      </div>
    </div>
  );
}
