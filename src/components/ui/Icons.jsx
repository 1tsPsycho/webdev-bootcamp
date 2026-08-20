// Custom line-mark icon set drawn from the observatory motif — no default
// icon-pack (Lucide/Heroicons) glyphs anywhere in the app.

const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' };

export function CompassIcon({ size = 20, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <circle cx="12" cy="12" r="9" />
      <path d="M15.5 8.5 13 13l-4.5 2.5L11 11l4.5-2.5Z" />
    </svg>
  );
}

export function RingIcon({ size = 20, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3.2" />
    </svg>
  );
}

export function QuillIcon({ size = 20, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <path d="M19 5c-5 0-11 3-13 11 3-1 5-1 6-2M19 5c0 5-3 11-11 13M19 5l-3 1" />
    </svg>
  );
}

export function StarIcon({ size = 12, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" fill="currentColor" />
    </svg>
  );
}

export function MoonIcon({ size = 20, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <path d="M17 12.5A7 7 0 0 1 9.5 5 7.5 7.5 0 1 0 17 12.5Z" />
    </svg>
  );
}

export function FlameIcon({ size = 20, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <path d="M12 3c1 3-3 4-3 7a3 3 0 0 0 6 0c0-1-.5-1.5-1-2 1.5 1 3 3 3 5.5A5 5 0 0 1 7 13.5C7 8 12 7 12 3Z" />
    </svg>
  );
}

export function CloseIcon({ size = 18, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function CheckIcon({ size = 16, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

export function ChevronIcon({ size = 16, className = '', direction = 'right' }) {
  const rotations = { right: 0, down: 90, left: 180, up: 270 };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      style={{ transform: `rotate(${rotations[direction]}deg)` }}
      {...base}
    >
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}
