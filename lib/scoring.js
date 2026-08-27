// Pure scoring functions. No I/O, no React, so these are trivial to unit test.
import { SCORED_QUESTIONS } from './quizData';

const AREA_QUESTION_IDS = {
  energy: SCORED_QUESTIONS.filter((q) => q.area === 'energy').map((q) => q.id),
  focus: SCORED_QUESTIONS.filter((q) => q.area === 'focus').map((q) => q.id),
  capacity: SCORED_QUESTIONS.filter((q) => q.area === 'capacity').map((q) => q.id),
};

const AREA_MAX = {
  energy: AREA_QUESTION_IDS.energy.length * 2, // 8
  focus: AREA_QUESTION_IDS.focus.length * 2, // 6
  capacity: AREA_QUESTION_IDS.capacity.length * 2, // 6
};

const TOTAL_MAX = AREA_MAX.energy + AREA_MAX.focus + AREA_MAX.capacity; // 20

function pct(raw, max) {
  return Math.round((raw / max) * 100);
}

function sumArea(answers, area) {
  return AREA_QUESTION_IDS[area].reduce((sum, id) => sum + (answers[id] ?? 0), 0);
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

// answers: { q1: 0|1|2, ..., q10: 0|1|2 }
export function computeScores(answers) {
  const energyRaw = sumArea(answers, 'energy');
  const focusRaw = sumArea(answers, 'focus');
  const capacityRaw = sumArea(answers, 'capacity');
  const totalRaw = energyRaw + focusRaw + capacityRaw;

  const areas = {
    energy: { raw: energyRaw, max: AREA_MAX.energy, pct: pct(energyRaw, AREA_MAX.energy) },
    focus: { raw: focusRaw, max: AREA_MAX.focus, pct: pct(focusRaw, AREA_MAX.focus) },
    capacity: { raw: capacityRaw, max: AREA_MAX.capacity, pct: pct(capacityRaw, AREA_MAX.capacity) },
  };

  // Lowest area gets "fix this first". Ties broken toward Energy, then Focus, then Capacity
  // (energy comes before clarity).
  const order = ['energy', 'focus', 'capacity'];
  let lowestArea = order[0];
  for (const area of order) {
    if (areas[area].pct < areas[lowestArea].pct) lowestArea = area;
  }

  return {
    totalRaw,
    totalMax: TOTAL_MAX,
    totalPct: pct(totalRaw, TOTAL_MAX),
    areas,
    lowestArea,
  };
}
