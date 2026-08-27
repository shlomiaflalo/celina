import { useEffect, useState } from "react";
import { api } from "../../api/client";
import type { Order, OrderStatus } from "../../types";
import { Spinner, Badge, Button, ErrorState, ConfirmModal } from "../../components/ui";
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
  // null = повар ещё не выбирал вкладку сам. Раньше всегда открывались «Новые»,
  // и повар с 2 активными и 10 завершёнными заказами видел «Заказов пока нет» —
  // будто заказов нет вообще. Теперь по умолчанию открываем первую непустую,
  // сохраняя приоритет «Новых» (там нужно действие повара).
  const [picked, setPicked] = useState<Tab | null>(null);

  function load() {
    setFailed(false);
    api.get<{ orders: Order[] }>("/orders").then((r) => setOrders(r.orders)).catch(() => setFailed(true));
  }
  useEffect(load, []);

  // подтверждение отмены: один случайный тап не должен терять заказ
  const [cancelId, setCancelId] = useState<string | null>(null);
  // защита от двойного тапа: пока PATCH летит, кнопки карточки заблокированы
  const [acting, setActing] = useState<string | null>(null);
  async function setStatus(id: string, status: OrderStatus) {
    // защита от двойного тапа — ПО КАРТОЧКЕ: глобальный guard молча глотал
    // подтверждённую отмену другой карточки, пока летел чужой PATCH
    if (acting === id) return;
    setActing(id);
    try {
      await api.patch(`/orders/${id}/status`, { status });
      load();
    } catch (e) {
      // отклонённый переход (напр. заказ уже отменил покупатель) больше не пропадает молча
      toast(e instanceof Error ? e.message : t.common.error);
      load();
    } finally {
      setActing(null);
    }
  }

  if (failed) return <ErrorState onRetry={load} />;
  if (!orders) return <Spinner />;

  const counts: Record<Tab, number> = {
    new: orders.filter((o) => TAB_STATUSES.new.includes(o.status)).length,
    active: orders.filter((o) => TAB_STATUSES.active.includes(o.status)).length,
    done: orders.filter((o) => TAB_STATUSES.done.includes(o.status)).length,
  };
  const tab: Tab = picked ?? ((["new", "active", "done"] as Tab[]).find((tb) => counts[tb] > 0) ?? "new");
  const visible = orders.filter((o) => TAB_STATUSES[tab].includes(o.status));

  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold">{t.orders.title}</h1>

      {/* overflow-x-auto + shrink-0: три русских вкладки шире 375px — прокрутка вместо расползания страницы */}
      <div className="-mx-1 mb-5 flex gap-2 overflow-x-auto px-1 pb-1">
        {(["new", "active", "done"] as Tab[]).map((tb) => (
          <button
            key={tb}
            onClick={() => setPicked(tb)}
            aria-pressed={tab === tb}
            className={`flex min-h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition ${
              // btn-glass и glass-soft различались ТОЛЬКО глубиной тени — какая
              // вкладка выбрана, понять было нельзя. ring-* здесь не работает:
              // .btn-glass задаёт box-shadow напрямую и перебивает кольцо
              // Tailwind. Поэтому обводка через outline (его никто не занимает —
              // своего focus-стиля в проекте нет, браузерный фокус выглядит иначе).
              tab === tb
                ? "btn-glass outline-2 outline-offset-2 outline-[#e0860c]"
                : "glass-soft opacity-90"
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
              <div key={o.id} className="card p-5">
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

                <div className="mt-3 flex items-center justify-between border-t border-[color:var(--hairline)] pt-3">
                  <span className="font-semibold">
                    {o.total} {t.common.rub}
                  </span>
                  <div className="flex gap-2">
                    {(o.status === "PENDING" || o.status === "ACCEPTED" || o.status === "COOKING") && (
                      // ghost, не solid: «Отменить» не должна выглядеть как
                      // главная кнопка рядом с «Принять» — и без подтверждения
                      // один промах пальцем терял заказ безвозвратно
                      <Button variant="ghost" disabled={acting === o.id} onClick={() => setCancelId(o.id)}>
                        {t.orders.cancel}
                      </Button>
                    )}
                    {action && (
                      <Button disabled={acting === o.id} onClick={() => setStatus(o.id, action.next)}>
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
      <ConfirmModal
        open={!!cancelId}
        title={t.tracking.cancelConfirm}
        confirmLabel={t.orders.cancel}
        onConfirm={() => { if (cancelId) setStatus(cancelId, "CANCELLED"); setCancelId(null); }}
        onClose={() => setCancelId(null)}
      />
    </div>
  );
}
