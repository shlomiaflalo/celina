import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../../api/client";
import type { Order } from "../../types";
import { Spinner, ErrorState } from "../../components/ui";
import { CheckIcon } from "../../components/icons";
import { OrderPanel } from "./OrderTracking";
import { InviteMoment } from "../../components/InviteMoment";
import { useT } from "../../i18n";

/**
 * Экран сразу после оформления: показывает ТОЛЬКО что оформленные заказы.
 * Один повар — одна панель; два повара — две панели рядом.
 */
export function JustPlacedOrders() {
  const t = useT();
  const [params] = useSearchParams();
  const ids = (params.get("ids") || "").split(",").map((s) => s.trim()).filter(Boolean);
  const [orders, setOrders] = useState<Order[] | null>(null);
  const done = useRef<Set<string>>(new Set());

  function load() {
    Promise.all(ids.map((id) => api.get<{ order: Order }>(`/orders/${id}`).then((r) => r.order).catch(() => null)))
      .then((list) => setOrders(list.filter((o): o is Order => !!o)));
  }

  useEffect(() => {
    load();
    const iv = setInterval(() => {
      // пока хоть один заказ не завершён — обновляем
      if (orders && orders.every((o) => done.current.has(o.id))) return;
      load();
    }, 5000);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.get("ids")]);

  useEffect(() => {
    orders?.forEach((o) => { if (o.status === "DELIVERED" || o.status === "CANCELLED") done.current.add(o.id); });
  }, [orders]);

  if (!orders) return <Spinner />;
  // сеть упала → каждая загрузка съелась в null и отфильтровалась: страница
  // рисовала «Заказ оформлен» и пустоту. Честнее — ошибка с «Повторить».
  if (ids.length > 0 && orders.length === 0) return <ErrorState onRetry={load} />;
  const multi = orders.length > 1;

  return (
    <div className={`mx-auto ${multi ? "max-w-5xl" : "max-w-2xl"}`}>
      <div className="mb-4 flex items-center gap-2 rounded-xl bg-orange-50 p-4 font-semibold text-[#e0860c]">
        <CheckIcon size={18} /> {t.cart.placed}
      </div>

      {/* два заказа — ВСЕГДА рядом (и на телефоне): покупатель должен видеть
          обе оформленные покупки сразу, без прокрутки */}
      <div className={multi ? "grid grid-cols-2 items-start gap-2 sm:gap-4" : ""}>
        {orders.map((o) => (
          <OrderPanel key={o.id} order={o} onReload={load} />
        ))}
      </div>

      {/* вирусная петля: шеринг в самый счастливый момент — заказ только что оформлен */}
      <InviteMoment variant="order" />

      <div className="mt-5 text-center">
        <Link to="/orders" className="text-sm font-medium hover:underline">{t.tracking.back} →</Link>
      </div>
    </div>
  );
}
