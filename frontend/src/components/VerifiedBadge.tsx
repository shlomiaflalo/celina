import { useT } from "../i18n";

/**
 * Оранжевая отметка Проверен для подтверждённых пользователей.
 * variant="seal" — только значок; variant="chip" — значок + подпись.
 */
export function VerifiedBadge({
  size = 16,
  variant = "seal",
  className = "",
}: {
  size?: number;
  variant?: "seal" | "chip";
  className?: string;
}) {
  const t = useT();
  const seal = (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-label={t.verify.badge} role="img">
      <path
        fill="#e0860c"
        d="M12 1.5l2.3 1.7 2.85-.2.9 2.7 2.45 1.5-.85 2.72.85 2.72-2.45 1.5-.9 2.7-2.85-.2L12 22.5l-2.3-1.66-2.85.2-.9-2.7-2.45-1.5.85-2.72-.85-2.72 2.45-1.5.9-2.7 2.85.2z"
      />
      <path
        fill="none"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 12.2l2.6 2.6L16 9.4"
      />
    </svg>
  );

  if (variant === "chip") {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full bg-orange-50 px-2 py-0.5 text-xs font-semibold text-[#e0860c] ${className}`}
        title={t.verify.verified}
      >
        {seal}
        {t.verify.badge}
      </span>
    );
  }
  return (
    <span className={`inline-flex ${className}`} title={t.verify.verified}>
      {seal}
    </span>
  );
}
