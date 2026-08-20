import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFocusSession } from '../hooks/useFocusSession';
import { useAppData } from '../state/AppDataContext';
import { useSoundscape } from '../hooks/useSoundscape';
import { Nebula } from '../components/landing/Nebula';
import { TimerDial } from '../components/timer/TimerDial';
import { TimerControls } from '../components/timer/TimerControls';
import { DistractionModal } from '../components/timer/DistractionModal';
import { Button } from '../components/ui/Button';
import { CloseIcon } from '../components/ui/Icons';

export default function Focus() {
  const navigate = useNavigate();
  const { settings } = useAppData();
  const [mode] = useState('custom');
  const [customMinutes] = useState(settings.pomodoroFocusMinutes);
  const session = useFocusSession({ mode, customMinutes });
  const soundscape = useSoundscape(settings.soundscape);
  const wasRunningRef = useRef(false);

  // Page Visibility API: a tab switch mid-session auto-logs a distraction.
  useEffect(() => {
    function onVisibility() {
      if (document.hidden && session.status === 'running') {
        session.logDistraction('tab-switch');
      }
    }
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [session]);

  useEffect(() => {
    if (session.status === 'running' && settings.soundscape !== 'none') soundscape.play();
    if (session.status !== 'running') soundscape.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.status]);

  useEffect(() => {
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = '';
      soundscape.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-50 -mx-4 sm:-mx-6 -my-8">
      <Nebula />
      <div className="absolute inset-0 bg-ink/40" />

      <button
        onClick={() => navigate('/dashboard')}
        className="absolute top-6 right-6 text-parchment/70 hover:text-gold transition-colors cursor-pointer z-10"
        aria-label="Exit Deep Focus"
      >
        <CloseIcon size={28} />
      </button>

      <div className="relative z-10 h-full flex flex-col items-center justify-center gap-8 px-4">
        <p className="font-body text-xs tracking-[0.3em] uppercase text-gold/80">Deep Focus</p>
        <TimerDial elapsed={session.elapsed} remaining={session.remaining} progress={session.progress} status={session.status} size={320} />
        <TimerControls session={session} />
        <DistractionModal open={session.distractionModalOpen} onClose={session.closeDistractionModal} onSelect={session.logDistraction} />
        {session.status === 'idle' && (
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        )}
      </div>
    </div>
  );
}
