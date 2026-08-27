import TrackedLink from '@/components/TrackedLink';
import CalendarEmbed from './CalendarEmbed';
import { LINKS, CALL_COPY, nextStepsDoor, showNewsletterSecondary } from '@/lib/config';

function CallCard({ withEmbed }) {
  return (
    <div className="rounded-2xl bg-white p-6 sm:p-8 text-navy-700">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange">Your free call</p>
      <h2 className="mt-3 text-3xl">Talk it through with Keith</h2>
      <p className="mt-3 text-navy-600">{CALL_COPY}</p>
      {withEmbed ? (
        <CalendarEmbed />
      ) : (
        <TrackedLink
          event="call_booked_click"
          href={LINKS.calendarEmbed}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex items-center justify-center rounded-lg bg-orange px-6 py-4 font-sans font-bold text-white transition hover:-translate-y-0.5"
        >
          Book your free call →
        </TrackedLink>
      )}
    </div>
  );
}

function SecondaryLinks() {
  if (!LINKS.guide && !LINKS.newsletter) return null;
  return (
    <div className="mt-5 flex flex-wrap gap-3">
      {LINKS.guide && (
        <TrackedLink
          event="guide_download_click"
          href={LINKS.guide}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border-[1.5px] border-navy-100 px-5 py-3 text-sm font-bold text-navy-700 transition hover:border-orange"
        >
          Get the SIMPLER Guide →
        </TrackedLink>
      )}
      {LINKS.newsletter && (
        <TrackedLink
          event="guide_download_click"
          meta={{ type: 'newsletter' }}
          href={LINKS.newsletter}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border-[1.5px] border-navy-100 px-5 py-3 text-sm font-bold text-navy-700 transition hover:border-orange"
        >
          Read The Capacity Gap →
        </TrackedLink>
      )}
    </div>
  );
}

export default function NextSteps({ revenueBand }) {
  const door = nextStepsDoor(revenueBand);

  if (door === 'call_first') {
    return (
      <div className="flex flex-col gap-5">
        <CallCard withEmbed />
        {showNewsletterSecondary(revenueBand) && (
          <div className="rounded-2xl bg-white p-6 sm:p-8 text-navy-700">
            <h2 className="text-2xl">Or start with the guide</h2>
            <p className="mt-2 text-sm text-navy-600">
              Free, practical, no obligation to book anything.
            </p>
            <SecondaryLinks />
          </div>
        )}
      </div>
    );
  }

  // guide_first: SIMPLER Guide + newsletter lead, call is offered below.
  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-2xl bg-white p-6 sm:p-8 text-navy-700">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange">Start here</p>
        <h2 className="mt-3 text-3xl">Get the SIMPLER Guide</h2>
        <p className="mt-3 text-navy-600">
          A practical framework for founders who need more from their days without adding more to
          their plate.
        </p>
        <SecondaryLinks />
      </div>
      <CallCard withEmbed={false} />
    </div>
  );
}
