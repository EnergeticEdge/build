import Logo from '@/components/Logo';
import TrackEvent from '@/components/TrackEvent';
import GuideForm from '@/components/guide/GuideForm';

export const metadata = {
  title: 'The SIMPLER Guide | The Energetic Edge',
};

export default function GuidePage() {
  return (
    <main>
      <TrackEvent event="guide_page_view" />

      <div className="site-header container">
        <div className="brand">
          <Logo />
        </div>
      </div>

      <div className="capture-body">
        <GuideForm />
      </div>

      <p className="tagline-footer">Energy is revenue. Focus is profit.</p>
    </main>
  );
}
