import { useState } from "react";
import { Link } from "react-router-dom";
import { useRealtime, type Notif } from "../realtime/RealtimeContext";
import { useAuth } from "../auth/AuthContext";
import { useT, useTr, useLang } from "../i18n";

function describe(n: Notif, t: ReturnType<typeof useT>): { title: string; sub: string } {
  if (n.type === "order_new") return { title: t.notify.newOrder, sub: n.body };
  if (n.type === "order_status") {
    const map = t.notify.status as Record<string, string>;
    return { title: map[n.title] ?? n.title, sub: n.body };
  }
  return { title: n.title || t.notify.title, sub: n.body };
}

// суффиксы «с/м/ч/д» — по языку интерфейса (раньше были только английские s/m/h/d)
function timeAgo(iso: string, lang: string): string {
  const sfx = lang === "en" ? ["s", "m", "h", "d"] : ["с", "м", "ч", "д"];
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return `${s}${sfx[0]}`;
  if (s < 3600) return `${Math.floor(s / 60)}${sfx[1]}`;
  if (s < 86400) return `${Math.floor(s / 3600)}${sfx[2]}`;
  return `${Math.floor(s / 86400)}${sfx[3]}`;
}

export function NotificationBell() {
  const { notifications, unread, markRead } = useRealtime();
  const { user } = useAuth();
  // /orders/:id — маршрут покупателя (Guard role="BUYER"); повара ведём в его кабинет заказов
  const orderLink = (orderId: string) => (user?.role === "COOK" ? "/cook/orders" : `/orders/${orderId}`);
  const [open, setOpen] = useState(false);
  const t = useT();
  const tr = useTr();
  const { lang } = useLang();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-8 w-8 items-center justify-center rounded-full text-[#e0860c] transition hover:bg-orange-50"
        aria-label={t.notify.title}
      >
        <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" />
        </svg>
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#e0860c] px-1 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-80 max-w-[90vw] overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-orange-100 px-4 py-2.5">
              <span className="font-bold text-[#e0860c]">{t.notify.title}</span>
              {unread > 0 && (
                <button onClick={() => markRead()} className="text-xs font-medium text-[#e0860c] hover:underline">{t.notify.readAll}</button>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-10 text-center text-sm text-[#e0860c]">{t.notify.empty}</div>
              ) : (
                notifications.map((n) => {
                  const d = describe(n, t);
                  const body = (
                    <div className="flex items-start gap-3 px-4 py-3">
                      <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.read ? "bg-transparent" : "bg-[#e0860c]"}`} />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-bold text-[#e0860c]">{d.title}</div>
                        {d.sub && <div className="truncate text-xs text-[#e0860c]">{tr(d.sub)}</div>}
                      </div>
                      <span className="shrink-0 text-[11px] text-[#e0860c]">{timeAgo(n.createdAt, lang)}</span>
                    </div>
                  );
                  const cls = `block w-full text-left transition hover:bg-orange-50/60 ${n.read ? "" : "bg-orange-50/40"}`;
                  return n.orderId ? (
                    <Link key={n.id} to={orderLink(n.orderId)} className={cls} onClick={() => { markRead(n.id); setOpen(false); }}>{body}</Link>
                  ) : (
                    <button key={n.id} className={cls} onClick={() => markRead(n.id)}>{body}</button>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
