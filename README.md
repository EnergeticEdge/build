# The Founder Energy Quiz

A Next.js (App Router) funnel for The Energetic Edge: landing page, 15-question quiz, personalised
results page, and a Beehiiv subscriber integration. See `TODO.md` for what's still a placeholder
before this goes live.

## Local development

```
npm install
cp .env.example .env.local   # then fill in DATABASE_URL, BEEHIIV_API_KEY, BEEHIIV_PUBLICATION_ID
npm run dev
```

Needs a Postgres database for local dev (leads + event log). `lib/db.js` creates its tables on
first use, so any empty Postgres instance works — no separate migration step.

## Structure

- `app/` — routes: `/` (landing), `/quiz`, `/results/[id]`, plus `api/quiz/submit` and `api/track`.
- `lib/config.js` — thresholds, pricing copy, external links. Edit here, not in components.
- `lib/quizData.js` — all quiz copy: questions, headlines, insight blocks.
- `lib/scoring.js` — pure scoring functions.
- `lib/db.js` / `lib/beehiiv.js` — Postgres backup store and the Beehiiv subscriber sync.
- `emails/` — the 10-email nurture sequence as markdown, ready to paste into Beehiiv.

## Deployment

Deployment pipeline: push to `main` on GitHub → Railway auto-deploys. Add a Postgres service in
Railway (it injects `DATABASE_URL` automatically) and set `BEEHIIV_API_KEY`,
`BEEHIIV_PUBLICATION_ID` and `NEXT_PUBLIC_SITE_URL` as environment variables.
