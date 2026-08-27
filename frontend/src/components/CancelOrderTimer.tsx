import { useEffect, useState } from "react";
import { api } from "../api/client";
import { ConfirmModal } from "./ui";
import { useT } from "../i18n";

/** Окно отмены заказа покупателем — 5 минут после оформления. */
export const CANCEL_WINDOW_MS = 5 * 60 * 1000;

/**
 * Кнопка Отменить заказ + обратный отсчёт. Показывается только пока заказ
 * в статусе PENDING и не прошло 5 минут с оформления. По истечении — исчезает.
 * `compact` — вариант для карточки в списке заказов.
 */
export function CancelOrderTimer({
  orderId,
  createdAt,
  status,
  onCancelled,
  compact,
}: {
  orderId: string;
  createdAt: string;
  status: string;
  onCancelled?: () => void;
  compact?: boolean;
}) {
  const t = useT();
  const [now, setNow] = useState(() => Date.now());
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const iv = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(iv);
  }, []);

  if (status !== "PENDING") return null;
  const remaining = CANCEL_WINDOW_MS - (now - new Date(createdAt).getTime());
  if (remaining <= 0) return null;

  const mm = Math.floor(remaining / 60000);
  const ss = Math.floor((remaining % 60000) / 1000);
  const timeStr = `${mm}:${String(ss).padStart(2, "0")}`;

  async function cancel() {
    if (busy) return; // двойной клик по подтверждению = два параллельных PATCH
    setBusy(true);
    setErr(null);
    try {
      await api.patch(`/orders/${orderId}/status`, { status: "CANCELLED" });
      setOpen(false);
      onCancelled?.();
    } catch (e) {
      setErr(e instanceof Error ? e.message : t.common.error);
      setOpen(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={compact ? "flex items-center gap-2" : "mt-4 flex flex-wrap items-center gap-3 border-t border-[color:var(--hairline)] pt-4"}>
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(true); }}
        className="btn-glass inline-flex min-h-11 shrink-0 items-center justify-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold"
      >
        {t.tracking.cancelOrder}
      </button>
      <span className="inline-flex items-center gap-1 text-xs font-medium text-[#e0860c]">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
        </svg>
        {t.tracking.cancelWindow.replace("{time}", timeStr)}
      </span>
      {err && <span className="text-xs font-semibold text-[#e0860c]">{err}</span>}

      <ConfirmModal
        open={open}
        title={t.tracking.cancelConfirm}
        confirmLabel={busy ? "…" : t.tracking.cancelOrder}
        onConfirm={cancel}
        onClose={() => { if (!busy) setOpen(false); }}
      />
    </div>
  );
}
