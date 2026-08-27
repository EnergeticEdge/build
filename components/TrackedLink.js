'use client';

import { trackClick } from './TrackEvent';

// An <a> that fires a tracking event before/while navigating.
export default function TrackedLink({ event, meta, className, children, ...props }) {
  return (
    <a
      className={className}
      onClick={() => trackClick(event, meta)}
      {...props}
    >
      {children}
    </a>
  );
}
