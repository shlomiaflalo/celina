import { useEffect, useRef } from "react";

/**
 * Доступность модальных окон (WCAG 2.2): Esc закрывает, фокус переносится внутрь
 * и удерживается (focus trap), при закрытии возвращается на элемент-триггер.
 * Возвращает ref, который нужно повесить на контейнер диалога.
 */
export function useDialog<T extends HTMLElement>(open: boolean, onClose: () => void) {
  const ref = useRef<T>(null);
  const restoreTo = useRef<HTMLElement | null>(null);
  // onClose живёт в ref: иначе каждая перерисовка родителя (новая функция)
  // пересоздавала эффект, cleanup ВОЗВРАЩАЛ фокус на кнопку-триггер ПОД
  // модалкой, и Enter во время «обработки» повторял действие (дубли заказов)
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    restoreTo.current = document.activeElement as HTMLElement | null;
    const node = ref.current;
    // переносим фокус в диалог (на первый фокусируемый элемент или сам контейнер)
    const focusables = () =>
      node
        ? [...node.querySelectorAll<HTMLElement>(
            'a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])'
          )].filter((el) => el.offsetParent !== null)
        : [];
    const first = focusables()[0];
    (first ?? node)?.focus?.();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") { e.stopPropagation(); onCloseRef.current(); return; }
      if (e.key !== "Tab" || !node) return;
      const items = focusables();
      if (!items.length) return;
      const firstEl = items[0], lastEl = items[items.length - 1];
      if (e.shiftKey && document.activeElement === firstEl) { e.preventDefault(); lastEl.focus(); }
      else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); firstEl.focus(); }
    }
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("keydown", onKey, true);
      restoreTo.current?.focus?.(); // вернуть фокус на триггер
    };
  }, [open]);

  return ref;
}
