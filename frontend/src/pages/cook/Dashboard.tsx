import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import { toast } from "../../components/Toast";
import { useAuth } from "../../auth/AuthContext";
import type { Order } from "../../types";
import { Spinner, Badge, ErrorState } from "../../components/ui";
import { statusTone } from "./orderStatus";
import { useT, useTr } from "../../i18n";

export function Dashboard() {
  const t = useT();
  const tr = useTr();
  const { user, refresh } = useAuth();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [online, setOnline] = useState(user?.cookProfile?.isOnline ?? false);
  const [toggling, setToggling] = useState(false);

  // держим переключатель в синхроне с сервером (после refresh/навигации)
  useEffect(() => { setOnline(user?.cookProfile?.isOnline ?? false); }, [user]);

  function load() {
    setFailed(false);
    setOrders(null);
    api.get<{ orders: Order[] }>("/orders").then((r) => setOrders(r.orders)).catch(() => setFailed(true));
  }
  useEffect(load, []);

  async function toggleOnline() {
    if (toggling) return;
    const next = !online;
    setOnline(next); // оптимистично
    setToggling(true);
    try {
      await api.patch("/cooks/me/status", { isOnline: next });
      await refresh(); // сохраняем статус в сессии, чтобы не сбрасывался при переходах
    } catch (e) {
      setOnline(!next); // откат при ошибке
      toast(e instanceof Error ? e.message : t.common.error);
    } finally {
      setToggling(false);
    }
  }

  if (failed) return <ErrorState onRetry={load} />;
  if (!orders) return <Spinner />;

  const active = orders.filter((o) => !["DELIVERED", "CANCELLED"].includes(o.status));
  const today = orders.filter(
    (o) =>
      o.status === "DELIVERED" &&
      new Date(o.createdAt).toDateString() === new Date().toDateString()
  );
  const revenueToday = today.reduce((s, o) => s + o.total, 0);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{tr(user?.cookProfile?.kitchenName || "")}</h1>
          <p className="text-sm ">{t.nav.dashboard}</p>
        </div>
        <button
          onClick={toggleOnline}
          disabled={toggling}
          aria-pressed={online}
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition active:scale-95 disabled:opacity-60 ${online ? "bg-[#e0860c] text-white shadow-sm" : "bg-orange-50 text-[#e0860c] ring-1 ring-orange-200"}`}
        >
          <span className={`h-2.5 w-2.5 rounded-full ${online ? "bg-white" : "bg-[#c2ad90]"}`} />
          {online ? t.cook.online : t.cook.offline}
        </button>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-3">
        <Stat label={t.dash.active} value={active.length} />
        <Stat label={t.dash.doneToday} value={today.length} />
        <Stat label={t.dash.revenueToday} value={revenueToday} />
      </div>

      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t.orders.title}</h2>
        <Link to="/cook/orders" className="text-sm font-medium text-white hover:underline">
          {t.dash.all} →
        </Link>
      </div>

      {active.length === 0 ? (
        <p className="">{t.orders.empty}</p>
      ) : (
        <div className="space-y-2">
          {active.slice(0, 5).map((o) => (
            <div key={o.id} className="flex items-center justify-between rounded-xl border border-orange-100 bg-white p-4">
              <div>
                <div className="font-medium">{o.buyer?.name}</div>
                <div className="text-sm ">
                  {o.items.map((i) => `${tr(i.titleSnapshot)}×${i.qty}`).join(", ")}
                </div>
              </div>
              <Badge tone={statusTone(o.status)}>{t.orders.status[o.status]}</Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-orange-100 bg-white p-4 text-center shadow-sm">
      <div className="text-2xl font-semibold text-[#e0860c]">{value}</div>
      <div className="mt-1 text-xs ">{label}</div>
    </div>
  );
}
