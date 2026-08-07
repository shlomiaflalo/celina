/**
 * Набор фирменных иконок Celina — нарисованы с нуля в цветах логотипа
 * (угольный контур #3a3a3a + оранжевая заливка). Без эмодзи.
 */
import type { CSSProperties } from "react";

const INK = "#3a3a3a";
const ORANGE = "#f59e0b";
const ORANGE_D = "#ea580c";
const AMBER = "#fbbf24";
const CREAM = "#fff4df";
const GREEN = "#34a853";

type IconProps = { size?: number; className?: string; style?: CSSProperties };

function Svg({
  size = 24,
  className,
  style,
  children,
  vb = 24,
}: IconProps & { children: React.ReactNode; vb?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${vb} ${vb}`}
      fill="none"
      className={className}
      style={style}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

/* ── Роли (крупные, заливные) ── */

export function BuyerIcon(p: IconProps) {
  return (
    <Svg {...p} vb={32}>
      {/* сумка покупателя */}
      <path d="M6.5 11h19l-1.5 15.4A2.6 2.6 0 0 1 21.4 28.8H10.6A2.6 2.6 0 0 1 8 26.4z"
        fill={ORANGE} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <path d="M11 12.5V9.5a5 5 0 0 1 10 0v3" fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" />
      <circle cx="11" cy="15" r="1.1" fill={INK} />
      <circle cx="21" cy="15" r="1.1" fill={INK} />
      <path d="M11 9.5h.01" stroke={CREAM} strokeWidth="1" strokeLinecap="round" />
    </Svg>
  );
}

export function CookIcon(p: IconProps) {
  return (
    <Svg {...p} vb={32}>
      {/* поварской колпак */}
      <path d="M8.8 15.5a5 5 0 0 1-1.4-9.7 6.1 6.1 0 0 1 11.6-1.1 5.2 5.2 0 0 1 4.2 1 5 5 0 0 1-1.4 9.8z"
        fill={CREAM} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <path d="M9 15.5h14v7.8a2.2 2.2 0 0 1-2.2 2.2H11.2A2.2 2.2 0 0 1 9 23.3z"
        fill={ORANGE} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <path d="M13 19v3M16 19v3M19 19v3" stroke={CREAM} strokeWidth="1.7" strokeLinecap="round" />
    </Svg>
  );
}

/* ── Корзина / заказы ── */

export function CartIcon({ color, ...p }: IconProps & { color?: string }) {
  const c = color ?? INK;
  const wheel = color ?? ORANGE;
  return (
    <Svg {...p}>
      {/* сдвиг вверх на 1.2: колёса тянут «чернильный» центр рисунка ниже центра
          viewBox, из-за чего корзина выглядела ниже соседних иконок (колокольчика) */}
      <g transform="translate(0 -1.2)">
        <path d="M3 4h2.2l2 12.2A2 2 0 0 0 9.2 18H18a2 2 0 0 0 2-1.6L21.5 8H6"
          fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="9.5" cy="21" r="1.6" fill={wheel} stroke={c} strokeWidth="1.4" />
        <circle cx="18" cy="21" r="1.6" fill={wheel} stroke={c} strokeWidth="1.4" />
      </g>
    </Svg>
  );
}

export function ReceiptIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M6 3h12v18l-3-1.7L12 21l-3-1.7L6 21z" fill={ORANGE} stroke={INK}
        strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9.5 8h5M9.5 11.5h5" stroke={CREAM} strokeWidth="1.6" strokeLinecap="round" />
    </Svg>
  );
}

/* ── Доставка / инфо ── */

export function DeliveryIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="6" cy="17.5" r="3" fill="none" stroke={INK} strokeWidth="1.8" />
      <circle cx="18" cy="17.5" r="3" fill="none" stroke={INK} strokeWidth="1.8" />
      <path d="M6 17.5l4-8h4l2.5 8" fill="none" stroke={ORANGE_D} strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 9.5h6l1 3" fill="none" stroke={INK} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.5 6h2.5v2" fill="none" stroke={ORANGE} strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}

export function BasketIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M4 9h16l-1.3 9.4A2 2 0 0 1 16.7 20H7.3a2 2 0 0 1-2-1.6z"
        fill={ORANGE} stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M8.5 9l2.5-4.5M15.5 9L13 4.5" stroke={INK} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M9 13v3M12 13v3M15 13v3" stroke={CREAM} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

export function PinIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 22c5-5.3 7-8.6 7-12a7 7 0 0 0-14 0c0 3.4 2 6.7 7 12z"
        fill={ORANGE} stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="12" cy="10" r="2.4" fill={CREAM} stroke={INK} strokeWidth="1.4" />
    </Svg>
  );
}

export function ClockIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="12" r="8.5" fill="none" stroke={INK} strokeWidth="1.8" />
      <path d="M12 7.5V12l3 2" stroke={ORANGE_D} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function StarIcon({ filled = true, ...p }: IconProps & { filled?: boolean }) {
  return (
    <Svg {...p}>
      <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17l-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z"
        fill={filled ? AMBER : "none"} stroke={filled ? ORANGE_D : "#cbb89a"}
        strokeWidth="1.4" strokeLinejoin="round" />
    </Svg>
  );
}

export function PlateIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="12" r="9" fill={CREAM} stroke={INK} strokeWidth="1.6" />
      <circle cx="12" cy="12" r="5" fill="none" stroke={ORANGE} strokeWidth="1.6" />
      <path d="M6.5 8.5c1.5 1 1.5 3 0 4M17.5 8.5c-1.5 1-1.5 3 0 4" stroke={INK}
        strokeWidth="1.4" strokeLinecap="round" />
    </Svg>
  );
}

/* ── Этапы заказа ── */

export function CheckIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M5 12.5l4.5 4.5L19 7" stroke="currentColor" strokeWidth="2.4"
        strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function PotIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M4.5 10.5h15v3.5a6.5 6.5 0 0 1-6.5 6.5h-2a6.5 6.5 0 0 1-6.5-6.5z"
        fill="currentColor" opacity="0.9" />
      <path d="M3 10.5h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M9 7c-1.2-1.2 1.2-2 0-3.5M15 7c-1.2-1.2 1.2-2 0-3.5" stroke="currentColor"
        strokeWidth="1.6" strokeLinecap="round" fill="none" />
    </Svg>
  );
}

export function BagIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M6 8h12l-1 12H7z" fill="currentColor" opacity="0.92" />
      <path d="M9 8l1.5-3h3L15 8" stroke="currentColor" strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

export function PartyIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M4 20l5-13 8 8z" fill="currentColor" opacity="0.92" />
      <path d="M15 4.5c1.5 0 1.5 2 3 2M18 9c1.2-.6 2.3-.3 3 .6M13.5 8.5l.01 0" stroke="currentColor"
        strokeWidth="1.8" strokeLinecap="round" fill="none" />
    </Svg>
  );
}

// Фирменная «праздничная» иконка Celina — чаша бренда с искрами: праздник = еда.
// Своя, не эмодзи (замена 🎉). Используется в моментах успеха/шеринга.
export function CelebrateIcon(p: IconProps) {
  return (
    <Svg {...p}>
      {/* чаша (силуэт логотипа) */}
      <path d="M4.5 13.2h15a7.5 7.5 0 0 1-15 0z" fill={ORANGE} stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M3.4 13.2h17.2" stroke={INK} strokeWidth="1.6" strokeLinecap="round" />
      {/* искры над чашей — центральная крупная + две боковые */}
      <path d="M12 2.2l1 2.6 2.6 1-2.6 1-1 2.6-1-2.6-2.6-1 2.6-1z" fill={AMBER} stroke={ORANGE_D} strokeWidth="0.9" strokeLinejoin="round" />
      <path d="M6.6 5.6l.55 1.5 1.5.55-1.5.55L6.6 9.7l-.55-1.5L4.55 7.65l1.5-.55z" fill={ORANGE} />
      <path d="M17.4 5.6l.55 1.5 1.5.55-1.5.55-.55 1.5-.55-1.5-1.5-.55 1.5-.55z" fill={ORANGE} />
    </Svg>
  );
}

// фирменная иконка камеры — для подсказок добавьте фото
export function CameraIcon(p: IconProps) {
  const C = "#e0860c", D = "#b16808";
  return (
    <Svg {...p}>
      <path d="M4 8h3l1.4-2h7L17 8h3a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2Z" fill={C} stroke={D} strokeWidth="1.2" strokeLinejoin="round" />
      <circle cx="12" cy="14" r="3.4" fill="#fff" fillOpacity="0.92" stroke={D} strokeWidth="1.1" />
      <circle cx="12" cy="14" r="1.5" fill={C} />
    </Svg>
  );
}

// фирменная иконка-предупреждение (аллергены, ошибки) — в цветах логотипа
export function AlertIcon(p: IconProps) {
  const C = "#e0860c", D = "#b16808";
  return (
    <Svg {...p}>
      <path d="M12 3.5 22 20.5H2Z" fill={C} stroke={D} strokeWidth="1.3" strokeLinejoin="round" />
      <rect x="11" y="9" width="2" height="6" rx="1" fill="#fff" />
      <circle cx="12" cy="17.4" r="1.2" fill="#fff" />
    </Svg>
  );
}

// фирменная иконка денег/выручки — стопка монет в цветах логотипа
export function CoinsIcon(p: IconProps) {
  const C = "#e0860c", D = "#b16808";
  return (
    <Svg {...p}>
      <ellipse cx="12" cy="6.5" rx="7" ry="2.8" fill={C} stroke={D} strokeWidth="1.1" />
      <path d="M5 6.5v4c0 1.55 3.13 2.8 7 2.8s7-1.25 7-2.8v-4" fill={C} stroke={D} strokeWidth="1.1" />
      <path d="M5 10.5v4c0 1.55 3.13 2.8 7 2.8s7-1.25 7-2.8v-4" fill={C} stroke={D} strokeWidth="1.1" />
    </Svg>
  );
}

// фирменная иконка банковской карты — в цветах логотипа (для экрана оплаты $1)
export function CardIcon(p: IconProps) {
  const C = "#e0860c"; // оранжевый логотипа
  const D = "#b16808"; // тёмный оттенок для контура/полосы
  return (
    <Svg {...p}>
      <rect x="2.5" y="5.5" width="19" height="13" rx="2.6" fill={C} stroke={D} strokeWidth="1.3" />
      <rect x="2.5" y="8.3" width="19" height="2.7" fill={D} />
      <rect x="5" y="13.2" width="4.4" height="3" rx="0.7" fill="#fff" fillOpacity="0.95" />
      <path d="M12.4 15.7 H18.6" stroke="#fff" strokeOpacity="0.85" strokeWidth="1.4" strokeLinecap="round" />
    </Svg>
  );
}

export function DrinkIcon(p: IconProps) {
  // тёплая чашка с паром — посиделки за чаем у соседа (БЕЗ алкоголя, ФЗ-171).
  // В фирменном цвете логотипа.
  const C = "#e0860c";
  const D = "#b16808";
  return (
    <Svg {...p}>
      {/* пар */}
      <path d="M8.5 3.2 Q10 4.4 8.5 5.8 M12 2.6 Q13.5 3.9 12 5.4 M15.5 3.2 Q17 4.4 15.5 5.8"
        stroke={C} strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.85" />
      {/* чашка */}
      <path d="M4.5 8.5 H17 V13 A4.5 4.5 0 0 1 12.5 17.5 H9 A4.5 4.5 0 0 1 4.5 13 Z"
        fill={C} stroke={D} strokeWidth="1.5" strokeLinejoin="round" />
      {/* ручка */}
      <path d="M17 9.6 A2.6 2.6 0 0 1 17 14.4" fill="none" stroke={D} strokeWidth="1.6" strokeLinecap="round" />
      {/* блюдце */}
      <path d="M3.4 19.4 H18.1" stroke={D} strokeWidth="1.7" strokeLinecap="round" />
    </Svg>
  );
}

export function DineInIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M3 19h18" stroke={INK} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M4.5 19a7.5 7.5 0 0 1 15 0z" fill={ORANGE} stroke={INK}
        strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M12 6.5V9" stroke={INK} strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12" cy="5.5" r="1.4" fill={AMBER} stroke={INK} strokeWidth="1.4" />
      <path d="M8 15.5c1.5-1 4.5-1 8 0" stroke={CREAM} strokeWidth="1.5"
        strokeLinecap="round" fill="none" />
    </Svg>
  );
}

export function DocIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M7 3h7l4 4v14H7z" fill="currentColor" opacity="0.92" />
      <path d="M14 3v4h4" fill="none" stroke="#fff" strokeOpacity="0.5" strokeWidth="1.4" />
    </Svg>
  );
}

export function SparkleIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" fill={AMBER} stroke={ORANGE_D} strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M18 14l.8 2.2L21 17l-2.2.8L18 20l-.8-2.2L15 17l2.2-.8z" fill={ORANGE} />
    </Svg>
  );
}

export function VideoIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="3" y="6.5" width="13" height="11" rx="2.5" fill={ORANGE} stroke={INK} strokeWidth="1.7" />
      <path d="M16 10.5l4.5-2.6v8.2L16 13.5z" fill={ORANGE} stroke={INK} strokeWidth="1.7" strokeLinejoin="round" />
    </Svg>
  );
}

export function SettingsIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 2.5l2 1.2 2.3-.3 1.1 2 2 1.1-.3 2.3 1.2 2-1.2 2 .3 2.3-2 1.1-1.1 2-2.3-.3-2 1.2-2-1.2-2.3.3-1.1-2-2-1.1.3-2.3-1.2-2 1.2-2-.3-2.3 2-1.1 1.1-2 2.3.3z"
        fill="currentColor" opacity="0.9" />
      <circle cx="12" cy="12" r="3" fill="#fff" />
    </Svg>
  );
}

export function PowerIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 3v8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M7.5 6.5a7 7 0 1 0 9 0" stroke="currentColor" strokeWidth="2.2"
        strokeLinecap="round" fill="none" />
    </Svg>
  );
}

export function GlobeIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M3 12h18M12 3c2.5 2.6 2.5 15.4 0 18M12 3c-2.5 2.6-2.5 15.4 0 18" stroke="currentColor"
        strokeWidth="1.7" fill="none" />
    </Svg>
  );
}

export function PhoneIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M6 3h4l1.5 5-2.2 1.6a12 12 0 0 0 5 5l1.6-2.2 5 1.5v4a2 2 0 0 1-2.2 2A17 17 0 0 1 4 5.2 2 2 0 0 1 6 3z"
        fill={ORANGE} stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
    </Svg>
  );
}

export function HeartIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 20S4 14.5 4 9.2A4.2 4.2 0 0 1 12 7a4.2 4.2 0 0 1 8 2.2C20 14.5 12 20 12 20z"
        fill={ORANGE} stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
    </Svg>
  );
}
