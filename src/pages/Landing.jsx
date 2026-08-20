import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLenis } from '../hooks/useLenis';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { ensureGsapPlugins } from '../lib/gsapSetup';
import { Nebula } from '../components/landing/Nebula';
import { StarField } from '../components/landing/StarField';
import { HeroDial } from '../components/landing/HeroDial';
import { Button } from '../components/ui/Button';
import { Panel, PanelHeading } from '../components/ui/Panel';
import { Footer } from '../components/layout/Footer';
import { CompassIcon, RingIcon, QuillIcon } from '../components/ui/Icons';

export default function Landing() {
  const navigate = useNavigate();
  const headlineRef = useRef(null);
  const revealRefs = useRef([]);
  const reducedMotion = useReducedMotion();
  useLenis();

  useEffect(() => {
    const { gsap, ScrollTrigger, SplitText } = ensureGsapPlugins();
    const ctx = gsap.context(() => {
      if (headlineRef.current && !reducedMotion) {
        const split = new SplitText(headlineRef.current, { type: 'words' });
        gsap.from(split.words, {
          yPercent: 110,
          opacity: 0,
          duration: 0.8,
          stagger: 0.06,
          ease: 'power3.out',
          delay: 0.15,
        });
      }

      revealRefs.current.forEach((el) => {
        if (!el) return;
        gsap.fromTo(
          el,
          { opacity: 0, y: reducedMotion ? 0 : 32 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 85%' },
          }
        );
      });
    });

    return () => ctx.revert();
  }, [reducedMotion]);

  const addReveal = (el) => {
    if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el);
  };

  return (
    <div className="min-h-screen">
      <header className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <RingIcon className="text-gold" />
          <span className="font-display text-2xl text-parchment tracking-wide">FocusFlow</span>
        </div>
        <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
          Enter
        </Button>
      </header>

      {/* Hero — the live dial IS the demo, no marketing filler beside it */}
      <section className="relative overflow-hidden min-h-[88vh] flex items-center">
        <Nebula />
        <StarField count={70} />
        <div className="absolute inset-0 bg-ink/25" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center flex flex-col items-center gap-8">
          <h1 ref={headlineRef} className="font-display text-5xl sm:text-6xl md:text-7xl text-parchment leading-[1.05]">
            Chart your focus like a night sky.
          </h1>
          <p className="font-body text-lg text-muted max-w-xl">
            Log a session, and watch it become a point of light. FocusFlow turns study time into a Focus Score,
            streaks, and rule-based insights — nothing ever leaves your browser.
          </p>
          <HeroDial target={87} />
          <Button variant="gold" size="lg" onClick={() => navigate('/dashboard')}>
            Begin Charting
          </Button>
        </div>
      </section>

      {/* Instrument-panel style feature layout: one large panel, two flanking */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-24">
        <div ref={addReveal} className="mb-10">
          <p className="font-body text-xs tracking-[0.18em] uppercase text-muted mb-1">How it works</p>
          <h2 className="font-display text-4xl text-parchment">Three instruments, one sky</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-5">
          <Panel tone="maroon" className="p-8" ref={addReveal}>
            <CompassIcon size={28} className="text-gold mb-4" />
            <h3 className="font-display text-2xl text-parchment mb-2">Timer & tasks, in one instrument panel</h3>
            <p className="text-muted leading-relaxed">
              Start a Pomodoro, a custom duration, or an open stopwatch. Log distractions as they happen. Every
              session rolls into today's Focus Score automatically — tasks completed, time on task, and how often
              you got pulled away.
            </p>
          </Panel>
          <div className="grid gap-5">
            <Panel ref={addReveal}>
              <RingIcon size={24} className="text-gold mb-3" />
              <h3 className="font-display text-xl text-parchment mb-1.5">Rule-based insights</h3>
              <p className="text-muted text-sm leading-relaxed">
                "Your focus drops after ~45 minutes." Patterns surface from your own history — no black-box AI, just
                straightforward rules over your data.
              </p>
            </Panel>
            <Panel ref={addReveal}>
              <QuillIcon size={24} className="text-gold mb-3" />
              <h3 className="font-display text-xl text-parchment mb-1.5">Gamified, not gimmicky</h3>
              <p className="text-muted text-sm leading-relaxed">
                XP and levels track consistency, not just raw hours. Badges reward zero-distraction sessions and
                real streaks.
              </p>
            </Panel>
          </div>
        </div>
      </section>

      {/* Star Chart teaser */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-24">
        <Panel ref={addReveal} className="relative overflow-hidden py-16 text-center">
          <StarField count={90} />
          <div className="relative z-10">
            <p className="font-body text-xs tracking-[0.18em] uppercase text-muted mb-2">Signature view</p>
            <h2 className="font-display text-4xl text-parchment mb-4">The Star Chart</h2>
            <p className="text-muted max-w-xl mx-auto mb-2">
              Every study day becomes a point of light — brighter and larger the higher your Focus Score. Streaks
              connect like constellations, so your history reads as a sky you're charting, not a to-do list you're
              clearing.
            </p>
          </div>
        </Panel>
      </section>

      <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-24 text-center" ref={addReveal}>
        <h2 className="font-display text-3xl text-parchment mb-3">Free. Local. No account.</h2>
        <p className="text-muted mb-6">
          There's no pricing table because there's nothing to buy. Everything runs and persists in this browser —
          export your profile any time as a plain JSON file.
        </p>
        <Button variant="primary" size="lg" onClick={() => navigate('/dashboard')}>
          Start Your First Session
        </Button>
      </section>

      <Footer />
    </div>
  );
}
