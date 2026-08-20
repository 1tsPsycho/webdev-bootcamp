import { useMemo, useState } from 'react';

/** Small hand-rolled SVG line chart — kept dependency-free and on-palette. */
export function TrendChart({ points, height = 180, valueLabel = '', color = 'var(--color-gold)', maxOverride }) {
  const [hoverIndex, setHoverIndex] = useState(null);
  const width = 640;
  const padding = { top: 16, right: 16, bottom: 28, left: 16 };

  const { path, areaPath, coords, maxValue } = useMemo(() => {
    if (points.length === 0) return { path: '', areaPath: '', coords: [], maxValue: 1 };
    const max = maxOverride ?? Math.max(1, ...points.map((p) => p.value));
    const innerW = width - padding.left - padding.right;
    const innerH = height - padding.top - padding.bottom;
    const step = points.length > 1 ? innerW / (points.length - 1) : 0;

    const cs = points.map((p, i) => ({
      x: padding.left + i * step,
      y: padding.top + innerH * (1 - Math.min(1, p.value / max)),
      ...p,
    }));

    const linePath = cs.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ');
    const area = `${linePath} L ${cs[cs.length - 1].x} ${padding.top + innerH} L ${cs[0].x} ${padding.top + innerH} Z`;

    return { path: linePath, areaPath: area, coords: cs, maxValue: max };
  }, [points, height, maxOverride]);

  if (points.length === 0) {
    return <div className="text-muted text-sm py-10 text-center">Not enough data yet.</div>;
  }

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" role="img" aria-label={valueLabel}>
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.28" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((f) => (
          <line
            key={f}
            x1={padding.left}
            x2={width - padding.right}
            y1={padding.top + (height - padding.top - padding.bottom) * f}
            y2={padding.top + (height - padding.top - padding.bottom) * f}
            stroke="var(--color-border)"
            strokeWidth="1"
          />
        ))}
        <path d={areaPath} fill="url(#trendFill)" />
        <path d={path} fill="none" stroke={color} strokeWidth="2" />
        {coords.map((c, i) => (
          <g key={i}>
            <circle
              cx={c.x}
              cy={c.y}
              r={hoverIndex === i ? 4.5 : 3}
              fill={color}
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
              className="cursor-pointer"
            />
            {i % Math.ceil(coords.length / 7 || 1) === 0 && (
              <text x={c.x} y={height - 8} fontSize="9" fill="var(--color-muted)" textAnchor="middle" fontFamily="Manrope">
                {c.label}
              </text>
            )}
          </g>
        ))}
      </svg>
      {hoverIndex != null && (
        <div className="absolute top-0 left-0 ff-surface-maroon border px-2.5 py-1.5 text-xs pointer-events-none">
          <div className="text-parchment">{coords[hoverIndex].label}</div>
          <div className="font-data text-gold">{coords[hoverIndex].value}</div>
        </div>
      )}
    </div>
  );
}
