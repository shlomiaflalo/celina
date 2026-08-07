import { useEffect, useState } from "react";
import { api } from "../api/client";
import { Button } from "./ui";
import { PasswordField } from "./PasswordField";
import { useT } from "../i18n";

/** Восстановление пароля: запросить код → ввести код + новый пароль.
 *  Код действует 15 минут; повторный запрос шлёт ТОТ ЖЕ код (бэкенд).
 *  Анти-спам: максимум 3 отправки в час — при превышении показываем
 *  обратный отсчёт до следующей возможности. */
export function ForgotPassword({ onClose }: { onClose: () => void }) {
  const t = useT();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [id, setId] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState("");
  // секунд до снятия лимита «3 отправки в час» (0 = лимита нет)
  const [retryLeft, setRetryLeft] = useState(0);

  // тикающий обратный отсчёт лимита
  useEffect(() => {
    if (retryLeft <= 0) return;
    const iv = setInterval(() => setRetryLeft((s) => (s > 1 ? s - 1 : 0)), 1000);
    return () => clearInterval(iv);
  }, [retryLeft > 0]);

  const fmtLeft = (s: number) => {
    const m = Math.floor(s / 60), ss = s % 60;
    return `${m}:${String(ss).padStart(2, "0")}`;
  };
  // лимит 3/час исчерпан → вся форма сброса заблокирована, пока идёт таймер
  const limited = retryLeft > 0;

  const input =
    "w-full rounded-xl border border-orange-100 bg-orange-50/40 px-3.5 py-2.5 text-sm outline-none transition focus:border-orange-300 focus:bg-white focus:ring-2 focus:ring-orange-200";

  async function sendCode() {
    setBusy(true); setError(null);
    try {
      const r = await api.post<{ sent: boolean; to?: string }>("/auth/forgot", { identifier: id });
      setSentTo(r.to || id);
      setStep(2);
    } catch (e) {
      const err = e as Error & { status?: number; retryAfterSec?: number };
      if (err.status === 429 && err.retryAfterSec) {
        // лимит 3/час: запускаем часы и блокируем кнопку до истечения
        setRetryLeft(err.retryAfterSec);
        setError(null);
      } else {
        setError(err.message || t.common.error);
      }
    } finally { setBusy(false); }
  }

  async function reset() {
    setBusy(true); setError(null);
    try {
      await api.post("/auth/reset", { identifier: id, code, password });
      setStep(3);
    } catch (e) {
      setError(e instanceof Error ? e.message : t.common.error);
      // неверный/просроченный код → очищаем поля, чтобы начать заново без ручного стирания
      setCode("");
      setPassword("");
    } finally { setBusy(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#e0860c]">{t.auth.forgotTitle}</h2>
          <button onClick={onClose} aria-label={t.a11y.close} className="text-2xl leading-none text-[#e0860c] hover:text-[#e0860c]">×</button>
        </div>

        {step === 1 && (
          <div className="space-y-3">
            <input className={input} placeholder={t.auth.forgotId} aria-label={t.auth.forgotId} value={id} onChange={(e) => setId(e.target.value)} autoFocus />
            {error && <p className="text-sm font-semibold text-[#e0860c]">{error}</p>}
            {retryLeft > 0 && (
              <p className="rounded-xl bg-orange-50 px-3 py-2 text-sm font-semibold text-[#e0860c]">
                {t.auth.resetLimit}. {t.auth.tryAgainIn} <span className="tabular-nums">{fmtLeft(retryLeft)}</span> ⏳
              </p>
            )}
            <Button full onClick={sendCode} disabled={busy || retryLeft > 0 || id.trim().length < 3}>
              {busy ? "…" : retryLeft > 0 ? `⏳ ${fmtLeft(retryLeft)}` : t.auth.sendCode}
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <p className="text-sm text-[#e0860c]">{t.auth.codeSentTo} <b className="text-[#e0860c]">{sentTo}</b></p>
            {/* прозрачность: сколько живёт код и что повторная отправка не «ломает» первый */}
            <p className="text-xs text-[#e0860c]/80">{t.auth.codeValidFor}</p>
            {/* после исчерпания лимита (3/час) ВСЯ форма сброса блокируется до
                истечения часа: поля недоступны, кнопка неактивна, показан таймер */}
            <input className={input} inputMode="numeric" placeholder={t.auth.enterCode} aria-label={t.auth.enterCode} value={code} disabled={limited} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} />
            {/* новый пароль — умное поле: можно сгенерировать надёжный, показать и скопировать */}
            <PasswordField className={input} placeholder={t.auth.newPassword} value={password} onChange={setPassword} autoComplete="new-password" disabled={limited} />
            {error && <p className="text-sm font-semibold text-[#e0860c]">{error}</p>}
            {limited && (
              <p className="rounded-xl bg-orange-50 px-3 py-2.5 text-sm font-semibold text-[#e0860c]">
                {t.auth.resetBlocked} {t.auth.tryAgainIn} <span className="tabular-nums">{fmtLeft(retryLeft)}</span> ⏳
              </p>
            )}
            <Button full onClick={reset} disabled={busy || limited || code.length < 4 || password.length < 4}>
              {busy ? "…" : limited ? `⏳ ${fmtLeft(retryLeft)}` : t.auth.resetBtn}
            </Button>
            <div className="flex items-center justify-between text-xs">
              <button onClick={() => setStep(1)} className="text-[#e0860c] hover:underline">← {t.auth.back}</button>
              <button onClick={sendCode} disabled={busy || limited} className="text-[#e0860c] hover:underline disabled:opacity-50">
                {limited ? `⏳ ${fmtLeft(retryLeft)}` : t.auth.sendCode}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="py-6 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-orange-50 text-2xl text-[#e0860c]">✓</div>
            <p className="font-semibold text-[#e0860c]">{t.auth.resetDone}</p>
            <div className="mt-4"><Button onClick={onClose}>{t.auth.login}</Button></div>
          </div>
        )}
      </div>
    </div>
  );
}
