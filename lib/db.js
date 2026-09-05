import { Pool } from 'pg';

let pool;
let schemaReady;

function getPool() {
  if (!pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not set');
    }
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL.includes('sslmode=disable')
        ? false
        : { rejectUnauthorized: false },
    });
  }
  return pool;
}

// Idempotent, runs once per server process. Cheap enough to call before every
// query rather than wiring a separate migration step for a two-table app.
function ensureSchema() {
  if (!schemaReady) {
    schemaReady = getPool().query(`
      CREATE EXTENSION IF NOT EXISTS pgcrypto;

      CREATE TABLE IF NOT EXISTS leads (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        first_name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        answers JSONB NOT NULL,
        score INTEGER NOT NULL,
        state TEXT NOT NULL,
        energy_score INTEGER NOT NULL,
        focus_score INTEGER NOT NULL,
        revenue_band TEXT,
        outcome_90 TEXT,
        obstacle TEXT,
        notes TEXT,
        beehiiv_synced BOOLEAN NOT NULL DEFAULT false,
        beehiiv_error TEXT,
        marketing_consent BOOLEAN NOT NULL DEFAULT false
      );

      -- Existing rows predate this column; defaults them to false rather than
      -- assuming consent for anyone who submitted before the checkbox existed.
      ALTER TABLE leads ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN NOT NULL DEFAULT false;

      -- Capacity was dropped from the scoring model after the first deploy. Relax
      -- rather than drop the column so no historical data is lost; new rows just
      -- don't populate it. No-ops once already applied or if the column never
      -- existed (a fresh database created after this change).
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'leads' AND column_name = 'capacity_score'
        ) THEN
          ALTER TABLE leads ALTER COLUMN capacity_score DROP NOT NULL;
        END IF;
      END $$;

      CREATE TABLE IF NOT EXISTS events (
        id BIGSERIAL PRIMARY KEY,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        event TEXT NOT NULL,
        meta JSONB
      );

      -- Separate from leads: a guide download has no quiz answers, score, or
      -- state, so it doesn't belong in the leads table's shape.
      CREATE TABLE IF NOT EXISTS guide_downloads (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        first_name TEXT NOT NULL,
        email TEXT NOT NULL,
        marketing_consent BOOLEAN NOT NULL DEFAULT false,
        beehiiv_synced BOOLEAN NOT NULL DEFAULT false,
        beehiiv_error TEXT
      );
    `);
  }
  return schemaReady;
}

// Runs a query, guaranteeing the schema exists first. If the table is still
// missing anyway (e.g. two requests racing to provision it on a cold start),
// resets the cached schema promise and retries once rather than failing the
// request outright.
async function query(sql, params) {
  await ensureSchema();
  try {
    return await getPool().query(sql, params);
  } catch (err) {
    if (err.code === '42P01') {
      schemaReady = undefined;
      await ensureSchema();
      return getPool().query(sql, params);
    }
    throw err;
  }
}

export async function insertLead(lead) {
  const { rows } = await query(
    `INSERT INTO leads
      (first_name, email, phone, answers, score, state, energy_score, focus_score,
       revenue_band, outcome_90, obstacle, notes, beehiiv_synced, beehiiv_error, marketing_consent)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
     RETURNING id`,
    [
      lead.firstName,
      lead.email,
      lead.phone || null,
      JSON.stringify(lead.answers),
      lead.score,
      lead.state,
      lead.energyScore,
      lead.focusScore,
      lead.revenueBand || null,
      lead.outcome90 || null,
      lead.obstacle || null,
      lead.notes || null,
      lead.beehiivSynced,
      lead.beehiivError || null,
      Boolean(lead.marketingConsent),
    ]
  );
  return rows[0].id;
}

export async function getLead(id) {
  try {
    const { rows } = await query('SELECT * FROM leads WHERE id = $1', [id]);
    return rows[0] || null;
  } catch (err) {
    // Malformed id in the URL (not valid UUID syntax) should 404, not 500.
    if (err.code === '22P02') return null;
    throw err;
  }
}

export async function markBeehiivSynced(id, ok, errorMessage) {
  await query('UPDATE leads SET beehiiv_synced = $2, beehiiv_error = $3 WHERE id = $1', [
    id,
    ok,
    errorMessage || null,
  ]);
}

export async function insertGuideDownload({ firstName, email, marketingConsent }) {
  const { rows } = await query(
    `INSERT INTO guide_downloads (first_name, email, marketing_consent)
     VALUES ($1,$2,$3)
     RETURNING id`,
    [firstName, email, Boolean(marketingConsent)]
  );
  return rows[0].id;
}

export async function markGuideDownloadBeehiivSynced(id, ok, errorMessage) {
  await query('UPDATE guide_downloads SET beehiiv_synced = $2, beehiiv_error = $3 WHERE id = $1', [
    id,
    ok,
    errorMessage || null,
  ]);
}

export async function logEvent(event, meta) {
  await query('INSERT INTO events (event, meta) VALUES ($1, $2)', [
    event,
    meta ? JSON.stringify(meta) : null,
  ]);
}

// Funnel summary for the two headline events the brief cares about: landing view -> quiz start.
export async function getFunnelSummary() {
  const { rows } = await query(
    `SELECT event, COUNT(*)::int AS count FROM events
     WHERE event IN ('landing_view','quiz_start','contact_complete','quiz_complete','call_booked_click','guide_download_click','guide_download','share_click')
     GROUP BY event`
  );
  const counts = Object.fromEntries(rows.map((r) => [r.event, r.count]));
  const landingViews = counts.landing_view || 0;
  const quizStarts = counts.quiz_start || 0;
  return {
    counts,
    landingToQuizStartPct: landingViews ? Math.round((quizStarts / landingViews) * 1000) / 10 : null,
  };
}
