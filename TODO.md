# TODO — before this goes live

## Source material used

No literal `founder-energy-quiz-funnel-design.md` was ever supplied. This build was written from:
- The scoring/page/logic spec Keith gave directly in the build brief (Q1-10 Yes/Sometimes/No,
  Q11 state, Q12 revenue, Q13/Q14 single-select, Q15 free text; area/score bands; next-steps
  revenue thresholds; Beehiiv fields; voice rules).
- `keith-voice-profile.md`, `brand-device-two-edges.md`, `the-energetic-edge-brand-overview.md`.
- The Business OS and ICP/Flagship Offer docs (Google Drive), for real facts: SIMPLER framework,
  £4,997 Reset, £197 Clarity Call, £250k revenue target, the Capacity Cost Read (£26k-£52k/yr).
- An early static HTML prototype of the quiz (visual style reference only — its 8-question,
  state-tally scoring model was **not** used; this build follows the 15-question spec above).

Because of that, every question, headline, insight and email is copy I wrote to fit the spec and
voice rules, not transcribed from an existing doc. Read it before it goes live, particularly the
12 headlines and 9 insight blocks in `lib/quizData.js`.

**Edge state framing:** `brand-device-two-edges.md` and the ICP doc both describe Edge as
"performing well but closer to the line than he thinks." Keith confirmed in this build session
that framing is wrong and should not be used anywhere in this funnel. Edge is written throughout
as something to celebrate and build on, never as a warning. If those docs get reused for other
assets, flag the same conflict again.

## Real placeholders to fill in

1. **Logo files.** `TEELogoSide250px.png`, `TEELogoBelow250px.png`, `TEEmarque250px.png` were
   never supplied. `components/Logo.js` is a text wordmark placeholder using the existing
   `public/favicon.svg` marque shape. Swap it for the real logo once you have the files.
2. **Landing page credibility stat** (`app/page.js`, Credibility section). Currently a visible
   bracketed placeholder: add a real number (founders through the quiz/programme, a measurable
   outcome) rather than inventing one.
3. **Four state videos** (Edge / Frantic / Fog / Blocked). `lib/config.js` → `STATE_VIDEOS` is
   `null` for all four. The results page shows a labelled placeholder box until these are set to
   real URLs.
4. **SIMPLER Guide link.** No link was supplied. `lib/config.js` → `LINKS.guide` is `null`, which
   makes every "Get the SIMPLER Guide" CTA hide itself (results page next-steps, emails 3 and 6).
   Set the real URL once it exists and those CTAs reappear automatically.
5. **Email 7 (`emails/07-the-real-cost.md`).** Uses the real, sourced £26,000-£52,000/year range
   from the ICP doc's Capacity Cost Read, but leaves a bracketed placeholder for a specific real
   example (a client's actual numbers, or Keith's own worked example) as the brief asked for.
6. **Email 8 (`emails/08-client-story.md`).** Entirely a placeholder. No real client story exists
   in any source document, so nothing was invented. Needs a real, anonymised-if-necessary example:
   who they were, what state they were in, what changed.
7. **Automation trigger.** Beehiiv doesn't have a confirmed tag-on-create API, so the trigger is a
   custom field `quiz_completed` set to `"true"` on every quiz subscriber (see `lib/beehiiv.js`).
   You still need to build the actual automation in the Beehiiv dashboard, triggered on
   `quiz_completed = true`, and point it at the 10 emails in `/emails`.
8. **Analytics.** Built as a plain first-party event log (Postgres `events` table), not Plausible,
   per the "I don't know what that means" answer in this build session. `getFunnelSummary()` in
   `lib/db.js` gives the landing-view-to-quiz-start percentage the brief asked to track; there's
   no dashboard UI for it yet, just the function. Say the word if you want a simple `/admin` page
   for it.

## Beehiiv integration — verify before relying on it

`developers.beehiiv.com` was unreachable from this build environment (network egress blocked), so
`lib/beehiiv.js` was written from beehiiv's help-centre articles and search results, not the live
API reference. The parts that matter most to check:
- Custom field creation payload (`POST /v2/publications/{id}/custom_fields`) — field names used:
  `score`, `state`, `energy_score`, `focus_score`, `capacity_score`, `revenue_band`, `outcome_90`,
  `obstacle`, `notes`, `results_url`, `quiz_completed`.
- Whether `custom_fields: [{ name: "First Name", value }]` is really how the reserved first-name
  field is set on subscriber creation (vs. a dedicated top-level field).
- Merge tag syntax used in the emails: `{{first name | there}}` for the reserved name field,
  `{{score}}` / `{{state}}` / `{{results_url}}` etc. for the custom fields above — confirmed
  against beehiiv's own merge-tag help article, but double check the custom field ones render once
  real subscribers exist.

If a submission's Beehiiv call fails, it still saves to the `leads` table with
`beehiiv_synced = false` and the error in `beehiiv_error`, so nothing is lost — those rows can be
replayed once the integration is confirmed working.

## Infra

- Needs a Postgres database. On Railway, add a Postgres service to this project and it will inject
  `DATABASE_URL` automatically; `lib/db.js` creates its own tables on first use.
- Set `BEEHIIV_API_KEY`, `BEEHIIV_PUBLICATION_ID` and `NEXT_PUBLIC_SITE_URL` (your real domain) as
  environment variables in Railway. Nothing sensitive is committed to this repo.
