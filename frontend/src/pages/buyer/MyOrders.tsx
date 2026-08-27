import { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import type { Order } from "../../types";
import { Spinner, Badge, ErrorState, EmptyState } from "../../components/ui";
import { CheckIcon } from "../../components/icons";
import { statusTone } from "../cook/orderStatus";
import { CancelOrderTimer } from "../../components/CancelOrderTimer";
import { useT, useTr, useLang } from "../../i18n";

export function MyOrders() {
  const t = useT();
  const tr = useTr();
  const { lang } = useLang();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [params] = useSearchParams();
  const placed = params.get("placed");

  function load() {
    setFailed(false);
    // БЕЗ setOrders(null): первый визит и так стартует с null (спиннер), а
    // перезагрузка после отмены обновляет список НА МЕСТЕ, не пряча экран
    api.get<{ orders: Order[] }>("/orders").then((r) => setOrders(r.orders)).catch(() => setFailed(true));
  }
  useEffect(load, []);

  if (failed) return <ErrorState onRetry={load} />;
  if (!orders) return <Spinner />;

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-4 text-2xl font-semibold">{t.orders.myTitle}</h1>

      {placed && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-orange-50 p-4 font-medium text-[#e0860c]">
          <CheckIcon size={18} /> {t.cart.placed}
        </div>
      )}

      {orders.length === 0 ? (
        <EmptyState title={t.orders.empty} actionLabel={t.common.backToFeed} onAction={() => navigate("/")} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {orders.map((o) => (
            <Link
              to={`/orders/${o.id}`}
              key={o.id}
              className="flex flex-col rounded-2xl border border-orange-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="font-medium">{tr(o.cookProfile?.kitchenName || "")}</div>
                <Badge tone={statusTone(o.status)}>{t.orders.status[o.status]}</Badge>
              </div>
              <ul className="mt-2 text-sm ">
                {o.items.map((it) => (
                  <li key={it.id}>
                    {tr(it.titleSnapshot)} × {it.qty} — {it.priceAtOrder * it.qty} {t.common.rub}
                  </li>
                ))}
              </ul>
              <div className="mt-auto flex items-center justify-between border-t border-orange-100 pt-3 text-sm">
                <span className="">
                  {new Date(o.createdAt).toLocaleString(lang === "en" ? "en-GB" : "ru-RU")}
                </span>
                <span className="font-semibold">{o.total} {t.common.rub}</span>
              </div>
              <div className="mt-2 flex items-center gap-1 text-sm font-medium text-[#e0860c]">
                {o.review ? (
                  t.review.written
                ) : o.status === "DELIVERED" ? (
                  <>{t.review.leave} →</>
                ) : (
                  <>{t.orders.track} →</>
                )}
              </div>
              {o.status === "PENDING" && (
                <div className="mt-3 border-t border-orange-100 pt-3">
                  <CancelOrderTimer orderId={o.id} createdAt={o.createdAt} status={o.status} onCancelled={load} compact />
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
