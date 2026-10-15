// Lead source attribution: where did this person come from before they took the
// quiz or downloaded the guide?
//
// Two signals, in order of trust:
//   1. Tagged links. `?src=instagram-bio` (short, for Keith to type) or the
//      standard `utm_source` / `utm_medium` / `utm_campaign`. Reliable.
//   2. The referrer header. A fallback for untagged links. Patchy in practice:
//      Instagram and LinkedIn's in-app browsers often strip it, so an untagged
//      click usually lands as 'direct'.
//
// Captured on whichever page they land on (AttributionCapture in the root
// layout) and kept in localStorage, because people often land on `/`, read, and
// only start the quiz later. A new tagged link overwrites what's stored; a bare
// visit never overwrites a tagged one.

const STORAGE_KEY = 'tee_attribution';
const PARAM_KEYS = ['src', 'utm_source', 'utm_medium', 'utm_campaign'];
const MAX_LEN = 100;

// Referrer hostnames mapped to a readable source. Anything else external is
// recorded as its bare hostname.
const REFERRER_SOURCES = [
  [/(^|\.)instagram\.com$/, 'instagram'],
  [/(^|\.)linkedin\.com$|^lnkd\.in$/, 'linkedin'],
  [/(^|\.)facebook\.com$|^fb\.me$/, 'facebook'],
  [/(^|\.)beehiiv\.com$/, 'newsletter'],
  [/(^|\.)google\.[a-z.]+$/, 'google'],
];

function referrerSource(referrer) {
  if (!referrer) return null;
  let host;
  try {
    host = new URL(referrer).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
  if (typeof window !== 'undefined' && host === window.location.hostname.replace(/^www\./, '')) {
    return null;
  }
  const match = REFERRER_SOURCES.find(([pattern]) => pattern.test(host));
  return match ? match[1] : host;
}

// Client only. Safe to call on every page load.
export function captureAttribution() {
  if (typeof window === 'undefined') return;
  const params = new URLSearchParams(window.location.search);
  const tagged = {};
  for (const key of PARAM_KEYS) {
    const value = params.get(key);
    if (value) tagged[key] = value;
  }

  let stored = null;
  try {
    stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || 'null');
  } catch {
    // Private mode or blocked storage: fall through and just don't persist.
  }

  let next = null;
  if (Object.keys(tagged).length > 0) {
    next = { ...tagged, landing: window.location.pathname };
  } else if (!stored) {
    const fromReferrer = referrerSource(document.referrer);
    if (fromReferrer) next = { referrer: fromReferrer, landing: window.location.pathname };
  }

  if (next) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...next, at: new Date().toISOString() }));
    } catch {
      // Ignore: the current page's URL is still read directly by getAttribution.
    }
  }
}

// Client only. What to send with a form submission.
export function getAttribution() {
  if (typeof window === 'undefined') return null;
  try {
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || 'null');
    if (stored) return stored;
  } catch {
    // Fall through.
  }
  // Storage unavailable: use whatever is on the current URL.
  const params = new URLSearchParams(window.location.search);
  const fromUrl = {};
  for (const key of PARAM_KEYS) {
    const value = params.get(key);
    if (value) fromUrl[key] = value;
  }
  return Object.keys(fromUrl).length > 0 ? fromUrl : null;
}

function clean(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim().slice(0, MAX_LEN);
  return trimmed || null;
}

// Server side. Takes whatever the browser sent and returns a sanitised record
// plus a single `source` label for CRMs: src, else utm_source, else referrer,
// else 'direct'.
export function normaliseAttribution(raw) {
  const input = raw && typeof raw === 'object' ? raw : {};
  const attribution = {
    src: clean(input.src),
    utm_source: clean(input.utm_source),
    utm_medium: clean(input.utm_medium),
    utm_campaign: clean(input.utm_campaign),
    referrer: clean(input.referrer),
    landing: clean(input.landing),
  };
  const source = (attribution.src || attribution.utm_source || attribution.referrer || 'direct').toLowerCase();
  return { source, attribution };
}
