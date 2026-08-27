import { STATE_LABELS, STATES } from '@/lib/quizData';

// A static explainer of the four states, evenly laid out. No score, no position
// marker, just which one applies, highlighted. (Edge actually needs a stricter
// bar than the other three to reach: see lib/scoring.js. Now that nothing is
// plotted by position, that detail doesn't need to show up in the shape.)
const CELLS = [
  { state: STATES.FRANTIC, col: 1, row: 1 },
  { state: STATES.EDGE, col: 2, row: 1 },
  { state: STATES.FOG, col: 1, row: 2 },
  { state: STATES.BLOCKED, col: 2, row: 2 },
];

export default function Quadrant({ state }) {
  return (
    <div className="mx-auto w-full max-w-[280px]">
      <div className="flex items-center justify-center pb-2 pl-9">
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-300">More energy</span>
      </div>

      <div className="flex items-stretch gap-2">
        <div className="flex w-5 shrink-0 items-center justify-center">
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-300 [writing-mode:vertical-rl] rotate-180 whitespace-nowrap">
            Less focus
          </span>
        </div>

        <div className="grid flex-1 grid-cols-2 grid-rows-2 gap-2.5">
          {CELLS.map((cell) => {
            const active = cell.state === state;
            return (
              <div
                key={cell.state}
                className={`flex aspect-square items-center justify-center rounded-2xl border transition-colors ${
                  active
                    ? 'border-orange bg-orange/10'
                    : 'border-navy-100 bg-navy-50'
                }`}
              >
                <span
                  className={`font-display text-lg tracking-wide sm:text-xl ${
                    active ? 'text-orange' : 'text-navy-300'
                  }`}
                >
                  {STATE_LABELS[cell.state]}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex w-5 shrink-0 items-center justify-center">
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-300 [writing-mode:vertical-rl] whitespace-nowrap">
            More focus
          </span>
        </div>
      </div>

      <div className="flex items-center justify-center pt-2 pl-9">
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-300">Less energy</span>
      </div>
    </div>
  );
}
