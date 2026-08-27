'use client';

import { useState } from 'react';
import { trackClick } from '@/components/TrackEvent';

export default function ShareButton({ text, url }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    trackClick('share_click');
    if (navigator.share) {
      navigator.share({ text, url }).catch(() => {});
      return;
    }
    try {
      await navigator.clipboard.writeText(`${text} ${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable, nothing more to do quietly
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="rounded-lg border-[1.5px] border-navy-100 px-6 py-3 text-sm font-bold text-navy-700 transition hover:border-orange"
    >
      {copied ? 'Copied to clipboard' : 'Share your result'}
    </button>
  );
}
