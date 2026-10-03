import Logo from '@/components/Logo';
import TrackEvent from '@/components/TrackEvent';
import CapacityLedger from '@/components/ledger/CapacityLedger';
import { SITE_URL } from '@/lib/config';
import './ledger.css';

export const metadata = {
  // Social cards need absolute image URLs.
  metadataBase: new URL(SITE_URL),
  title: 'The Capacity Ledger | The Energetic Edge',
  description:
    'Five entries. Ten minutes. Put a pound figure on what running at the edge of your capacity cost your business in the last 90 days.',
  openGraph: {
    title: 'The Capacity Ledger | The Energetic Edge',
    description: 'Five entries. Ten minutes. Put a pound figure on what the last 90 days really cost you.',
    images: [{ url: '/assets/og-ledger.png', width: 1200, height: 630 }],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', images: ['/assets/og-ledger.png'] },
};

export default function LedgerPage() {
  return (
    <div className="cl">
      <TrackEvent event="ledger_page_view" />
      <div className="site-header cl-wrap">
        <div className="brand">
          <Logo />
        </div>
      </div>
      <CapacityLedger />
    </div>
  );
}
