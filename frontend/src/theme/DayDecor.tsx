/**
 * Декорация дня — визуальный рычаг оформления.
 *
 * До 21.08.2026 у слоя оформления не было ни одного визуального рычага:
 * `--day-hero-tint` жил на фотографии героя, фотографию убрали ради LCP, и
 * день выражался только строкой текста. Здесь рычаг возвращается — но не
 * пеленой поверх еды (её пробовали 11.08: фирменный оранжевый гас, картинка
 * выглядела поцарапанной), а собственной рисованной графикой дня.
 *
 * Правила, по которым это можно держать на живом маркетплейсе:
 *
 * - Всё нарисовано инлайном, в SVG. Ноль сетевых запросов, ноль новых шрифтов
 *   и ассетов, ноль блокировки рендера.
 * - Ничего не двигает вёрстку: падающий слой абсолютный и не участвует в
 *   потоке, куча стоит на своей фиксированной высоте. CLS не меняется.
 *   Пример: куча живёт в CSS-переменной --day-heap-h, а не в контенте.
 * - `pointer-events: none` и `aria-hidden` на всём: декорация не ловит клики
 *   и не попадает в скринридер.
 * - `prefers-reduced-motion` выключает падение целиком (см. index.css).
 *   Замерший в воздухе кабачок читается как баг, а не как уважение к
 *   настройке, поэтому именно display:none, а не paused.
 * - Анимируется только transform, на композиторе. Никакого JS в кадре.
 *
 * Слой по-прежнему физически не может задеть заказы, корзину, оплату или
 * верификацию: он умеет только рисовать поверх фона первого экрана.
 */
import { TODAY } from "./dayTheme";

/**
 * Спрайт форм урожая. Каждая фигура описана ОДИН раз в <symbol>, а ставится
 * через <use> — иначе четырнадцать кабачков в куче и девять в воздухе
 * приехали бы в HTML двадцатью тремя копиями своих путей.
 */
function HarvestSprite() {
  return (
    <svg
      aria-hidden
      focusable="false"
      width="0"
      height="0"
      style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
    >
      <defs>
        {/* кабачок */}
        <symbol id="dc-zuc" viewBox="0 0 100 46">
          <path d="M14 21c-4-1-7 0-8 3 1 3 4 4 8 3z" fill="var(--dc-green-dk)" />
          <path
            d="M12 27C9 15 22 7 44 7c21 0 39 5 49 12 5 4 5 12-1 15-11 6-33 7-53 5-18-2-25-5-27-12z"
            fill="var(--dc-green)"
          />
          <path
            d="M26 16c11-4 30-3 45 2"
            fill="none"
            stroke="var(--dc-green-lt)"
            strokeWidth="4"
            strokeLinecap="round"
            opacity=".6"
          />
        </symbol>

        {/* яблоко */}
        <symbol id="dc-app" viewBox="0 0 100 100">
          <path
            d="M50 24C38 11 15 15 13 40 11 65 30 93 50 93s39-28 37-53C85 15 62 11 50 24z"
            fill="var(--dc-red)"
          />
          <path
            d="M50 24c0-9 2-15 8-19"
            fill="none"
            stroke="var(--dc-stem)"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path d="M59 9c9-8 23-6 25 2-6 8-20 8-25-2z" fill="var(--dc-green)" />
          <path
            d="M30 33c4-6 10-9 15-9"
            fill="none"
            stroke="#fff"
            strokeWidth="5"
            strokeLinecap="round"
            opacity=".32"
          />
        </symbol>

        {/* помидор */}
        <symbol id="dc-tom" viewBox="0 0 100 92">
          <path
            d="M50 20C27 20 9 35 9 55c0 20 18 34 41 34s41-14 41-34c0-20-18-35-41-35z"
            fill="var(--dc-red)"
          />
          <path
            d="M26 46c3-8 10-13 18-15"
            fill="none"
            stroke="#fff"
            strokeWidth="5"
            strokeLinecap="round"
            opacity=".3"
          />
          <path d="M48 12h5V3h-5z" fill="var(--dc-green)" />
          <path
            d="M50 7l4.7 12.5L68.1 20.1 57.6 28.5 61.2 41.4 50 34 38.8 41.4 42.4 28.5 31.9 20.1 45.3 19.5z"
            fill="var(--dc-green)"
          />
        </symbol>

        {/* тыква */}
        <symbol id="dc-pum" viewBox="0 0 100 84">
          <path
            d="M50 10C24 10 7 25 7 47c0 21 18 33 43 33s43-12 43-33C93 25 76 10 50 10z"
            fill="var(--dc-amber)"
          />
          <path
            d="M33 14c-9 15-9 45 0 62M67 14c9 15 9 45 0 62"
            fill="none"
            stroke="var(--dc-deep)"
            strokeWidth="3.5"
            strokeLinecap="round"
            opacity=".55"
          />
          <path d="M46 12V4c0-2 2-3 5-3s5 1 5 3v8z" fill="var(--dc-green)" />
        </symbol>

        {/* банка заготовок */}
        <symbol id="dc-jar" viewBox="0 0 100 120">
          <path
            d="M22 4h56a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H22a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4z"
            fill="var(--dc-deep)"
          />
          <path
            d="M26 24h48v10c0 3 4 5 4 9v66c0 6-6 10-14 10H36c-8 0-14-4-14-10V43c0-4 4-6 4-9V24z"
            fill="var(--dc-jar)"
          />
          <circle cx="42" cy="62" r="7" fill="var(--dc-green)" opacity=".75" />
          <circle cx="61" cy="78" r="6" fill="var(--dc-red)" opacity=".6" />
          <circle cx="40" cy="92" r="6" fill="var(--dc-green)" opacity=".6" />
          <path
            d="M33 48v54"
            fill="none"
            stroke="#fff"
            strokeWidth="5"
            strokeLinecap="round"
            opacity=".35"
          />
        </symbol>

        {/* лист */}
        <symbol id="dc-lea" viewBox="0 0 100 60">
          <path d="M5 53C17 12 58 0 96 5c-3 39-46 57-91 48z" fill="var(--dc-green)" />
          <path
            d="M9 51C40 41 70 27 92 11"
            fill="none"
            stroke="var(--dc-deep)"
            strokeWidth="3"
            strokeLinecap="round"
            opacity=".45"
          />
        </symbol>
      </defs>
    </svg>
  );
}

