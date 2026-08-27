import { useEffect, useState } from "react";
import { toast } from "../components/Toast";
import type React from "react";
import { api, getToken } from "../api/client";
import { Spinner, Button } from "../components/ui";
import { CoinsIcon, VideoIcon, PinIcon } from "../components/icons";
import { BowlMark } from "../components/Logo";
import { useT, useLang } from "../i18n";

/** Открывает приватный KYC-документ в новой вкладке БЕЗ токена в URL:
 *  fetch с заголовком Authorization → blob-ссылка. Иначе JWT сессии основателя
 *  оседал бы в истории браузера / адресной строке. */
async function openKycDoc(url: string) {
  try {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${getToken()}` } });
    if (!res.ok) { toast("Не удалось открыть документ"); return; }
    const blob = await res.blob();
    const obj = URL.createObjectURL(blob);
    window.open(obj, "_blank", "noopener");
    setTimeout(() => URL.revokeObjectURL(obj), 60_000);
  } catch { toast("Не удалось открыть документ"); }
}

interface Metrics {
  gmv: number; paidGmv: number; aov: number; gmv7d: number; gmvToday: number;
  totalOrders: number; liveOrders: number; ordersToday: number; orders7d: number; delivered: number;
  funnel: { pending: number; accepted: number; cooking: number; ready: number; delivered: number; cancelled: number };
  cancelRate: number; fulfilRate: number; dineInBookings: number;
  cooks: number; cooks7d: number; buyers: number; activeBuyers: number; repeatBuyers: number; retentionRate: number; conversionRate: number;
  usersToday: number; users7d: number;
  pendingVerifications: number; verifiedUsers: number;
  dishes: number; cities: number;
  reviews: number; avgRating: number;
  gatherings: number; gatheringsOpen: number; rsvpGoing: number;
  cashOrders: number; cardOrders: number;
  topCooks: { name: string; gmv: number; orders: number }[];
  updatedAt: string;
}

interface Pending {
  id: string; name: string; phone: string; city: string | null; role: string;
  verificationVideoUrl: string | null; verificationDocUrl: string | null;
  cookProfile?: { kitchenName: string } | null;
}

export function Founder() {
  const t = useT();
  const { lang } = useLang();
  const [m, setM] = useState<Metrics | null>(null);
  const [pending, setPending] = useState<Pending[]>([]);
  // 2FA-шлюз входа в панель
  const [gate, setGate] = useState<"checking" | "locked" | "open">("checking");
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState("");
  const [sentTo, setSentTo] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 403 на опросе = 2FA-сессия истекла: возвращаем шлюз, а не «зависаем» на старых данных
  function on403(e: Error & { status?: number }) { if (e?.status === 403) { setGate("locked"); setCodeSent(false); } }
  function loadMetrics() { api.get<Metrics>("/stats/founder").then(setM).catch(on403); }
  function loadPending() { api.get<{ pending: Pending[] }>("/admin/verifications").then((r) => setPending(r.pending)).catch(on403); }

  useEffect(() => {
    api.get<Metrics>("/stats/founder")
      .then((mm) => { setM(mm); setGate("open"); loadPending(); })
      .catch(() => setGate("locked")); // 403 → нужна 2FA
  }, []);

  // авто-обновление данных раз в 30 сек, пока панель открыта
  useEffect(() => {
    if (gate !== "open") return;
    const id = setInterval(() => { loadMetrics(); loadPending(); }, 30_000);
    return () => clearInterval(id);
  }, [gate]);

  async function decide(id: string, decision: "approve" | "decline") {
    try {
      await api.post(`/admin/verifications/${id}`, { decision });
    } catch (e) {
      const err = e as Error & { status?: number };
      on403(err);
      // не-403 (сеть, 500): молча «не сработало» выглядит как «одобрено» —
      // показываем ошибку явно
      if (err.status !== 403) toast(err.message || t.common.error);
      return;
    }
    loadPending();
    loadMetrics();
  }

  async function requestCode() {
    setBusy(true); setError(null);
    try {
      const r = await api.post<{ to?: string; devCode?: string }>("/auth/founder/request-2fa", {});
      setSentTo(r.to || ""); setCodeSent(true);
    } catch (e) { setError(e instanceof Error ? e.message : t.common.error); }
    finally { setBusy(false); }
  }
  async function verifyCode() {
    setBusy(true); setError(null);
    try {
      await api.post("/auth/founder/verify-2fa", { code });
      const mm = await api.get<Metrics>("/stats/founder");
      setM(mm); setGate("open"); loadPending();
    } catch (e) { setError(e instanceof Error ? e.message : t.common.error); }
    finally { setBusy(false); }
  }

  if (gate === "checking") return <Spinner />;

  if (gate === "locked") {
    return (
      <div className="flex min-h-[72vh] items-center justify-center px-4">
        <div className="w-full max-w-sm overflow-hidden rounded-[28px] bg-white shadow-[0_20px_60px_rgba(120,70,10,0.28)]">
          {/* фирменная шапка-градиент с логотипом-чашей и замком */}
          <div
            className="relative px-7 pb-9 pt-8 text-center"
            style={{ background: "linear-gradient(160deg,#f4a01f 0%,#e0860c 100%)" }}
          >
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 ring-1 ring-white/40 backdrop-blur">
              <BowlMark size={34} tone="light" steam />
            </div>
            <h1 className="text-xl font-bold text-white drop-shadow-sm">{t.founder.twoFATitle}</h1>
            {/* замок-бейдж, «наезжающий» на границу шапки/тела */}
            <div className="absolute -bottom-6 left-1/2 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full bg-white shadow-md border border-[var(--hairline)]">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e0860c" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="11" width="16" height="10" rx="2.5" /><path d="M8 11V7a4 4 0 0 1 8 0v4" />
              </svg>
            </div>
          </div>

          {/* тело */}
          <div className="px-7 pb-7 pt-9 text-center">
            <p className="mx-auto max-w-[17rem] text-sm leading-relaxed text-[#e0860c]">{t.founder.twoFADesc}</p>

            {!codeSent ? (
              <Button full onClick={requestCode} disabled={busy}>
                <span className="inline-flex items-center gap-2">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
                  {busy ? "…" : t.auth.sendCode}
                </span>
              </Button>
            ) : (
              <div className="mt-5 space-y-3">
                <p className="text-xs text-[#e0860c]">
                  {t.auth.codeSentTo} <b className="text-[#e0860c]">{sentTo}</b>
                </p>
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  inputMode="numeric"
                  autoFocus
                  placeholder="••••••"
                  aria-label={t.auth.enterCode}
                  className="w-full rounded-2xl border-2 border-orange-100 bg-orange-50/50 px-4 py-3.5 text-center text-2xl font-bold tracking-[0.5em] text-[#e0860c] outline-none transition focus:border-[#e0860c] focus:bg-white"
                />
                <Button full onClick={verifyCode} disabled={busy || code.length < 4}>{busy ? "…" : t.founder.unlock}</Button>
                <button onClick={requestCode} disabled={busy} className="px-3 py-2.5 text-xs font-medium text-[#e0860c] transition hover:underline disabled:opacity-50">
                  {t.auth.sendCode}
                </button>
              </div>
            )}

            {error && <p className="mt-4 rounded-xl bg-orange-50 px-3 py-2 text-sm font-semibold text-[#e0860c]">{error}</p>}
          </div>
        </div>
      </div>
    );
  }

  if (!m) return <Spinner />;

  const nf = (n: number) => n.toLocaleString(lang === "en" ? "en-US" : "ru-RU");
  const big = [
    { v: nf(m.gmv), l: t.founder.gmv },
    { v: nf(m.liveOrders), l: t.founder.orders },
    { v: nf(m.aov), l: t.founder.aov },
    { v: `${m.retentionRate}%`, l: t.founder.retention },
  ];
  // мелкие метрики по разделам
  const moneyRow = [
    { v: nf(m.gmvToday), l: t.founder.gmvToday },
    { v: nf(m.gmv7d), l: t.founder.gmv7d },
    { v: nf(m.paidGmv), l: t.founder.paidGmv },
  ];
  const ordersRow = [
    { v: nf(m.ordersToday), l: t.founder.ordersToday },
    { v: nf(m.orders7d), l: t.founder.orders7d },
    { v: nf(m.delivered), l: t.founder.delivered },
    { v: `${m.fulfilRate}%`, l: t.founder.fulfilRate },
    { v: `${m.cancelRate}%`, l: t.founder.cancelRate },
    { v: nf(m.dineInBookings), l: t.founder.dineInBookings },
  ];
  const usersRow = [
    { v: nf(m.buyers), l: t.founder.buyers },
    { v: nf(m.cooks), l: t.founder.cooks },
    { v: `+${nf(m.usersToday)}`, l: t.founder.usersToday },
    { v: `+${nf(m.users7d)}`, l: t.founder.users7d },
    { v: `+${nf(m.cooks7d)}`, l: t.founder.cooks7d },
    { v: nf(m.activeBuyers), l: t.founder.activeBuyers },
    { v: `${m.conversionRate}%`, l: t.founder.conversion },
    { v: nf(m.verifiedUsers), l: t.founder.verified },
  ];
  const catalogRow = [
    { v: nf(m.dishes), l: t.founder.dishes },
    { v: nf(m.cities), l: t.founder.cities },
    { v: nf(m.reviews), l: t.founder.reviews },
    { v: m.avgRating ? `★ ${m.avgRating}` : "—", l: t.founder.avgRating },
    { v: nf(m.gatherings), l: t.founder.gatherings },
    { v: nf(m.rsvpGoing), l: t.founder.rsvpGoing },
  ];
  const funnelCells = [
    { v: m.funnel.pending, l: t.founder.fPending },
    { v: m.funnel.accepted, l: t.founder.fAccepted },
    { v: m.funnel.cooking, l: t.founder.fCooking },
    { v: m.funnel.ready, l: t.founder.fReady },
    { v: m.funnel.delivered, l: t.founder.fDelivered },
    { v: m.funnel.cancelled, l: t.founder.fCancelled },
  ];
  const Section = ({ title, cells }: { title: string; cells: { v: React.ReactNode; l: string }[] }) => (
    <div className="mt-4">
      <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-white/80 drop-shadow">{title}</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {cells.map((c) => (
          <div key={c.l} className="rounded-2xl bg-white p-4 border border-[var(--hairline)] shadow-[var(--e1)]">
            <div className="text-2xl font-bold text-[#e0860c]">{c.v}</div>
            <div className="mt-0.5 text-xs text-[#e0860c]">{c.l}</div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-end justify-between gap-3">
        <div>
          <h1 className="t-h1 text-white drop-shadow">{t.founder.title}</h1>
          <p className="text-sm text-white/85">
            {t.founder.subtitle}
            <span className="text-white/60"> · {t.founder.updated} {new Date(m.updatedAt).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}</span>
          </p>
        </div>
        <button
          onClick={() => { loadMetrics(); loadPending(); }}
          className="shrink-0 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-[#e0860c] shadow-sm transition hover:bg-white"
        >
          ↻ {t.founder.refresh}
        </button>
      </div>

      {/* крупные метрики — оранжевые карточки */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {big.map((c) => (
          <div key={c.l} className="rounded-3xl bg-[#e0860c] p-5 text-white shadow-[0_8px_24px_rgba(176,104,8,0.25)]">
            <div className="text-3xl font-extrabold leading-tight sm:text-4xl">{c.v}</div>
            <div className="mt-1 text-xs font-medium text-white/85">{c.l}</div>
          </div>
        ))}
      </div>

      {/* метрики по разделам */}
      <Section title={t.founder.sectionMoney} cells={moneyRow} />
      <Section title={t.founder.sectionOrders} cells={ordersRow} />

      {/* воронка заказов */}
      <div className="mt-4">
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-white/80 drop-shadow">{t.founder.funnelTitle}</h2>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {funnelCells.map((c) => (
            <div key={c.l} className={`rounded-2xl p-3 text-center shadow-sm ${c.l === t.founder.fCancelled ? "bg-orange-50 ring-1 ring-orange-200" : "bg-white border border-[var(--hairline)]"}`}>
              <div className="text-xl font-bold text-[#e0860c]">{c.v}</div>
              <div className="mt-0.5 text-[11px] leading-tight text-[#e0860c]">{c.l}</div>
            </div>
          ))}
        </div>
      </div>

      <Section title={t.founder.sectionUsers} cells={usersRow} />
      <Section title={t.founder.sectionCatalog} cells={catalogRow} />

      {/* топ поваров по обороту */}
      {m.topCooks.length > 0 && (
        <div className="mt-4">
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-white/80 drop-shadow">{t.founder.topCooksTitle}</h2>
          <div className="overflow-hidden rounded-2xl bg-white border border-[var(--hairline)] shadow-[var(--e1)]">
            {m.topCooks.map((c, i) => (
              <div key={i} className={`flex items-center justify-between gap-3 px-4 py-3 ${i > 0 ? "border-t border-orange-100" : ""}`}>
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#e0860c] text-xs font-bold text-white">{i + 1}</span>
                  <span className="truncate font-medium text-[#e0860c]">{c.name}</span>
                </div>
                <div className="shrink-0 text-right">
                  <div className="font-bold text-[#e0860c]">{nf(c.gmv)} ₽</div>
                  <div className="text-[11px] text-[#e0860c]/70">{c.orders} {t.founder.tcOrders}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* пилот — только наличные при получении */}
      <div className="mt-4 flex items-center gap-3 rounded-2xl bg-white p-5 border border-[var(--hairline)] shadow-[var(--e1)]">
        <span className="shrink-0"><CoinsIcon size={26} /></span>
        <span className="text-sm font-medium text-[#e0860c]">{t.founder.cashOnlyNote}</span>
      </div>

      {/* заявки на верификацию — одобрение основателем */}
      <div className="mt-3 rounded-2xl bg-white p-5 border border-[var(--hairline)] shadow-[var(--e1)]">
        <h2 className="mb-3 flex items-center gap-2 font-bold text-[#e0860c]">
          {t.founder.verifTitle}
          {pending.length > 0 && (
            <span className="rounded-full bg-[#e0860c] px-2 py-0.5 text-xs font-semibold text-white">{pending.length}</span>
          )}
        </h2>
        {pending.length === 0 ? (
          <p className="text-sm text-[#e0860c]">{t.founder.noPending}</p>
        ) : (
          <div className="space-y-3">
            {pending.map((u) => (
              <div key={u.id} className="rounded-xl border border-[var(--hairline)] bg-orange-50/60 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold text-[#e0860c]">
                      {u.name} <span className="text-xs font-normal text-[#e0860c]">· {u.role === "COOK" ? t.auth.cook : t.auth.buyer}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-[#e0860c]">{u.phone} · <PinIcon size={12} /> {u.city || "—"}{u.cookProfile ? ` · ${u.cookProfile.kitchenName}` : ""}</div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button onClick={() => decide(u.id, "approve")} className="rounded-full bg-[#e0860c] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90">{t.founder.approve}</button>
                    <button onClick={() => decide(u.id, "decline")} className="rounded-full bg-orange-100 px-4 py-2.5 text-sm font-semibold text-[#e0860c] hover:bg-orange-200">{t.founder.decline}</button>
                  </div>
                </div>
                {/* видео + документ для проверки */}
                <div className="mt-3 flex flex-wrap gap-3">
                  {u.verificationVideoUrl && (
                    <div>
                      <div className="mb-1 flex items-center gap-1 text-[11px] font-medium text-[#e0860c]"><VideoIcon size={13} /> {t.founder.viewVideo}</div>
                      <video src={api.kycUrl(u.verificationVideoUrl)} controls className="h-24 w-36 rounded-lg bg-black object-cover" />
                    </div>
                  )}
                  {u.verificationDocUrl && (
                    <div>
                      <div className="mb-1 text-[11px] font-medium text-[#e0860c]">📄 {t.founder.viewDoc}</div>
                      {u.verificationDocUrl.toLowerCase().endsWith(".pdf") ? (
                        <button type="button" onClick={() => openKycDoc(u.verificationDocUrl!)} className="flex h-24 w-36 items-center justify-center rounded-lg bg-orange-100 text-sm font-semibold text-[#e0860c]">PDF →</button>
                      ) : (
                        <button type="button" onClick={() => openKycDoc(u.verificationDocUrl!)} aria-label={t.a11y.openDoc}>
                          <img src={api.kycUrl(u.verificationDocUrl)} alt="" loading="lazy" decoding="async" className="h-24 w-36 rounded-lg object-cover" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="mt-5 text-center text-xs text-white/70">{t.founder.note}</p>
    </div>
  );
}
