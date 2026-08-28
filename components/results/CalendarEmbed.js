'use client';

import Script from 'next/script';
import { LINKS } from '@/lib/config';

export default function CalendarEmbed() {
  return (
    <div style={{ marginTop: 20, overflow: 'hidden', borderRadius: 12, border: '1px solid var(--card-border)' }}>
      <iframe
        src={LINKS.calendarEmbed}
        style={{ width: '100%', height: 720, border: 'none' }}
        scrolling="no"
        id="tee-booking-widget"
        title="Book your free call with Keith"
      />
      <Script src="https://link.msgsndr.com/js/form_embed.js" strategy="afterInteractive" />
    </div>
  );
}
