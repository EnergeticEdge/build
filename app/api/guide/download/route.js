import { NextResponse } from 'next/server';
import { insertGuideDownload, markGuideDownloadBeehiivSynced, logEvent } from '@/lib/db';
import { ensureCustomFields, upsertSubscriber } from '@/lib/beehiiv';
import { sendToGHL } from '@/lib/ghl';

export async function POST(request) {
  const body = await request.json().catch(() => null);
  if (!body?.email || !body?.firstName) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
  }
  if (body.marketingConsent !== true) {
    return NextResponse.json({ error: 'consent_required' }, { status: 400 });
  }

  const { firstName, email, marketingConsent } = body;

  let downloadId;
  try {
    downloadId = await insertGuideDownload({ firstName, email, marketingConsent });
  } catch (err) {
    console.error('Failed to save guide download to backup table:', err);
    return NextResponse.json({ error: 'save_failed' }, { status: 500 });
  }

  // Beehiiv and GHL are both best-effort here too, same independence as the quiz
  // submit route: the download must succeed either way.
  try {
    await ensureCustomFields();
    await upsertSubscriber({
      email,
      firstName,
      customFields: { marketing_consent: 'true', guide_downloaded: 'true' },
    });
    await markGuideDownloadBeehiivSynced(downloadId, true);
  } catch (err) {
    console.error('Beehiiv sync failed for guide download', downloadId, err.message);
    await markGuideDownloadBeehiivSynced(downloadId, false, err.message).catch(() => {});
  }

  try {
    await sendToGHL({
      email,
      firstName,
      completedAt: new Date().toISOString(),
      source: 'simpler-guide',
    });
  } catch (err) {
    console.error('GHL sync failed for guide download', downloadId, err.message);
  }

  logEvent('guide_download', { downloadId }).catch(() => {});

  return NextResponse.json({ ok: true });
}
