import { ProgressRing } from '../ui/ProgressRing';
import { formatClock } from '../../lib/time';

export function TimerDial({ elapsed, remaining, progress, status, size = 260 }) {
  const displaySeconds = remaining != null ? remaining : elapsed;
  const ringValue = progress != null ? progress : Math.min(1, elapsed / 3600);

  return (
    <ProgressRing
      value={ringValue}
      size={size}
      strokeWidth={12}
      trackColor="var(--color-maroon-soft)"
      progressColor="var(--color-gold)"
    >
      <div className="flex flex-col items-center">
        <span className="font-data text-5xl sm:text-6xl text-parchment tabular-nums">{formatClock(displaySeconds)}</span>
        <span className="font-body text-xs uppercase tracking-[0.2em] text-muted mt-2">
          {status === 'idle' && 'Ready'}
          {status === 'running' && 'In session'}
          {status === 'paused' && 'Paused'}
          {status === 'done' && 'Complete'}
        </span>
      </div>
    </ProgressRing>
  );
}
