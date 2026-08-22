/**
 * ОБЩИЙ СТОЛ — ЗАПАСНАЯ сцена, сейчас НЕ используется.
 *
 * История (22.08.2026): сцену собрали на замену куче урожая, основатель
 * посмотрел обе и выбрал овощи — но в цветах логотипа (см. DayDecor.tsx).
 * Стол остаётся в запасе на будущее. Если возвращать — БЕЗ рук и людей:
 * первую редакцию с руками соседей основатель забраковал сразу.
 *
 * Что это. Длинный накрытый стол во всю ширину окна: борщ, пельмени,
 * пирожки, блины, салат, чай с вареньем, хлеб, соленья, бублики. Картинка
 * тэглайна «Соседи кормят соседей»: еда общая, стол один на всех.
 *
 * Только еда. Первая редакция сажала за стол руки соседей — основатель
 * забраковал («выглядит очень плохо»). Людей на столе НЕ рисуем: ни рук,
 * ни лиц. Присутствие людей передают приборы и число тарелок.
 *
 * Почему так, а не куча овощей. Полоса урожая (см. theme/DayDecor.tsx)
 * читалась как свалка: крупные фигуры стык в стык, без воздуха. Стол —
 * противоположность: просторные посадочные места, между ними пустая
 * скатерть. Пустота — не недоработка, а композиция: воздух и делает сцену
 * элегантной, НЕ уплотнять.
 *
 * Правила те же, что у декораций дня:
 * - всё инлайновый SVG: ноль запросов, ноль шрифтов, ноль блокировок;
 * - высота живёт в --table-band-h (index.css) — полоса не двигает вёрстку;
 * - pointer-events: none, aria-hidden: чистая декорация.
 *
 * Геометрия. viewBox 2940×260, preserveAspectRatio="xMidYMid slice»:
 * на узком экране стол продолжается ЗА КРАЯ (режутся бока), тарелки лежат
 * в безопасной середине (y 42–218) и по вертикали не режутся никогда.
 * Порядок блюд не случайный: середина рисунка (видимая на обычном десктопе,
 * x≈550–2400) чередует золотое с красным и зелёным — борщ у центра.
 */

const CLOTH = "#f3e7d2";
const PLATE = "#fffdf8";
const PLATE_EDGE = "rgba(224,134,12,0.20)";
const SHADOW = "rgba(120,84,30,0.10)";

function Shadow({ x, y, rx, ry = 14 }: { x: number; y: number; rx: number; ry?: number }) {
  return <ellipse cx={x} cy={y} rx={rx} ry={ry} fill={SHADOW} />;
}

/** Борщ: белая тарелка, свёкольно-красный, сметана, укроп + ложка рядом. */
function Borscht({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <Shadow x={x} y={y + 12} rx={96} />
      <circle cx={x} cy={y} r={88} fill={PLATE} stroke={PLATE_EDGE} strokeWidth="3" />
      <circle cx={x} cy={y} r={68} fill="none" stroke="rgba(224,134,12,0.12)" strokeWidth="2" />
      <circle cx={x} cy={y} r={60} fill="#b8402a" />
      <path d={`M${x - 38} ${y - 20}A44 44 0 0 1 ${x - 6} ${y - 44}`} stroke="#d05a3e" strokeWidth="8" strokeLinecap="round" fill="none" />
      {/* сметана — ложка белого с хвостиком */}
      <circle cx={x + 12} cy={y + 6} r={16} fill="#fff6e8" />
      <path d={`M${x + 24} ${y - 2}q14 -8 20 -22`} stroke="#fff6e8" strokeWidth="7" strokeLinecap="round" fill="none" />
      {/* укроп */}
      {[[-24, -14], [8, -28], [-4, 24], [30, 22]].map(([dx, dy], i) => (
        <circle key={i} cx={x + dx} cy={y + dy} r={3} fill="#5f8f3e" opacity=".85" />
      ))}
      {/* ложка справа от тарелки */}
      <g transform={`rotate(18 ${x + 118} ${y})`}>
        <rect x={x + 112} y={y - 52} width={11} height={72} rx={5.5} fill="#d9cbb6" />
        <ellipse cx={x + 117.5} cy={y + 36} rx={17} ry={24} fill="#e6d9c4" />
      </g>
    </g>
  );
}

