// White-on-navy variant, derived from the real logo (navy swapped for white,
// orange unchanged) since every page this appears on sits on the navy background
// and the brand overview calls for a white version there.
export default function Logo({ className = '' }) {
  return (
    <img
      src="/assets/logo-side-white.svg"
      alt="The Energetic Edge"
      className={`h-6 w-auto sm:h-7 ${className}`}
    />
  );
}
