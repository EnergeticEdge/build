import Logo from '@/components/Logo';
import TrackEvent from '@/components/TrackEvent';
import TrackedLink from '@/components/TrackedLink';

// Two frustration angles to split test against each other, not a frustration-vs-
// readiness pair. Default is "know what to do, can't do it"; ?v=ready is "the
// business looks fine, I don't" (kept the same param name so existing links and
// tracking meta don't need to change).
const HOOKS = {
  frustration: {
    eyebrow: '15 questions · 3 minutes · no fluff',
    heading: "Are you frustrated that you know exactly what you should be doing, even though you never seem to do it?",
    body: "You've got the plan. You know the next move. And somehow the day still gets away from you before you touch it. That's not a discipline problem, whatever it feels like at 11pm. Fifteen questions tell you what's actually running your business right now, and what to fix first.",
  },
  ready: {
    eyebrow: '15 questions · 3 minutes · no fluff',
    heading: "Are you frustrated that you're running on empty, even though the business is doing well?",
    body: "From the outside, it looks like it's working. From the inside, you're not sure how much longer you can keep doing it this way. Fifteen questions tell you what's actually running your business right now, and what to fix first.",
  },
};

export default async function LandingPage({ searchParams }) {
  const params = await searchParams;
  const variant = params?.v === 'ready' ? 'ready' : 'frustration';
  const hook = HOOKS[variant];

  return (
    <main className="min-h-screen flex flex-col">
      <TrackEvent event="landing_view" meta={{ variant }} />

      <header className="px-5 py-5 sm:px-8">
        <Logo />
      </header>

      {/* Hook */}
      <section className="px-5 sm:px-8 pt-6 pb-10 sm:pt-10 sm:pb-14">
        <div className="mx-auto max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange">{hook.eyebrow}</p>
          <h1 className="mt-4 text-[42px] leading-[0.95] sm:text-6xl">{hook.heading}</h1>
          <p className="mt-5 text-base sm:text-lg text-white/80 max-w-[42ch]">{hook.body}</p>
          <div className="mt-8">
            <TrackedLink
              event="quiz_start_click"
              meta={{ variant, location: 'hero' }}
              href="/quiz"
              className="inline-flex items-center justify-center rounded-lg bg-orange px-7 py-4 font-sans font-bold text-white transition hover:-translate-y-0.5"
            >
              Start the quiz →
            </TrackedLink>
            <p className="mt-3 text-xs uppercase tracking-[0.1em] text-white/50">
              Free. 3 minutes. Straight to the point.
            </p>
          </div>
        </div>
      </section>

      {/* Value proposition */}
      <section className="bg-navy-800 px-5 sm:px-8 py-12 sm:py-16">
        <div className="mx-auto max-w-xl">
          <h2 className="text-3xl sm:text-4xl">Energy is revenue. Focus is profit.</h2>
          <p className="mt-4 text-base sm:text-lg text-white/80 max-w-[46ch]">
            The quiz measures the two things that actually determine how you perform: your energy and your
            focus. You'll get your state and the one thing to fix first.
          </p>
        </div>
      </section>

      {/* Credibility */}
      <section className="px-5 sm:px-8 py-12 sm:py-16">
        <div className="mx-auto max-w-xl">
          <h2 className="text-3xl sm:text-4xl">Built by someone who runs the numbers on this for a living</h2>
          <p className="mt-4 text-base sm:text-lg text-white/80 max-w-[46ch]">
            Keith West built The Energetic Edge working 1:1 with founders running six and seven-figure service
            businesses: the ones carrying the whole operation in their head, running on adrenaline and caffeine,
            and stuck on why it feels harder than it used to.
          </p>
          <p className="mt-4 text-sm text-white/50 max-w-[46ch]">
            [ADD REAL CREDIBILITY STAT: e.g. number of founders taken through the quiz or programme, or a
            measurable outcome. See TODO.md.]
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-navy-800 px-5 sm:px-8 py-14 sm:py-20 mt-auto">
        <div className="mx-auto max-w-xl text-center sm:text-left">
          <h2 className="text-3xl sm:text-4xl">Find out what's actually running your business.</h2>
          <p className="mt-3 text-base text-white/80">Free. Three minutes. Straight to the point.</p>
          <div className="mt-7">
            <TrackedLink
              event="quiz_start_click"
              meta={{ variant, location: 'footer' }}
              href="/quiz"
              className="inline-flex items-center justify-center rounded-lg bg-orange px-7 py-4 font-sans font-bold text-white transition hover:-translate-y-0.5"
            >
              Start the quiz →
            </TrackedLink>
          </div>
        </div>
      </section>
    </main>
  );
}
