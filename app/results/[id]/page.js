import { notFound } from 'next/navigation';
import { getLead } from '@/lib/db';
import { computeScores } from '@/lib/scoring';
import {
  HEADLINES,
  SHORT_HEADLINES,
  CALL_LABELS,
  STATES,
  STATE_LABELS,
  TWO_EDGES_COPY,
  CONTACT_COPY,
  SHARE_COPY,
} from '@/lib/quizData';
import { STATE_VIDEOS, SITE_URL } from '@/lib/config';
import Logo from '@/components/Logo';
import NextSteps from '@/components/results/NextSteps';
import ShareButton from '@/components/results/ShareButton';
import Quadrant from '@/components/results/Quadrant';

export async function generateMetadata({ params }) {
  const { id } = await params;
  return { title: `Your result | The Founder Energy Quiz`, alternates: { canonical: `/results/${id}` } };
}

export default async function ResultsPage({ params }) {
  const { id } = await params;
  const lead = await getLead(id);
  if (!lead) notFound();

  const scores = computeScores(lead.answers);
  const state = scores.state;
  const stateLabel = STATE_LABELS[state] || state;
  const shortHeadline = SHORT_HEADLINES[state] || '';
  const headline = HEADLINES[state] || '';
  const videoUrl = STATE_VIDEOS[state];
  const resultsUrl = `${SITE_URL}/results/${id}`;

  return (
    <main>
      <div className="site-header container">
        <div className="brand">
          <Logo />
        </div>
      </div>

      <p className="result-confirm">{lead.first_name}, here&rsquo;s where you&rsquo;re operating from</p>

      <div className="result-band">
        <h1 className="result-state">{stateLabel}</h1>
      </div>

      <div className="result-body">
        <p className="transition-line">{shortHeadline}</p>
        <div className="quadrant-wrap">
          <Quadrant state={state} />
        </div>
        <p className="result-description">{headline}</p>
        <a
          href="#next-steps"
          className="btn btn-orange btn-large"
        >
          {CALL_LABELS[state] || 'Book your free call'} &rarr;
        </a>
      </div>

      <div className="result-section">
        <div className="video-frame">
          {videoUrl ? (
            <video src={videoUrl} controls />
          ) : (
            <p>[Video slot: Keith&rsquo;s {stateLabel} state video embeds here. See TODO.md.]</p>
          )}
        </div>
      </div>

      <div className="result-section">
        <h2>Which edge are you on</h2>
        <p className="body-copy">{TWO_EDGES_COPY.intro}</p>
        {/* Fog's headline already ends on this exact line; showing it twice on
            one page reads as a mistake, not emphasis. */}
        {state !== STATES.FOG && <p className="body-copy heading">{TWO_EDGES_COPY.line}</p>}
        <p className="body-copy">{TWO_EDGES_COPY.byState[state]}</p>
      </div>

      <div className="result-section" id="next-steps">
        <h2>What to do next</h2>
        <NextSteps revenueBand={lead.revenue_band} state={state} />
      </div>

      <div className="result-section">
        <h2>{CONTACT_COPY.heading}</h2>
        <p className="body-copy">{CONTACT_COPY.body}</p>
      </div>

      <div className="share-row">
        <ShareButton text={SHARE_COPY.text(stateLabel)} url={resultsUrl} />
      </div>

      <p className="tagline-footer">Energy is revenue. Focus is profit.</p>
    </main>
  );
}
