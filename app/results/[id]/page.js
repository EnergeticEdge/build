import { notFound } from 'next/navigation';
import { getLead } from '@/lib/db';
import { computeScores, scoreBand, areaBand } from '@/lib/scoring';
import {
  HEADLINES,
  AREA_INSIGHTS,
  AREA_LABELS,
  STATE_LABELS,
  TWO_EDGES_COPY,
  CONTACT_COPY,
  SHARE_COPY,
} from '@/lib/quizData';
import { STATE_VIDEOS, SITE_URL } from '@/lib/config';
import Logo from '@/components/Logo';
import InsightCard from '@/components/results/InsightCard';
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
  const band = scoreBand(scores.totalPct);
  const headline = HEADLINES[state]?.[band] || '';
  const stateLabel = STATE_LABELS[state] || state;
  const videoUrl = STATE_VIDEOS[state];
  const resultsUrl = `${SITE_URL}/results/${id}`;

  const areaOrder = ['energy', 'focus'];

  return (
    <main className="min-h-screen">
      <header className="px-5 py-5 sm:px-8">
        <Logo />
      </header>

      <div className="mx-auto max-w-2xl px-5 pb-16 sm:px-8">
        {/* Big reveal */}
        <section className="rounded-2xl bg-white p-6 sm:p-8 text-navy-700 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange">
            {lead.first_name}, here's where you're operating from
          </p>
          <h1 className="mt-5 text-4xl sm:text-5xl">{stateLabel}</h1>
          <p className="mt-4 text-base sm:text-lg text-navy-600 max-w-[50ch] mx-auto">{headline}</p>

          <div className="mt-6 px-6 pt-6 pb-6">
            <Quadrant state={state} />
          </div>
        </section>

        {/* State video */}
        <section className="mt-6">
          <div className="aspect-video w-full rounded-2xl border border-dashed border-white/25 bg-navy-800 flex items-center justify-center text-center p-6">
            {videoUrl ? (
              <video src={videoUrl} controls className="h-full w-full rounded-2xl" />
            ) : (
              <p className="text-sm text-white/50">
                [Video slot: Keith's {stateLabel} state video embeds here. See TODO.md.]
              </p>
            )}
          </div>
        </section>

        {/* Insights */}
        <section className="mt-6 rounded-2xl bg-white p-6 sm:p-8 text-navy-700">
          <h2 className="text-2xl">Where it's coming from</h2>
          <div className="mt-4 grid grid-cols-1 gap-4">
            {areaOrder.map((area) => (
              <InsightCard
                key={area}
                label={AREA_LABELS[area]}
                body={AREA_INSIGHTS[area][areaBand(scores.areas[area].pct)]}
                isFixFirst={area === scores.lowestArea}
              />
            ))}
          </div>
        </section>

        {/* Two edges */}
        <section className="mt-6 rounded-2xl bg-white p-6 sm:p-8 text-navy-700">
          <h2 className="text-2xl">Which edge are you on</h2>
          <p className="mt-3 text-navy-600">{TWO_EDGES_COPY.intro}</p>
          <p className="mt-3 font-display text-2xl text-navy-700">{TWO_EDGES_COPY.line}</p>
          <p className="mt-3 text-navy-600">{TWO_EDGES_COPY.byState[state]}</p>
        </section>

        {/* Next steps */}
        <section className="mt-6">
          <h2 className="mb-4 text-2xl">What to do next</h2>
          <NextSteps revenueBand={lead.revenue_band} />
        </section>

        {/* Contact */}
        <section className="mt-6 rounded-2xl bg-white p-6 sm:p-8 text-navy-700">
          <h2 className="text-2xl">{CONTACT_COPY.heading}</h2>
          <p className="mt-3 text-navy-600">{CONTACT_COPY.body}</p>
        </section>

        {/* Share */}
        <section className="mt-8 flex justify-center">
          <ShareButton text={SHARE_COPY.text(stateLabel)} url={resultsUrl} />
        </section>
      </div>
    </main>
  );
}
