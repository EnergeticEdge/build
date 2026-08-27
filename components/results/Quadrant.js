import { STATE_LABELS, STATES } from '@/lib/quizData';

const SIZE = 240;
const MID = SIZE / 2;

const QUADRANTS = [
  { state: STATES.FRANTIC, x: 0, y: 0 }, // top-left: high energy, low focus
  { state: STATES.EDGE, x: MID, y: 0 }, // top-right: high energy, high focus
  { state: STATES.FOG, x: 0, y: MID }, // bottom-left: low energy, low focus
  { state: STATES.BLOCKED, x: MID, y: MID }, // bottom-right: low energy, high focus
];

export default function Quadrant({ energyPct, focusPct, state }) {
  // Screen y is inverted: 0 at top (high energy), SIZE at bottom (low energy).
  const dotX = (focusPct / 100) * SIZE;
  const dotY = SIZE - (energyPct / 100) * SIZE;

  return (
    <div className="text-navy-700">
      <div className="flex items-center gap-2">
        <div
          className="relative shrink-0"
          style={{ width: SIZE, height: SIZE }}
          role="img"
          aria-label={`Energy ${energyPct}%, Focus ${focusPct}%, state: ${STATE_LABELS[state]}`}
        >
          <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
            {QUADRANTS.map((q) => (
              <rect
                key={q.state}
                x={q.x}
                y={q.y}
                width={MID}
                height={MID}
                fill={q.state === state ? 'rgba(255,106,0,0.12)' : '#f2f6fa'}
                stroke="#dbe4ee"
                strokeWidth={1}
              />
            ))}
            <line x1={MID} y1={0} x2={MID} y2={SIZE} stroke="#dbe4ee" strokeWidth={1} />
            <line x1={0} y1={MID} x2={SIZE} y2={MID} stroke="#dbe4ee" strokeWidth={1} />

            {QUADRANTS.map((q) => (
              <text
                key={`label-${q.state}`}
                x={q.x + MID / 2}
                y={q.y + MID / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fontFamily="var(--font-bebas), sans-serif"
                fontSize={q.state === state ? 20 : 16}
                fill={q.state === state ? '#ff6a00' : '#8598ac'}
              >
                {STATE_LABELS[q.state]}
              </text>
            ))}

            <circle cx={dotX} cy={dotY} r={7} fill="#0b3a6a" stroke="#ffffff" strokeWidth={2} />
          </svg>

          <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.12em] text-navy-300">
            High energy
          </span>
          <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.12em] text-navy-300">
            Low energy
          </span>
          <span className="absolute top-1/2 -left-2 -translate-x-full -translate-y-1/2 text-[10px] uppercase tracking-[0.12em] text-navy-300 [writing-mode:vertical-rl] rotate-180">
            Low focus
          </span>
          <span className="absolute top-1/2 -right-2 translate-x-full -translate-y-1/2 text-[10px] uppercase tracking-[0.12em] text-navy-300 [writing-mode:vertical-rl]">
            High focus
          </span>
        </div>
      </div>
    </div>
  );
}
