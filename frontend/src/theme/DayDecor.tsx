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
  if (TODAY.decor === "perm") return <PermHeap />;
  if (TODAY.decor === "breakfast") return <BreakfastHeap />;
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


/* ─────────────────────────── завтрак (25.08.2026) ───────────────────────────
   Второй натюрморт того же прилавка. Урожай объяснялся строкой про конец
   августа; этот — строкой «завтрак может быть в одиннадцать». Графика без
   своего повода не выпускается, поэтому спрайты и ряд разведены по наборам,
   а не свалены в один.

   Собственные id (dc-b-*): в документе одновременно живёт ровно один спрайт,
   но совпадающие id у разных наборов — это ловушка на будущее.

   Палитра — та же монохромно-оранжевая (решение основателя 22.08): фигуры
   различаются формой и оттенком, не хюэ. Тарелки и каша — «стекло банки»
   --dc-jar, самый светлый тон набора: посуда должна уходить назад, еда —
   выходить вперёд. */
function BreakfastSprite() {
  return (
    <svg
      aria-hidden
      focusable="false"
      width="0"
      height="0"
      style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
    >
      <defs>
        {/* пар гаснет кверху сам, градиентом по своей же bbox: маску на <g>
            браузеры считают по-разному, а это работает везде одинаково */}
        <linearGradient id="dc-b-steamg" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="var(--dc-deep)" stopOpacity=".42" />
          <stop offset="1" stopColor="var(--dc-deep)" stopOpacity="0" />
        </linearGradient>

        {/* кружка на блюдце */}
        <symbol id="dc-b-cup" viewBox="0 0 100 92">
          <ellipse cx="46" cy="84" rx="40" ry="7" fill="var(--dc-jar)" />
          <path d="M6 84c0-4 18-7 40-7s40 3 40 7" fill="none" stroke="var(--dc-deep)" strokeWidth="2" opacity=".2" />
          <path d="M76 34c16-2 20 24 4 28" fill="none" stroke="var(--dc-red)" strokeWidth="9" strokeLinecap="round" />
          <path d="M14 26h64l-6 44c-1 8-8 12-26 12s-25-4-26-12z" fill="var(--dc-amber)" />
          <ellipse cx="46" cy="26" rx="32" ry="8" fill="var(--dc-green-lt)" />
          <ellipse cx="46" cy="26" rx="25" ry="5.5" fill="var(--dc-deep)" opacity=".5" />
          <path d="M24 40c1 12 4 22 9 29" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity=".3" />
        </symbol>

        {/* сырники со сметаной */}
        <symbol id="dc-b-syr" viewBox="0 0 100 56">
          <ellipse cx="50" cy="46" rx="46" ry="9" fill="var(--dc-jar)" />
          <path d="M4 46c0-5 21-9 46-9s46 4 46 9" fill="none" stroke="var(--dc-deep)" strokeWidth="2" opacity=".2" />
          <rect x="12" y="30" width="36" height="12" rx="6" fill="var(--dc-green)" />
          <ellipse cx="30" cy="30" rx="18" ry="7" fill="var(--dc-amber)" />
          <rect x="52" y="30" width="36" height="12" rx="6" fill="var(--dc-green)" />
          <ellipse cx="70" cy="30" rx="18" ry="7" fill="var(--dc-amber)" />
          <rect x="32" y="16" width="36" height="12" rx="6" fill="var(--dc-green)" />
          <ellipse cx="50" cy="16" rx="18" ry="7" fill="var(--dc-amber)" />
          {/* ложка сметаны — единственное белое пятно набора, поэтому глаз
              находит верхний сырник первым */}
          <path d="M39 13c3-5 8-6 11-3 4-3 9 0 8 4-2 5-17 5-19-1z" fill="var(--dc-jar)" />
        </symbol>

        {/* стопка блинов с маслом */}
        <symbol id="dc-b-bli" viewBox="0 0 100 58">
          <ellipse cx="50" cy="50" rx="45" ry="8" fill="var(--dc-jar)" />
          <ellipse cx="50" cy="44" rx="40" ry="7" fill="var(--dc-amber)" />
          <ellipse cx="50" cy="37" rx="39" ry="7" fill="var(--dc-green)" />
          <ellipse cx="50" cy="30" rx="38" ry="7" fill="var(--dc-amber)" />
          <ellipse cx="50" cy="23" rx="36" ry="7" fill="var(--dc-green)" />
          <path d="M43 15h13l-3 7H46z" fill="var(--dc-jar)" />
          <path d="M56 20c6 3 8 9 5 15" fill="none" stroke="var(--dc-red)" strokeWidth="3" strokeLinecap="round" opacity=".65" />
        </symbol>

        {/* каша в миске с ложкой.
            Ложка не украшение: без неё мелкая миска с ровной светлой
            поверхностью читалась не как каша, а как перевёрнутая тарелка. */}
        <symbol id="dc-b-kas" viewBox="0 0 100 66">
          <path d="M12 26c0 20 16 34 38 34s38-14 38-34z" fill="var(--dc-amber)" />
          <ellipse cx="50" cy="26" rx="38" ry="8" fill="var(--dc-green)" />
          <ellipse cx="50" cy="26" rx="30" ry="6" fill="var(--dc-jar)" />
          <ellipse cx="47" cy="25" rx="6" ry="3.4" fill="var(--dc-red)" opacity=".85" />
          <path d="M80 6 62 22" fill="none" stroke="var(--dc-deep)" strokeWidth="5" strokeLinecap="round" />
          <ellipse cx="59" cy="25" rx="7" ry="4.6" fill="var(--dc-deep)" transform="rotate(-40 59 25)" />
          <path d="M22 36c3 9 8 15 14 19" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity=".26" />
        </symbol>

        {/* банка варенья */}
        <symbol id="dc-b-jam" viewBox="0 0 100 120">
          <path d="M22 4h56a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H22a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4z" fill="var(--dc-deep)" />
          <path d="M26 24h48v10c0 3 4 5 4 9v66c0 6-6 10-14 10H36c-8 0-14-4-14-10V43c0-4 4-6 4-9V24z" fill="var(--dc-jar)" />
          <path d="M22 54h56v49c0 6-6 10-14 10H36c-8 0-14-4-14-10z" fill="var(--dc-red)" opacity=".88" />
          <path d="M33 74v30" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity=".3" />
        </symbol>

        {/* яблоко «в портфель» */}
        <symbol id="dc-b-app" viewBox="0 0 100 100">
          <path d="M50 24C38 11 15 15 13 40 11 65 30 93 50 93s39-28 37-53C85 15 62 11 50 24z" fill="var(--dc-red)" />
          <path d="M50 24c0-9 2-15 8-19" fill="none" stroke="var(--dc-stem)" strokeWidth="5" strokeLinecap="round" />
          <path d="M59 9c9-8 23-6 25 2-6 8-20 8-25-2z" fill="var(--dc-green)" />
          <path d="M30 33c4-6 10-9 15-9" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity=".32" />
        </symbol>
      </defs>
    </svg>
  );
}

