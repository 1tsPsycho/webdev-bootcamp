import { useMemo } from 'react';

/** Sparse, irregularly-spaced gold star texture — the one ambient-texture pattern that's on-concept. */
export function StarField({ count = 60, className = '' }) {
  const stars = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: Math.random() * 1.8 + 0.6,
        delay: Math.random() * 4,
        gold: Math.random() > 0.75,
      })),
    [count]
  );

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`} aria-hidden="true">
      {stars.map((s) => (
        <span
          key={s.id}
          className="absolute rounded-full animate-twinkle"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: s.size,
            height: s.size,
            background: s.gold ? 'var(--color-gold)' : 'var(--color-parchment)',
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
