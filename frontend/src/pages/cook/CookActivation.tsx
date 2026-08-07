import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { Button } from "../../components/ui";
import { CardIcon } from "../../components/icons";
import { VerifiedBadge } from "../../components/VerifiedBadge";
import { useT } from "../../i18n";
import { COOK_ACTIVATION_FEE_ENABLED } from "../../config";

interface Info { amountUsd: number; amountRub: number; providerName: string; paid: boolean; configured: boolean }

const PID_KEY = "celina_activation_pid";

export function CookActivation() {
  const t = useT();
  const navigate = useNavigate();
  const { user, refresh } = useAuth();
  const [info, setInfo] = useState<Info | null>(null);
  const [card, setCard] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [state, setState] = useState<"form" | "paying" | "confirming" | "success" | "fail">("form");
  const [emailedTo, setEmailedTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // на время бесплатного запуска сбор отключён — страница оплаты недоступна
    if (!COOK_ACTIVATION_FEE_ENABLED) { navigate("/cook", { replace: true }); return; }
    (async () => {
      // вернулись от провайдера? проверяем статус по сохранённому id платежа
      const pid = localStorage.getItem(PID_KEY);
      if (pid) {
        setState("confirming");
        try {
          const r = await api.post<{ ok: boolean; emailedTo: string | null }>("/billing/activate/confirm", { paymentId: pid });
          localStorage.removeItem(PID_KEY);
          if (r.ok) { setEmailedTo(r.emailedTo); setState("success"); await refresh(); setTimeout(() => navigate("/cook", { replace: true }), 2000); return; }
          setState("fail");
        } catch { localStorage.removeItem(PID_KEY); setState("fail"); }
      }
      const r = await api.get<Info>("/billing/activation").catch(() => null);
      if (r) { setInfo(r); if (r.paid) navigate("/cook", { replace: true }); }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const digits = card.replace(/\D/g, "");
  const fmt = (v: string) => v.replace(/\D/g, "").slice(0, 19).replace(/(.{4})/g, "$1 ").trim();
  const emailOk = !email || /\S+@\S+\.\S+/.test(email);
  const canPay = info ? (info.configured ? emailOk : digits.length >= 12) : false;

  async function pay() {
    if (!info) return;
    setError(null);
    setState("paying");
    try {
      if (info.configured) {
        // реальный провайдер: создаём платёж и уходим на защищённую страницу
        const r = await api.post<{ redirect: string; paymentId: string }>("/billing/activate/start", {
          returnUrl: `${location.origin}/cook/activate`,
          email: email.trim() || undefined,
        });
        localStorage.setItem(PID_KEY, r.paymentId);
        window.location.assign(r.redirect);
        return;
      }
      // симуляция (нет ключей): прямой charge по карте
      const r = await api.post<{ emailedTo: string | null }>("/billing/activate", { cardNumber: digits, email: email.trim() || undefined });
      setEmailedTo(r.emailedTo);
      setState("success");
      await refresh();
      setTimeout(() => navigate("/cook", { replace: true }), 2000);
    } catch {
      // карта отклонена / ошибка — показываем красную строку прямо в форме (без отдельного экрана)
      setError(t.activation.failText);
      setState("form");
    }
  }

  const amount = info ? `$${info.amountUsd} (${info.amountRub} ₽)` : "$1";

  return (
    <div className="mx-auto max-w-md py-4">
      <div className="rounded-t-3xl bg-gradient-to-br from-[#e0860c] to-[#f4ac2f] px-6 py-7 text-center text-white shadow-lg">
        <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm"><img src="/images/celina-symbol.svg" alt="" className="h-8 w-8" /></div>
        <h1 className="text-2xl font-extrabold drop-shadow">{t.activation.title}</h1>
        <p className="mx-auto mt-1 max-w-xs text-sm text-white/90">{t.activation.subtitle}</p>
      </div>

      <div className="rounded-b-3xl bg-white p-6 shadow-lg">
        {state === "confirming" ? (
          <div className="py-10 text-center text-sm text-[#e0860c]">{t.activation.confirming}</div>
        ) : state === "success" ? (
          <Done emailedTo={emailedTo} onGo={() => navigate("/cook", { replace: true })} />
        ) : state === "fail" ? (
          <Failed onRetry={() => setState("form")} />
        ) : (
          <>
            <p className="mb-5 flex items-start gap-2 rounded-xl bg-orange-50 px-3.5 py-3 text-sm font-medium leading-snug text-[#e0860c]">
              <span className="mt-0.5 shrink-0"><VerifiedBadge size={18} /></span><span>{t.activation.afterSignup}</span>
            </p>
            <p className="mb-5 rounded-xl bg-orange-50/70 px-3.5 py-3 text-sm leading-snug text-[#e0860c]">{t.activation.why}</p>

            <div className="mb-6 flex items-center justify-between rounded-xl border border-orange-100 bg-orange-50/40 px-4 py-3">
              <span className="flex items-center gap-2 text-sm text-[#e0860c]"><CardIcon size={22} /> {t.activation.amount}</span>
              <span className="text-xl font-extrabold text-[#e0860c]">{amount}</span>
            </div>

            <label htmlFor="activation-email" className="mb-1.5 block text-xs font-semibold text-[#e0860c]">{t.activation.emailLabel}</label>
            <input
              id="activation-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@email.com"
              className="mb-5 w-full rounded-xl border border-orange-100 bg-orange-50/40 px-3.5 py-2.5 text-sm outline-none transition focus:border-orange-300 focus:bg-white focus:ring-2 focus:ring-orange-200"
            />

            {/* номер карты вводим ТОЛЬКО в режиме симуляции; с реальным провайдером карту вводят на его защищённой странице */}
            {info && !info.configured && (
              <>
                <label htmlFor="activation-card" className="mb-1.5 block text-xs font-semibold text-[#e0860c]">{t.activation.cardNumber}</label>
                <input
                  id="activation-card"
                  value={card}
                  onChange={(e) => setCard(fmt(e.target.value))}
                  inputMode="numeric"
                  autoComplete="cc-number"
                  placeholder="0000 0000 0000 0000"
                  className="w-full rounded-xl border border-orange-100 bg-orange-50/40 px-3.5 py-2.5 text-lg tracking-wider outline-none transition focus:border-orange-300 focus:bg-white focus:ring-2 focus:ring-orange-200"
                />
              </>
            )}

            {error && <p className="mt-5 rounded-xl bg-red-50 px-3.5 py-2.5 text-sm font-semibold text-[#e0860c]">{error}</p>}

            <div className="mt-6">
              <Button full onClick={pay} disabled={!canPay || state === "paying"}>
                {state === "paying" ? t.activation.paying : info?.configured ? `${t.activation.payVia} · ${info.providerName}` : t.activation.pay}
              </Button>
            </div>

            <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-[#e0860c]">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="11" width="16" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
              {t.activation.secured}{info ? ` · ${info.providerName}` : ""}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Done({ emailedTo, onGo }: { emailedTo: string | null; onGo: () => void }) {
  const t = useT();
  return (
    <div className="py-6 text-center">
      <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-4xl text-[#e0860c]">✓</div>
      <h2 className="text-xl font-bold text-[#e0860c]">{t.activation.successTitle}</h2>
      <p className="mt-1 text-sm text-[#e0860c]">{t.activation.successText}</p>
      {emailedTo
        ? <p className="mt-2 text-xs text-[#e0860c]">{t.activation.receiptSent} <b className="text-[#e0860c]">{emailedTo}</b></p>
        : <p className="mt-2 text-xs text-[#e0860c]">{t.activation.receiptNote}</p>}
      <Button full onClick={onGo}>{t.activation.toDashboard}</Button>
    </div>
  );
}

function Failed({ onRetry }: { onRetry: () => void }) {
  const t = useT();
  return (
    <div className="py-6 text-center">
      <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-4xl text-[#e0860c]">✕</div>
      <h2 className="text-xl font-bold text-[#e0860c]">{t.activation.failTitle}</h2>
      <p className="mt-1 text-sm text-[#e0860c]">{t.activation.failText}</p>
      <Button full onClick={onRetry}>{t.activation.retry}</Button>
    </div>
  );
}
