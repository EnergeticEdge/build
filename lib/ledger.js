// The Capacity Ledger: pure calculation and reading copy, shared by the page
// (live running total) and the submit route (which recomputes from the raw
// inputs rather than trusting totals sent by the browser).

export const LEDGER_DEFAULTS = {
  a1: 0, a2: 0, a3: 30,
  b1: 0, b2: 0, b3: 5,
  c1: 0, c2: 55, c3: 0,
  d1: 0, d2: 0,
  e1: 0, e2: 0, e3: 0, e4: 0,
};

export const LEDGER_FIELDS = Object.keys(LEDGER_DEFAULTS);

// Weeks in the ledger's 90-day window, and working weeks in a year for the
// hourly rate. Both are assumptions surfaced in the page copy.
const WEEKS = 13;
const WORKING_WEEKS = 46;

export function gbp(n) {
  if (!isFinite(n)) n = 0;
  return '£' + Math.round(n).toLocaleString('en-GB');
}

function num(v) {
  const n = parseFloat(v);
  return isFinite(n) && n > 0 ? n : 0;
}

// Keeps only known fields, coerced to non-negative numbers. Used server-side
// on whatever the browser posted.
export function cleanInputs(raw) {
  const out = {};
  for (const key of LEDGER_FIELDS) out[key] = num(raw?.[key]);
  return out;
}

export function calcLedger(raw) {
  const v = cleanInputs(raw);

  const e1 = v.a1 * v.a2 * (v.a3 / 100);
  const e2 = v.b1 * v.b2 * (v.b3 / 100);

  const hoursPerWeek = v.c2 || 55;
  const hourly = v.c1 > 0 ? v.c1 / (hoursPerWeek * WORKING_WEEKS) : 0;
  const e3 = hourly * v.c3 * WEEKS;

  const e4 = v.d1 + v.d2;
  const total = e1 + e2 + e3 + e4;

  // Entry 05: four readings, no total.
  const touched = v.e1 > 0 || v.e2 > 0 || v.e3 > 0 || v.e4 > 0;
  let flags = 0;
  if (v.e1 > 0 && v.e1 < 6.5) flags++;
  if (v.e2 > 30) flags++;
  if (v.e3 > 4) flags++;
  if (v.e4 > 4) flags++;

  return {
    entries: [e1, e2, e3, e4],
    hourly,
    total,
    annual: total * 4,
    touched,
    flags,
    condition: conditionFor(touched, flags),
  };
}

function conditionFor(touched, flags) {
  if (!touched) return { word: 'Not costed', key: 'not_costed' };
  if (flags === 0) return { word: 'Holding', key: 'holding' };
  if (flags === 1) return { word: 'One reading hot', key: 'one_hot' };
  if (flags === 2) return { word: 'Running on reserves', key: 'reserves' };
  return { word: 'Running on empty', key: 'empty' };
}

export const CONDITION_NOTES = {
  not_costed: {
    lead: 'This entry has no total.',
    body: "It has never been on anyone's balance sheet, which is roughly why it keeps producing the four above.",
  },
  holding: {
    lead: 'Nothing here is flashing.',
    body: 'Which means the four entries above are a structure problem, not a state problem, and you should fix the structure. Come back to this line when the readings change.',
  },
  one_hot: {
    lead: 'One of four is running hot.',
    body: 'On its own that is a bad month. Watch whether it is still true in six weeks, because this is the line that moves first and gets noticed last.',
  },
  reserves: {
    lead: 'Half the readings are hot.',
    body: 'You are still delivering, which is exactly why nobody has said anything, including you. The four entries above are what that costs.',
  },
  empty: {
    lead: 'Three or more readings are hot.',
    body: 'Every figure you entered above was produced by an operator in this condition. Fixing the systems without fixing the operator gives you better systems, run by the same tired man.',
  },
};

export function verdictLine(total) {
  if (total <= 0) return 'Fill in the ledger and a reading will appear here.';
  if (total < 5000) {
    return 'Under £5,000 across 90 days. Either your systems are holding, or you have been generous with yourself. Try entry 03 again and count the interruptions honestly.';
  }
  if (total < 25000) {
    return `${gbp(total)} in 90 days. That is a leak, not a flood. It is also the stage where it is cheapest to fix, and the stage almost nobody fixes it.`;
  }
  if (total < 75000) {
    return `${gbp(total)} in 90 days, which is ${gbp(total * 4)} a year. That is a salary. You are currently paying it to nobody.`;
  }
  return `${gbp(total)} in 90 days. At that rate the constraint in this business is not the market, the team or the strategy. It is the capacity of one person, and it is now the most expensive line in your accounts.`;
}

export function verdictSub(total, touched, flags) {
  if (total > 0 && touched && flags >= 2) {
    return 'Four costed entries and one that never gets costed. The same instrument produced all five. That is the finding, and no amount of process will change it on its own.';
  }
  if (total > 0 && touched) {
    return 'Four entries with a pound sign and one without. Note which one has never appeared in a set of accounts, and which one produced the rest.';
  }
  return 'Every figure above is your estimate. This is not an audit. It is an argument you can take to your own board, your partner, or yourself.';
}

export function whatItBuys(total, hourly) {
  return [
    { what: 'Weeks of a full-time operations hire at £45k', fig: `${Math.floor(total / (45000 / 52))} weeks` },
    { what: 'Months of a fractional finance director at £2,000', fig: `${Math.floor(total / 2000)} months` },
    {
      what: 'Days of your own time, back',
      fig: hourly > 0 ? `${Math.floor(total / hourly / 8)} days` : 'Add your revenue',
    },
  ];
}
