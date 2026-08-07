import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { Button } from "./ui";
import { useT, useLang } from "../i18n";

interface Session {
  id: string;
  device: string;
  location: string | null;
  lastSeenAt: string;
  createdAt: string;
  current: boolean;
}

/** «Устройства и безопасность»: список активных сессий с выходом на конкретном
 *  устройстве, на всех других, и везде. Живёт в профиле. */
export function SessionsManager() {
  const t = useT();
  const { lang } = useLang();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[] | null>(null);
  const [max, setMax] = useState(5);
  const [busy, setBusy] = useState<string | null>(null);

  function load() {
    api.get<{ sessions: Session[]; maxDevices: number }>("/auth/sessions")
      .then((r) => { setSessions(r.sessions); setMax(r.maxDevices); })
      .catch(() => setSessions([]));
  }
  useEffect(load, []);

  async function revoke(id: string) {
    setBusy(id);
    try { await api.post(`/auth/sessions/${id}/revoke`); load(); }
    finally { setBusy(null); }
  }
  async function logoutOthers() {
    setBusy("others");
    try { await api.post("/auth/sessions/logout-others"); load(); }
    finally { setBusy(null); }
  }
  async function logoutEverywhere() {
    setBusy("all");
    try { await api.post("/auth/logout-all"); } catch { /* всё равно выходим локально */ }
    logout();
    navigate("/login");
  }

  const fmt = (iso: string) =>
    new Date(iso).toLocaleString(lang === "en" ? "en-GB" : "ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

  if (!sessions) return null;
  const others = sessions.filter((s) => !s.current);

  return (
    <div className="rounded-2xl glass-card p-6">
      <h2 className="text-lg font-bold text-[#e0860c]">{t.sessions.title}</h2>
      <p className="mt-1 text-sm text-[#e0860c]/80">{t.sessions.subtitle(sessions.length, max)}</p>

      <div className="mt-4 space-y-2">
        {sessions.map((s) => (
          <div key={s.id} className="flex items-center justify-between gap-3 rounded-2xl border border-orange-100 bg-white/70 p-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-semibold text-[#e0860c]">{s.device}</span>
                {s.current && <span className="shrink-0 rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-[#e0860c]">{t.sessions.thisDevice}</span>}
              </div>
              <div className="truncate text-xs text-[#e0860c]/70">
                {s.location ? `${s.location} · ` : ""}{t.sessions.lastSeen}: {fmt(s.lastSeenAt)}
              </div>
            </div>
            {!s.current && (
              <button
                onClick={() => revoke(s.id)}
                disabled={busy === s.id}
                className="shrink-0 rounded-xl border border-orange-200 px-3 py-1.5 text-xs font-semibold text-[#e0860c] transition hover:bg-orange-50 disabled:opacity-50"
              >
                {busy === s.id ? "…" : t.sessions.logoutDevice}
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {others.length > 0 && (
          <button
            onClick={logoutOthers}
            disabled={busy === "others"}
            className="rounded-xl border border-orange-200 px-4 py-2 text-sm font-semibold text-[#e0860c] transition hover:bg-orange-50 disabled:opacity-50"
          >
            {busy === "others" ? "…" : t.sessions.logoutOthers}
          </button>
        )}
        <Button onClick={logoutEverywhere} disabled={busy === "all"}>{t.sessions.logoutEverywhere}</Button>
      </div>
    </div>
  );
}
