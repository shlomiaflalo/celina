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

  // сколько блюд опубликовано — для чек-листа активации
  const [dishCount, setDishCount] = useState<number | null>(null);
  useEffect(() => {
    const id = user?.cookProfile?.id;
    if (!id) return;
    api.get<{ cook: { dishes?: unknown[] } }>(`/cooks/${id}`)
      .then((r) => setDishCount((r.cook.dishes ?? []).length))
      .catch(() => setDishCount(null));
  }, [user?.cookProfile?.id]);

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
      // refresh отдельно: PATCH уже прошёл, и его сбой не должен откатывать
      // тумблер и пугать «ошибкой» при успешном переключении
      refresh().catch(() => {});
    } catch (e) {
      setOnline(!next); // откат при ошибке САМОГО переключения
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
          <p className="text-sm opacity-75">{t.nav.dashboard}</p>
        </div>
        <button
          onClick={toggleOnline}
          disabled={toggling}
          aria-pressed={online}
          className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition active:scale-95 disabled:opacity-60 ${online ? "bg-[#e0860c] text-white shadow-sm" : "bg-orange-50 text-[#e0860c] ring-1 ring-orange-200"}`}
        >
          <span className={`h-2.5 w-2.5 rounded-full ${online ? "bg-white" : "bg-[#e0860c]/40"}`} />
          {online ? t.cook.online : t.cook.offline}
        </button>
      </div>

      {/* Чек-лист активации: повар — узкое место маркетплейса, и его первая
          сессия должна вести за руку до первого заказа. Прячется сам, когда
          все шаги пройдены. */}
      {user && (!user.isVerified || dishCount === 0 || !online) && (
        <div className="card mb-6 rounded-2xl p-5">
          <p className="font-bold text-[#e0860c]">{t.cook.onb.title}</p>
          <ol className="mt-3 space-y-2.5">
            {[
              { done: !!user.isVerified, label: t.cook.onb.verify, to: "/verify", cta: t.verify.goVerify },
              { done: dishCount !== 0, label: t.cook.onb.dish, to: "/cook/menu", cta: t.nav.menu },
              { done: online, label: t.cook.onb.online, action: toggleOnline, cta: t.cook.onb.turnOn },
            ].map((st, i) => (
              <li key={i} className="flex items-center gap-3">
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${st.done ? "bg-[#e0860c] text-white" : "bg-orange-50 text-[#e0860c]"}`}>
                  {st.done ? "✓" : i + 1}
                </span>
                <span className={`min-w-0 flex-1 text-sm font-medium text-[#e0860c] ${st.done ? "opacity-60 line-through" : ""}`}>{st.label}</span>
                {!st.done && (st.to ? (
                  <Link to={st.to} className="btn-solid shrink-0 rounded-xl px-3.5 py-2 text-sm font-semibold">{st.cta}</Link>
                ) : (
                  <button onClick={st.action} disabled={toggling} className="btn-solid shrink-0 rounded-xl px-3.5 py-2 text-sm font-semibold disabled:opacity-50">{st.cta}</button>
                ))}
              </li>
            ))}
            <li className="flex items-center gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-50 text-sm font-bold text-[#e0860c]">4</span>
              <span className="min-w-0 flex-1 text-sm font-medium text-[#e0860c]">{t.cook.onb.invite}</span>
              <Link to="/listovki" className="btn-glass shrink-0 rounded-xl px-3.5 py-2 text-sm font-semibold">{t.cook.onb.flyers}</Link>
            </li>
          </ol>
        </div>
      )}

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
        <div className="rounded-2xl bg-white/10 p-6 text-center ring-1 ring-white/20">
          <p>{t.orders.empty}</p>
          {/* первый экран нового повара не должен быть тупиком: следующее
              действие — добавить блюдо в меню */}
          <Link to="/cook/menu" className="btn-glass mt-3 inline-flex items-center gap-1 rounded-xl px-4 py-2 text-sm font-semibold">
            {t.nav.menu} →
          </Link>
          <div className="mt-3 text-sm">
            <Link to="/listovki" className="underline-offset-2 hover:underline">
              {`Листовки для подъезда →`}
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {active.slice(0, 5).map((o) => (
            <div key={o.id} className="flex items-center justify-between card rounded-xl p-4">
              <div>
                <div className="font-medium">{o.buyer?.name}</div>
                <div className="text-sm opacity-75">
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
    <div className="card rounded-2xl p-4 text-center">
      <div className="text-2xl font-semibold text-[#e0860c]">{value}</div>
      <div className="mt-1 text-xs ">{label}</div>
    </div>
  );
}
