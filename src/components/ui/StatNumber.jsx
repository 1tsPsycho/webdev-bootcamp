export function StatNumber({ value, label, tone = 'gold', size = 'md' }) {
  const toneClass = { gold: 'text-gold', parchment: 'text-parchment', success: 'text-success', warning: 'text-warning' }[tone];
  const sizeClass = { sm: 'text-2xl', md: 'text-4xl', lg: 'text-6xl' }[size];
  return (
    <div>
      <div className={`font-data ${sizeClass} ${toneClass} leading-none`}>{value}</div>
      {label && <div className="font-body text-xs uppercase tracking-[0.14em] text-muted mt-2">{label}</div>}
    </div>
  );
}
