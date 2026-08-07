import { useEffect, useState } from "react";
import { api } from "../../api/client";
import type { Order, OrderStatus } from "../../types";
import { Spinner, Badge, Button, ErrorState } from "../../components/ui";
import { toast } from "../../components/Toast";
import { PinIcon } from "../../components/icons";
import { statusTone, NEXT_ACTION } from "./orderStatus";
import { useT, useTr } from "../../i18n";

type Tab = "new" | "active" | "done";
const TAB_STATUSES: Record<Tab, OrderStatus[]> = {
  new: ["PENDING"],
  active: ["ACCEPTED", "COOKING", "READY"],
  done: ["DELIVERED", "CANCELLED"],
};

export function CookOrders() {
  const t = useT();
  const tr = useTr();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [tab, setTab] = useState<Tab>("new");

  function load() {
    setFailed(false);
    api.get<{ orders: Order[] }>("/orders").then((r) => setOrders(r.orders)).catch(() => setFailed(true));
  }
  useEffect(load, []);

  async function setStatus(id: string, status: OrderStatus) {
    try {
      await api.patch(`/orders/${id}/status`, { status });
      load();
    } catch (e) {
      // отклонённый переход (напр. заказ уже отменил покупатель) больше не пропадает молча
      toast(e instanceof Error ? e.message : t.common.error);
      load();
    }
  }

  if (failed) return <ErrorState onRetry={load} />;
  if (!orders) return <Spinner />;

  const counts: Record<Tab, number> = {
    new: orders.filter((o) => TAB_STATUSES.new.includes(o.status)).length,
    active: orders.filter((o) => TAB_STATUSES.active.includes(o.status)).length,
    done: orders.filter((o) => TAB_STATUSES.done.includes(o.status)).length,
  };
  const visible = orders.filter((o) => TAB_STATUSES[tab].includes(o.status));

  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold">{t.orders.title}</h1>

      {/* overflow-x-auto + shrink-0: три русских вкладки шире 375px — прокрутка вместо расползания страницы */}
      <div className="-mx-1 mb-5 flex gap-2 overflow-x-auto px-1 pb-1">
        {(["new", "active", "done"] as Tab[]).map((tb) => (
          <button
            key={tb}
            onClick={() => setTab(tb)}
            className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition ${
              tab === tb ? "btn-glass" : "glass-soft "
            }`}
          >
            {t.orders.tabs[tb]}
            {counts[tb] > 0 && (
              <span className={`rounded-full px-1.5 text-xs ${tab === tb ? "bg-orange-100 text-[#e0860c]" : "bg-orange-50"}`}>
                {counts[tb]}
              </span>
            )}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="">{t.orders.empty}</p>
      ) : (
        // карточки рядом (2 колонки с 640px) — как во всех остальных списках
        <div className="grid items-start gap-3 sm:grid-cols-2">
          {visible.map((o) => {
            const action = NEXT_ACTION[o.status];
            return (
              <div key={o.id} className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">{o.buyer?.name}</span>
                    <span className="ml-2 text-sm ">{o.buyer?.phone}</span>
                  </div>
                  <Badge tone={statusTone(o.status)}>{t.orders.status[o.status]}</Badge>
                </div>

                <ul className="mt-2 text-sm ">
                  {o.items.map((it) => (
                    <li key={it.id}>
                      {tr(it.titleSnapshot)} × {it.qty}
                    </li>
                  ))}
                </ul>

                {o.address && <p className="mt-2 flex items-center gap-1 text-sm "><PinIcon size={14} /> {o.address}</p>}

                <div className="mt-3 flex items-center justify-between border-t border-orange-100 pt-3">
                  <span className="font-semibold">
                    {o.total} {t.common.rub}
                  </span>
                  <div className="flex gap-2">
                    {(o.status === "PENDING" || o.status === "ACCEPTED" || o.status === "COOKING") && (
                      <Button variant="danger" onClick={() => setStatus(o.id, "CANCELLED")}>
                        {t.orders.cancel}
                      </Button>
                    )}
                    {action && (
                      <Button onClick={() => setStatus(o.id, action.next)}>
                        {(t.orders as any)[action.labelKey]}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
