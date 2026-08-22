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
          {/* крапинки — настоящий кабачок не бывает гладким */}
          {[[34, 26], [52, 30], [68, 24], [80, 30], [45, 33]].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r="1.8" fill="var(--dc-green-dk)" opacity=".3" />
          ))}
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

        {/* помидор — с дольками-складками от плодоножки */}
        <symbol id="dc-tom" viewBox="0 0 100 92">
          <path
            d="M50 20C27 20 9 35 9 55c0 20 18 34 41 34s41-14 41-34c0-20-18-35-41-35z"
            fill="var(--dc-red)"
          />
          <path d="M36 24q-9 26 0 56M64 24q9 26 0 56" fill="none" stroke="var(--dc-deep)" strokeWidth="3" strokeLinecap="round" opacity=".28" />
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

        {/* груша */}
        <symbol id="dc-pear" viewBox="0 0 100 120">
          <path
            d="M50 26c-8 0-12 8-14 18-3 14-14 20-16 38-2 20 12 32 30 32s32-12 30-32c-2-18-13-24-16-38-2-10-6-18-14-18z"
            fill="var(--dc-amber)"
          />
          <path d="M50 26q-2-10 6-16" fill="none" stroke="var(--dc-stem)" strokeWidth="5" strokeLinecap="round" />
          <path d="M56 12q14-8 22 0-8 10-22 0z" fill="var(--dc-green)" />
          <path d="M34 82q2 14 12 20" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity=".3" />
          <path d="M44 48q6-4 12 0" fill="none" stroke="var(--dc-deep)" strokeWidth="3" strokeLinecap="round" opacity=".25" />
        </symbol>

        {/* гроздь винограда */}
        <symbol id="dc-grape" viewBox="0 0 100 110">
          <path d="M50 4v16" stroke="var(--dc-stem)" strokeWidth="5" strokeLinecap="round" fill="none" />
          <path d="M50 14q16-10 26-2-10 12-26 2z" fill="var(--dc-green)" />
          {[
            [30, 36], [50, 32], [70, 36],
            [38, 56], [58, 54], [72, 58],
            [30, 74], [50, 76], [64, 78], [46, 96],
          ].map(([cx, cy], i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r="14" fill="var(--dc-deep)" />
              <circle cx={cx - 4} cy={cy - 4} r="3.5" fill="#fff" opacity=".22" />
            </g>
          ))}
        </symbol>

        {/* слива */}
        <symbol id="dc-plum" viewBox="0 0 100 90">
          <ellipse cx="50" cy="52" rx="34" ry="36" fill="var(--dc-deep)" />
          <path d="M50 18q-10 34 0 68" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity=".16" />
          <path d="M50 16q0-8 6-12" fill="none" stroke="var(--dc-stem)" strokeWidth="5" strokeLinecap="round" />
          <path d="M30 40q2 16 10 24" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity=".26" />
        </symbol>

        {/* кочан капусты */}
        <symbol id="dc-cab" viewBox="0 0 100 92">
          <path d="M12 58q-8-26 14-38-6 18 4 30z" fill="var(--dc-green)" opacity=".85" />
          <path d="M88 58q8-26-14-38 6 18-4 30z" fill="var(--dc-green)" opacity=".85" />
          <circle cx="50" cy="52" r="38" fill="var(--dc-green-lt)" />
          <path d="M26 64q4-28 28-32" fill="none" stroke="var(--dc-green-dk)" strokeWidth="4" strokeLinecap="round" opacity=".5" />
          <path d="M38 70q6-20 26-22" fill="none" stroke="var(--dc-green-dk)" strokeWidth="4" strokeLinecap="round" opacity=".4" />
          <path d="M52 74q4-10 14-12" fill="none" stroke="var(--dc-green-dk)" strokeWidth="4" strokeLinecap="round" opacity=".35" />
        </symbol>

        {/* морковь (лежит, хвостик ботвы справа) */}
        <symbol id="dc-car" viewBox="0 0 100 40">
          <path
            d="M6 22C20 10 58 8 80 14c8 2 8 12 0 14-22 6-60 4-74-6z"
            fill="var(--dc-red)"
          />
          <path d="M30 14q-3 8 0 14M48 12q-3 9 0 17M64 12q-2 9 0 18" fill="none" stroke="var(--dc-deep)" strokeWidth="3" strokeLinecap="round" opacity=".35" />
          <path d="M84 18q8-8 12-12M86 21q12-4 14-2M85 24q10 4 12 8" fill="none" stroke="var(--dc-green)" strokeWidth="3.5" strokeLinecap="round" />
        </symbol>

        {/* луковица */}
        <symbol id="dc-onion" viewBox="0 0 100 100">
          <path d="M42 28L50 4l8 24z" fill="var(--dc-jar)" />
          <path
            d="M50 24C30 24 18 40 18 60s14 32 32 32 32-12 32-32-12-36-32-36z"
            fill="var(--dc-jar)"
          />
          <path d="M38 30q-8 30 0 58M50 28v62M62 30q8 30 0 58" fill="none" stroke="var(--dc-deep)" strokeWidth="3" strokeLinecap="round" opacity=".38" />
          <path d="M44 94l-2 5M50 94v6M56 94l2 5" stroke="var(--dc-stem)" strokeWidth="3" strokeLinecap="round" fill="none" />
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
          {/* усик и блик — тыква с грядки, а не круг с полосками */}
          <path d="M58 8c8-6 14-2 12 6-2 6-9 6-11 1" fill="none" stroke="var(--dc-deep)" strokeWidth="2.5" strokeLinecap="round" opacity=".6" />
          <path d="M22 34c3 14 10 24 20 30" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity=".22" />
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

        {/* лист — с боковыми прожилками */}
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
          <path d="M30 44l6-14M50 37l7-15M68 28l6-14" fill="none" stroke="var(--dc-deep)" strokeWidth="2" strokeLinecap="round" opacity=".35" />
        </symbol>
      </defs>
    </svg>
  );
}

