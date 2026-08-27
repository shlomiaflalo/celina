import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../cart/CartContext";
import { useAuth } from "../../auth/AuthContext";
import { api } from "../../api/client";
import type { CookProfile } from "../../types";
import { Button, EmptyState } from "../../components/ui";
import { CartIcon, PlateIcon, PinIcon, CheckIcon } from "../../components/icons";
import { SteamFx } from "../../components/SteamFx";
import { PaymentModal } from "../../components/PaymentModal";
import { playBell } from "../../lib/fx";
import { metricaGoal } from "../../components/Metrica";
import { looksLikeAddress, pointInCity } from "../../lib/address";
import { reverseGeocode, geocodeInCity } from "../../lib/geocode";
import { useT, useTr } from "../../i18n";

export function Cart() {
  const t = useT();
  const tr = useTr();
  const { lines, add, remove, clear, cookProfileIds } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [address, setAddress] = useState(user?.address || "");
  const [busy, setBusy] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // созданные заказы, ожидающие подтверждения: при 2 поварах — 2 заказа,
  // подтверждаются ОДНОЙ модалкой разом (последовательные окна путали людей)
  const [payQueue, setPayQueue] = useState<{ id: string; total: number; cookName: string }[]>([]);
  const [placedIds, setPlacedIds] = useState<string[]>([]);
  const [cooks, setCooks] = useState<Record<string, CookProfile>>({});
  const [geoStatus, setGeoStatus] = useState<"idle" | "locating" | "denied" | "wrongCity">("idle");
  // настоящая проверка адреса геокодером (а не просто не другой город)
  const [addrStatus, setAddrStatus] = useState<"idle" | "checking" | "valid" | "invalid">("idle");
  const [addrReason, setAddrReason] = useState<"format" | "notFound" | "wrongCity" | null>(null);

  // адрес доставки должен быть в городе покупателя (он же город поваров в корзине)
  const buyerCity = user?.city ?? null;
  // город хранится по-русски; в ленте и в профиле повара он переводится, а здесь
  // оставался «Москва» посреди английского текста — показываем через тот же tr()
  const buyerCityLabel = buyerCity ? tr(buyerCity) : "";

  // профиль приходит асинхронно: при жёсткой перезагрузке /cart user ещё null,
  // и useState-инициализатор оставил address пустым. Подставляем адрес из
  // профиля, когда он загрузится (но не затираем то, что покупатель уже ввёл).
  useEffect(() => {
    if (user?.address) setAddress((prev) => prev || user.address!);
  }, [user?.address]);

  // подтягиваем условия каждого повара (доставка, минимальный заказ)
  const [termsFailed, setTermsFailed] = useState(false);
  const [termsRetry, setTermsRetry] = useState(0);
  useEffect(() => {
    setTermsFailed(false);
    // отмена: устаревший ответ (после ретрая или удаления повара из корзины)
    // не должен ни кэшировать, ни поднимать termsFailed заново
    let cancelled = false;
    cookProfileIds.forEach((id) => {
      if (cooks[id]) return;
      api.get<{ cook: CookProfile }>(`/cooks/${id}`)
        .then((r) => { if (!cancelled) setCooks((m) => ({ ...m, [id]: r.cook })); })
        // молча глотать нельзя: без условий повара итог считался без доставки
        // и минимального заказа — сюрприз суммы на последнем шаге
        .catch(() => { if (!cancelled) setTermsFailed(true); });
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cookProfileIds.join(","), termsRetry]);

  // настоящая проверка адреса: структурно + геокодер (с дебаунсом)
  useEffect(() => {
    const a = address.trim();
    if (!a) { setAddrStatus("idle"); setAddrReason(null); return; }
    if (!looksLikeAddress(a)) { setAddrStatus("invalid"); setAddrReason("format"); return; }
    setAddrStatus("checking");
    // отмена: поздний ответ геокодера для СТАРОГО текста не имеет права
    // ставить «подтверждён» мусорному адресу (или «не найден» — исправленному)
    let cancelled = false;
    const h = setTimeout(async () => {
      const r = await geocodeInCity(a, buyerCity || "");
      if (cancelled) return;
      setAddrStatus(r.ok ? "valid" : "invalid");
      setAddrReason(r.ok ? null : (r.reason ?? "notFound"));
    }, 700);
    return () => { cancelled = true; clearTimeout(h); };
  }, [address, buyerCity]);

  // всегда видимая плашка лимита — и при пустой, и при полной корзине.
  // Стеклянный стиль с белой рамкой: сплошной оранжевый сливался с фоном страницы
  const maxCooksBanner = (
    <div className="mx-auto mb-4 w-fit max-w-lg rounded-full border border-white px-5 py-2 text-center text-sm font-semibold text-white drop-shadow">
      {t.cart.maxCooksInfo}
    </div>
  );

  if (lines.length === 0) {
    return (
      <div>
        {maxCooksBanner}
        <EmptyState
          icon={<CartIcon size={44} color="#ffffff" />}
          title={t.cart.empty}
          actionLabel={t.common.backToFeed}
          onAction={() => navigate("/")}
        />
      </div>
    );
  }

  // группируем строки по повару
  const groups = cookProfileIds.map((id) => {
    const groupLines = lines.filter((l) => l.dish.cookProfileId === id);
    const cook = cooks[id] || null;
    const subtotal = groupLines.reduce((s, l) => s + l.dish.price * l.qty, 0);
    const deliveryFee = cook?.deliveryFee ?? 0;
    const minOrder = cook?.minOrder ?? 0;
    const belowMin = minOrder > 0 && subtotal < minOrder;
    return { id, cook, lines: groupLines, subtotal, deliveryFee, minOrder, belowMin, total: subtotal + deliveryFee };
  });

  const grandTotal = groups.reduce((s, g) => s + g.total, 0);
  const deliveryTotal = groups.reduce((s, g) => s + g.deliveryFee, 0);
  const anyBelowMin = groups.some((g) => g.belowMin);
  const multi = groups.length > 1;

  const addressOk = addrStatus === "valid";

  function detectLocation() {
    if (!navigator.geolocation) { setGeoStatus("denied"); return; }
    setGeoStatus("locating");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const here = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        if (!pointInCity(here, buyerCity)) { setGeoStatus("wrongCity"); return; }
        const geo = await reverseGeocode(here.lat, here.lng);
        if (geo?.display) setAddress(geo.display);
        setGeoStatus("idle");
      },
      () => setGeoStatus("denied"),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }

  async function checkout() {
    if (!user) { navigate("/login?next=" + encodeURIComponent("/cart")); return; }
    if (!user.isVerified) { navigate("/verify"); return; }
    if (anyBelowMin || !addressOk || termsFailed) return;
    setBusy(true);
    setError(null);
    // создаём отдельный заказ для каждого повара
    const orders: { id: string; total: number; cookName: string }[] = [];
    try {
      for (const g of groups) {
        const r = await api.post<{ order: { id: string; total: number } }>("/orders", {
          cookProfileId: g.id,
          fulfillment: "DELIVERY",
          address,
          items: g.lines.map((l) => ({ dishId: l.dish.id, qty: l.qty })),
        });
        orders.push({ id: r.order.id, total: r.order.total, cookName: tr(g.cook?.user?.name || g.cook?.kitchenName || "") });
      }
      setPlacedIds(orders.map((o) => o.id));
      setPayQueue(orders);
      metricaGoal("order_placed"); // KPI-воронка: заказ оформлен
    } catch (err) {
      // частичный сбой (заказ у 2-го повара не создался): откатываем уже
      // созданные заказы, чтобы не оставить «висящие» PENDING и не задвоить при повторе
      await Promise.all(
        orders.map((o) => api.patch(`/orders/${o.id}/status`, { status: "CANCELLED" }).catch(() => {}))
      );
      setError(err instanceof Error ? err.message : t.common.error);
    } finally {
      setBusy(false);
    }
  }

  // все заказы подтверждены разом (одна модалка на всех поваров) → к заказам
  function onPaid() {
    setPayQueue([]);
    playBell();
    setPlaced(true);
    const ids = placedIds;
    setTimeout(() => { clear(); navigate(`/orders/placed?ids=${ids.join(",")}`); }, 900);
  }

  // закрытие окна без подтверждения: отменяем СОЗДАННЫЕ, но не подтверждённые
  // заказы (они уже в БД как PENDING) — иначе они висят и дублируются при повторе.
  // confirmedIds — заказы, успевшие подтвердиться до закрытия (частичный сбой):
  // их НЕ отменяем, они настоящие.
  async function abandonCheckout(confirmedIds: string[] = []) {
    const unpaid = payQueue.filter((o) => !confirmedIds.includes(o.id));
    setPayQueue([]);
    // отмена может НЕ пройти (5-минутное окно истекло / повар уже принял) —
    // такие заказы реально существуют, скрывать их от покупателя нельзя
    const results = await Promise.all(
      unpaid.map((o) => api.patch(`/orders/${o.id}/status`, { status: "CANCELLED" }).then(() => null).catch(() => o.id))
    );
    const stillActive = results.filter(Boolean) as string[];
    const keptIds = [...confirmedIds, ...stillActive];
    if (keptIds.length > 0) {
      // оформленные и неотменяемые заказы существуют — показываем их, корзину чистим
      setPlacedIds([]);
      clear();
      navigate(`/orders/placed?ids=${keptIds.join(",")}`);
      return;
    }
    // всё отменилось — оставляем корзину, чтобы покупатель мог повторить без дублей
    setPlacedIds([]);
  }

  return (
    <div className="mx-auto max-w-lg">
      {maxCooksBanner}
      <h1 className="mb-4 text-2xl font-semibold">{t.cart.title}</h1>

      {groups.map((g) => (
        <div key={g.id} className="mb-5">
          {/* заголовок повара (показываем только при заказе у нескольких) */}
          {multi && (
            <div className="mb-2 flex items-center justify-between">
              <button
                onClick={() => navigate(`/cooks/${g.id}`)}
                className="text-sm font-semibold text-white drop-shadow hover:underline"
              >
                {t.cart.fromCook}: {tr(g.cook?.user?.name || g.cook?.kitchenName || "")}
              </button>
              <span className="text-xs font-medium text-white drop-shadow">{g.subtotal} {t.common.rub}</span>
            </div>
          )}

          <div className="space-y-2">
            {g.lines.map((l) => (
              <div key={l.dish.id} className="flex items-center gap-3 rounded-xl border border-[color:var(--hairline)] bg-white p-3">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-orange-50">
                  {l.dish.photoUrl ? (
                    <img src={l.dish.photoUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center"><PlateIcon size={22} className="opacity-50" /></div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{tr(l.dish.title)}</div>
                  <div className="text-sm text-[#e0860c]">{l.dish.price} {t.common.rub}</div>
                </div>
                <div className="flex items-center gap-2.5">
                  <button onClick={() => remove(l.dish.id)} aria-label={t.a11y.removePortion} className="relative h-7 w-7 rounded-full bg-orange-50 text-lg leading-none after:absolute after:-inset-2 after:content-[''] hover:bg-orange-100">−</button>
                  <span className="w-5 text-center">{l.qty}</span>
                  <button
                    onClick={() => add(l.dish)}
                    aria-label={t.a11y.addPortion}
                    disabled={l.qty >= l.dish.portions}
                    title={l.qty >= l.dish.portions ? t.cart.allPortionsInCart.replace("{x}", String(l.dish.portions)) : undefined}
                    className="relative h-7 w-7 rounded-full bg-orange-50 text-lg leading-none transition after:absolute after:-inset-2 after:content-[''] hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-40"
                  >+</button>
                </div>
                <div className="w-20 shrink-0 text-right font-semibold">{l.dish.price * l.qty} {t.common.rub}</div>
              </div>
            ))}
            {g.lines.some((l) => l.qty >= l.dish.portions) && (
              // на оранжевом полотне оранжевый текст невидим — плашка на белом
              <p className="rounded-xl bg-orange-50 px-3 py-2 text-xs font-medium text-[#e0860c]">
                {t.cart.allPortionsInCart.replace(
                  "{x}",
                  String(g.lines.find((l) => l.qty >= l.dish.portions)!.dish.portions)
                )}
              </p>
            )}
          </div>

          {g.belowMin && (
            <p className="mt-2 rounded-xl bg-orange-50 px-3 py-2 text-sm font-medium text-[#e0860c]">
              {t.cart.minOrderWarn.replace("{x}", String(g.minOrder - g.subtotal))}
            </p>
          )}
        </div>
      ))}

      <div className="mt-2 rounded-xl border border-[color:var(--hairline)] bg-white p-4">
        <div className="mb-1 flex items-center justify-between">
          <label htmlFor="cart-address" className="text-sm text-[#e0860c]">
            {t.cart.address}{buyerCityLabel ? ` · ${buyerCityLabel}` : ""}
          </label>
          <button
            type="button"
            onClick={detectLocation}
            disabled={geoStatus === "locating"}
            className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-[#e0860c] transition hover:bg-orange-100 disabled:opacity-60"
          >
            <PinIcon size={13} />
            {geoStatus === "locating" ? t.cart.locating : t.cart.detectLocation}
          </button>
        </div>
        <div className="relative">
          <input
            id="cart-address"
            autoComplete="street-address"
            value={address}
            onChange={(e) => { setAddress(e.target.value); if (geoStatus !== "idle") setGeoStatus("idle"); }}
            placeholder={t.cart.address}
            className={`w-full rounded-lg border px-3 py-2 pr-9 text-sm focus:outline-none ${
              addressOk ? "border-[#e0860c] focus:border-[#e0860c]" : "border-orange-200 focus:border-[#e0860c]"
            }`}
          />
          {addressOk && (
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#e0860c]"><CheckIcon size={16} /></span>
          )}
        </div>
        {/* статус проверки адреса (структурно + геокодер) */}
        <div className="mb-4 mt-1.5 min-h-[1.1rem] text-xs font-medium">
          {geoStatus === "wrongCity" ? (
            <span className="text-[#e0860c]">{t.cart.addressWrongCity.replace("{city}", buyerCityLabel)}</span>
          ) : geoStatus === "denied" ? (
            <span className="text-[#e0860c]">{t.cart.locationDenied}</span>
          ) : addrStatus === "valid" ? (
            <span className="text-[#e0860c]">✓ {t.cart.addressConfirmed.replace("{city}", buyerCityLabel)}</span>
          ) : addrStatus === "checking" ? (
            <span className="text-[#e0860c]/80">{t.cart.addressChecking}</span>
          ) : addrStatus === "invalid" ? (
            <span className="text-[#e0860c]">
              {addrReason === "format" ? t.cart.addressInvalid
                : addrReason === "wrongCity" ? t.cart.addressWrongCity.replace("{city}", buyerCityLabel)
                : t.cart.addressNotFound}
            </span>
          ) : (
            <span className="text-[#e0860c]/80">{t.cart.addressInvalid}</span>
          )}
        </div>

        {/* разбивка суммы: блюда и доставка отдельными строками. Одной строкой
            «Блюда + Доставка» покупатель не видел стоимость доставки, а сама
            строка повторяла «Итого» тем же числом. */}
        <div className="space-y-1.5 text-sm text-[#e0860c]">
          {groups.map((g) => (
            <div key={g.id} className="flex items-center justify-between">
              <span>{multi ? `${tr(g.cook?.user?.name || g.cook?.kitchenName || "")}: ` : t.cart.items}</span>
              <span>{g.subtotal} {t.common.rub}</span>
            </div>
          ))}
          {deliveryTotal > 0 && (
            <div className="flex items-center justify-between">
              <span>{t.cart.deliveryFee}</span>
              <span>{deliveryTotal} {t.common.rub}</span>
            </div>
          )}
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-[color:var(--hairline)] pt-2 text-lg font-semibold">
          <span>{t.cart.total}</span><span>{grandTotal} {t.common.rub}</span>
        </div>

        {/* ФЗ-289: до заключения сделки покупатель должен видеть, что платформа
            не продавец. Дублируем раскрытие из карточки блюда на оформлении. */}
        <p className="mt-3 rounded-xl bg-orange-50/70 px-3 py-2 text-[11px] leading-relaxed text-[#e0860c]">
          {t.cookProfile.notSeller}
        </p>

        {error && <p className="mt-2 text-sm font-semibold text-[#e0860c]">{error}</p>}

        {user && !user.isVerified ? (
          <div className="mt-4 rounded-xl bg-orange-50 p-3 text-center">
            <p className="text-sm font-semibold text-[#e0860c]">{t.verify.gateText}</p>
            <Button full onClick={() => navigate("/verify")}>{t.verify.goVerify}</Button>
          </div>
        ) : (
          <div className="relative mt-4">
            {placed && <SteamFx />}
            {termsFailed && (
              <div className="mb-3 flex items-center justify-between gap-3 rounded-xl bg-orange-50 px-3 py-2.5 text-sm font-medium text-[#e0860c]">
                <span>{t.common.loadError}</span>
                <button type="button" onClick={() => setTermsRetry((v) => v + 1)} className="shrink-0 font-semibold underline underline-offset-2">
                  {t.common.retry}
                </button>
              </div>
            )}
            <Button full onClick={checkout} disabled={busy || placed || anyBelowMin || !addressOk || termsFailed}>
              {placed ? `✓ ${t.cart.placed}` : busy ? t.cart.processing : t.cart.checkout}
            </Button>
          </div>
        )}
      </div>

      {payQueue.length > 0 && (
        <PaymentModal
          key={payQueue.map((o) => o.id).join("+")}
          orders={payQueue}
          onPaid={onPaid}
          onClose={abandonCheckout}
        />
      )}
    </div>
  );
}
