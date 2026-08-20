import { useCallback, useState } from 'react';
import { useTimer } from './useTimer';
import { useAppData } from '../state/AppDataContext';
import { newSession } from '../lib/model';
import { useNotifications } from './useNotifications';

const MODE_PRESETS = {
  pomodoro25: { label: 'Pomodoro 25/5', focusSeconds: 25 * 60, breakSeconds: 5 * 60 },
  pomodoro50: { label: 'Pomodoro 50/10', focusSeconds: 50 * 60, breakSeconds: 10 * 60 },
  stopwatch: { label: 'Open Stopwatch', focusSeconds: 0, breakSeconds: 0 },
  custom: { label: 'Custom', focusSeconds: 0, breakSeconds: 0 },
};

/** Wires the generic timer hook to session persistence + distraction/break bookkeeping. */
export function useFocusSession({ taskId, mode = 'pomodoro25', customMinutes = 25 } = {}) {
  const { commitSession, settings } = useAppData();
  const { notify } = useNotifications();
  const [distractionModalOpen, setDistractionModalOpen] = useState(false);
  const [committed, setCommitted] = useState(false);

  const preset = MODE_PRESETS[mode] ?? MODE_PRESETS.pomodoro25;
  const targetSeconds = mode === 'custom' ? customMinutes * 60 : preset.focusSeconds;

  const handleComplete = useCallback(() => {
    if (settings.notificationsEnabled) notify('Session complete', { body: 'Nice work — log it and take a break.' });
  }, [settings.notificationsEnabled, notify]);

  const timer = useTimer({ targetSeconds, onComplete: handleComplete });

  const finish = useCallback(
    (opts = {}) => {
      if (!timer.startedAt || committed) return;
      const session = {
        ...newSession({ taskId: taskId ?? null }),
        startTime: timer.startedAt,
        endTime: new Date().toISOString(),
        durationSeconds: timer.elapsed,
        distractions: timer.distractions,
        breaksTaken: timer.breaksTaken,
        breaksSkipped: timer.breaksSkipped,
        completed: opts.completed ?? timer.status === 'done',
      };
      commitSession(session);
      setCommitted(true);
      return session;
    },
    [timer, taskId, commitSession, committed]
  );

  const endSession = useCallback(() => {
    finish({ completed: timer.status === 'done' || timer.elapsed > 10 });
    timer.stop();
  }, [finish, timer]);

  const abandonSession = useCallback(() => {
    if (timer.elapsed > 5) finish({ completed: false });
    timer.reset();
    setCommitted(false);
  }, [finish, timer]);

  const startNew = useCallback(() => {
    timer.reset();
    setCommitted(false);
  }, [timer]);

  return {
    ...timer,
    targetSeconds,
    distractionModalOpen,
    openDistractionModal: () => setDistractionModalOpen(true),
    closeDistractionModal: () => setDistractionModalOpen(false),
    endSession,
    abandonSession,
    startNew,
    committed,
    presets: MODE_PRESETS,
  };
}
