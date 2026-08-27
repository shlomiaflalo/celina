import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../../api/client";
import type { Order, OrderStatus } from "../../types";
import { Spinner, Badge, Stars, ErrorState } from "../../components/ui";
import { ReviewForm } from "../../components/ReviewForm";
import { statusTone } from "../cook/orderStatus";
import { DocIcon, CheckIcon, PotIcon, BagIcon, PinIcon, DrinkIcon } from "../../components/icons";
import { BowlMark } from "../../components/Logo";
import { CancelOrderTimer } from "../../components/CancelOrderTimer";
import { playBell } from "../../lib/fx";
import { useT, useTr } from "../../i18n";

const FLOW: OrderStatus[] = ["PENDING", "ACCEPTED", "COOKING", "READY", "DELIVERED"];
const STEP_ICON: Record<string, (p: { size?: number }) => JSX.Element> = {
  PENDING: DocIcon,
  ACCEPTED: CheckIcon,
  COOKING: PotIcon,
  READY: BagIcon,
  DELIVERED: (p) => <BowlMark size={p.size} />, // логотип-чаша Celina на Доставлен
};

/** Панель отслеживания одного заказа — переиспользуется и на странице заказа,
 *  и в виде только что оформленных (несколько рядом). */
export function OrderPanel({ order, onReload }: { order: Order; onReload: () => void }) {
  const t = useT();
  const tr = useTr();
  const cancelled = order.status === "CANCELLED";
  const currentIdx = FLOW.indexOf(order.status as OrderStatus);

  // Посиделки — это НЕ доставка еды: показываем короткую карточку (приглашение → подтверждение),
  // без шагов готовится/готов/доставлен и без отзыва.
  if (order.fulfillment === "DINE_IN") {
    const confirmed = !cancelled && order.status !== "PENDING";
    const guests = order.items[0]?.qty ?? 1;
    return (
      <div className="flex flex-col">
        <div className="rounded-3xl border border-orange-100 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h1 className="break-words text-xl font-bold">{tr(order.cookProfile?.kitchenName || "")}</h1>
              <p className="text-sm ">{t.tracking.drinkTitle}</p>
            </div>
            <span role="status"><Badge tone={statusTone(order.status)}>{t.orders.status[order.status]}</Badge></span>
          </div>

          <div className="mt-5 flex items-center gap-3 rounded-2xl bg-orange-50 p-4 font-semibold text-[#e0860c]">
            {cancelled || confirmed ? (
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e0860c] text-xl text-white">
                {cancelled ? "✕" : "✓"}
              </span>
            ) : (
              <span className="shrink-0"><DrinkIcon size={36} /></span>
            )}
            <span>{cancelled ? t.tracking.drinkCancelled : confirmed ? t.tracking.drinkConfirmed : t.tracking.drinkWaiting}</span>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-orange-100 pt-3 text-sm">
            <span className="">{t.tracking.drinkGuests}: {guests}</span>
            <span className="font-semibold">{order.total} {t.common.rub}</span>
          </div>

          <CancelOrderTimer orderId={order.id} createdAt={order.createdAt} status={order.status} onCancelled={onReload} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="rounded-3xl border border-orange-100 bg-white p-4 shadow-sm sm:p-6">
        {/* flex-wrap: в узкой карточке (2 заказа рядом на телефоне) бейдж
            статуса переносится под название, а не вылезает за край */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="min-w-0">
            <h1 className="break-words text-xl font-bold">{tr(order.cookProfile?.kitchenName || "")}</h1>
          </div>
          <Badge tone={statusTone(order.status)}>{t.orders.status[order.status]}</Badge>
        </div>

        {order.status === "DELIVERED" && (
          <div className="mt-5 flex items-center gap-3 rounded-2xl bg-orange-50 p-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e0860c] text-2xl text-white">✓</span>
            <span className="font-bold text-[#e0860c]">{t.tracking.completedTitle}</span>
          </div>
        )}

        {cancelled ? (
          <div className="mt-5 rounded-2xl bg-orange-50 p-4 text-[#e0860c] font-semibold">{t.tracking.cancelled}</div>
        ) : (
          <ol className="mt-6 space-y-1">
            {FLOW.map((step, i) => {
              const reached = i <= currentIdx;
              const active = i === currentIdx;
              const Ico = STEP_ICON[step];
              return (
                <li key={step} aria-current={active ? "step" : undefined} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full transition ${reached ? "bg-[#e0860c] text-white shadow" : "bg-orange-50 "} ${active ? "ring-4 ring-orange-200" : ""}`}>
                      <Ico size={20} />
                    </div>
                    {i < FLOW.length - 1 && <div className={`h-6 w-0.5 ${i < currentIdx ? "bg-orange-300" : "bg-orange-100"}`} />}
                  </div>
                  {/* min-h вместо h: в узкой карточке (2 заказа рядом) длинный
                      текст шага переносится на 2 строки, а не вылезает за край */}
                  <span className={`flex min-h-10 min-w-0 items-center break-words text-sm ${reached ? "font-medium " : ""}`}>{t.tracking.steps[step]}</span>
                </li>
              );
            })}
          </ol>
        )}

        {/* отмена заказа в течение 5 минут */}
        <CancelOrderTimer orderId={order.id} createdAt={order.createdAt} status={order.status} onCancelled={onReload} />
      </div>

      {/* состав заказа */}
      <div className="mt-4 rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
        <h2 className="mb-2 font-semibold">{t.tracking.details}</h2>
        <ul className="divide-y divide-orange-100">
          {order.items.map((it) => (
            <li key={it.id} className="flex justify-between py-2 text-sm">
              <span>{tr(it.titleSnapshot)} × {it.qty}</span>
              <span className="">{it.priceAtOrder * it.qty} {t.common.rub}</span>
            </li>
          ))}
        </ul>
        {order.deliveryFee > 0 && (
          <div className="flex justify-between border-t border-orange-100 py-2 text-sm">
            {/* без этой строки сумма блюд и «Итого» не сходились на величину доставки */}
            <span>{t.cart.deliveryFee}</span>
            <span>{order.deliveryFee} {t.common.rub}</span>
          </div>
        )}
        {order.address && (
          <p className="mt-3 flex items-center gap-1.5 text-sm ">
            <PinIcon size={15} /> {t.tracking.deliverTo}: {order.address}
          </p>
        )}
        <div className="mt-3 flex justify-between border-t border-orange-100 pt-3 font-semibold">
          <span>{t.cart.total}</span>
          <span>{order.total} {t.common.rub}</span>
        </div>
      </div>

      {/* отзыв после доставки */}
      {order.status === "DELIVERED" && (
        <div className="mt-4">
          {order.review ? (
            <div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#e0860c]">{t.review.written}</span>
                <Stars rating={order.review.rating} />
              </div>
              {order.review.comment && <p className="mt-2 text-sm font-medium text-[#e0860c]">{order.review.comment}</p>}
            </div>
          ) : (
            <ReviewForm orderId={order.id} onDone={onReload} />
          )}
        </div>
      )}
    </div>
  );
}

export function OrderTracking() {
  const t = useT();
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [failed, setFailed] = useState(false);
  const prevStatus = useRef<string | null>(null);
  // ref, а не state из замыкания: интервал захватывает load() один раз, и проверка
  // на «была ли уже загрузка» через order давала ложный error-экран при любом
  // временном сбое опроса. Флаг в ref всегда актуален.
  const loadedOnce = useRef(false);
  const alive = useRef(true);

  function load() {
    api.get<{ order: Order }>(`/orders/${id}`).then((r) => {
      if (!alive.current) return;
      if (prevStatus.current && prevStatus.current !== "DELIVERED" && r.order.status === "DELIVERED") playBell();
      prevStatus.current = r.order.status;
      loadedOnce.current = true;
      setOrder(r.order);
      setFailed(false);
    }).catch(() => {
      // временный сбой опроса не должен ронять уже загруженный заказ в error-экран
      if (alive.current && !loadedOnce.current) setFailed(true);
    });
  }

  useEffect(() => {
    alive.current = true;
    loadedOnce.current = false;
    load();
    const iv = setInterval(() => {
      if (prevStatus.current === "DELIVERED" || prevStatus.current === "CANCELLED") return;
      load();
    }, 5000);
    return () => { alive.current = false; clearInterval(iv); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (failed) return <ErrorState onRetry={() => { setFailed(false); load(); }} />;
  if (!order) return <Spinner />;

  return (
    <div className="mx-auto max-w-2xl">
      <Link to="/orders" className="text-sm  hover:underline">← {t.tracking.back}</Link>
      <div className="mt-3">
        <OrderPanel order={order} onReload={load} />
      </div>
    </div>
  );
}
