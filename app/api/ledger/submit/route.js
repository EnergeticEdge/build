import { NextResponse } from 'next/server';
import { insertLedgerEntry, markLedgerEntryBeehiivSynced, logEvent } from '@/lib/db';
import { ensureCustomFields, upsertSubscriber } from '@/lib/beehiiv';
import { sendToGHL } from '@/lib/ghl';
import { calcLedger, cleanInputs } from '@/lib/ledger';

export async function POST(request) {
  const body = await request.json().catch(() => null);
  if (!body?.email || !body?.firstName) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
  }
  if (body.marketingConsent !== true) {
    return NextResponse.json({ error: 'consent_required' }, { status: 400 });
  }

  const { firstName, email, marketingConsent } = body;
  // Recomputed here from the raw inputs rather than trusting totals from the browser.
  const inputs = cleanInputs(body.inputs);
  const result = calcLedger(inputs);
  const total90 = Math.round(result.total);
  const annual = Math.round(result.annual);
  const condition = result.condition.key;

  let entryId;
  try {
    entryId = await insertLedgerEntry({ firstName, email, marketingConsent, inputs, total90, annual, condition });
  } catch (err) {
    console.error('Failed to save ledger entry to backup table:', err);
    return NextResponse.json({ error: 'save_failed' }, { status: 500 });
  }

  // Beehiiv and GHL are both best-effort, same independence as the quiz and the
  // guide: the founder sees their reading either way.
  try {
    await ensureCustomFields();
    await upsertSubscriber({
      email,
      firstName,
      customFields: {
        marketing_consent: 'true',
        ledger_completed: 'true',
        ledger_total_90: total90,
        ledger_annual: annual,
        ledger_condition: condition,
      },
    });
    await markLedgerEntryBeehiivSynced(entryId, true);
  } catch (err) {
    console.error('Beehiiv sync failed for ledger entry', entryId, err.message);
    await markLedgerEntryBeehiivSynced(entryId, false, err.message).catch(() => {});
  }

  try {
    await sendToGHL({
      email,
      firstName,
      completedAt: new Date().toISOString(),
      source: 'capacity-ledger',
      ledgerTotal90: total90,
      ledgerAnnual: annual,
      ledgerCondition: condition,
    });
  } catch (err) {
    console.error('GHL sync failed for ledger entry', entryId, err.message);
  }

  logEvent('ledger_unlock', { entryId, total90, condition }).catch(() => {});

  return NextResponse.json({ ok: true });
}