/* Ряд завтрака. Порядок = порядок на экране: на телефоне видны первые две-три
   фигуры, поэтому сильная тройка (сырники — кружка — блины) стоит первой, а
   банка и каша достаются широким окнам.
   `top` — воздух над фигурой под пар; он входит в высоту SVG, а не сдвигает
   соседей, поэтому полоса по-прежнему не двигает вёрстку. */
const B_ROW: Array<{ s: string; h: number; top?: number; steam?: boolean; v?: Record<string, string> }> = [
  { s: "dc-b-syr", h: 56 },
  { s: "dc-b-cup", h: 76, top: 30, steam: true },
  { s: "dc-b-bli", h: 58 },
  { s: "dc-b-jam", h: 84, v: { "--dc-red": "#d97f0a" } },
  { s: "dc-b-kas", h: 62, v: { "--dc-amber": "#eea226" } },
  { s: "dc-b-app", h: 54 },
];

const B_RATIO: Record<string, number> = {
  "dc-b-syr": 0.56,
  "dc-b-cup": 0.92,
  "dc-b-bli": 0.58,
  "dc-b-kas": 0.66,
  "dc-b-jam": 1.2,
  "dc-b-app": 1,
};

/* Три струйки пара над кружкой: разные дорожки, разная длительность и сдвиг
   фазы — иначе пар дышит одним куском и читается как мигающая картинка.
   Координаты — в системе элемента ряда (кружка шириной 83, край чашки ~y=51). */
