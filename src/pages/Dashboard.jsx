import { useMemo, useState } from 'react';
import { useAppData } from '../state/AppDataContext';
import { useFocusSession } from '../hooks/useFocusSession';
import { TimerDial } from '../components/timer/TimerDial';
import { TimerControls } from '../components/timer/TimerControls';
import { DistractionModal } from '../components/timer/DistractionModal';
import { Panel, PanelHeading } from '../components/ui/Panel';
import { StatNumber } from '../components/ui/StatNumber';
import { ProgressRing } from '../components/ui/ProgressRing';
import { Button } from '../components/ui/Button';
import { QuillIcon, CheckIcon } from '../components/ui/Icons';
import { formatMinutes } from '../lib/time';
import { dateKey, groupByDay, scoreForDay, generateInsights } from '../lib/focusScore';

const MODES = [
  { key: 'pomodoro25', label: '25 / 5' },
  { key: 'pomodoro50', label: '50 / 10' },
  { key: 'stopwatch', label: 'Stopwatch' },
  { key: 'custom', label: 'Custom' },
];

export default function Dashboard() {
  const { profile, tasks, sessions, settings, addTask, toggleTaskComplete } = useAppData();
  const [mode, setMode] = useState('pomodoro25');
  const [customMinutes, setCustomMinutes] = useState(settings.pomodoroFocusMinutes);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [quickTitle, setQuickTitle] = useState('');

  const session = useFocusSession({ taskId: selectedTaskId || null, mode, customMinutes });

  const todayKey = dateKey(new Date().toISOString());
  const todaySessions = useMemo(() => (groupByDay(sessions).get(todayKey) || []), [sessions, todayKey]);
  const todayScore = scoreForDay(todaySessions, tasks, settings.focusScoreWeights);
  const todaySeconds = todaySessions.reduce((s, x) => s + x.durationSeconds, 0);
  const todayDistractions = todaySessions.reduce((s, x) => s + x.distractions.length, 0);
  const tasksCompletedToday = tasks.filter((t) => t.completedAt && dateKey(t.completedAt) === todayKey).length;

  const insights = useMemo(
    () => generateInsights({ sessions, tasks, focusScoreToday: todayScore }),
    [sessions, tasks, todayScore]
  );

  const goalProgress = Math.min(1, todaySeconds / 60 / settings.dailyGoalMinutes);
  const pendingTasks = tasks.filter((t) => t.status === 'pending');

  return (
    <div className="space-y-8">
      <div>
        <p className="font-body text-xs tracking-[0.18em] uppercase text-muted mb-1">Dashboard</p>
        <h1 className="font-display text-4xl text-parchment">Welcome back, {profile.displayName}</h1>
      </div>

      {/* instrument panel: central dial flanked by unevenly-sized panels */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_280px] gap-5 items-start">
        <div className="space-y-5 order-2 lg:order-1">
          <Panel>
            <PanelHeading eyebrow="Today" title="Snapshot" />
            <div className="grid grid-cols-2 gap-4">
              <StatNumber value={todayScore} label="Focus Score" size="sm" />
              <StatNumber value={formatMinutes(todaySeconds)} label="Studied" size="sm" tone="parchment" />
              <StatNumber value={tasksCompletedToday} label="Tasks Done" size="sm" tone="parchment" />
              <StatNumber value={todayDistractions} label="Distractions" size="sm" tone="warning" />
            </div>
          </Panel>
          <Panel tone="maroon">
            <PanelHeading eyebrow="Goal" title="Daily Progress" />
            <div className="flex items-center gap-4">
              <ProgressRing value={goalProgress} size={72} strokeWidth={7}>
                <span className="font-data text-sm text-gold">{Math.round(goalProgress * 100)}%</span>
              </ProgressRing>
              <p className="text-sm text-muted">
                {formatMinutes(todaySeconds)} of {formatMinutes(settings.dailyGoalMinutes * 60)}
              </p>
            </div>
          </Panel>
        </div>

        <Panel className="flex flex-col items-center py-10 order-1 lg:order-2">
          <div className="flex gap-2 mb-6 flex-wrap justify-center">
            {MODES.map((m) => (
              <button
                key={m.key}
                disabled={session.status !== 'idle'}
                onClick={() => setMode(m.key)}
                className={`px-3 py-1 text-xs border transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 ${
                  mode === m.key ? 'border-gold text-gold' : 'border-border text-muted'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {mode === 'custom' && session.status === 'idle' && (
            <input
              type="number"
              min="1"
              value={customMinutes}
              onChange={(e) => setCustomMinutes(Number(e.target.value))}
              className="mb-6 w-24 text-center bg-ink border border-border focus:border-gold px-2 py-1 font-data text-parchment outline-none"
            />
          )}

          <TimerDial elapsed={session.elapsed} remaining={session.remaining} progress={session.progress} status={session.status} />

          {session.status === 'idle' && pendingTasks.length > 0 && (
            <select
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
              className="mt-6 bg-ink border border-border focus:border-gold px-3 py-2 text-sm text-parchment font-body outline-none max-w-xs"
            >
              <option value="">No linked task</option>
              {pendingTasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          )}

          <div className="mt-6 w-full">
            <TimerControls session={session} />
          </div>

          <DistractionModal open={session.distractionModalOpen} onClose={session.closeDistractionModal} onSelect={session.logDistraction} />
        </Panel>

        <div className="space-y-5 order-3">
          <Panel>
            <PanelHeading eyebrow="Insight" title="Rule of Thumb" />
            <p className="font-display text-lg text-parchment leading-snug italic">"{insights[0]}"</p>
          </Panel>

          <Panel tone="maroon">
            <PanelHeading
              eyebrow="Quick Add"
              title="Task"
              action={<QuillIcon size={16} className="text-gold" />}
            />
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!quickTitle.trim()) return;
                addTask({ title: quickTitle.trim() });
                setQuickTitle('');
              }}
              className="flex gap-2"
            >
              <input
                value={quickTitle}
                onChange={(e) => setQuickTitle(e.target.value)}
                placeholder="New task..."
                className="flex-1 bg-ink border border-border focus:border-gold px-3 py-2 text-sm text-parchment font-body outline-none"
              />
              <Button type="submit" size="sm" variant="gold">
                Add
              </Button>
            </form>
            <div className="mt-4 space-y-2 max-h-48 overflow-y-auto ff-scrollbar">
              {pendingTasks.length === 0 ? (
                <p className="text-xs text-muted">No pending tasks — add one to get started.</p>
              ) : (
                pendingTasks.slice(0, 6).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => toggleTaskComplete(t.id)}
                    className="w-full flex items-center gap-2 text-left text-sm text-parchment hover:text-gold transition-colors cursor-pointer"
                  >
                    <span className="w-4 h-4 border border-border flex items-center justify-center shrink-0">
                      <CheckIcon size={10} className="opacity-0" />
                    </span>
                    <span className="truncate">{t.title}</span>
                  </button>
                ))
              )}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
