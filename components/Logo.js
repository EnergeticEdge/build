/*
  Placeholder wordmark standing in for TEELogoSide250px.png (real logo not supplied — see TODO.md).
  Swap for an <img> once the real files are available.
*/
export default function Logo({ className = '' }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
        <rect width="24" height="24" rx="4" fill="#0b3a6a" />
        <path d="M15 4 L9 20" stroke="#ff6a00" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <span className="font-display text-xl tracking-wide">
        THE ENERGETIC <span className="text-orange">EDGE</span>
      </span>
    </div>
  );
}
