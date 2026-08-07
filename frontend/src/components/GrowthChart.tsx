/**
 * Само-рисующийся график роста вверх и вправо (для инвесторского раздела).
 * Анимация запускается, когда родительский .reveal получает класс .in.
 */
export function GrowthChart() {
  // точки роста (условные, иллюстративные) в координатах viewBox 0..560 x 0..240
  const pts = [
    [20, 210],
    [110, 188],
    [200, 196],
    [290, 150],
    [380, 120],
    [470, 70],
    [540, 28],
  ];
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`).join(" ");
  const area = `${line} L 540 240 L 20 240 Z`;

  return (
    <svg viewBox="0 0 560 240" className="h-auto w-full" role="img" aria-label="growth">
      <defs>
        <linearGradient id="growthFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.35)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>

      {/* сетка */}
      {[60, 120, 180].map((y) => (
        <line key={y} x1="20" y1={y} x2="540" y2={y} stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
      ))}

      {/* заливка под линией */}
      <path d={area} fill="url(#growthFill)" opacity="0.9" />

      {/* линия роста — рисуется сама */}
      <path className="draw-line" d={line} fill="none" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

      {/* точки */}
      {pts.map((p, i) => (
        <circle
          key={i}
          className="chart-dot"
          style={{ animationDelay: `${0.9 + i * 0.12}s`, transformOrigin: `${p[0]}px ${p[1]}px` }}
          cx={p[0]}
          cy={p[1]}
          r={i === pts.length - 1 ? 7 : 4}
          fill="#fff"
        />
      ))}
    </svg>
  );
}
