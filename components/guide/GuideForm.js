'use client';

import { useState } from 'react';
import { trackClick } from '@/components/TrackEvent';

export default function GuideForm() {
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | submitting | done | error

  async function handleSubmit(e) {
    e.preventDefault();
    const nextErrors = {};
    if (!firstName.trim()) nextErrors.firstName = 'Enter your first name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = 'Enter a valid email so we can send the guide.';
    }
    if (!marketingConsent) nextErrors.consent = 'Tick the box below to get the guide.';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setStatus('submitting');
    try {
      const res = await fetch('/api/guide/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName: firstName.trim(), email: email.trim(), marketingConsent }),
      });
      if (!res.ok) throw new Error('submit_failed');
      trackClick('guide_download_click');
      setStatus('done');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'done') {
    return (
      <div className="capture-card">
        <h1>Your Guide Is Ready</h1>
        <p className="sub">Click below to download your copy.</p>
        <a href="/assets/simpler-guide.pdf" download className="btn btn-orange btn-large">
          Download The SIMPLER Guide &rarr;
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="capture-card" noValidate>
      <h1>The SIMPLER Guide</h1>
      <p className="sub">
        A practical framework for founders who need more from their days, without adding more to their plate.
      </p>

      <div className={`field${errors.firstName ? ' has-error' : ''}`}>
        <label htmlFor="firstName">First name</label>
        <input
          id="firstName"
          type="text"
          autoComplete="given-name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className={errors.firstName ? 'invalid' : ''}
        />
        {errors.firstName && <p className="field-error">{errors.firstName}</p>}
      </div>

      <div className={`field${errors.email ? ' has-error' : ''}`}>
        <label htmlFor="email">Email address</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={errors.email ? 'invalid' : ''}
        />
        {errors.email && <p className="field-error">{errors.email}</p>}
      </div>

      <div className={`consent-field${errors.consent ? ' has-error' : ''}`}>
        <label className="consent-row">
          <input
            type="checkbox"
            checked={marketingConsent}
            onChange={(e) => setMarketingConsent(e.target.checked)}
          />
          <span className="consent-text">
            Yes, send me the guide. I&rsquo;m happy to receive email marketing from The Energetic Edge, including
            The Capacity Gap newsletter. I can opt out any time.
          </span>
        </label>
        {errors.consent && <p className="field-error">{errors.consent}</p>}
      </div>

      {status === 'error' && (
        <p className="field-error" style={{ marginBottom: 16 }}>
          Something went wrong. Try again in a moment.
        </p>
      )}

      <button type="submit" className="btn btn-orange btn-large" disabled={status === 'submitting'}>
        {status === 'submitting' ? 'Sending…' : 'Send Me The Guide →'}
      </button>
    </form>
  );
}
