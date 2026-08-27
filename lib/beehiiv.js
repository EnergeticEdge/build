// Beehiiv API v2 client, scoped to what the quiz needs: create/update a subscriber
// with custom fields attached, plus provisioning those custom fields once.
//
// NOTE ON CONFIDENCE: developer.beehiiv.com was unreachable from this environment
// (network egress blocked), so this was built from beehiiv's own help-centre articles
// and search results rather than the live API reference. The shape below (POST
// /v2/publications/{id}/subscriptions with custom_fields: [{name, value}], custom
// fields must already exist server-side or the values are silently dropped) is
// consistent across every source found. Verify against developers.beehiiv.com
// before relying on this in production — see TODO.md.

const BASE_URL = 'https://api.beehiiv.com/v2';

// Custom fields this integration needs on the publication. Kind follows beehiiv's
// custom-field types (string | number). Created once, on first use, if missing.
const REQUIRED_CUSTOM_FIELDS = [
  { name: 'score', kind: 'number' },
  { name: 'state', kind: 'string' },
  { name: 'energy_score', kind: 'number' },
  { name: 'focus_score', kind: 'number' },
  { name: 'capacity_score', kind: 'number' },
  { name: 'revenue_band', kind: 'string' },
  { name: 'outcome_90', kind: 'string' },
  { name: 'obstacle', kind: 'string' },
  { name: 'notes', kind: 'string' },
  { name: 'results_url', kind: 'string' },
  // Boolean-ish flag used as the Beehiiv automation trigger for the quiz sequence
  // (see AUTOMATION_TRIGGER_FIELD below). Beehiiv confirmed they'd need to build
  // the "tag added" automation in their dashboard against this field.
  { name: 'quiz_completed', kind: 'string' },
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
  const existingNames = new Set((existing?.data || []).map((f) => f.display_name || f.name));

  for (const field of REQUIRED_CUSTOM_FIELDS) {
    if (existingNames.has(field.name)) continue;
    try {
      await beehiivFetch(`/publications/${pubId}/custom_fields`, {
        method: 'POST',
        body: JSON.stringify({ display_name: field.name, kind: field.kind }),
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
    ...(firstName ? [{ name: 'First Name', value: firstName }] : []),
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
