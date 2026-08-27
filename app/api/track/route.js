import { NextResponse } from 'next/server';
import { logEvent } from '@/lib/db';

const ALLOWED_EVENTS = new Set([
  'landing_view',
  'quiz_start_click',
  'quiz_start',
  'contact_complete',
  'quiz_complete',
  'call_booked_click',
  'guide_download_click',
  'share_click',
]);

export async function POST(request) {
  const body = await request.json().catch(() => null);
  if (!body?.event || !ALLOWED_EVENTS.has(body.event)) {
    return NextResponse.json({ error: 'invalid_event' }, { status: 400 });
  }
  try {
    await logEvent(body.event, body.meta || null);
  } catch (err) {
    console.error('Failed to log event', body.event, err.message);
  }
  return NextResponse.json({ ok: true });
}
