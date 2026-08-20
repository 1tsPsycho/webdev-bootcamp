import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ProgressRing } from '../ui/ProgressRing';
import { useReducedMotion } from '../../hooks/useReducedMotion';

/** The hero's live demo: an animated Focus Score dial that counts up on load — the product as its own demo. */
export function HeroDial({ target = 87 }) {
  const [score, setScore] = useState(0);
  const proxy = useRef({ value: 0 });
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      setScore(target);
      return undefined;
    }
    const tween = gsap.to(proxy.current, {
      value: target,
      duration: 2.2,
      delay: 0.3,
      ease: 'power2.out',
      onUpdate: () => setScore(Math.round(proxy.current.value)),
    });
    return () => tween.kill();
  }, [target, reducedMotion]);

  return (
    <ProgressRing value={score / 100} size={280} strokeWidth={14} trackColor="var(--color-maroon-soft)" progressColor="var(--color-gold)">
      <div className="flex flex-col items-center">
        <span className="font-data text-7xl text-gold tabular-nums">{score}</span>
        <span className="font-body text-xs uppercase tracking-[0.2em] text-parchment/70 mt-2">Focus Score</span>
      </div>
    </ProgressRing>
  );
}