/**
 * Куча урожая: то, ради чего всё затевалось. Полоса во всю ширину окна, на
 * которой лежит то, что сосед оставил под дверью.
 *
 * viewBox широкий (1440), а `preserveAspectRatio="xMidYMax slice"` — то есть
 * на узком экране куча не сжимается в кашу, а продолжается за края. Так она
 * и должна себя вести: у соседей этого добра больше, чем помещается в экран.
 */
const HEAP: Array<{ s: string; x: number; w: number; r?: number }> = [
  { s: "dc-lea", x: -20, w: 150, r: -12 },
  { s: "dc-pum", x: 30, w: 176 },
  { s: "dc-zuc", x: 150, w: 264, r: -6 },
  { s: "dc-app", x: 296, w: 116 },
  { s: "dc-jar", x: 392, w: 104 },
  { s: "dc-zuc", x: 470, w: 300, r: 5 },
  { s: "dc-tom", x: 636, w: 124 },
  { s: "dc-lea", x: 700, w: 132, r: 16 },
  { s: "dc-app", x: 742, w: 134 },
  { s: "dc-pum", x: 830, w: 208 },
  { s: "dc-zuc", x: 990, w: 286, r: -4 },
  { s: "dc-tom", x: 1136, w: 132 },
  { s: "dc-jar", x: 1218, w: 100 },
  { s: "dc-app", x: 1288, w: 122 },
  { s: "dc-zuc", x: 1330, w: 250, r: 7 },
];

/** Пропорции символов — чтобы посчитать высоту от ширины. */
const RATIO: Record<string, number> = {
  "dc-zuc": 0.46,
  "dc-app": 1,
  "dc-tom": 0.92,
  "dc-pum": 0.84,
  "dc-jar": 1.2,
  "dc-lea": 0.6,
};

const BASE = 196;

export function DayHeap() {
  if (TODAY.decor !== "harvest") return null;
  return (
    <div className="day-heap bleed" aria-hidden>
      <svg
        className="day-heap-svg"
        viewBox="0 0 1440 200"
        preserveAspectRatio="xMidYMax slice"
        focusable="false"
      >
        {/* тень: куча должна лежать на земле, а не висеть над ней */}
        <ellipse cx="720" cy="197" rx="760" ry="16" fill="var(--dc-shadow)" />
        {HEAP.map((it, i) => {
          const h = it.w * RATIO[it.s];
          const y = BASE - h;
          return (
            <use
              key={i}
              href={`#${it.s}`}
              x={it.x}
              y={y}
              width={it.w}
              height={h}
              transform={
                it.r ? `rotate(${it.r} ${it.x + it.w / 2} ${y + h / 2})` : undefined
              }
            />
          );
        })}
      </svg>
    </div>
  );
}

/**
 * Падающий урожай. Восемь фигур, у каждой своя дорожка, своя длительность и
 * своё покачивание — специально не кратные друг другу, чтобы рисунок не
 * зацикливался заметно.
 *
 * Обёртка ростом в контейнер: translateY в процентах считается от неё, а
 * значит путь падения равен высоте первого экрана и не зависит от того,
 * сколько там сегодня строк текста.
 */
const FALL: Array<{ s: string; x: string; sz: string; dur: string; delay: string; sway: string }> = [
  { s: "dc-zuc", x: "6%",  sz: "58px", dur: "17s", delay: "0s",    sway: "3.7s" },
  { s: "dc-lea", x: "18%", sz: "34px", dur: "21s", delay: "-6s",   sway: "2.9s" },
  { s: "dc-app", x: "29%", sz: "30px", dur: "15s", delay: "-11s",  sway: "3.3s" },
  { s: "dc-zuc", x: "42%", sz: "48px", dur: "23s", delay: "-3s",   sway: "4.1s" },
  { s: "dc-tom", x: "55%", sz: "28px", dur: "18s", delay: "-14s",  sway: "3.1s" },
  { s: "dc-lea", x: "67%", sz: "38px", dur: "25s", delay: "-8s",   sway: "4.6s" },
  { s: "dc-app", x: "79%", sz: "34px", dur: "19s", delay: "-17s",  sway: "3.5s" },
  { s: "dc-zuc", x: "90%", sz: "62px", dur: "27s", delay: "-2s",   sway: "4.3s" },
];

export function DayFall() {
  if (TODAY.decor !== "harvest") return null;
  return (
    <>
      <HarvestSprite />
      <div className="day-fall" aria-hidden>
        {FALL.map((it, i) => (
          <span
            key={i}
            className="day-fall-item"
            style={
              {
                left: it.x,
                animationDuration: it.dur,
                animationDelay: it.delay,
              } as React.CSSProperties
            }
          >
            <svg
              className="day-fall-shape"
              viewBox="0 0 100 100"
              focusable="false"
              style={
                {
                  width: it.sz,
                  animationDuration: it.sway,
                  animationDelay: it.delay,
                } as React.CSSProperties
              }
            >
              <use href={`#${it.s}`} x="0" y="0" width="100" height="100" />
            </svg>
          </span>
        ))}
      </div>
    </>
  );
}
