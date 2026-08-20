import { useMemo, useState } from 'react';
import { useAppData } from '../state/AppDataContext';
import { Panel, PanelHeading } from '../components/ui/Panel';
import { TrendChart } from '../components/charts/TrendChart';
import { DistractionBreakdown } from '../components/charts/DistractionBreakdown';
import { StatNumber } from '../components/ui/StatNumber';
import { dateKey, groupByDay, scoreForDay } from '../lib/focusScore';
import { last7Days, last30Days } from '../lib/time';
import { DISTRACTION_TYPES } from '../lib/model';

export default function Analytics() {
  const { sessions, tasks, settings } = useAppData();
  const [range, setRange] = useState('week');

  const byDay = useMemo(() => groupByDay(sessions), [sessions]);
  const days = range === 'week' ? last7Days() : last30Days();

  const scorePoints = useMemo(
    () =>
      days.map((d) => {
        const daySessions = byDay.get(d) || [];
        const score = daySessions.length ? scoreForDay(daySessions, tasks, settings.focusScoreWeights) : 0;
        return { label: new Date(d).toLocaleDateString(undefined, { weekday: range === 'week' ? 'short' : undefined, day: range === 'month' ? 'numeric' : undefined }), value: score };
      }),
    [days, byDay, tasks, settings.focusScoreWeights, range]
  );

  const hoursPoints = useMemo(
    () =>
      days.map((d) => {
        const daySessions = byDay.get(d) || [];
        const hours = Math.round((daySessions.reduce((s, x) => s + x.durationSeconds, 0) / 3600) * 10) / 10;
        return { label: new Date(d).toLocaleDateString(undefined, { weekday: range === 'week' ? 'short' : undefined, day: range === 'month' ? 'numeric' : undefined }), value: hours };
      }),
    [days, byDay, range]
  );

  const distractionCounts = useMemo(() => {
    const counts = Object.fromEntries(DISTRACTION_TYPES.map((t) => [t, 0]));
    for (const s of sessions) {
      for (const d of s.distractions) {
        counts[d.type] = (counts[d.type] || 0) + 1;
      }
    }
    return counts;
  }, [sessions]);

  const avgScore = Math.round(scorePoints.reduce((s, p) => s + p.value, 0) / (scorePoints.length || 1));
  const totalHours = Math.round(hoursPoints.reduce((s, p) => s + p.value, 0) * 10) / 10;

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="font-body text-xs tracking-[0.18em] uppercase text-muted mb-1">Analytics</p>
          <h1 className="font-display text-4xl text-parchment">Patterns in the Sky</h1>
        </div>
        <div className="flex gap-2">
          {['week', 'month'].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 text-sm capitalize border transition-colors cursor-pointer ${
                range === r ? 'border-gold text-gold' : 'border-border text-muted'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Panel><StatNumber value={avgScore} label="Avg Focus Score" size="sm" /></Panel>
        <Panel><StatNumber value={`${totalHours}h`} label="Total Studied" size="sm" tone="parchment" /></Panel>
        <Panel><StatNumber value={sessions.filter((s) => s.completed).length} label="Sessions Completed" size="sm" tone="parchment" /></Panel>
        <Panel><StatNumber value={sessions.reduce((s, x) => s + x.distractions.length, 0)} label="Total Distractions" size="sm" tone="warning" /></Panel>
      </div>

      <Panel>
        <PanelHeading eyebrow="Trend" title="Focus Score" />
        <TrendChart points={scorePoints} valueLabel="Focus Score trend" maxOverride={100} />
      </Panel>

      <Panel tone="maroon">
        <PanelHeading eyebrow="Trend" title="Study Hours" />
        <TrendChart points={hoursPoints} valueLabel="Study hours trend" color="var(--color-royal-soft)" />
      </Panel>

      <Panel>
        <PanelHeading eyebrow="Breakdown" title="Distractions by Category" />
        <DistractionBreakdown counts={distractionCounts} />
      </Panel>
    </div>
  );
}
