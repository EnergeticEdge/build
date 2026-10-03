'use client';

import { useMemo, useState } from 'react';
import { trackClick } from '@/components/TrackEvent';
import {
  LEDGER_DEFAULTS,
  CONDITION_NOTES,
  calcLedger,
  gbp,
  verdictLine,
  verdictSub,
  whatItBuys,
} from '@/lib/ledger';

// Copy for the five entries, verbatim from Keith's standalone Capacity Ledger page.
const ENTRIES = [
  {
    num: '01',
    title: 'Forgotten revenue',
    note: "Not the deals you lost. The ones you never got back to. The quote that went quiet, the callback you meant to make, the referral you never thanked.",
    rows: [
      { id: 'a1', label: 'Opportunities you know slipped in the last 90 days', hint: 'Be honest. Count the ones that nag at you.', step: 1 },
      { id: 'a2', label: 'Average value of one client or job', hint: 'First-year value, not lifetime.', pre: '£', step: 100 },
      { id: 'a3', label: 'Of those, what share would realistically have closed?', hint: 'Per cent. Most owners land between 20 and 40.', suf: '%', step: 5, max: 100 },
    ],
  },
  {
    num: '02',
    title: 'The cost of waiting for you',
    note: "Work that sat still because a decision only you were allowed to make hadn't been made yet. A price, an approval, a sign-off. The job didn't die. It just aged.",
    rows: [
      { id: 'b1', label: 'Times a job, quote or hire stalled waiting on your call', hint: 'Across 90 days.', step: 1 },
      { id: 'b2', label: 'Average value held up each time', hint: 'The value of the thing that was waiting.', pre: '£', step: 100 },
      { id: 'b3', label: 'What a delay of that length costs you', hint: 'Per cent of the held value. Default 5%.', suf: '%', step: 1, max: 100 },
    ],
    assume: (
      <>
        <b>The 5% is an assumption, not a fact.</b> It stands in for rescheduled crews, held stock, a client who
        cooled, a margin conceded to keep the job. Change it to whatever your business actually loses when work waits
        a week.
      </>
    ),
  },
  {
    num: '03',
    title: 'The interruption tax',
    note: 'Hours spent on questions only you are permitted to answer. Not the work. The being available for it.',
    rows: [
      { id: 'c1', label: 'Your annual revenue', hint: 'Used only to work out what an hour of yours is worth.', pre: '£', step: 10000 },
      { id: 'c2', label: 'Hours you personally work in a normal week', step: 1, min: 1, max: 120 },
      { id: 'c3', label: 'Hours a week lost to interruptions only you can handle', hint: 'Approvals, prices, "quick questions", firefighting.', step: 0.5, max: 120 },
    ],
  },
  {
    num: '04',
    title: 'Avoidance spend',
    note: "Money spent to get out from under something, that never went live. The software you bought and never set up. The hire made to dodge a task rather than fill a role. The retainer paid for a thing you then did yourself anyway.",
    rows: [
      { id: 'd1', label: 'Tools and subscriptions paid for and barely used', hint: 'Total across 90 days.', pre: '£', step: 50 },
      { id: 'd2', label: 'Spend on people or services brought in to avoid a task', hint: "The portion that hasn't paid for itself.", pre: '£', step: 100 },
    ],
  },
  {
    num: '05',
    title: 'The line nobody costs',
    note: 'Four entries above. Every one of them produced by the same instrument, making decisions in whatever state it happened to be in that week. No pound signs here. Just four readings.',
    rows: [
      { id: 'e1', label: 'Hours of proper sleep on a normal weeknight', hint: 'Actual, not intended.', step: 0.5, max: 14 },
      { id: 'e2', label: 'Days since you last switched off completely', hint: 'No phone, no checking. A holiday spent replying does not count.', step: 1 },
      { id: 'e3', label: 'Decisions in the last month you made while running on empty', hint: 'Late, rushed, or just to make the question go away.', step: 1 },
      { id: 'e4', label: 'Times this month you were in the room but not really there', hint: 'A dinner, in a meeting, a conversation at home.', step: 1 },
    ],
  },
];

const TALLY_LABELS = ['01 Forgotten revenue', '02 Cost of waiting', '03 Interruption tax', '04 Avoidance spend'];

