import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Generic session timer. `targetSeconds` of 0/null means an open stopwatch
 * (counts up with no end); otherwise counts down and calls onComplete when
 * it hits zero (used for Pomodoro presets and custom durations).
 */
export function useTimer({ targetSeconds = 0, onComplete } = {}) {
  const [status, setStatus] = useState('idle'); // idle | running | paused | done
  const [elapsed, setElapsed] = useState(0);
  const [distractions, setDistractions] = useState([]);
  const [breaksTaken, setBreaksTaken] = useState(0);
  const [breaksSkipped, setBreaksSkipped] = useState(0);
  const [startedAt, setStartedAt] = useState(null);
  const intervalRef = useRef(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (status !== 'running') return undefined;
    intervalRef.current = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 1;
        if (targetSeconds > 0 && next >= targetSeconds) {
          clearInterval(intervalRef.current);
          setStatus('done');
          queueMicrotask(() => onCompleteRef.current?.());
          return targetSeconds;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [status, targetSeconds]);

  const start = useCallback(() => {
    setStartedAt((prev) => prev ?? new Date().toISOString());
    setStatus('running');
  }, []);

  const pause = useCallback(() => setStatus((s) => (s === 'running' ? 'paused' : s)), []);
  const resume = useCallback(() => setStatus((s) => (s === 'paused' ? 'running' : s)), []);

  const reset = useCallback(() => {
    clearInterval(intervalRef.current);
    setStatus('idle');
    setElapsed(0);
    setDistractions([]);
    setBreaksTaken(0);
    setBreaksSkipped(0);
    setStartedAt(null);
  }, []);

  const stop = useCallback(() => {
    clearInterval(intervalRef.current);
    setStatus('done');
  }, []);

  const logDistraction = useCallback((type) => {
    setDistractions((prev) => [...prev, { type, timestamp: new Date().toISOString() }]);
  }, []);

  const logBreak = useCallback((taken) => {
    if (taken) setBreaksTaken((n) => n + 1);
    else setBreaksSkipped((n) => n + 1);
  }, []);

  const remaining = targetSeconds > 0 ? Math.max(0, targetSeconds - elapsed) : null;
  const progress = targetSeconds > 0 ? Math.min(1, elapsed / targetSeconds) : null;

  return {
    status,
    elapsed,
    remaining,
    progress,
    distractions,
    breaksTaken,
    breaksSkipped,
    startedAt,
    start,
    pause,
    resume,
    reset,
    stop,
    logDistraction,
    logBreak,
  };
}
