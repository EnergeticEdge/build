import { STATE_LABELS, STATES } from '@/lib/quizData';

// Static explainer of the four states as a 2x2 grid of separate rounded tiles
// with a gutter between them, rather than one filled grid with lines drawn over
// it — reads as four cards, not a spreadsheet. No score, no position marker; the
// gap itself marks the axes. State is null on the landing page teaser, where
// every tile stays muted.
const GAP = 14;
const BOUNDS = { x: 70, y: 20, size: 280 };
const TILE = (BOUNDS.size - GAP) / 2;

const QUADRANTS = [
  { key: STATES.FRANTIC, x: BOUNDS.x, y: BOUNDS.y },
  { key: STATES.EDGE, x: BOUNDS.x + TILE + GAP, y: BOUNDS.y },
  { key: STATES.FOG, x: BOUNDS.x, y: BOUNDS.y + TILE + GAP },
  { key: STATES.BLOCKED, x: BOUNDS.x + TILE + GAP, y: BOUNDS.y + TILE + GAP },
];

export default function Quadrant({ state }) {
  return (
    <svg
      className="quad-svg"
      viewBox="0 0 380 340"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={state ? `Your state: ${STATE_LABELS[state]}` : 'Focus Energy Quadrant'}
    >
      <defs>
        <linearGradient id="quadActiveFill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ff8a3d" />
          <stop offset="100%" stopColor="#ff6a00" />
        </linearGradient>
        <filter id="quadActiveGlow" x="-60%" y="-60%" width="220%" height="220%">
          <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#ff6a00" floodOpacity="0.4" />
        </filter>
      </defs>

      {QUADRANTS.map((q) => {
        const isActive = q.key === state;
        const cx = q.x + TILE / 2;
        const cy = q.y + TILE / 2;
        return (
          <g key={q.key} filter={isActive ? 'url(#quadActiveGlow)' : undefined}>
            <rect
              x={q.x}
              y={q.y}
              width={TILE}
              height={TILE}
              rx={18}
              fill={isActive ? 'url(#quadActiveFill)' : 'rgba(255,255,255,0.04)'}
              stroke={isActive ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)'}
              strokeWidth={1}
            />
            <text
              x={cx}
              y={cy + (isActive ? 9 : 8)}
              textAnchor="middle"
              fontSize={isActive ? 23 : 18}
              letterSpacing={1}
              className={isActive ? 'quad-name-active' : 'quad-name-muted'}
            >
              {STATE_LABELS[q.key]}
            </text>
          </g>
        );
      })}

      <text x={70} y={320} fontSize={10} className="quad-axis-label">LOW</text>
      <text x={350} y={320} textAnchor="end" fontSize={10} className="quad-axis-label">HIGH</text>
      <text x={210} y={335} textAnchor="middle" fontSize={11} letterSpacing={2} className="quad-axis-label">FOCUS</text>
      <text x={18} y={26} fontSize={10} className="quad-axis-label">HIGH</text>
      <text x={18} y={304} fontSize={10} className="quad-axis-label">LOW</text>
      <text
        x={14}
        y={160}
        textAnchor="middle"
        fontSize={11}
        letterSpacing={2}
        className="quad-axis-label"
        transform="rotate(-90 14 160)"
      >
        ENERGY
      </text>
    </svg>
  );
}
