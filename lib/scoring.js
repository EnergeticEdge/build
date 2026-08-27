// Pure scoring functions. No I/O, no React, so these are trivial to unit test.
import { SCORED_QUESTIONS, DUAL_QUESTION, STATES } from './quizData';

const ENERGY_QUESTION_IDS = SCORED_QUESTIONS.filter((q) => q.area === 'energy').map((q) => q.id);
const FOCUS_QUESTION_IDS = SCORED_QUESTIONS.filter((q) => q.area === 'focus').map((q) => q.id);

// Q9 (DUAL_QUESTION) contributes 0-3 to *both* axes depending on which option was
// picked, on top of the four pure questions per axis. So each axis maxes at
// 4 * 3 (pure questions) + 3 (Q9's contribution) = 15.
const PURE_MAX_PER_AXIS = ENERGY_QUESTION_IDS.length * 3; // 12
const AXIS_MAX = PURE_MAX_PER_AXIS + 3; // 15

const DUAL_OPTIONS_BY_VALUE = Object.fromEntries(DUAL_QUESTION.options.map((o) => [o.value, o]));

function pct(raw, max) {
  return Math.round((raw / max) * 100);
}

function sumPure(answers, ids) {
  return ids.reduce((sum, id) => sum + (answers[id] ?? 0), 0);
}

function dualContribution(answers) {
  const picked = DUAL_OPTIONS_BY_VALUE[answers[DUAL_QUESTION.id]];
  return picked ? { energy: picked.energy, focus: picked.focus } : { energy: 0, focus: 0 };
}

// score band for the overall headline: high 70+, mid 40-69, low <40
export function scoreBand(percentage) {
  if (percentage >= 70) return 'high';
  if (percentage >= 40) return 'mid';
  return 'low';
}

// area band for insight copy: strong 70+, mixed 40-69, weak <40
export function areaBand(percentage) {
  if (percentage >= 70) return 'strong';
  if (percentage >= 40) return 'mixed';
  return 'weak';
}

// State is a quadrant of Energy x Focus, each split at the midpoint:
//   high energy, high focus -> Edge      (top-right)
//   high energy, low focus  -> Frantic   (top-left)
//   low energy, low focus   -> Fog       (bottom-left)
//   low energy, high focus  -> Blocked   (bottom-right)
function computeState(energyPct, focusPct) {
  const highEnergy = energyPct >= 50;
  const highFocus = focusPct >= 50;
  if (highEnergy && highFocus) return STATES.EDGE;
  if (highEnergy && !highFocus) return STATES.FRANTIC;
  if (!highEnergy && !highFocus) return STATES.FOG;
  return STATES.BLOCKED;
}

// answers: { q1: 0-3, ..., q8: 0-3, q9: 'sharp'|'crash'|'quiet'|'stuck' }
export function computeScores(answers) {
  const dual = dualContribution(answers);
  const energyRaw = sumPure(answers, ENERGY_QUESTION_IDS) + dual.energy;
  const focusRaw = sumPure(answers, FOCUS_QUESTION_IDS) + dual.focus;
  const totalRaw = energyRaw + focusRaw;
  const totalMax = AXIS_MAX * 2;

  const areas = {
    energy: { raw: energyRaw, max: AXIS_MAX, pct: pct(energyRaw, AXIS_MAX) },
    focus: { raw: focusRaw, max: AXIS_MAX, pct: pct(focusRaw, AXIS_MAX) },
  };

  // Lowest area gets "fix this first". Tie broken toward Energy (energy comes before clarity).
  const lowestArea = areas.energy.pct <= areas.focus.pct ? 'energy' : 'focus';

  return {
    totalRaw,
    totalMax,
    totalPct: pct(totalRaw, totalMax),
    areas,
    lowestArea,
    state: computeState(areas.energy.pct, areas.focus.pct),
  };
}
