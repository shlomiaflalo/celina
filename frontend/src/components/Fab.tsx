import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import type { Order } from "../types";
import { SettingsIcon, ReceiptIcon, PowerIcon } from "./icons";
import { useT } from "../i18n";

/** Плавающая круглая кнопка + → раскрывает меню в строку (настройки, заказы, стоп-приём). */
export function Fab() {
  const t = useT();
  const { user, refresh } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);
  const [online, setOnline] = useState(user?.cookProfile?.isOnline ?? false);

  const isCook = user?.role === "COOK";

  useEffect(() => {
    // считаем активные заказы только для повара (Fab показывается лишь ему)
    if (!user || user.role !== "COOK") return;
    api.get<{ orders: Order[] }>("/orders").then((r) => {
      const active = r.orders.filter((o) => !["DELIVERED", "CANCELLED"].includes(o.status));
      setCount(active.length);
    }).catch(() => {});
  }, [user, open]);

  useEffect(() => {
    setOnline(user?.cookProfile?.isOnline ?? false);
  }, [user]);

  // Fab только для повара: быстрый доступ к кухне/заказам/онлайн-статусу.
  // У покупателя те же ссылки уже есть в верхнем меню — + там только путал.
  if (!user || !isCook) return null;

  async function toggleOnline() {
    const next = !online;
    setOnline(next);
    await api.patch("/cooks/me/status", { isOnline: next }).catch(() => {});
    await refresh();
  }

  const go = (path: string) => { setOpen(false); navigate(path); };

  const items = isCook
    ? [
        { key: "set", icon: <img src="/images/celina-symbol.svg" alt="" className="h-5 w-5" />, label: t.kitchen.title, onClick: () => go("/cook/kitchen") },
        { key: "ord", icon: <ReceiptIcon size={20} />, label: t.nav.orders, badge: count, onClick: () => go("/cook/orders") },
        {
          key: "pow",
          icon: <PowerIcon size={20} />,
          label: online ? t.cook.online : t.cook.offline,
          tone: online ? "green" : "off",
          onClick: toggleOnline,
        },
      ]
    : [
        { key: "ord", icon: <ReceiptIcon size={20} />, label: t.nav.myOrders, badge: count, onClick: () => go("/orders") },
        { key: "set", icon: <SettingsIcon size={20} />, label: t.nav.feed, onClick: () => go("/") },
      ];

  return (
    // меню раскрывается ВЕРТИКАЛЬНО над кнопкой: горизонтальный ряд из трёх
    // пилюль (~360px) на экране 375px уезжал влево за край и был недосягаем
    <div className="fixed bottom-16 right-5 z-40 flex flex-col items-end gap-3">
      <div
        className={`flex flex-col items-end gap-2 transition-all duration-300 ${
          open ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
        }`}
      >
        {items.map((it) => (
          <button
            key={it.key}
            onClick={it.onClick}
            className="glass-soft flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium "
          >
            <span
              className={
                (it as { tone?: string }).tone === "green"
                  ? "text-[#e0860c]"
                  : (it as { tone?: string }).tone === "off"
                    ? ""
                    : "text-[#e0860c]"
              }
            >
              {it.icon}
            </span>
            <span className="whitespace-nowrap">{it.label}</span>
            {"badge" in it && (it as { badge: number }).badge > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#e0860c] px-1 text-xs text-white">
                {(it as { badge: number }).badge}
              </span>
            )}
          </button>
        ))}
      </div>

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="menu"
        className="btn-glass flex h-14 w-14 items-center justify-center rounded-full active:scale-95"
      >
        <svg width="26" height="26" viewBox="0 0 24 24" className={`transition-transform duration-300 ${open ? "rotate-45" : ""}`}>
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
