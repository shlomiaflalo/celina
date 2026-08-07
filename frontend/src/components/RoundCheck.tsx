import type { ReactNode } from "react";

/**
 * Круглый чекбокс в стиле кнопок сайта (логотипный оранжевый + белая галочка).
 * Текст подписи — цвета логотипа. Вид управляется напрямую из props.
 */
export function RoundCheck({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  children: ReactNode;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5 text-sm text-[#e0860c]">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <span
        style={{ backgroundColor: checked ? "#e0860c" : "#ffffff" }}
        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-[#e0860c] shadow-sm transition-transform active:scale-90"
      >
        {checked && (
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 13l4 4L19 7" />
          </svg>
        )}
      </span>
      <span className="leading-snug">{children}</span>
    </label>
  );
}