/**
 * Урожай под первым экраном — прилавок в цветах логотипа.
 * История решений — в комментарии к ROW ниже.
 */
// Правки основателя (22.08, четыре итерации):
// - овощи ПЛОТНО, банок-«солонок» нет, 11 видов, повторы отличаются оттенком
//   (поле `v` подменяет CSS-переменную конкретному экземпляру);
// - НИЧЕГО НЕ РЕЖЕТСЯ ПО КРАЯМ («всё должно быть целым»). Поэтому прилавок —
//   не один широкий рисунок под slice, а центрированный flex-ряд ОТДЕЛЬНЫХ
//   фигур: в ряд встаёт столько ЦЕЛЫХ овощей, сколько влезает в окно,
//   остальные переносятся на невидимую вторую строку (overflow клипует
//   строку целиком, а не половину тыквы). Ни на какой ширине ничего не
//   обрезано — ни сверху, ни по бокам.
// Порядок в массиве = порядок в ряду; на телефоне видны первые 3–4 фигуры,
// поэтому сильная тройка (тыква-кабачок-яблоко) стоит первой.
const ROW: Array<{ s: string; h: number; v?: Record<string, string> }> = [
  { s: "dc-pum", h: 112 },
  { s: "dc-zuc", h: 60 },
  { s: "dc-app", h: 58 },
  { s: "dc-grape", h: 92 },
  { s: "dc-cab", h: 98 },
  { s: "dc-pear", h: 98 },
  { s: "dc-car", h: 56 },
  { s: "dc-tom", h: 64 },
  { s: "dc-pum", h: 104, v: { "--dc-amber": "#eea226" } },
  { s: "dc-onion", h: 76 },
  { s: "dc-zuc", h: 68, v: { "--dc-green": "#efab45" } },
  { s: "dc-plum", h: 58 },
  { s: "dc-app", h: 58, v: { "--dc-red": "#d97f0a" } },
  { s: "dc-grape", h: 86, v: { "--dc-deep": "#b26410" } },
  { s: "dc-zuc", h: 70, v: { "--dc-green": "#e09630" } },
  { s: "dc-pum", h: 108, v: { "--dc-amber": "#f0a41f" } },
  { s: "dc-tom", h: 60, v: { "--dc-red": "#ea9316" } },
  { s: "dc-pear", h: 90, v: { "--dc-amber": "#f0a51f" } },
  { s: "dc-cab", h: 92, v: { "--dc-green-lt": "#f2c05a" } },
  { s: "dc-car", h: 54, v: { "--dc-red": "#d97f0a" } },
];

/** Пропорции символов — чтобы посчитать высоту от ширины. */
const RATIO: Record<string, number> = {
  "dc-zuc": 0.46,
  "dc-app": 1,
  "dc-tom": 0.92,
  "dc-pum": 0.84,
  "dc-jar": 1.2,
  "dc-lea": 0.6,
  "dc-pear": 1.2,
  "dc-grape": 1.1,
  "dc-plum": 0.9,
  "dc-cab": 0.92,
  "dc-car": 0.4,
  "dc-onion": 1,
};

export function DayHeap() {
  if (TODAY.decor !== "harvest") return null;
  return (
    <div className="day-heap bleed" aria-hidden>
      {ROW.map((it, i) => {
        const w = Math.round(it.h / RATIO[it.s]);
        return (
          <svg
            key={i}
            className="day-heap-item"
            width={w}
            height={it.h + 14}
            viewBox={`0 0 ${w} ${it.h + 14}`}
            focusable="false"
            // CSS-переменные наследуются внутрь <use>: экземпляр получает
            // свой оттенок, не трогая палитру соседей
            style={it.v as React.CSSProperties}
          >
            {/* собственная тень: фигура стоит на земле, а не висит */}
            <ellipse cx={w / 2} cy={it.h + 6} rx={w * 0.52} ry={5.5} fill="var(--dc-shadow)" />
            <use href={`#${it.s}`} x={0} y={0} width={w} height={it.h} />
          </svg>
        );
      })}
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
// Пять фигур, не восемь, и мельче: восемь полупрозрачных силуэтов поверх
// заголовка читались как пятна на экране, а не как падающий урожай
// (замечание основателя 22.08: «выглядит перегруженно»).
const FALL: Array<{ s: string; x: string; sz: string; dur: string; delay: string; sway: string }> = [
  { s: "dc-zuc", x: "7%",  sz: "44px", dur: "19s", delay: "0s",   sway: "3.7s" },
  { s: "dc-lea", x: "27%", sz: "30px", dur: "23s", delay: "-9s",  sway: "2.9s" },
  { s: "dc-app", x: "52%", sz: "28px", dur: "17s", delay: "-13s", sway: "3.3s" },
  { s: "dc-lea", x: "72%", sz: "32px", dur: "25s", delay: "-5s",  sway: "4.6s" },
  { s: "dc-zuc", x: "91%", sz: "48px", dur: "27s", delay: "-2s",  sway: "4.3s" },
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
