const COLORS = ['var(--color-gold)', 'var(--color-royal-soft)', 'var(--color-maroon-soft)', 'var(--color-muted)'];

export function DistractionBreakdown({ counts }) {
  const entries = Object.entries(counts);
  const total = entries.reduce((s, [, n]) => s + n, 0);

  if (total === 0) {
    return <div className="text-muted text-sm py-6 text-center">No distractions logged yet — good sign.</div>;
  }

  return (
    <div className="space-y-3">
      {entries
        .sort((a, b) => b[1] - a[1])
        .map(([type, count], i) => {
          const pct = Math.round((count / total) * 100);
          return (
            <div key={type}>
              <div className="flex justify-between text-sm mb-1">
                <span className="capitalize text-parchment">{type}</span>
                <span className="font-data text-muted">
                  {count} · {pct}%
                </span>
              </div>
              <div className="h-2 bg-border">
                <div className="h-full" style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }} />
              </div>
            </div>
          );
        })}
    </div>
  );
}
