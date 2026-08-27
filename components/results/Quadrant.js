import { STATE_LABELS, STATES } from '@/lib/quizData';

const SIZE = 240;
const MID = SIZE / 2; // the 50% line
const EDGE_CUT = SIZE * 0.7; // the 70% line, where Edge's stricter bar kicks in

const FILL = {
  [STATES.FRANTIC]: '#f2f6fa',
  [STATES.FOG]: '#f2f6fa',
  [STATES.BLOCKED]: '#f2f6fa',
  [STATES.EDGE]: '#f2f6fa',
};

function pctToX(pct) {
  return (pct / 100) * SIZE;
}
function pctToY(pct) {
  return SIZE - (pct / 100) * SIZE;
}

export default function Quadrant({ energyPct, focusPct, state }) {
  const dotX = pctToX(focusPct);
  const dotY = pctToY(energyPct);

  const activeFill = 'rgba(255,106,0,0.14)';
  const fillFor = (s) => (s === state ? activeFill : FILL[s]);

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
            {/* Frantic occupies the whole top half (energy >=50), except the Edge
                corner carved out of its top-right, since Edge needs 70+ on both
                axes rather than just clearing the 50% midpoint. */}
            <rect x={0} y={0} width={SIZE} height={MID} fill={fillFor(STATES.FRANTIC)} stroke="#dbe4ee" strokeWidth={1} />
            <rect x={0} y={MID} width={MID} height={MID} fill={fillFor(STATES.FOG)} stroke="#dbe4ee" strokeWidth={1} />
            <rect x={MID} y={MID} width={MID} height={MID} fill={fillFor(STATES.BLOCKED)} stroke="#dbe4ee" strokeWidth={1} />
            <rect
              x={EDGE_CUT}
              y={0}
              width={SIZE - EDGE_CUT}
              height={SIZE - EDGE_CUT}
              fill={fillFor(STATES.EDGE)}
              stroke="#dbe4ee"
              strokeWidth={1}
            />

            <text x={MID / 2} y={MID / 2 + 6} textAnchor="middle" fontFamily="var(--font-bebas), sans-serif" fontSize={state === STATES.FRANTIC ? 20 : 16} fill={state === STATES.FRANTIC ? '#ff6a00' : '#8598ac'}>
              {STATE_LABELS[STATES.FRANTIC]}
            </text>
            <text x={(EDGE_CUT + SIZE) / 2} y={(SIZE - EDGE_CUT) / 2 + 5} textAnchor="middle" fontFamily="var(--font-bebas), sans-serif" fontSize={state === STATES.EDGE ? 18 : 14} fill={state === STATES.EDGE ? '#ff6a00' : '#8598ac'}>
              {STATE_LABELS[STATES.EDGE]}
            </text>
            <text x={MID / 2} y={MID + MID / 2 + 6} textAnchor="middle" fontFamily="var(--font-bebas), sans-serif" fontSize={state === STATES.FOG ? 20 : 16} fill={state === STATES.FOG ? '#ff6a00' : '#8598ac'}>
              {STATE_LABELS[STATES.FOG]}
            </text>
            <text x={MID + MID / 2} y={MID + MID / 2 + 6} textAnchor="middle" fontFamily="var(--font-bebas), sans-serif" fontSize={state === STATES.BLOCKED ? 20 : 16} fill={state === STATES.BLOCKED ? '#ff6a00' : '#8598ac'}>
              {STATE_LABELS[STATES.BLOCKED]}
            </text>

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