export default function CapacityLedger() {
  const [inputs, setInputs] = useState(() =>
    Object.fromEntries(Object.entries(LEDGER_DEFAULTS).map(([k, v]) => [k, String(v)]))
  );
  const [unlocked, setUnlocked] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | submitting | error

  const r = useMemo(() => calcLedger(inputs), [inputs]);
  const hasFigures = r.total > 0 || r.touched;
  const conditionWord = unlocked ? r.condition.word : 'Not costed';
  const conditionNote = CONDITION_NOTES[unlocked ? r.condition.key : 'not_costed'];

  function update(id, value) {
    setInputs((prev) => ({ ...prev, [id]: value }));
  }

  async function handleUnlock(e) {
    e.preventDefault();
    const nextErrors = {};
    if (!hasFigures) nextErrors.form = 'Fill in at least one entry first, so there is something to read.';
    if (!firstName.trim()) nextErrors.firstName = 'Enter your first name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = 'Enter a valid email so we can send your reading.';
    }
    if (!marketingConsent) nextErrors.consent = 'Tick the box below to get your reading.';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setStatus('submitting');
    try {
      const res = await fetch('/api/ledger/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName.trim(),
          email: email.trim(),
          marketingConsent,
          inputs,
        }),
      });
      if (!res.ok) throw new Error('submit_failed');
      trackClick('ledger_unlock_click');
      setUnlocked(true);
      setStatus('idle');
    } catch {
      setStatus('error');
    }
  }

  // The page wraps this in .cl, which carries the ledger's scoped styles.
  return (
    <>
      <header className="cl-masthead">
        <div className="cl-wrap">
          <div className="cl-eyebrow">A 90-day reckoning for founder-operators</div>
          <h1>
            The Capacity
            <br />
            Ledger
          </h1>
          <p className="cl-standfirst">
            You can measure everything in your business except the one thing running it.{' '}
            <strong>Five entries. Ten minutes.</strong> Four of them have a pound sign. The fifth is the one that
            produced the other four.
          </p>
        </div>
      </header>

      <main className="cl-wrap cl-ledger">
        <div>
          {ENTRIES.map((entry, i) => (
            <section className="cl-entry" key={entry.num}>
              <div className="cl-entryhead">
                <div className="cl-num">{entry.num}</div>
                <h2>{entry.title}</h2>
              </div>
              <p className="cl-entrynote">{entry.note}</p>
              <div className="cl-rows">
                {entry.rows.map((row) => (
                  <div className="cl-row" key={row.id}>
                    <label htmlFor={`cl-${row.id}`}>
                      {row.label}
                      {row.hint && <span className="cl-hint">{row.hint}</span>}
                    </label>
                    <div className="cl-field">
                      {row.pre && <span className="cl-pre">{row.pre}</span>}
                      <input
                        type="number"
                        inputMode="decimal"
                        id={`cl-${row.id}`}
                        min={row.min ?? 0}
                        max={row.max}
                        step={row.step}
                        value={inputs[row.id]}
                        onChange={(e) => update(row.id, e.target.value)}
                      />
                      {row.suf && <span className="cl-suf">{row.suf}</span>}
                    </div>
                  </div>
                ))}
              </div>

              {i < 4 ? (
                <div className="cl-subtotal">
                  <span className="cl-lbl">Entry {entry.num}</span>
                  <span className="cl-val">{gbp(r.entries[i])}</span>
                </div>
              ) : (
                <div className="cl-subtotal">
                  <span className="cl-lbl">Entry 05</span>
                  <span className="cl-val cl-state">{conditionWord}</span>
                </div>
              )}

              {entry.assume && <p className="cl-assume">{entry.assume}</p>}
              {entry.num === '03' && (
                <p className="cl-assume">
                  Your hour is currently valued at <b>{gbp(r.hourly)}</b>. That is your annual revenue divided by the
                  hours you work across a 46-week year. It is a blunt figure and it is almost certainly kind to you,
                  because it treats every hour as equal.
                </p>
              )}
              {entry.num === '05' && (
                <p className="cl-assume">
                  <b>{conditionNote.lead}</b> {conditionNote.body}
                  {!unlocked && r.touched && ' Your reading for this line comes with the verdict below.'}
                </p>
              )}
            </section>
          ))}
        </div>

        <aside className="cl-balance" aria-live="polite">
          <div className="cl-balancecard">
            <div>
              <div className="cl-lbl">Running total</div>
              <div className="cl-bignum">{gbp(r.total)}</div>
              <div className="cl-period">Last 90 days</div>
            </div>
            <div className="cl-tally">
              {TALLY_LABELS.map((label, i) => (
                <div key={label}>
                  <span>{label}</span>
                  <span>{gbp(r.entries[i])}</span>
                </div>
              ))}
              <div>
                <span>05 Condition</span>
                <span>{conditionWord}</span>
              </div>
            </div>
            <div className="cl-perweek">
              Annualised, that is <b>{gbp(r.annual)}</b>.
            </div>
          </div>
        </aside>
      </main>

      <section className="cl-wrap cl-verdict">
        <h2>What the number means</h2>

        {unlocked ? (
          <>
            <div className="cl-readout">
              <p>{verdictLine(r.total)}</p>
              <p>{verdictSub(r.total, r.touched, r.flags)}</p>
            </div>

            {r.total > 0 && (
              <div className="cl-buys">
                {whatItBuys(r.total, r.hourly).map((b) => (
                  <div className="cl-line" key={b.what}>
                    <span className="cl-what">{b.what}</span>
                    <span className="cl-fig">{b.fig}</span>
                  </div>
                ))}
              </div>
            )}

            <button type="button" className="cl-print" onClick={() => window.print()}>
              Print or save your ledger as a PDF
            </button>
          </>
        ) : (
          <form className="cl-gate" onSubmit={handleUnlock} noValidate>
            <p className="cl-gate-lead">
              {r.total > 0 ? (
                <>
                  Your ledger says <b>{gbp(r.total)}</b> in 90 days.
                </>
              ) : (
                <>Fill in the ledger above and your total will appear here.</>
              )}{' '}
              Get the full reading: what that figure means for a business your size, what it would buy you instead, and
              what your fifth entry says about the person producing it.
            </p>

            <div className="cl-gate-fields">
              <div className="cl-gate-field">
                <label htmlFor="cl-firstName">First name</label>
                <input
                  id="cl-firstName"
                  type="text"
                  autoComplete="given-name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  aria-invalid={Boolean(errors.firstName)}
                />
                {errors.firstName && <p className="cl-error">{errors.firstName}</p>}
              </div>
              <div className="cl-gate-field">
                <label htmlFor="cl-email">Email address</label>
                <input
                  id="cl-email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={Boolean(errors.email)}
                />
                {errors.email && <p className="cl-error">{errors.email}</p>}
              </div>
            </div>

            <label className="cl-consent">
              <input
                type="checkbox"
                checked={marketingConsent}
                onChange={(e) => setMarketingConsent(e.target.checked)}
              />
              <span>
                Yes, show me my reading. I&rsquo;m happy for The Energetic Edge to keep my ledger figures and send me
                email marketing, including The Capacity Gap newsletter. I can opt out any time.
              </span>
            </label>
            {errors.consent && <p className="cl-error">{errors.consent}</p>}
            {errors.form && <p className="cl-error">{errors.form}</p>}
            {status === 'error' && <p className="cl-error">Something went wrong. Try again in a moment.</p>}

            <button type="submit" className="cl-cta" disabled={status === 'submitting'}>
              {status === 'submitting' ? 'Working it out…' : 'Show me my reading →'}
            </button>
          </form>
        )}
      </section>

      <section className="cl-wrap cl-close">
        <div className="cl-kicker">None of this is a discipline problem.</div>
        <p>
          You already knew most of what you just typed. Knowing it has never been the issue. Every fix on the market
          assumes an owner with capacity spare to install it, which is precisely what you no longer have. That is why
          the last three didn&rsquo;t stick.
        </p>
        <p>Take the number to a 30-minute call. You&rsquo;ll leave with a read on your current state and one thing to change. No pitch.</p>
        <a className="cl-cta" href="/call" onClick={() => trackClick('call_booked_click', { source: 'ledger' })}>
          Book the 30-minute call
        </a>

        <div className="cl-foot">
          <p className="cl-tag">Energy is revenue. Focus is profit. Capacity is your asset.</p>
          <p className="cl-smallprint">
            The Capacity Ledger is an estimating tool, not a financial audit. Your figures stay in your browser while
            you fill it in. They&rsquo;re only saved if you ask for your reading. theenergeticedge.com
          </p>
        </div>
      </section>
    </>
  );
}
