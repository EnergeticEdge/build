// GoHighLevel (GHL) integration: posts a quiz completion to an inbound webhook so
// GHL can create/update the contact, tag it by state, and run the matching email
// sequence. Deliberately as simple as Beehiiv's client (lib/beehiiv.js) — one
// function, no SDK. Independent of Beehiiv: a failure here must never affect
// whether the other sync runs or whether the user sees their result (see
// app/api/quiz/submit/route.js, which calls this in its own try/catch).

// `source` is which funnel (feq-quiz / simpler-guide); `leadSource` is where the
// person came from before that (instagram-bio, linkedin-post, ...), with the raw
// UTM detail in `attribution`. See lib/attribution.js.
export async function sendToGHL({ email, firstName, phone, state, completedAt, source, leadSource, attribution }) {
  const url = process.env.GHL_WEBHOOK_URL;
  if (!url) throw new Error('GHL_WEBHOOK_URL is not set');

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      firstName,
      phone,
      state,
      completedAt,
      source,
      leadSource,
      utmSource: attribution?.utm_source || null,
      utmMedium: attribution?.utm_medium || null,
      utmCampaign: attribution?.utm_campaign || null,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`GHL webhook failed: ${res.status} ${body}`);
  }
}
