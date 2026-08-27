import { STATE_LABELS, STATES } from '@/lib/quizData';

// A static explainer of where the four states sit relative to each other. No score,
// no position marker: just which quadrant the founder landed in, highlighted.
const SIZE = 240;
const MID = SIZE / 2;
const EDGE_CUT = SIZE * 0.7;

export default function Quadrant({ state }) {
  const activeFill = 'rgba(255,106,0,0.14)';
  const fillFor = (s) => (s === state ? activeFill : '#f2f6fa');

  return (
    <div
      className="relative shrink-0 mx-auto"
      style={{ width: SIZE, height: SIZE }}
      role="img"
      aria-label={`Your state: ${STATE_LABELS[state]}`}
    >
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        {/* Frantic occupies the whole top half, except the Edge corner carved out
            of its top-right: Edge is a higher bar than just clearing the midpoint. */}
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
      </svg>

      <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.12em] text-navy-300">
        More energy
      </span>
      <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.12em] text-navy-300">
        Less energy
      </span>
      <span className="absolute top-1/2 -left-2 -translate-x-full -translate-y-1/2 text-[10px] uppercase tracking-[0.12em] text-navy-300 [writing-mode:vertical-rl] rotate-180">
        Less focus
      </span>
      <span className="absolute top-1/2 -right-2 translate-x-full -translate-y-1/2 text-[10px] uppercase tracking-[0.12em] text-navy-300 [writing-mode:vertical-rl]">
        More focus
      </span>
    </div>
  );
}
