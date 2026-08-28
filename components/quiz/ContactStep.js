'use client';

import { useState } from 'react';

export default function ContactStep({ onSubmit }) {
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [errors, setErrors] = useState({});

  function handleSubmit(e) {
    e.preventDefault();
    const nextErrors = {};
    if (!firstName.trim()) nextErrors.firstName = 'Enter your first name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = 'Enter a valid email so we can send your result.';
    }
    if (!marketingConsent) nextErrors.consent = 'Tick the box below to get your result.';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSubmit({
      firstName: firstName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      marketingConsent,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="capture-card" noValidate>
      <h1>Where should we send your result?</h1>
      <p className="sub">Your result is ready to reveal. Two minutes of typing between you and it.</p>

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

      <div className="field">
        <label htmlFor="phone">Phone (optional)</label>
        <input
          id="phone"
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>

      <div className={`consent-field${errors.consent ? ' has-error' : ''}`}>
        <label className="consent-row">
          <input
            type="checkbox"
            checked={marketingConsent}
            onChange={(e) => setMarketingConsent(e.target.checked)}
          />
          <span className="consent-text">
            Yes, send me my result. I&rsquo;m happy to receive email marketing from The Energetic Edge, including
            The Capacity Gap newsletter. I can opt out any time.
          </span>
        </label>
        {errors.consent && <p className="field-error">{errors.consent}</p>}
      </div>

      <button type="submit" className="btn btn-orange btn-large">
        See my result &rarr;
      </button>
    </form>
  );
}
