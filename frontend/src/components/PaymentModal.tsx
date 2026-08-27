import { useRef, useState } from "react";
import { api } from "../api/client";
import { Button } from "./ui";
import { CoinsIcon } from "./icons";
import { useDialog } from "../lib/useDialog";
import { useT } from "../i18n";

/**
 * Подтверждение заказа. В пилоте принимаем ТОЛЬКО наличные при получении —
 * без карт. (Карточный путь на бэкенде сохранён для будущего включения.)
 *
 * ОДНО подтверждение на ВСЕ заказы корзины (1–2 повара). Раньше при заказе у
 * двух поваров модалки шли по очереди: после «✓ Заказ подтверждён» первого
 * появлялось второе, почти такое же окно — покупатель думал, что уже всё,
 * закрывал его и «застревал» в корзине (второй заказ отменялся, перехода на
 * страницу заказов не было). Теперь: один список, одна кнопка, один переход.
 */
export function PaymentModal({
  orders,
  onPaid,
  onClose,
}: {
  orders: { id: string; total: number; cookName: string }[];
  onPaid: () => void;
  /** confirmedIds — заказы, успешно подтверждённые до закрытия (при частичном сбое) */
  onClose: (confirmedIds: string[]) => void;
}) {
  const t = useT();
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  // уже подтверждённые заказы: при повторе после сбоя не подтверждаем дважды
  const confirmedRef = useRef<string[]>([]);

  const multi = orders.length > 1;
  const amount = orders.reduce((s, o) => s + o.total, 0);

  async function confirm() {
    setStatus("processing");
    setError(null);
    try {
      for (const o of orders) {
        if (confirmedRef.current.includes(o.id)) continue;
        await api.post("/payments/intent", { orderId: o.id });
        await api.post("/payments/confirm", { orderId: o.id, method: "cash" });
        confirmedRef.current.push(o.id);
      }
      setStatus("success");
      setTimeout(onPaid, 1100);
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : t.payment.failed);
    }
  }

  // после старта подтверждения закрывать нельзя: клик по фону во время
  // обработки/зелёной галочки отменял бы УЖЕ подтверждённый заказ
  const canClose = status === "idle" || status === "error";
  const close = () => { if (canClose) onClose(confirmedRef.current); };
  const dialogRef = useDialog<HTMLDivElement>(true, close);

  return (
    // БЕЗ onClick={close} на фоне: случайный тап по затемнению отменял УЖЕ
    // созданные заказы на последнем шаге воронки. Закрытие — крестик и Esc.
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-label={t.payment.cashTitle} className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {status === "success" ? (
          <div className="py-8 text-center">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-orange-50 text-3xl text-[#e0860c]">
              ✓
            </div>
            <h2 className="text-xl font-bold text-[#e0860c]">{multi ? t.payment.cashSuccessMany : t.payment.cashSuccess}</h2>
            {orders.map((o) => (
              <p key={o.id} className="mt-1 text-sm font-medium text-[#e0860c]">{t.cart.fromCook}: {o.cookName}</p>
            ))}
          </div>
        ) : (
          <>
            <div className="mb-1 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold">{t.payment.cashTitle}</h2>
                {!multi && orders[0]?.cookName && (
                  <p className="mt-0.5 text-sm font-semibold text-[#e0860c]">{t.cart.fromCook}: {orders[0].cookName}</p>
                )}
              </div>
              <button onClick={close} disabled={!canClose} aria-label={t.a11y.close} className="-m-2 flex h-11 w-11 items-center justify-center rounded-full text-2xl leading-none text-[#e0860c] transition hover:bg-orange-50 disabled:opacity-40">×</button>
            </div>

            <div className="mt-4 mb-4 flex items-center gap-3 rounded-2xl bg-orange-50 p-4">
              <span className="shrink-0"><CoinsIcon size={26} /></span>
              <p className="text-sm leading-snug text-[#e0860c]">{t.payment.cashHint}</p>
            </div>

            {/* при заказе у двух поваров — разбивка по каждому */}
            {multi && (
              <div className="mb-3 space-y-1.5 rounded-2xl border border-[color:var(--hairline)] p-3">
                {orders.map((o) => (
                  <div key={o.id} className="flex items-center justify-between text-sm">
                    <span className="font-medium">{t.cart.fromCook}: {o.cookName}</span>
                    <span className="font-semibold">{o.total} {t.common.rub}</span>
                  </div>
                ))}
              </div>
            )}

            {error && <p className="mb-3 rounded-lg bg-orange-50 px-3 py-2 text-sm font-semibold text-[#e0860c]">{error}</p>}

            <div className="mt-2 mb-1 flex items-center justify-between">
              <span className="text-sm text-[#e0860c]">{t.payment.toPayCash}</span>
              <span className="text-2xl font-bold">{amount} {t.common.rub}</span>
            </div>

            <Button full onClick={confirm} disabled={status === "processing"}>
              {status === "processing" ? t.payment.processing : multi ? t.payment.confirmCashAll : t.payment.confirmCash}
            </Button>
            <p className="mt-3 text-center text-[11px] text-[#e0860c]">{t.payment.cashNote}</p>
          </>
        )}
      </div>
    </div>
  );
}
