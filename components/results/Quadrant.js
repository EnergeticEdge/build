import { STATE_LABELS, STATES } from '@/lib/quizData';

// Static explainer of the four states as a 2x2 grid. No score, no position marker,
// just which quadrant applies (or none, for the landing page teaser where
// state is null and every box stays muted).
const QUADRANTS = [
  { key: STATES.FRANTIC, x: 70, y: 20 },
  { key: STATES.EDGE, x: 210, y: 20 },
  { key: STATES.FOG, x: 70, y: 160 },
  { key: STATES.BLOCKED, x: 210, y: 160 },
];
const QUAD_W = 140;
const QUAD_H = 140;

export default function Quadrant({ state }) {
  return (
    <svg
      className="quad-svg"
      viewBox="0 0 380 340"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={state ? `Your state: ${STATE_LABELS[state]}` : 'Focus Energy Quadrant'}
    >
      {QUADRANTS.map((q) => {
        const isActive = q.key === state;
        const cx = q.x + QUAD_W / 2;
        const cy = q.y + QUAD_H / 2;
        return (
          <g key={q.key}>
            <rect
              x={q.x}
              y={q.y}
              width={QUAD_W}
              height={QUAD_H}
              fill={isActive ? 'var(--orange)' : 'var(--navy)'}
            />
            <text
              x={cx}
              y={cy + 8}
              textAnchor="middle"
              fontSize={20}
              letterSpacing={1}
              className={isActive ? 'quad-name-active' : 'quad-name-muted'}
            >
              {STATE_LABELS[q.key]}
            </text>
          </g>
        );
      })}

      <line x1={70} y1={20} x2={350} y2={20} stroke="rgba(255,255,255,0.18)" strokeWidth={1} />
      <line x1={70} y1={300} x2={350} y2={300} stroke="rgba(255,255,255,0.18)" strokeWidth={1} />
      <line x1={70} y1={20} x2={70} y2={300} stroke="rgba(255,255,255,0.18)" strokeWidth={1} />
      <line x1={350} y1={20} x2={350} y2={300} stroke="rgba(255,255,255,0.18)" strokeWidth={1} />
      <line x1={210} y1={20} x2={210} y2={300} stroke="rgba(255,255,255,0.18)" strokeWidth={1} />
      <line x1={70} y1={160} x2={350} y2={160} stroke="rgba(255,255,255,0.18)" strokeWidth={1} />

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
