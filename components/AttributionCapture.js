'use client';

import { useEffect } from 'react';
import { captureAttribution } from '@/lib/attribution';

// Mounted once in the root layout so the lead source is recorded on whichever
// page someone lands on, not just /quiz. See lib/attribution.js.
export default function AttributionCapture() {
  useEffect(() => {
    captureAttribution();
  }, []);

  return null;
}