/** Пельмени со сметаной и маслом. */
function Pelmeni({ x, y }: { x: number; y: number }) {
  const ds: Array<[number, number, number]> = [
    [-30, -22, -15], [8, -34, 20], [36, -8, 60], [-42, 14, 35], [-4, 8, -30], [26, 30, 10], [-16, 40, 75],
  ];
  return (
    <g>
      <Shadow x={x} y={y + 12} rx={94} />
      <circle cx={x} cy={y} r={86} fill={PLATE} stroke={PLATE_EDGE} strokeWidth="3" />
      {ds.map(([dx, dy, r], i) => (
        <g key={i} transform={`rotate(${r} ${x + dx} ${y + dy})`}>
          <ellipse cx={x + dx} cy={y + dy} rx={21} ry={15} fill="#f6e3c2" stroke="#e3c795" strokeWidth="2.5" />
          <path d={`M${x + dx - 12} ${y + dy + 4}q12 8 24 0`} stroke="#e3c795" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </g>
      ))}
      <circle cx={x + 6} cy={y - 2} r={9} fill="#f4b942" opacity=".9" />
      {[[-30, 26], [22, -30]].map(([dx, dy], i) => (
        <circle key={i} cx={x + dx} cy={y + dy} r={2.6} fill="#5f8f3e" />
      ))}
    </g>
  );
}

/** Деревянная доска с пирожками. */
function Pirozhki({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <Shadow x={x} y={y + 14} rx={118} />
      <rect x={x - 112} y={y - 58} width={224} height={116} rx={26} fill="#d9a35f" stroke="#c08a44" strokeWidth="3" />
      {[-64, 0, 64].map((dx, i) => (
        <g key={i} transform={`rotate(${i === 1 ? 0 : i === 0 ? -14 : 14} ${x + dx} ${y})`}>
          <ellipse cx={x + dx} cy={y} rx={40} ry={25} fill="#dd9433" />
          <path d={`M${x + dx - 24} ${y - 4}q24 -14 48 0`} stroke="#f4c064" strokeWidth="5" strokeLinecap="round" fill="none" />
          <path d={`M${x + dx - 18} ${y + 8}q18 8 36 0`} stroke="#c07d1f" strokeWidth="3" strokeLinecap="round" fill="none" opacity=".7" />
        </g>
      ))}
    </g>
  );
}

/** Салат: зелень и помидоры в миске. */
function Salad({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <Shadow x={x} y={y + 10} rx={72} />
      <circle cx={x} cy={y} r={66} fill={PLATE} stroke={PLATE_EDGE} strokeWidth="3" />
      <circle cx={x} cy={y} r={50} fill="#6f9c48" />
      {[[-18, -14, "#86b45c"], [14, -20, "#5f8f3e"], [-26, 16, "#86b45c"], [22, 14, "#5f8f3e"], [0, 0, "#79a850"]].map(
        ([dx, dy, c], i) => (
          <ellipse key={i} cx={x + Number(dx)} cy={y + Number(dy)} rx={16} ry={10} fill={String(c)}
            transform={`rotate(${i * 37} ${x + Number(dx)} ${y + Number(dy)})`} />
        )
      )}
      {[[-8, -22], [18, 4], [-20, 4]].map(([dx, dy], i) => (
        <circle key={i} cx={x + dx} cy={y + dy} r={7} fill="#c14a30" />
      ))}
    </g>
  );
}

/** Стопка блинов с вареньем. */
function Blini({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <Shadow x={x} y={y + 12} rx={88} />
      <circle cx={x} cy={y} r={80} fill={PLATE} stroke={PLATE_EDGE} strokeWidth="3" />
      <circle cx={x} cy={y} r={58} fill="#e8a93f" />
      <circle cx={x} cy={y} r={58} fill="none" stroke="#d18f2a" strokeWidth="3" strokeDasharray="10 14" opacity=".8" />
      <circle cx={x} cy={y} r={44} fill="none" stroke="#d18f2a" strokeWidth="2" opacity=".5" />
      <circle cx={x + 4} cy={y - 2} r={17} fill="#9c3322" />
      <path d={`M${x + 14} ${y + 6}q10 8 4 18`} stroke="#9c3322" strokeWidth="6" strokeLinecap="round" fill="none" opacity=".8" />
    </g>
  );
}

