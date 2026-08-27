import { NextResponse } from 'next/server';
import { computeScores } from '@/lib/scoring';
import { insertLead, markBeehiivSynced, logEvent } from '@/lib/db';
import { ensureCustomFields, upsertSubscriber, AUTOMATION_TRIGGER_FIELD } from '@/lib/beehiiv';
import { SITE_URL } from '@/lib/config';
import { REVENUE_QUESTION, OUTCOME_QUESTION, OBSTACLE_QUESTION, NOTES_QUESTION } from '@/lib/quizData';

export async function POST(request) {
  const body = await request.json().catch(() => null);
  if (!body?.contact?.email || !body?.contact?.firstName || !body?.answers) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
  }
  if (body.contact.marketingConsent !== true) {
    return NextResponse.json({ error: 'consent_required' }, { status: 400 });
  }

  const { contact, answers } = body;
  const scores = computeScores(answers);
  const state = scores.state;

  const revenueBand = answers[REVENUE_QUESTION.id];
  const outcome90 = answers[OUTCOME_QUESTION.id];
  const obstacle = answers[OBSTACLE_QUESTION.id];
  const notesRaw = answers[NOTES_QUESTION.id];
  const notes = typeof notesRaw === 'string' ? notesRaw : '';

  let leadId;
  try {
    leadId = await insertLead({
      firstName: contact.firstName,
      email: contact.email,
      phone: contact.phone,
      answers,
      score: scores.totalPct,
      state,
      energyScore: scores.areas.energy.pct,
      focusScore: scores.areas.focus.pct,
      revenueBand,
      outcome90,
      obstacle,
      notes,
      marketingConsent: contact.marketingConsent,
      beehiivSynced: false,
    });
  } catch (err) {
    console.error('Failed to save lead to backup table:', err);
    return NextResponse.json({ error: 'save_failed' }, { status: 500 });
  }

  // Beehiiv is best-effort: the results page must render either way. Failures are
  // logged to the same row so they can be retried later.
  try {
    await ensureCustomFields();
    await upsertSubscriber({
      email: contact.email,
      firstName: contact.firstName,
      phone: contact.phone,
      customFields: {
        score: scores.totalPct,
        state,
        energy_score: scores.areas.energy.pct,
        focus_score: scores.areas.focus.pct,
        revenue_band: revenueBand,
        outcome_90: outcome90,
        obstacle,
        notes,
        marketing_consent: 'true',
        results_url: `${SITE_URL}/results/${leadId}`,
        [AUTOMATION_TRIGGER_FIELD]: 'true',
      },
    });
    await markBeehiivSynced(leadId, true);
  } catch (err) {
    console.error('Beehiiv sync failed for lead', leadId, err.message);
    await markBeehiivSynced(leadId, false, err.message).catch(() => {});
  }

  logEvent('quiz_complete', { leadId, state, score: scores.totalPct }).catch(() => {});

  return NextResponse.json({ id: leadId });
}
