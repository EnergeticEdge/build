import Logo from '@/components/Logo';
import TrackEvent from '@/components/TrackEvent';
import TrackedLink from '@/components/TrackedLink';
import Quadrant from '@/components/results/Quadrant';

// Two frustration angles to split test against each other. Default is "know what
// to do, can't do it"; ?v=ready is "the business looks fine, I don't" (kept the
// same param name so existing links and tracking meta don't need to change).
const HOOKS = {
  frustration: {
    heading: "Are you frustrated that you know exactly what you should be doing, even though you never seem to do it?",
  },
  ready: {
    heading: "Are you frustrated that you're running on empty, even though the business is doing well?",
  },
};

export default async function LandingPage({ searchParams }) {
  const params = await searchParams;
  const variant = params?.v === 'ready' ? 'ready' : 'frustration';
  const hook = HOOKS[variant];

  return (
    <main>
      <TrackEvent event="landing_view" meta={{ variant }} />

      <section>
        <div className="site-header container">
          <div className="brand">
            <Logo />
          </div>
        </div>

        <div className="hero container">
          <p className="eyebrow">The Founder Energy Quiz</p>
          <h1 className="hero-headline">{hook.heading}</h1>
          <p className="hero-sub">
            Take the free Founder Energy Quiz. 20 questions, 3 minutes, and you'll know exactly which of the
            four founder States you're running your business from, and the first thing to change.
          </p>
          <TrackedLink
            event="quiz_start_click"
            meta={{ variant, location: 'hero' }}
            href="/quiz"
            className="btn btn-orange"
          >
            Take Quiz
          </TrackedLink>
          <p className="microcopy">Free. 3 minutes. Specific to you.</p>
        </div>
      </section>

      <div className="discover tee-section">
        <div className="container">
          <p className="eyebrow">What You'll Discover</p>
          <h2>Two answers you've been guessing at.</h2>
          <div className="discover-list">
            <div className="discover-item">
              <div className="num">01</div>
              <h3>Your State</h3>
              <p>
                Which of the four founder States you're running your business from, measured on the two axes
                that decide your output: focus and energy.
              </p>
            </div>
            <div className="discover-item">
              <div className="num">02</div>
              <h3>Your first move</h3>
              <p>The one thing to change first in your State. Specific to your result, not generic advice.</p>
            </div>
          </div>
          <TrackedLink
            event="quiz_start_click"
            meta={{ variant, location: 'discover' }}
            href="/quiz"
            className="btn btn-orange"
          >
            Take Quiz
          </TrackedLink>
          <p className="microcopy">20 questions. No right answers, just honest ones.</p>
        </div>
      </div>

      <div className="states-teaser tee-section">
        <div className="container">
          <h2>Every founder is running their business from one of four States.</h2>
          <div className="quadrant-teaser-wrap">
            <Quadrant state={null} />
          </div>

          <div className="states-grid">
            <div className="state-card">
              <div className="state-name">Frantic</div>
              <p>Low focus, high energy. Moving fast, not necessarily forward.</p>
            </div>
            <div className="state-card">
              <div className="state-name">Edge</div>
              <p>High focus, high energy. Energised, directed, grounded, engaged. Few founders score here.</p>
            </div>
            <div className="state-card">
              <div className="state-name">Fog</div>
              <p>Low focus, low energy. Everything feels heavy and nothing feels clear.</p>
            </div>
            <div className="state-card">
              <div className="state-name">Blocked</div>
              <p>High focus, low energy. You know exactly what to do. You just can't get to it.</p>
            </div>
          </div>

          <p className="teaser-note">Most founders guess wrong about which one they're in.</p>
          <TrackedLink
            event="quiz_start_click"
            meta={{ variant, location: 'states_teaser' }}
            href="/quiz"
            className="btn btn-orange"
          >
            Find Out Which One I'm In
          </TrackedLink>
        </div>
      </div>

      <div className="cta-band tee-section">
        <div className="container">
          <h2>Three minutes. No right answers. Just honest ones.</h2>
          <TrackedLink
            event="quiz_start_click"
            meta={{ variant, location: 'cta_band' }}
            href="/quiz"
            className="btn btn-navy"
          >
            Take the Quiz Now
          </TrackedLink>
          <p className="microcopy">Free. Specific to you.</p>
        </div>
      </div>

      <footer className="site-footer">
        <div className="brand">
          <Logo />
        </div>
        <p className="footer-tagline">Energy is revenue. Focus is profit.</p>
        <div className="social-links">
          <a href="https://www.linkedin.com/in/keith-west-3aa88b50/" target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
          <a href="https://www.instagram.com/keithwest._/" target="_blank" rel="noopener noreferrer">
            Instagram
          </a>
          <a href="https://www.facebook.com/profile.php?id=61575171456174" target="_blank" rel="noopener noreferrer">
            Facebook
          </a>
        </div>
      </footer>
    </main>
  );
}