const STEAM = [
  { d: "M27 44c-6-7 4-10-1-17s4-9 1-13", dur: "4.6s", delay: "0s" },
  { d: "M39 40c-6-8 4-11-1-18s4-8 1-12", dur: "5.4s", delay: "-1.7s" },
  { d: "M51 45c-5-7 4-10 0-16s3-8 1-11", dur: "5s", delay: "-3.1s" },
];

function BreakfastHeap() {
  return (
    <>
      <BreakfastSprite />
      <div className="day-heap day-heap--breakfast bleed" aria-hidden>
        {B_ROW.map((it, i) => {
          const top = it.top ?? 0;
          const w = Math.round(it.h / B_RATIO[it.s]);
          const h = top + it.h + 14;
          return (
            <svg
              key={i}
              className="day-heap-item"
              width={w}
              height={h}
              viewBox={`0 0 ${w} ${h}`}
              focusable="false"
              style={it.v as React.CSSProperties}
            >
              <ellipse cx={w / 2} cy={h - 8} rx={w * 0.5} ry={5.5} fill="var(--dc-shadow)" />
              {it.steam &&
                STEAM.map((st, j) => (
                  <path
                    key={j}
                    className="day-steam"
                    d={st.d}
                    fill="none"
                    stroke="url(#dc-b-steamg)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    style={
                      { animationDuration: st.dur, animationDelay: st.delay } as React.CSSProperties
                    }
                  />
                ))}
              <use href={`#${it.s}`} x={0} y={top} width={w} height={it.h} />
            </svg>
          );
        })}
      </div>
    </>
  );
}


/* ─────────────────────────── Пермь (26.08.2026) ───────────────────────────
   Третий натюрморт того же прилавка: пермская кухня.

   Повод объясняет графику, а не наоборот. Слово «пельмень» родилось в
   Прикамье — коми-перм. «пельнянь», хлебное ухо, — и строка дня говорит ровно
   это. Поэтому герой набора нарисован не «варениками общего вида», а именно
   УШКОМ: толстая дуга с круглыми концами, сведёнными внизу. Без строки такая
   фигура читалась бы как подкова; со строкой её узнают мгновенно, и это тот
   самый кадр, который хочется отправить другу.

   Свои id (dc-p-*) и свой ряд P_ROW — по той же причине, что и у завтрака:
   наборы не смешиваются, совпадающие id — ловушка на будущее.

   Движения у набора нет намеренно. Вчера день держался на паре над кружкой;
   повторить тот же приём на другом блюде — показать не день, а фокус.
   Сегодня работает форма.

   Палитра — та же монохромно-оранжевая (решение основателя 22.08): фигуры
   различаются формой и оттенком, не хюэ. Посуда — самый светлый --dc-jar:
   миска уходит назад, еда выходит вперёд. */
