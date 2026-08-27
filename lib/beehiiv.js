// Beehiiv API v2 client, scoped to what the quiz needs: create/update a subscriber
// with custom fields attached, plus provisioning those custom fields once.
//
// Custom field creation (kind enum, the `display` param name) was corrected against
// a real 400 response from the live API after the first production deploy — the
// initial guess (built from help-centre articles, since developers.beehiiv.com was
// unreachable at build time) had the wrong param name and an invalid kind value.
// The subscriber creation shape (custom_fields: [{name, value}], fields must already
// exist or the values are silently dropped) has not produced an error and matches
// beehiiv's own custom-field list response.

const BASE_URL = 'https://api.beehiiv.com/v2';

// Custom fields this integration needs on the publication. Kind follows beehiiv's
// actual custom-field types: string | integer | boolean | date | datetime | list.
// Created once, on first use, if missing.
const REQUIRED_CUSTOM_FIELDS = [
  { name: 'score', kind: 'integer' },
  { name: 'state', kind: 'string' },
  { name: 'energy_score', kind: 'integer' },
  { name: 'focus_score', kind: 'integer' },
  { name: 'revenue_band', kind: 'string' },
  { name: 'outcome_90', kind: 'string' },
  { name: 'obstacle', kind: 'string' },
  { name: 'notes', kind: 'string' },
  { name: 'results_url', kind: 'string' },
  { name: 'phone', kind: 'string' },
  { name: 'marketing_consent', kind: 'boolean' },
  // Flag used as the Beehiiv automation trigger for the quiz sequence (see
  // AUTOMATION_TRIGGER_FIELD below). The automation itself still needs to be
  // built in the Beehiiv dashboard against this field.
  { name: 'quiz_completed', kind: 'boolean' },
];

export const AUTOMATION_TRIGGER_FIELD = 'quiz_completed';

function authHeaders() {
  const key = process.env.BEEHIIV_API_KEY;
  if (!key) throw new Error('BEEHIIV_API_KEY is not set');
  return {
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
  };
}

function publicationId() {
  const id = process.env.BEEHIIV_PUBLICATION_ID;
  if (!id) throw new Error('BEEHIIV_PUBLICATION_ID is not set');
  return id;
}

async function beehiivFetch(path, options) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { ...authHeaders(), ...(options?.headers || {}) },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Beehiiv ${options?.method || 'GET'} ${path} failed: ${res.status} ${body}`);
  }
  return res.status === 204 ? null : res.json();
}

let ensured = false;

// Idempotent. Lists existing custom fields and creates whichever of
// REQUIRED_CUSTOM_FIELDS are missing. Safe to call on every request; only does
// network work the first time per server process.
export async function ensureCustomFields() {
  if (ensured) return;
  const pubId = publicationId();
  const existing = await beehiivFetch(`/publications/${pubId}/custom_fields?limit=100`, { method: 'GET' });
  const existingNames = new Set((existing?.custom_fields || existing?.data || []).map((f) => f.name));

  for (const field of REQUIRED_CUSTOM_FIELDS) {
    if (existingNames.has(field.name)) continue;
    try {
      await beehiivFetch(`/publications/${pubId}/custom_fields`, {
        method: 'POST',
        body: JSON.stringify({ display: field.name, kind: field.kind }),
      });
    } catch (err) {
      // Don't let a provisioning race (field created by another request) block the request.
      console.error('Beehiiv custom field provisioning failed for', field.name, err.message);
    }
  }
  ensured = true;
}

export async function upsertSubscriber({ email, firstName, phone, customFields }) {
  const pubId = publicationId();

  const custom_fields = [
    ...(firstName ? [{ name: 'first_name', value: firstName }] : []),
    ...(phone ? [{ name: 'phone', value: phone }] : []),
    ...Object.entries(customFields || {})
      .filter(([, value]) => value !== undefined && value !== null && value !== '')
      .map(([name, value]) => ({ name, value: String(value) })),
  ];

  return beehiivFetch(`/publications/${pubId}/subscriptions`, {
    method: 'POST',
    body: JSON.stringify({
      email,
      reactivate_existing: true,
      send_welcome_email: false,
      utm_source: 'founder-energy-quiz',
      custom_fields,
    }),
  });
}
