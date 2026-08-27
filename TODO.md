# TODO — before this goes live

## Status

- **PR #1** (initial build) and **PR #2** (Beehiiv fix + scoring redesign) merged and deployed.
  Live at `https://build-production-f884.up.railway.app` (custom domain not yet attached).
- **Edge threshold**: Edge now needs 70%+ on both Energy and Focus, not just above the 50%
  midpoint, so a middling result doesn't read as the best possible outcome. Other three states
  unchanged.
- **Score hidden from founders**: the results page no longer shows any percentage, gauge, or dot.
  The quadrant graphic is now a static explainer (which of the four states, relative to the
  others) with no position marker. Headlines and insight cards were reworded to drop the literal
  numbers while keeping the tonal difference between a strong/middling/weak result internally.
- **Flow reordered**: the 13 quiz questions now come first; contact details (name, email, phone,
  marketing consent) are the last step, right before the result. Was contact-first before.
- **Marketing consent**: a required checkbox on the contact step. Submission is blocked, both
  client-side and server-side (`app/api/quiz/submit/route.js`), if it isn't ticked. Worth flagging:
  bundling "get your result" with "receive marketing" in one checkbox is legally shaky under UK
  GDPR/PECR (consent should generally be freely given, not a condition of using the service) —
  built exactly as asked, but worth a compliance check before this goes live.
- Railway project `peaceful-mindfulness`: Postgres is provisioned and wired in
  (`DATABASE_URL`), along with `BEEHIIV_API_KEY`, `BEEHIIV_PUBLICATION_ID`, `NEXT_PUBLIC_SITE_URL`.

## Scoring model

Two axes, Energy (Q1-4) and Focus (Q5-8), each question worth 0-3 across four answer options.
Q9 is the original "which of these is closest to how running your business feels" question, kept
word for word, but it now scores *both* axes at once (0-3 each) depending on which option is
picked, rather than being read directly as the state. State is a straight quadrant read: energy
≥50% and focus ≥50% is Edge, high energy/low focus is Frantic, low/low is Fog, low energy/high
focus is Blocked. The results page shows this as an actual 2x2 grid (`components/results/
Quadrant.js`) with a dot at the real position, not just the label.

This replaced the original design where Capacity was a third scored area (Q8-10) and state came
from a single self-reported question (old Q11), independent of the score. That produced results
that could visibly disagree with each other (e.g. a "Blocked" pick with strong Focus and Energy
scores) — Keith flagged this after testing the live quiz, and asked for exactly the quadrant model
above instead. `capacity_score` is still a column in the `leads` table (constraint relaxed, not
dropped, so no historical data was lost) and may still exist as an orphaned Beehiiv custom field
from before this change; both are harmless to leave as is.

## Source material used

No literal `founder-energy-quiz-funnel-design.md` was ever supplied. This build was written from:
- The scoring/page/logic spec Keith gave directly in the build brief, since revised per the
  "Scoring model" section above.
- `keith-voice-profile.md`, `brand-device-two-edges.md`, `the-energetic-edge-brand-overview.md`.
- The Business OS and ICP/Flagship Offer docs (Google Drive), for real facts: SIMPLER framework,
  £4,997 Reset, £197 Clarity Call, £250k revenue target, the Capacity Cost Read (£26k-£52k/yr).
- An early static HTML prototype of the quiz (visual style reference only — its scoring model
  was not used).

Because of that, every question, headline, insight and email is copy written to fit the spec and
voice rules, not transcribed from an existing doc. Read it before it goes live, particularly the
12 headlines and 6 insight blocks in `lib/quizData.js`.

**Edge state framing:** `brand-device-two-edges.md` and the ICP doc both describe Edge as
"performing well but closer to the line than he thinks." Keith confirmed in this build session
that framing is wrong and should not be used anywhere in this funnel. Edge is written throughout
as something to celebrate and build on, never as a warning.

## Real placeholders to fill in

1. **Logo files.** `TEELogoSide250px.png`, `TEELogoBelow250px.png`, `TEEmarque250px.png` were
   never supplied. `components/Logo.js` is a text wordmark placeholder using the existing
   `public/favicon.svg` marque shape.
2. **Landing page credibility stat** (`app/page.js`, Credibility section). Currently a visible
   bracketed placeholder.
3. **Four state videos** (Edge / Frantic / Fog / Blocked). `lib/config.js` → `STATE_VIDEOS` is
   `null` for all four. The results page shows a labelled placeholder box until set.
4. **SIMPLER Guide link.** No link was supplied. `lib/config.js` → `LINKS.guide` is `null`, which
   makes every "Get the SIMPLER Guide" CTA hide itself. Set the real URL and those CTAs reappear.
5. **Email 7 (`emails/07-the-real-cost.md`).** Uses the real, sourced £26,000-£52,000/year range
   from the ICP doc's Capacity Cost Read, but leaves a placeholder for a specific real example.
6. **Email 8 (`emails/08-client-story.md`).** Entirely a placeholder — no real client story exists
   in any source document.
7. **Automation.** `quiz_completed` is set to `true` as a Beehiiv custom field on every quiz
   subscriber (`lib/beehiiv.js`). The actual automation triggered on that field, sending the 10
   emails in `/emails`, still needs building in the Beehiiv dashboard — that's gated behind a
   Beehiiv plan upgrade for API/MCP-driven building, so it's a manual job for now. The 12 custom
   fields the app writes to also need creating there first (Settings → Subscribers → Custom
   Fields): `score`, `energy_score`, `focus_score` (number), `state`, `revenue_band`, `outcome_90`,
   `obstacle`, `notes`, `results_url`, `phone` (text), `quiz_completed`, `marketing_consent`
   (boolean).
8. **Analytics.** Plain first-party event log (Postgres `events` table), not Plausible.
   `getFunnelSummary()` in `lib/db.js` gives the landing-view-to-quiz-start percentage; no
   dashboard UI for it yet.

## Beehiiv integration

`lib/beehiiv.js`'s custom-field creation shape was corrected against a real 400 response from the
live API after the first production deploy (kind enum is `string | integer | boolean | date |
datetime | list`, not `number`; the field-name param is `display`, not `display_name`). Subscriber
creation (`custom_fields: [{name, value}]`, matched against each field's real snake_case `name`)
has not produced an error.

If a submission's Beehiiv call fails, it still saves to the `leads` table with
`beehiiv_synced = false` and the error in `beehiiv_error`, so nothing is lost.

## Infra

- Postgres is live on Railway (project `peaceful-mindfulness`, service `Postgres`), wired into the
  `build` service via `DATABASE_URL`.
- `BEEHIIV_API_KEY`, `BEEHIIV_PUBLICATION_ID`, `NEXT_PUBLIC_SITE_URL` are set on the `build`
  service. `NEXT_PUBLIC_SITE_URL` currently points at the Railway subdomain
  (`build-production-f884.up.railway.app`) — update it once a custom domain is attached.
