import { useMemo, useState } from 'react';
import { dateKey, groupByDay, scoreForDay } from '../../lib/focusScore';
import { formatMinutes } from '../../lib/time';

function seededJitter(seedStr, salt) {
  let h = 0;
  const s = seedStr + salt;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return (h % 1000) / 1000; // 0..1
}

/**
 * Signature "Star Chart": each study day becomes a point of light, sized
 * and brightened by that day's Focus Score. Consecutive streak days are
 * joined with a faint gold constellation line.
 */
export function StarChart({ sessions, tasks, weights, days = 84 }) {
  const [hovered, setHovered] = useState(null);
  const width = 720;
  const rowHeight = 46;
  const cols = Math.ceil(days / 7);
  const height = 7 * rowHeight + 24;

  const points = useMemo(() => {
    const byDay = groupByDay(sessions);
    const today = new Date();
    const list = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = dateKey(d.toISOString());
      const daySessions = byDay.get(key) || [];
      const score = daySessions.length ? scoreForDay(daySessions, tasks, weights) : 0;
      const totalSeconds = daySessions.reduce((sum, s) => sum + s.durationSeconds, 0);
      const col = cols - 1 - Math.floor(i / 7);
      const row = 6 - (i % 7);
      const jx = seededJitter(key, 'x') * 0.5 - 0.25;
      const jy = seededJitter(key, 'y') * 0.5 - 0.25;
      const x = 24 + (col + 0.5 + jx) * ((width - 48) / cols);
      const y = 12 + (row + 0.5 + jy) * rowHeight;
      list.push({ key, date: d, score, totalSeconds, hasSession: daySessions.length > 0, x, y });
    }
    return list;
  }, [sessions, tasks, weights, days, cols, width]);

  const lines = useMemo(() => {
    const segs = [];
    for (let i = 1; i < points.length; i++) {
      if (points[i].hasSession && points[i - 1].hasSession) {
        segs.push([points[i - 1], points[i]]);
      }
    }
    return segs;
  }, [points]);

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" role="img" aria-label="Star chart of study history">
        <rect x="0" y="0" width={width} height={height} fill="var(--color-ink)" />
        {/* faint ambient background stars */}
        {Array.from({ length: 40 }).map((_, i) => {
          const rx = seededJitter(`bg${i}`, 'x') * width;
          const ry = seededJitter(`bg${i}`, 'y') * height;
          return <circle key={i} cx={rx} cy={ry} r={0.6} fill="var(--color-muted)" opacity={0.25} />;
        })}

        {lines.map(([a, b], i) => (
          <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="var(--color-gold)" strokeWidth={0.75} opacity={0.35} />
        ))}

        {points.map((p) => {
          const radius = p.hasSession ? 2.5 + (p.score / 100) * 5.5 : 1.2;
          const opacity = p.hasSession ? 0.55 + (p.score / 100) * 0.45 : 0.2;
          const color = p.hasSession ? 'var(--color-gold)' : 'var(--color-muted)';
          return (
            <g key={p.key} onMouseEnter={() => setHovered(p)} onMouseLeave={() => setHovered(null)} className="cursor-pointer">
              <circle cx={p.x} cy={p.y} r={radius + 5} fill="transparent" />
              {p.hasSession && (
                <circle cx={p.x} cy={p.y} r={radius + 3} fill={color} opacity={opacity * 0.18} className="animate-twinkle" />
              )}
              <circle cx={p.x} cy={p.y} r={radius} fill={color} opacity={opacity} />
            </g>
          );
        })}
      </svg>

      {hovered && (
        <div className="absolute top-0 right-0 ff-surface-maroon border px-3 py-2 text-xs pointer-events-none">
          <div className="font-body text-parchment">{hovered.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</div>
          {hovered.hasSession ? (
            <>
              <div className="font-data text-gold">Score {hovered.score}</div>
              <div className="text-muted">{formatMinutes(hovered.totalSeconds)} studied</div>
            </>
          ) : (
            <div className="text-muted">No session</div>
          )}
        </div>
      )}
    </div>
  );
}
