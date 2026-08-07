import { useState } from "react";
import { ConfirmModal } from "./ui";
import { useT } from "../i18n";

/**
 * Белая кнопка удаления с текстом цвета логотипа (оранжевый).
 * Показывается ТОЛЬКО владельцу. По клику — подтверждение вы уверены?,
 * после удаления — сообщение об успехе, затем onDone (навигация/обновление).
 */
export function DeleteButton({
  label,
  confirmText,
  successText,
  onDelete,
  onDone,
  full,
}: {
  label: string;
  confirmText: string;
  successText: string;
  onDelete: () => Promise<void>;
  onDone?: () => void;
  full?: boolean;
}) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handle() {
    setBusy(true);
    setError(null);
    try {
      await onDelete();
      setOpen(false);
      setDone(true);
      window.setTimeout(() => { setDone(false); onDone?.(); }, 1400);
    } catch (e) {
      setError(e instanceof Error ? e.message : t.common.error);
      setOpen(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`btn-glass inline-flex items-center justify-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-semibold ${full ? "w-full" : ""}`}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
          <line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" />
        </svg>
        {label}
      </button>

      <ConfirmModal
        open={open}
        title={confirmText}
        confirmLabel={busy ? "…" : label}
        onConfirm={handle}
        onClose={() => { if (!busy) setOpen(false); }}
      />

      {done && (
        <div className="fixed inset-x-0 top-16 z-[90] mx-auto w-fit max-w-[92%] rounded-xl bg-[#e0860c] px-4 py-2.5 text-center text-sm font-semibold text-white shadow-lg">
          ✓ {successText}
        </div>
      )}
      {error && <p className="mt-2 text-center text-sm font-semibold text-[#e0860c]">{error}</p>}
    </>
  );
}
