import TrackedLink from '@/components/TrackedLink';
import CalendarEmbed from './CalendarEmbed';
import { CALL_LABELS } from '@/lib/quizData';
import { LINKS, CALL_COPY, nextStepsDoor, showNewsletterSecondary } from '@/lib/config';

function CallCard({ state, withEmbed }) {
  const label = CALL_LABELS[state] || 'Book your free call';
  return (
    <div className="action-card">
      <p className="eyebrow">Your free call</p>
      <h3>{label}</h3>
      <p className="body-copy">{CALL_COPY}</p>
      {withEmbed ? (
        <CalendarEmbed />
      ) : (
        <TrackedLink
          event="call_booked_click"
          href={LINKS.calendarEmbed}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-orange"
        >
          {label} &rarr;
        </TrackedLink>
      )}
    </div>
  );
}

function SecondaryLinks() {
  if (!LINKS.guide && !LINKS.newsletter) return null;
  return (
    <div className="secondary-links">
      {LINKS.guide && (
        <TrackedLink event="guide_download_click" href={LINKS.guide} target="_blank" rel="noopener noreferrer">
          Get the SIMPLER Guide &rarr;
        </TrackedLink>
      )}
      {LINKS.newsletter && (
        <TrackedLink
          event="guide_download_click"
          meta={{ type: 'newsletter' }}
          href={LINKS.newsletter}
          target="_blank"
          rel="noopener noreferrer"
        >
          Read The Capacity Gap &rarr;
        </TrackedLink>
      )}
    </div>
  );
}

export default function NextSteps({ revenueBand, state }) {
  const door = nextStepsDoor(revenueBand);

  if (door === 'call_first') {
    return (
      <>
        <CallCard state={state} withEmbed />
        {showNewsletterSecondary(revenueBand) && (
          <div className="action-card">
            <h3>Or start with the guide</h3>
            <p className="body-copy">Free, practical, no obligation to book anything.</p>
            <SecondaryLinks />
          </div>
        )}
      </>
    );
  }

  // guide_first: SIMPLER Guide + newsletter lead, call is offered below.
  return (
    <>
      <div className="action-card">
        <p className="eyebrow">Start here</p>
        <h3>Get the SIMPLER Guide</h3>
        <p className="body-copy">
          A practical framework for founders who need more from their days without adding more to their plate.
        </p>
        <SecondaryLinks />
      </div>
      <CallCard state={state} withEmbed={false} />
    </>
  );
}
