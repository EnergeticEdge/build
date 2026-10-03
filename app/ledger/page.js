import Logo from '@/components/Logo';
import TrackEvent from '@/components/TrackEvent';
import CapacityLedger from '@/components/ledger/CapacityLedger';
import './ledger.css';

export const metadata = {
  title: 'The Capacity Ledger | The Energetic Edge',
  description:
    'Five entries. Ten minutes. Put a pound figure on what running at the edge of your capacity cost your business in the last 90 days.',
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