/** Чай: два стакана на блюдцах и розетка варенья. */
function Tea({ x, y }: { x: number; y: number }) {
  const cup = (cx: number, cy: number) => (
    <g>
      <Shadow x={cx} y={cy + 6} rx={42} ry={10} />
      <circle cx={cx} cy={cy} r={38} fill={PLATE} stroke={PLATE_EDGE} strokeWidth="2.5" />
      <circle cx={cx} cy={cy} r={26} fill="#fffdf8" stroke="rgba(224,134,12,0.25)" strokeWidth="2.5" />
      <circle cx={cx} cy={cy} r={20} fill="#b96f1e" />
      <path d={`M${cx - 10} ${cy - 4}a12 12 0 0 1 14 -7`} stroke="#d99b4e" strokeWidth="4" strokeLinecap="round" fill="none" />
      <circle cx={cx + 30} cy={cy + 12} r={8} fill="none" stroke="rgba(224,134,12,0.4)" strokeWidth="4" />
    </g>
  );
  return (
    <g>
      {cup(x - 46, y - 28)}
      {cup(x + 42, y + 30)}
      <Shadow x={x + 52} y={y - 32} rx={26} ry={8} />
      <circle cx={x + 52} cy={y - 36} r={24} fill={PLATE} stroke={PLATE_EDGE} strokeWidth="2.5" />
      <circle cx={x + 52} cy={y - 36} r={14} fill="#9c3322" />
    </g>
  );
}

/** Хлеб на доске. */
function Bread({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <Shadow x={x} y={y + 12} rx={104} />
      <rect x={x - 100} y={y - 54} width={200} height={108} rx={24} fill="#caa06a" stroke="#b28a52" strokeWidth="3" />
      <g transform={`rotate(-8 ${x} ${y})`}>
        <ellipse cx={x - 12} cy={y} rx={62} ry={34} fill="#8a5a2e" />
        <ellipse cx={x - 12} cy={y - 6} rx={54} ry={24} fill="#a06c39" />
        {[-34, -10, 14].map((dx, i) => (
          <path key={i} d={`M${x + dx} ${y - 26}q6 10 0 22`} stroke="#6f4522" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        ))}
      </g>
      {[[62, -18], [70, 10], [52, 26]].map(([dx, dy], i) => (
        <circle key={i} cx={x + dx} cy={y + dy} r={2.5} fill="#8a5a2e" opacity=".55" />
      ))}
    </g>
  );
}

/** Соленья: маленькая тарелка с огурцами. */
function Pickles({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <Shadow x={x} y={y + 8} rx={54} ry={11} />
      <circle cx={x} cy={y} r={50} fill={PLATE} stroke={PLATE_EDGE} strokeWidth="2.5" />
      {[[-14, -8, -28], [10, -12, 14], [-4, 14, 55], [18, 10, -40]].map(([dx, dy, r], i) => (
        <g key={i} transform={`rotate(${r} ${x + dx} ${y + dy})`}>
          <ellipse cx={x + dx} cy={y + dy} rx={20} ry={8.5} fill="#5f8f3e" />
          <ellipse cx={x + dx - 6} cy={y + dy - 2} rx={8} ry={3} fill="#86b45c" opacity=".8" />
        </g>
      ))}
      <circle cx={x - 20} cy={y + 4} r={2.4} fill="#5f8f3e" />
    </g>
  );
}

/** Бублики: пара, один с маком. */
function Bubliki({ x, y }: { x: number; y: number }) {
  const one = (cx: number, cy: number, r: number, poppy: boolean) => (
    <g>
      <Shadow x={cx} y={cy + 6} rx={r + 6} ry={9} />
      <circle cx={cx} cy={cy} r={r} fill="#dd9433" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f4c064" strokeWidth="5" opacity=".7" />
      <circle cx={cx} cy={cy} r={r * 0.42} fill={CLOTH} />
      {poppy &&
        [[-r * 0.6, -r * 0.3], [0, -r * 0.75], [r * 0.55, -r * 0.35], [r * 0.7, r * 0.25], [-r * 0.2, r * 0.7]].map(
          ([dx, dy], i) => <circle key={i} cx={cx + dx} cy={cy + dy} r={2.2} fill="#6f4522" />
        )}
    </g>
  );
  return (
    <g>
      {one(x - 22, y + 6, 34, false)}
      {one(x + 34, y - 14, 28, true)}
    </g>
  );
}

