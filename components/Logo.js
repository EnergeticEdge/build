// Coloured icon (navy triangle + orange arrow), white wordmark text: the navy
// icon still reads clearly against the app's dark navy background, and white
// keeps the "THE ENERGETIC EDGE" text legible rather than blending into it.
export default function Logo({ className = '' }) {
  return (
    <img
      src="/assets/logo-side-dark-bg.svg"
      alt="The Energetic Edge"
      className={`h-9 w-auto sm:h-11 ${className}`}
    />
  );
}
