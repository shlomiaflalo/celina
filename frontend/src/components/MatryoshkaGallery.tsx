import { useEffect, useId, useRef, useState } from "react";

/**
 * Витрина: ~10 рамок в форме матрёшки. Матрёшку НЕ рисуем — только контур-рамка,
 * а фото блюда заполняет весь силуэт. В каждой рамке фото постоянно сменяются.
 */
const IMAGES = [
  // борщ убран со страницы входа (украинское блюдо) — оставлен только в кухнях/карточках
  "/images/pelmeni.jpg", "/images/khinkali.jpg",
  "/images/syrniki.jpg", "/images/khachapuri.jpg", "/images/blini.jpg",
  "/images/apple-pie.jpg", "/images/olivier-salad.jpg", "/images/pirozhki.jpg",
  ...Array.from({ length: 78 }, (_, i) => `/images/marquee/food-${i + 1}.jpg`),
];

// силуэт очень пухлой матрёшки (viewBox 130×150) — широкая, видно больше фото
const BODY =
  "M65 6 C91 6 99 26 92 45 C122 60 124 106 104 130 C95 142 35 142 26 130 C6 106 8 60 38 45 C31 26 39 6 65 6 Z";

function Doll({ start }: { start: number }) {
  const uid = useId().replace(/[^a-z0-9]/gi, "");
  const [idx, setIdx] = useState(start % IMAGES.length);
  const prev = useRef(idx);
  useEffect(() => {
    const ms = 2300 + (start % 6) * 350; // у каждой матрёшки свой ритм
    const id = setInterval(() => setIdx((i) => { prev.current = i; return (i + 1) % IMAGES.length; }), ms);
    return () => clearInterval(id);
  }, [start]);

  return (
    <svg viewBox="0 0 130 150" width={120} className="matryoshka shrink-0" style={{ animationDelay: `${(start % 6) * 0.35}s`, overflow: "visible" }}>
      <defs>
        <clipPath id={`m${uid}`}><path d={BODY} /></clipPath>
      </defs>
      {/* фото заполняет весь силуэт (кросс-фейд) */}
      <g clipPath={`url(#m${uid})`}>
        <image href={IMAGES[prev.current]} x="0" y="0" width="130" height="150" preserveAspectRatio="xMidYMid slice" />
        <image key={idx} href={IMAGES[idx]} x="0" y="0" width="130" height="150" preserveAspectRatio="xMidYMid slice" className="m-fade" />
      </g>
      {/* белая рамка-контур матрёшки + линия головы */}
      <path d={BODY} fill="none" stroke="#ffffff" strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M38 45 Q65 58 92 45" fill="none" stroke="#ffffff" strokeWidth="2.5" opacity="0.85" />
    </svg>
  );
}

export function MatryoshkaGallery() {
  // витрину монтируем только когда она вот-вот появится в зоне видимости —
  // иначе её фото грузятся зря у тех, кто не прокрутил вниз (экономия трафика).
  // Проверка по позиции при скролле — надёжно во всех браузерах.
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (visible) return;
    const check = () => {
      const el = ref.current;
      if (!el) return;
      if (el.getBoundingClientRect().top < window.innerHeight + 300) setVisible(true);
    };
    check(); // вдруг уже видно при загрузке
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => { window.removeEventListener("scroll", check); window.removeEventListener("resize", check); };
  }, [visible]);

  return (
    <div ref={ref} className="mx-auto flex min-h-[150px] max-w-6xl flex-wrap items-center justify-center gap-x-4 gap-y-6 px-4">
      {visible && Array.from({ length: 24 }, (_, i) => <Doll key={i} start={i * 2} />)}
    </div>
  );
}
