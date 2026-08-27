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

// State is a quadrant of Energy x Focus. Edge is deliberately harder to reach
// than the other three: it needs both axes at 70%+ (matching the "strong" band
// used elsewhere), not just both above the 50% midpoint, so a middling 51/51
// doesn't read as the best possible result. Frantic/Fog/Blocked still split at
// the midpoint. A founder who clears 50 on both axes but not 70 on both isn't
// Edge yet, and defaults to Frantic (energy is there, just not dialled in).
//   energy >=70, focus >=70 -> Edge      (top-right, high bar)
//   energy >=50, focus <50  -> Frantic   (top-left, and the "almost Edge" case)
//   energy <50,  focus <50  -> Fog       (bottom-left)
//   energy <50,  focus >=50 -> Blocked   (bottom-right)
function computeState(energyPct, focusPct) {
  if (energyPct >= 70 && focusPct >= 70) return STATES.EDGE;
  const highEnergy = energyPct >= 50;
  const highFocus = focusPct >= 50;
  if (!highEnergy && !highFocus) return STATES.FOG;
  if (!highEnergy && highFocus) return STATES.BLOCKED;
  // highEnergy is true here: either genuinely Frantic (low focus), or the
  // near-Edge pocket (high energy, high focus, but under 70 on one or both).
  return STATES.FRANTIC;
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
