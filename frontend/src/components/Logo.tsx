import { useState } from "react";
import { useLang } from "../i18n";

/**
 * Логотип Celina.
 * Если в /public/images/ загружен настоящий файл логотипа
 * (logo.png — цветной, logo-white.png — белый), показываем его.
 * Иначе — аккуратный векторный фолбэк (чаша + надпись).
 *
 * Чтобы поставить свой логотип, положите файлы:
 *   frontend/public/images/logo.png        (цветной, прозрачный фон)
 *   frontend/public/images/logo-white.png  (белый, прозрачный фон)
 */
export function Logo({
  size = 36,
  withText = true,
  steam = false,
  tone = "brand",
}: {
  size?: number;
  withText?: boolean;
  steam?: boolean;
  tone?: "brand" | "light";
}) {
  const [imgOk, setImgOk] = useState(true);
  const { lang } = useLang();
  // логотип следует за языком: RU (по умолчанию) → Селина, EN → Celina
  const ru = lang !== "en";
  const src =
    tone === "light"
      ? ru
        ? "/images/logo-ru-white.png"
        : "/images/logo-white.png"
      : ru
        ? "/images/logo-ru.png"
        : "/images/logo.png";

  if (imgOk) {
    return (
      <img
        src={src}
        alt="Celina"
        onError={() => setImgOk(false)}
        draggable={false}
        className="inline-block select-none"
        style={{ height: Math.round(size * 1.25), width: "auto" }}
      />
    );
  }

  // фолбэк — векторный логотип
  return (
    <span className="inline-flex items-center gap-2">
      <BowlMark size={size} steam={steam} tone={tone} />
      {withText && (
        <span
          className={tone === "light" ? "wordmark text-white" : "wordmark"}
          style={{
            fontSize: size * 0.72,
            color: tone === "light" ? undefined : "#e0860c",
            lineHeight: 1,
          }}
        >
          Celina
        </span>
      )}
    </span>
  );
}

/** Только чаша (с паром или без). viewBox 0 0 100 100, чаша отцентрована. */
export function BowlMark({
  size = 64,
  steam = false,
  tone = "brand",
  animatedSteam = false,
}: {
  size?: number;
  steam?: boolean;
  tone?: "brand" | "light";
  animatedSteam?: boolean;
}) {
  const light = tone === "light";
  const outline = light ? "#ffffff" : "#3a3a3a";
  // белая версия — сплошной белый силуэт той же чаши (не контур),
  // чтобы форма совпадала с цветным логотипом 1:1.
  const bowlFill = light ? "#ffffff" : "url(#celinaBowl)";
  const gloss = light ? "rgba(224,134,12,0.28)" : "#fff4df";
  const steamClass = animatedSteam ? "steam" : undefined;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      aria-label="Celina"
      role="img"
      style={{ overflow: "visible" }}
    >
      <defs>
        <linearGradient id="celinaBowl" x1="20" y1="32" x2="80" y2="78" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f4ac2f" />
          <stop offset="100%" stopColor="#e0860c" />
        </linearGradient>
      </defs>

      {/* пар */}
      {steam && (
        <g stroke={outline} strokeWidth="3" strokeLinecap="round" fill="none" opacity={light ? 0.9 : 0.75}>
          <path className={steamClass} style={{ transformOrigin: "40px 16px", animationDelay: "0s" }}
            d="M40 17c-5-4 5-8 0-13" />
          <path className={steamClass} style={{ transformOrigin: "50px 14px", animationDelay: "0.7s" }}
            d="M50 14c-5-4 5-8 0-14" />
          <path className={steamClass} style={{ transformOrigin: "60px 16px", animationDelay: "1.4s" }}
            d="M60 17c-5-4 5-8 0-13" />
        </g>
      )}

      {/* ножка */}
      <path d="M43 60h14l-3 10H46z" fill={bowlFill} stroke={outline}
        strokeWidth="4" strokeLinejoin="round" />

      {/* чаша (приподнята, чтобы стоять на одной линии с текстом) */}
      <path d="M16 28C16 50 31 64 50 64C69 64 84 50 84 28Z"
        fill={bowlFill} stroke={outline} strokeWidth="4.5" strokeLinejoin="round" />

      {/* блик */}
      <path d="M27 33C29 45 35 53 45 58" stroke={gloss} strokeWidth="5"
        strokeLinecap="round" fill="none" opacity="0.9" />
    </svg>
  );
}
