// Pure scoring functions. No I/O, no React, so these are trivial to unit test.
import { SCORED_QUESTIONS, STATES } from './quizData';

const ENERGY_QUESTION_IDS = SCORED_QUESTIONS.filter((q) => q.area === 'energy').map((q) => q.id);
const FOCUS_QUESTION_IDS = SCORED_QUESTIONS.filter((q) => q.area === 'focus').map((q) => q.id);
const AXIS_MAX = ENERGY_QUESTION_IDS.length * 3; // 24 (8 questions x 3)

function pct(raw, max) {
  return Math.round((raw / max) * 100);
}

function sum(answers, ids) {
  return ids.reduce((total, id) => total + (answers[id] ?? 0), 0);
}

function countZeros(answers, ids) {
  return ids.filter((id) => answers[id] === 0).length;
}

// State thresholds, matching the earlier HTML prototype exactly: Edge needs both
// axes at 18+ (75%) AND no question answered with the bottom option at all, which
// is a stricter bar than either axis threshold alone. Below that, whichever axis
// clears 14 (58%) decides Frantic (energy) vs Blocked (focus); if both or neither
// clear it, the higher axis wins the tie, and neither clearing it is Fog.
function computeState(energyRaw, focusRaw, zeros) {
  if (energyRaw >= 18 && focusRaw >= 18 && zeros === 0) return STATES.EDGE;
  if (energyRaw >= 14 && focusRaw >= 14) return focusRaw <= energyRaw ? STATES.FRANTIC : STATES.BLOCKED;
  if (energyRaw >= 14) return STATES.FRANTIC;
  if (focusRaw >= 14) return STATES.BLOCKED;
  return STATES.FOG;
}

// answers: { q1: 0-3, ..., q16: 0-3, ...qualifiers }
export function computeScores(answers) {
  const energyRaw = sum(answers, ENERGY_QUESTION_IDS);
  const focusRaw = sum(answers, FOCUS_QUESTION_IDS);
  const zeros = countZeros(answers, ENERGY_QUESTION_IDS) + countZeros(answers, FOCUS_QUESTION_IDS);
  const totalRaw = energyRaw + focusRaw;
  const totalMax = AXIS_MAX * 2;

  const areas = {
    energy: { raw: energyRaw, max: AXIS_MAX, pct: pct(energyRaw, AXIS_MAX) },
    focus: { raw: focusRaw, max: AXIS_MAX, pct: pct(focusRaw, AXIS_MAX) },
  };

  // Lowest area gets "fix this first" if that's ever surfaced again. Tie broken
  // toward Energy (energy comes before clarity).
  const lowestArea = areas.energy.pct <= areas.focus.pct ? 'energy' : 'focus';

  return {
    totalRaw,
    totalMax,
    totalPct: pct(totalRaw, totalMax),
    areas,
    lowestArea,
    state: computeState(energyRaw, focusRaw, zeros),
  };
}
