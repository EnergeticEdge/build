// Central place for anything that isn't copy: thresholds, links, pricing.
// Change values here rather than in components.

export const REVENUE_BANDS = {
  PRE_REVENUE: 'pre_revenue',
  UNDER_100K: 'under_100k',
  BAND_100_250K: '100_250k',
  BAND_250K_1M: '250k_1m',
  OVER_1M: 'over_1m',
};

export const REVENUE_BAND_OPTIONS = [
  { value: REVENUE_BANDS.PRE_REVENUE, label: 'Pre-revenue' },
  { value: REVENUE_BANDS.UNDER_100K, label: 'Under £100k' },
  { value: REVENUE_BANDS.BAND_100_250K, label: '£100k – £250k' },
  { value: REVENUE_BANDS.BAND_250K_1M, label: '£250k – £1m' },
  { value: REVENUE_BANDS.OVER_1M, label: 'Over £1m' },
];

// Which "door" a revenue band sees first on the results page.
// 'call_first': free call is primary CTA, calendar embedded on page.
// 'guide_first': SIMPLER Guide + newsletter are primary, call is still offered below.
export function nextStepsDoor(revenueBand) {
  if (
    revenueBand === REVENUE_BANDS.BAND_250K_1M ||
    revenueBand === REVENUE_BANDS.OVER_1M ||
    revenueBand === REVENUE_BANDS.BAND_100_250K
  ) {
    return 'call_first';
  }
  return 'guide_first';
}

// £100k-£250k also shows the newsletter alongside the guide as a secondary, per spec.
export function showNewsletterSecondary(revenueBand) {
  return (
    revenueBand === REVENUE_BANDS.BAND_100_250K ||
    revenueBand === REVENUE_BANDS.UNDER_100K ||
    revenueBand === REVENUE_BANDS.PRE_REVENUE
  );
}

export const LINKS = {
  // LeadConnector/GHL calendar booking widget for the free 30-minute call.
  calendarEmbed: 'https://api.leadconnectorhq.com/widget/booking/SSKEKGUBLIw7Qt1oNWt5',
  newsletter: 'https://www.thecapacitygap.beehiiv.com',
  // No SIMPLER Guide link supplied yet. Leave null — CTAs that need it hide themselves
  // until this is set. See TODO.md.
  guide: null,
};

export const CALL_COPY =
  "You've earned a 30-minute call with Keith. Normally £197. Free because you finished the quiz. He'll read your results before you speak and give you one focused action.";

// State video embed slots. All placeholders until Keith supplies the four cuts.
export const STATE_VIDEOS = {
  edge: null,
  frantic: null,
  fog: null,
  blocked: null,
};

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