function PermSprite() {
  return (
    <svg
      aria-hidden
      focusable="false"
      width="0"
      height="0"
      style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
    >
      <defs>
        {/* Пельмень — герой набора и весь смысл дня.
            Тело — ОДНА толстая дуга с круглыми концами: это и есть ухо.
            Концы сводит эллипс внизу — без него фигура читается как подкова,
            а с ним замыкается в ушко с дыркой посередине, ровно как настоящий.
            Защип — пунктирная дуга по внешнему краю: короткие штрихи с
            расстояния читаются как защип, а нарисованные зубцы на 90px — как
            грязь по краю.

            ВАЖНО (проверено крупно 26.08): дырка решает всё. При дуге r=28 и
            толщине 24 отверстие занимало 40% фигуры — выходил БУБЛИК, и защип
            по внешнему краю дочитывался как посыпка. Стало r=25 при толщине
            34: отверстие ~20%, тесто плотное, ушко узнаётся сразу. Защип
            уведён на 4px внутрь края — снаружи он читался бусинами. */}
        <symbol id="dc-p-pel" viewBox="0 0 100 90">
          <path
            d="M32 66A25 25 0 1 1 68 66"
            fill="none"
            stroke="var(--dc-amber)"
            strokeWidth="34"
            strokeLinecap="round"
          />
          <ellipse cx="50" cy="66" rx="10" ry="9" fill="var(--dc-amber)" />
          <path
            d="M19 70A38 38 0 1 1 81 70"
            fill="none"
            stroke="var(--dc-deep)"
            strokeWidth="4"
            strokeDasharray="3 7"
            strokeLinecap="round"
            opacity=".3"
          />
          <path
            d="M28 45a25 25 0 0 1 12-16"
            fill="none"
            stroke="#fff"
            strokeWidth="8"
            strokeLinecap="round"
            opacity=".28"
          />
        </symbol>

        {/* Миска пельменей: «что заказать» рядом с «откуда имя».
            Пельмени в миске — плотные овалы с защипом поперёк: кольцо на
            30 пикселях прочиталось бы бубликом, а овал с защипом — тестом. */}
        <symbol id="dc-p-bowl" viewBox="0 0 100 76">
          <g fill="var(--dc-amber)">
            <ellipse cx="28" cy="30" rx="16" ry="11.5" />
            <ellipse cx="50" cy="23" rx="16" ry="11.5" />
            <ellipse cx="72" cy="30" rx="16" ry="11.5" />
          </g>
          <g fill="none" stroke="var(--dc-deep)" strokeWidth="2.6" strokeLinecap="round" opacity=".3">
            <path d="M20 29a9 7 0 0 1 16 0" />
            <path d="M42 22a9 7 0 0 1 16 0" />
            <path d="M64 29a9 7 0 0 1 16 0" />
          </g>
          <path d="M8 36c0 22 19 34 42 34s42-12 42-34z" fill="var(--dc-jar)" />
          <ellipse cx="50" cy="36" rx="42" ry="9" fill="var(--dc-green-lt)" />
          <ellipse cx="50" cy="36" rx="34" ry="6.5" fill="var(--dc-deep)" opacity=".16" />
          <path
            d="M20 46c3 10 8 16 15 20"
            fill="none"
            stroke="#fff"
            strokeWidth="5"
            strokeLinecap="round"
            opacity=".26"
          />
        </symbol>

        {/* Посикунчик — жареный пирожок-полумесяц, которого за пределами
            Прикамья почти никто не делает. Плоское дно + защип по дуге:
            без защипа купол читается как булка. */}
        <symbol id="dc-p-pos" viewBox="0 0 100 58">
          <path d="M6 48c0-22 20-36 44-36s44 14 44 36z" fill="var(--dc-red)" />
          <path
            d="M8 44c0-20 18-32 42-32s42 12 42 32"
            fill="none"
            stroke="var(--dc-deep)"
            strokeWidth="5"
            strokeDasharray="3 6"
            strokeLinecap="round"
            opacity=".42"
          />
          <path
            d="M22 34c4-9 11-14 19-16"
            fill="none"
            stroke="#fff"
            strokeWidth="6"
            strokeLinecap="round"
            opacity=".3"
          />
          <ellipse cx="50" cy="48" rx="44" ry="4" fill="var(--dc-deep)" opacity=".14" />
        </symbol>

        {/* Шаньга — открытая, сверху. Три кольца от края к начинке: тесто,
            картофельная намазка, светлая середина. Вилка по начинке — то, по
            чему шаньгу узнают и что отличает её от лепёшки. */}
        <symbol id="dc-p-sha" viewBox="0 0 100 54">
          <ellipse cx="50" cy="30" rx="47" ry="22" fill="var(--dc-red)" />
          <ellipse cx="50" cy="28" rx="36" ry="15.5" fill="var(--dc-amber)" />
          <ellipse cx="50" cy="27" rx="27" ry="11" fill="var(--dc-green-lt)" />
          <g fill="none" stroke="var(--dc-deep)" strokeWidth="2.4" strokeLinecap="round" opacity=".3">
            <path d="M36 24c5 3 10 4 15 4" />
            <path d="M38 30c5 3 10 4 15 4" />
            <path d="M52 22c5 2 9 3 13 3" />
          </g>
          <path
            d="M18 24c4-6 10-9 16-11"
            fill="none"
            stroke="#fff"
            strokeWidth="5"
            strokeLinecap="round"
            opacity=".26"
          />
        </symbol>

        {/* Груздь: сезон честный — грузди из-под Полазны идут как раз сейчас.
            Шляпка воронкой с подвёрнутым краем и бахромой; без воронки и
            бахромы гриб читается как шампиньон, а это уже другой лес. */}
        <symbol id="dc-p-gru" viewBox="0 0 100 74">
          <path d="M40 40h20v22a10 10 0 0 1-20 0z" fill="var(--dc-green)" />
          <path d="M6 40c0-20 20-32 44-32s44 12 44 32c0 8-20 12-44 12S6 48 6 40z" fill="var(--dc-green-lt)" />
          <ellipse cx="50" cy="30" rx="28" ry="11" fill="var(--dc-deep)" opacity=".16" />
          <path
            d="M8 44c8 6 24 9 42 9s34-3 42-9"
            fill="none"
            stroke="var(--dc-deep)"
            strokeWidth="3"
            strokeLinecap="round"
            opacity=".3"
          />
          <g fill="none" stroke="var(--dc-deep)" strokeWidth="2.4" strokeLinecap="round" opacity=".3">
            <path d="M16 45v5" />
            <path d="M30 49v5" />
            <path d="M50 51v5" />
            <path d="M70 49v5" />
            <path d="M84 45v5" />
          </g>
          <path
            d="M20 26c6-8 14-12 22-13"
            fill="none"
            stroke="#fff"
            strokeWidth="6"
            strokeLinecap="round"
            opacity=".3"
          />
        </symbol>
      </defs>
    </svg>
  );
}

