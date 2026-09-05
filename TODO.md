# TODO — before this goes live

## Status

- **Design and question bank rebuilt from an earlier HTML prototype (this round).** Keith liked
  the look and the questions in a standalone `index.html` prototype he'd built separately, so on
  his instruction this app now runs that prototype's CSS design system (`app/globals.css`, ported
  wholesale: dark navy background, Bebas/Inter type, bordered card components) and its 16 scored
  questions verbatim (`lib/quizData.js` → `SCORED_QUESTIONS`, Q1-16, 8 Energy/8 Focus). Everything
  else stays the build already had running: this repo's own 4 non-scored qualifier questions
  (revenue band, 90-day outcome, obstacle, notes — now Q17-20, 20 questions total), the real
  Postgres backup table, and the Beehiiv sync in `app/api/quiz/submit/route.js`. The prototype's own
  fire-and-forget `/api/subscribe` stub was explicitly **not** carried over — every submission still
  goes through the real endpoint that writes to `leads` first and syncs Beehiiv best-effort after,
  so a Beehiiv outage never loses a lead. The old "YOU ARE HERE" dot on the quadrant graphic is gone
  per Keith's explicit instruction — the quadrant is state-only, same as it already was.
- Scoring thresholds now match the prototype's exactly (see "Scoring model" below) rather than the
  70%/70% custom rule from the previous round.
- **PR #1-#4** merged and deployed. Live at
  `https://build-production-f884.up.railway.app` (custom domain not yet attached).
- **15 questions, for real now.** The landing page always said "15 questions" but the quiz only
  had 13 after the Capacity redesign. Added two more scored questions (a 5th Energy question on
  monthly consistency, a 5th Focus question on whether the important work actually moves week to
  week) rather than change the marketing copy. Energy is now Q1-5, Focus Q6-10, the dual-scoring
  question Q11, then revenue/outcome/obstacle/notes as Q12-15. `app/api/quiz/submit/route.js` now
  reads these via the question objects' own `.id` rather than hardcoded strings, so a future
  renumbering can't silently break it the way this one would have.
- **Landing headlines** are now actual questions ("Are you frustrated that..." / "Are you ready
  to..."), and a stale "energy, focus and capacity" line in the value proposition section (left
  over from before Capacity was dropped) is fixed to just energy and focus.
- **Real logo files are in** (`public/assets/logo-side.svg`, `logo-below.svg`, `marque.svg`, plus
  `-white` variants used in every header since all three pages sit on the navy background). No
  more text-wordmark placeholder. One thing worth knowing: the actual artwork uses navy `#004174`
  and orange `#ff720f`, not the `#0b3a6a` / `#ff6a00` from the brand overview doc — close but not
  identical. Left the rest of the app on the documented palette rather than recolouring everything
  off a few-point difference; flag if you want it reconciled one way or the other.
- **Results page simplified further**: dropped the Energy/Focus insight cards entirely (just the
  state now, no area breakdown). The quadrant is back to an even, symmetric grid now that nothing
  is plotted by exact position, and the 4 headlines are Keith's actual words for each state (one
  per state now, not banded by score). Fog's paragraph and the Two Edges section both used to say
  "You haven't lost your edge, you've lost access to it," so the Two Edges section skips that line
  for Fog specifically now, no other state affected.
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

Two axes, Energy and Focus, 8 questions each (Q1-16, alternating in that order in
`SCORED_QUESTIONS`), each worth 0-3 across four answer options, max 24 raw per axis. Q17-20 are
the qualifier questions (revenue band, 90-day outcome, obstacle, free-text notes) and don't feed
the score at all. Thresholds (`lib/scoring.js`) match the HTML prototype exactly: Edge needs both
axes at 18+ (75%) *and* zero bottom-option ("0") answers across all 16 — a stricter bar than either
axis threshold alone, so a middling result never reads as the best outcome. Below that, whichever
axis clears 14 (58%) decides Frantic (energy) vs Blocked (focus); if both clear it the higher axis
wins the tie toward Frantic, and if neither clears it it's Fog. The results page shows this as a
static 2x2 grid (`components/results/Quadrant.js`) with the founder's state highlighted — no score,
no dot, same as before this round.

This replaced a previous 70%/70%-both-axes rule from an earlier round, which itself replaced the
original design where Capacity was a third scored area and state came from a single self-reported
question independent of the score. `capacity_score` is still a column in the `leads` table
(constraint relaxed, not dropped, so no historical data was lost) and may still exist as an
orphaned Beehiiv custom field from before that change; both are harmless to leave as is.

## Source material used

No literal `founder-energy-quiz-funnel-design.md` was ever supplied. This build was written from:
- The scoring/page/logic spec Keith gave directly in the build brief, since revised per the
  "Scoring model" section above.
- `keith-voice-profile.md`, `brand-device-two-edges.md`, `the-energetic-edge-brand-overview.md`.
- The Business OS and ICP/Flagship Offer docs (Google Drive), for real facts: SIMPLER framework,
  £4,997 Reset, £197 Clarity Call, £250k revenue target, the Capacity Cost Read (£26k-£52k/yr).
- An early static HTML prototype of the quiz (visual style reference only — its scoring model
  was not used).

Because of that, every question and email is copy written to fit the spec and voice rules, not
transcribed from an existing doc — except the 4 state descriptions in `HEADLINES`
(`lib/quizData.js`), which are Keith's own words, supplied directly and used verbatim.

**Edge state framing:** `brand-device-two-edges.md` and the ICP doc both describe Edge as
"performing well but closer to the line than he thinks." Keith confirmed in this build session
that framing is wrong and should not be used anywhere in this funnel. Edge is written throughout
as something to celebrate and build on, never as a warning.

## Real placeholders to fill in

1. **Four state videos** (Edge / Frantic / Fog / Blocked). `lib/config.js` → `STATE_VIDEOS` is
   `null` for all four. The results page shows a labelled placeholder box until set.
2. ~~SIMPLER Guide link~~ — done. `LINKS.guide` now points at `/guide`, a gated capture page
   (`app/guide/page.js` + `app/api/guide/download/route.js`) that saves to its own
   `guide_downloads` backup table, syncs to Beehiiv and GHL the same independent, best-effort way
   as the quiz, then reveals a real download button for `public/assets/simpler-guide.pdf`. This
   is the final, correct guide Keith supplied — there had been two conflicting versions floating
   around before this.
3. **Email 7 (`emails/07-the-real-cost.md`).** Uses the real, sourced £26,000-£52,000/year range
   from the ICP doc's Capacity Cost Read, but leaves a placeholder for a specific real example.
4. **Email 8 (`emails/08-client-story.md`).** Entirely a placeholder — no real client story exists
   in any source document.
5. **Automation.** `quiz_completed` is set to `true` as a Beehiiv custom field on every quiz
   subscriber (`lib/beehiiv.js`). The actual automation triggered on that field, sending the 10
   emails in `/emails`, still needs building in the Beehiiv dashboard — that's gated behind a
   Beehiiv plan upgrade for API/MCP-driven building, so it's a manual job for now. The 12 custom
   fields the app writes to also need creating there first (Settings → Subscribers → Custom
   Fields): `score`, `energy_score`, `focus_score` (number), `state`, `revenue_band`, `outcome_90`,
   `obstacle`, `notes`, `results_url`, `phone` (text), `quiz_completed`, `marketing_consent`
   (boolean).
6. **Analytics.** Plain first-party event log (Postgres `events` table), not Plausible.
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
