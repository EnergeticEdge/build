'use client';

import { useState } from 'react';

export default function ContactStep({ onSubmit, onBack }) {
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!firstName.trim()) {
      setError('Enter your first name.');
      return;
    }
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!emailOk) {
      setError('Enter a valid email so we can send your result.');
      return;
    }
    if (!marketingConsent) {
      setError('Tick the box below to get your result.');
      return;
    }
    setError('');
    onSubmit({
      firstName: firstName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      marketingConsent,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-6 sm:p-8 text-navy-700">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange">Last step</p>
      <h1 className="mt-3 text-4xl sm:text-5xl">Where should we send your result?</h1>
      <p className="mt-3 text-navy-600">Your result is ready to reveal. Two minutes of typing between you and it.</p>

      <div className="mt-6 flex flex-col gap-4">
        <input
          className="w-full rounded-lg border border-navy-100 px-4 py-4 text-base focus:border-orange focus:outline-none focus:ring-2 focus:ring-orange/40"
          type="text"
          placeholder="First name"
          autoComplete="given-name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <input
          className="w-full rounded-lg border border-navy-100 px-4 py-4 text-base focus:border-orange focus:outline-none focus:ring-2 focus:ring-orange/40"
          type="email"
          placeholder="Email address"
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full rounded-lg border border-navy-100 px-4 py-4 text-base focus:border-orange focus:outline-none focus:ring-2 focus:ring-orange/40"
          type="tel"
          placeholder="Phone (optional)"
          autoComplete="tel"
          inputMode="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>

      <label className="mt-5 flex items-start gap-3 text-sm text-navy-600">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 shrink-0 accent-orange"
          checked={marketingConsent}
          onChange={(e) => setMarketingConsent(e.target.checked)}
        />
        <span>
          Yes, send me my result. I'm happy to receive email marketing from The Energetic Edge, including The
          Capacity Gap newsletter. I can opt out any time.
        </span>
      </label>

      {error && <p className="mt-3 text-sm text-orange-600">{error}</p>}

      <button
        type="submit"
        className="mt-6 w-full rounded-lg bg-orange px-6 py-4 font-sans font-bold text-white transition hover:-translate-y-0.5 sm:w-auto"
      >
        See my result →
      </button>
      <button type="button" onClick={onBack} className="mt-4 block text-sm text-navy-300 hover:text-navy-600">
        ← Back
      </button>
    </form>
  );
}
