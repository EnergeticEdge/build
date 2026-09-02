import Logo from '@/components/Logo';
import TrackEvent from '@/components/TrackEvent';
import CalendarEmbed from '@/components/results/CalendarEmbed';
import { CALL_COPY, CALL_PRICE } from '@/lib/config';

export const metadata = {
  title: 'Book Your Clarity Call | The Energetic Edge',
};

export default function CallPage() {
  return (
    <main>
      <TrackEvent event="call_page_view" />

      <div className="site-header container">
        <div className="brand">
          <Logo />
        </div>
      </div>

      <div className="hero container">
        <p className="eyebrow">Free 30-minute call</p>
        <h1 className="hero-headline">Book Your Clarity Call</h1>
        <div className="price-tag" style={{ justifyContent: 'center' }}>
          <span className="was">{CALL_PRICE.was}</span>
          <span className="now">{CALL_PRICE.now}</span>
        </div>
        <p className="hero-sub">{CALL_COPY}</p>
      </div>

      <div className="narrow" style={{ paddingBottom: 60 }}>
        <CalendarEmbed />
      </div>

      <p className="tagline-footer">Energy is revenue. Focus is profit.</p>
    </main>
  );
}
