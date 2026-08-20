import { useMemo, useState } from 'react';
import { useAppData } from '../state/AppDataContext';
import { StarChart } from '../components/starchart/StarChart';
import { Panel, PanelHeading } from '../components/ui/Panel';
import { Button } from '../components/ui/Button';
import { formatMinutes, formatRelativeDate } from '../lib/time';
import { dateKey, groupByDay, scoreForDay } from '../lib/focusScore';
import { sessionsToCSV, downloadFile } from '../lib/exportImport';
import { downloadDailyRecap } from '../lib/recapImage';

export default function History() {
  const { profile, sessions, tasks, settings } = useAppData();
  const [range, setRange] = useState(84);

  const byDay = useMemo(() => groupByDay(sessions), [sessions]);
  const sortedDays = useMemo(() => [...byDay.keys()].sort().reverse(), [byDay]);

  const todayKey = dateKey(new Date().toISOString());
  const todaySessions = byDay.get(todayKey) || [];
  const todayScore = scoreForDay(todaySessions, tasks, settings.focusScoreWeights);
  const todaySeconds = todaySessions.reduce((s, x) => s + x.durationSeconds, 0);
  const tasksCompletedToday = tasks.filter((t) => t.completedAt && dateKey(t.completedAt) === todayKey).length;

  const bestDay = useMemo(() => {
    let best = { key: null, score: -1 };
    for (const [key, daySessions] of byDay) {
      const score = scoreForDay(daySessions, tasks, settings.focusScoreWeights);
      if (score > best.score) best = { key, score };
    }
    return best.key ? best : null;
  }, [byDay, tasks, settings.focusScoreWeights]);

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="font-body text-xs tracking-[0.18em] uppercase text-muted mb-1">History</p>
          <h1 className="font-display text-4xl text-parchment">Your Star Chart</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => downloadFile('focusflow-sessions.csv', sessionsToCSV(sessions), 'text/csv')}>
            Export CSV
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              downloadDailyRecap({
                displayName: profile.displayName,
                dateLabel: new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric' }),
                focusScore: todayScore,
                studySeconds: todaySeconds,
                tasksCompleted: tasksCompletedToday,
                distractionCount: todaySessions.reduce((s, x) => s + x.distractions.length, 0),
              })
            }
          >
            Daily Recap Card
          </Button>
        </div>
      </div>

      <Panel>
        <PanelHeading eyebrow="Constellation" title={`Last ${range} Days`} />
        <div className="flex gap-2 mb-4">
          {[28, 84, 168].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1 text-xs border transition-colors cursor-pointer ${
                range === r ? 'border-gold text-gold' : 'border-border text-muted'
              }`}
            >
              {r}d
            </button>
          ))}
        </div>
        {sessions.length === 0 ? (
          <p className="text-muted text-sm py-10 text-center">Your sky is empty — complete a session to plot your first star.</p>
        ) : (
          <StarChart sessions={sessions} tasks={tasks} weights={settings.focusScoreWeights} days={range} />
        )}
      </Panel>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Panel tone="maroon">
          <PanelHeading eyebrow="Personal Record" title="Longest Streak" />
          <p className="font-data text-5xl text-gold">{profile.longestStreak}</p>
          <p className="text-sm text-muted mt-1">days in a row</p>
        </Panel>
        <Panel tone="maroon">
          <PanelHeading eyebrow="Personal Record" title="Best Focus Score" />
          <p className="font-data text-5xl text-gold">{bestDay ? bestDay.score : '—'}</p>
          <p className="text-sm text-muted mt-1">{bestDay ? formatRelativeDate(bestDay.key) : 'No sessions yet'}</p>
        </Panel>
      </div>

      <Panel>
        <PanelHeading eyebrow="Log" title="Session History" />
        {sortedDays.length === 0 ? (
          <p className="text-muted text-sm py-6 text-center">No sessions logged yet.</p>
        ) : (
          <div className="space-y-4 max-h-[480px] overflow-y-auto ff-scrollbar pr-1">
            {sortedDays.map((day) => {
              const daySessions = byDay.get(day);
              const score = scoreForDay(daySessions, tasks, settings.focusScoreWeights);
              return (
                <div key={day} className="border-b border-border pb-3 last:border-0">
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="font-body text-parchment text-sm">{formatRelativeDate(day)}</span>
                    <span className="font-data text-gold text-sm">Score {score}</span>
                  </div>
                  <div className="space-y-1">
                    {daySessions.map((s) => (
                      <div key={s.id} className="flex justify-between text-xs text-muted">
                        <span>
                          {new Date(s.startTime).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })} ·{' '}
                          {formatMinutes(s.durationSeconds)}
                        </span>
                        <span>
                          {s.distractions.length} distraction{s.distractions.length === 1 ? '' : 's'} ·{' '}
                          {s.completed ? 'completed' : 'abandoned'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Panel>
    </div>
  );
}
