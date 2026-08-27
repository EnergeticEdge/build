'use client';

import { useState } from 'react';

export default function ContactStep({ value, onNext }) {
  const [firstName, setFirstName] = useState(value.firstName || '');
  const [email, setEmail] = useState(value.email || '');
  const [phone, setPhone] = useState(value.phone || '');
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
    setError('');
    onNext({ firstName: firstName.trim(), email: email.trim(), phone: phone.trim() });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-6 sm:p-8 text-navy-700">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange">First</p>
      <h1 className="mt-3 text-4xl sm:text-5xl">Where should we send your result?</h1>
      <p className="mt-3 text-navy-600">15 questions, about 3 minutes. Your result and next step are personal to you.</p>

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

      {error && <p className="mt-3 text-sm text-orange-600">{error}</p>}

      <button
        type="submit"
        className="mt-6 w-full rounded-lg bg-orange px-6 py-4 font-sans font-bold text-white transition hover:-translate-y-0.5 sm:w-auto"
      >
        Start the quiz →
      </button>
      <p className="mt-3 text-xs text-navy-300">No spam. No filler. Just the thinking you need.</p>
    </form>
  );
}