/** Приборы на салфетке — накрыто ещё на одного соседа. */
function Cutlery({ x, y, r = 0 }: { x: number; y: number; r?: number }) {
  return (
    <g transform={`rotate(${r} ${x} ${y})`}>
      <Shadow x={x} y={y + 30} rx={44} ry={9} />
      <rect x={x - 44} y={y - 34} width={88} height={68} rx={10} fill="#fbf3e4" stroke="rgba(224,134,12,0.22)" strokeWidth="2.5" />
      <path d={`M${x - 44} ${y - 20}h88M${x - 44} ${y + 20}h88`} stroke="rgba(224,134,12,0.14)" strokeWidth="2" />
      {/* вилка */}
      <g>
        <rect x={x - 20} y={y - 16} width={6} height={44} rx={3} fill="#cfc4b4" />
        {[-5, 0, 5].map((dx) => (
          <rect key={dx} x={x - 18.5 + dx} y={y - 28} width={3} height={14} rx={1.5} fill="#cfc4b4" />
        ))}
      </g>
      {/* нож */}
      <rect x={x + 12} y={y - 14} width={6} height={42} rx={3} fill="#cfc4b4" />
      <path d={`M${x + 15} ${y - 28}q9 2 0 16z`} fill="#ddd3c2" />
    </g>
  );
}

/** Веточка укропа на скатерти — лёгкий ритм между приборами. */
function Sprig({ x, y, r = 0 }: { x: number; y: number; r?: number }) {
  return (
    <g transform={`rotate(${r} ${x} ${y})`} opacity=".8">
      <path d={`M${x} ${y}v26`} stroke="#5f8f3e" strokeWidth="3" strokeLinecap="round" />
      {[6, 14, 22].map((dy, i) => (
        <g key={i}>
          <path d={`M${x} ${y + dy}l-9 -7`} stroke="#5f8f3e" strokeWidth="2.5" strokeLinecap="round" />
          <path d={`M${x} ${y + dy}l9 -7`} stroke="#5f8f3e" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      ))}
    </g>
  );
}

export function TableBand() {
  return (
    <div className="table-band bleed" aria-hidden>
      <svg
        className="table-band-svg"
        viewBox="0 0 2940 260"
        preserveAspectRatio="xMidYMid slice"
        focusable="false"
      >
        {/* скатерть с тонкой каймой по кромкам стола и редким горошком */}
        <defs>
          <pattern id="tb-dots" width="72" height="72" patternUnits="userSpaceOnUse">
            <circle cx="18" cy="18" r="3.2" fill="rgba(224,134,12,0.07)" />
            <circle cx="54" cy="54" r="3.2" fill="rgba(224,134,12,0.07)" />
          </pattern>
        </defs>
        <rect x="0" y="0" width="2940" height="260" fill={CLOTH} />
        <rect x="0" y="0" width="2940" height="260" fill="url(#tb-dots)" />
        <line x1="0" y1="8" x2="2940" y2="8" stroke="rgba(224,134,12,0.30)" strokeWidth="2.5" />
        <line x1="0" y1="16" x2="2940" y2="16" stroke="rgba(224,134,12,0.14)" strokeWidth="1.5" />
        <line x1="0" y1="252" x2="2940" y2="252" stroke="rgba(224,134,12,0.30)" strokeWidth="2.5" />
        <line x1="0" y1="244" x2="2940" y2="244" stroke="rgba(224,134,12,0.14)" strokeWidth="1.5" />

        {/* восемь больших блюд, между ними — воздух и малые предметы */}
        <Pelmeni x={210} y={128} />
        <Blini x={600} y={134} />
        <Pirozhki x={985} y={136} />
        <Salad x={1345} y={126} />
        <Borscht x={1700} y={134} />
        <Tea x={2065} y={128} />
        <Bread x={2430} y={134} />
        <Borscht x={2790} y={128} />

        {/* малые предметы в промежутках: приборы, соленья, бублики */}
        <Pickles x={412} y={182} />
        <Cutlery x={795} y={62} r={-8} />
        <Bubliki x={1168} y={180} />
        <Cutlery x={1525} y={196} r={6} />
        <Pickles x={1888} y={58} />
        <Bubliki x={2250} y={64} />
        <Cutlery x={2612} y={186} r={-5} />

        {/* редкие веточки укропа — ритм, не мусор */}
        <Sprig x={470} y={70} r={24} />
        <Sprig x={1258} y={54} r={-30} />
        <Sprig x={1962} y={196} r={12} />
        <Sprig x={2706} y={58} r={-18} />
      </svg>
    </div>
  );
}