/* Пермский ряд. Порядок = порядок на экране: на 320/375 в первую строку
   встают две-три фигуры, поэтому пельмень-ушко — герой дня и весь его смысл —
   стоит первым, миска второй. Груздь и шаньга достаются широким окнам. */
const P_ROW: Array<{ s: string; h: number; v?: Record<string, string> }> = [
  { s: "dc-p-pel", h: 88 },
  { s: "dc-p-bowl", h: 70 },
  { s: "dc-p-pos", h: 54, v: { "--dc-red": "#e8a23a" } },
  { s: "dc-p-sha", h: 50 },
  { s: "dc-p-gru", h: 68 },
];

const P_RATIO: Record<string, number> = {
  "dc-p-pel": 0.9,
  "dc-p-bowl": 0.76,
  "dc-p-pos": 0.58,
  "dc-p-sha": 0.54,
  "dc-p-gru": 0.74,
};

function PermHeap() {
  return (
    <>
      <PermSprite />
      <div className="day-heap day-heap--perm bleed" aria-hidden>
        {P_ROW.map((it, i) => {
          const w = Math.round(it.h / P_RATIO[it.s]);
          const h = it.h + 14;
          return (
            <svg
              key={i}
              className="day-heap-item"
              width={w}
              height={h}
              viewBox={`0 0 ${w} ${h}`}
              focusable="false"
              style={it.v as React.CSSProperties}
            >
              <ellipse cx={w / 2} cy={h - 8} rx={w * 0.5} ry={5.5} fill="var(--dc-shadow)" />
              <use href={`#${it.s}`} x={0} y={0} width={w} height={it.h} />
            </svg>
          );
        })}
      </div>
    </>
  );
}
