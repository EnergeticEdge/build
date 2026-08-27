'use client';

import { useEffect } from 'react';

// Fires a single first-party event on mount. Used for page-view style events
// (landing_view, quiz_start, quiz_complete) that don't hang off a click.
export default function TrackEvent({ event, meta }) {
  useEffect(() => {
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, meta }),
      keepalive: true,
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

export function trackClick(event, meta) {
  fetch('/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event, meta }),
    keepalive: true,
  }).catch(() => {});
}
