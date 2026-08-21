import { useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { useT } from "../i18n";
import { PasswordField } from "./PasswordField";

/**
 * Удаление аккаунта из настроек профиля.
 *
 * Действие необратимо, поэтому оно намеренно неудобное: раскрывается по
 * отдельному нажатию и требует ввести текущий пароль. Токена мало — он может
 * остаться в чужом браузере, и цена ошибки здесь выше цены лишнего шага.
 *
 * Что произойдёт, написано ДО нажатия, а не после: селфи-видео и документ
 * удаляются с диска, имя и контакты обезличиваются, а заказы остаются у
 * второй стороны — повар не должен терять свою историю из-за чужого решения.
 */
export function DeleteAccount() {
  const t = useT();
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api.del("/auth/me", { password });
      logout();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.deleteAccount.failed);
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-sm font-medium underline underline-offset-4 opacity-70 transition hover:opacity-100"
        >
          {t.deleteAccount.open}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card mt-6 p-5">
      <h3 className="t-h3 mb-2">{t.deleteAccount.title}</h3>
      <p className="mb-1 leading-relaxed">{t.deleteAccount.what}</p>
      <p className="mb-4 text-sm leading-relaxed opacity-80">{t.deleteAccount.kept}</p>

      <PasswordField
        className="w-full rounded-xl border border-[var(--hairline)] bg-white px-4 py-3 outline-none"
        placeholder={t.deleteAccount.password}
        value={password}
        onChange={setPassword}
        autoComplete="current-password"
      />

      {error && (
        <p role="alert" className="mt-3 rounded-lg bg-orange-50 px-3 py-2 text-sm font-semibold">
          {error}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2.5">
        <button
          type="submit"
          disabled={busy || password.length === 0}
          className="rounded-xl bg-[#b3261e] px-5 py-2.5 font-semibold text-white transition hover:brightness-110 active:scale-95 disabled:opacity-50"
        >
          {busy ? "…" : t.deleteAccount.confirm}
        </button>
        <button
          type="button"
          onClick={() => { setOpen(false); setPassword(""); setError(""); }}
          className="rounded-xl border border-[var(--hairline)] px-5 py-2.5 font-medium transition hover:bg-orange-50"
        >
          {t.common.cancel}
        </button>
      </div>
    </form>
  );
}
