import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { AlertIcon } from "./icons";
import { useDialog } from "../lib/useDialog";
import { useT } from "../i18n";

export function Spinner() {
  const t = useT();
  return <div className="p-8 text-center ">{t.common.loading}</div>;
}

/** Дружелюбное состояние ошибки загрузки — вместо вечного спиннера. */
export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  const t = useT();
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <AlertIcon size={40} />
      <p className="max-w-xs text-sm font-medium text-white drop-shadow">{t.common.loadError}</p>
      <Button onClick={onRetry ?? (() => location.reload())}>{t.common.retry}</Button>
    </div>
  );
}

/** Наше фирменное модальное подтверждение (вместо системного confirm). */
export function ConfirmModal({
  open,
  title,
  confirmLabel,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const t = useT();
  const dialogRef = useDialog<HTMLDivElement>(open, onClose);
  if (!open) return null;
  // через портал в body: иначе, будучи вложенным в кликабельный <Link> (список
  // заказов), клик по фону/кнопкам всплывал к ссылке и уводил со страницы
  return createPortal(
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"
      onClick={(e) => { e.stopPropagation(); onClose(); }}
    >
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-label={title} className="w-full max-w-xs rounded-3xl bg-white p-6 text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <p className="mb-5 text-base font-semibold text-[#e0860c]">{title}</p>
        <div className="flex gap-2">
          <Button variant="ghost" full onClick={onClose}>{t.common.cancel}</Button>
          <Button full onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/** Пустое состояние с понятным следующим шагом (кнопкой). */
export function EmptyState({
  icon,
  title,
  actionLabel,
  onAction,
}: {
  icon?: ReactNode;
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      {/* без opacity: на оранжевом фоне иконка должна быть чисто белой */}
      {icon && <div>{icon}</div>}
      <p className="font-medium text-white drop-shadow">{title}</p>
      {actionLabel && onAction && <Button onClick={onAction}>{actionLabel}</Button>}
    </div>
  );
}

export function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-[#e0860c]" title={rating.toFixed(1)}>
      {"★".repeat(Math.round(rating))}
      <span className="">{"★".repeat(5 - Math.round(rating))}</span>
    </span>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "green" | "red" | "amber" | "blue";
}) {
  const tones: Record<string, string> = {
    neutral: "bg-orange-50 ",
    green: "bg-orange-100 text-[#e0860c]",
    red: "bg-orange-100 text-[#e0860c] font-semibold",
    amber: "bg-[#e0860c]/15 text-[#e0860c]",
    blue: "bg-orange-100 text-[#e0860c]",
  };
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function Button({
  children,
  onClick,
  variant = "primary",
  type = "button",
  disabled,
  full,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "danger";
  type?: "button" | "submit";
  disabled?: boolean;
  full?: boolean;
}) {
  // на белых поверхностях (формы, карточки, окна) кнопка инвертирована:
  // оранжевый фон + белый текст. Вторичная (ghost) — белая с текстом логотипа.
  const variants: Record<string, string> = {
    primary: "btn-solid",
    ghost: "btn-glass",
    danger: "btn-solid",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-full px-5 py-2.5 text-sm font-medium transition disabled:opacity-50 ${variants[variant]} ${full ? "w-full" : ""}`}
    >
      {children}
    </button>
  );
}
