import { Button } from '../ui/Button';

export function TimerControls({ session }) {
  const { status, start, pause, resume, endSession, abandonSession, openDistractionModal, distractions } = session;

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="flex items-center gap-3 flex-wrap justify-center">
        {status === 'idle' && (
          <Button onClick={start} variant="gold" size="lg">
            Start Session
          </Button>
        )}
        {status === 'running' && (
          <>
            <Button onClick={pause} variant="ghost">
              Pause
            </Button>
            <Button onClick={openDistractionModal} variant="ghost">
              Log Distraction ({distractions.length})
            </Button>
            <Button onClick={endSession} variant="gold">
              End Session
            </Button>
          </>
        )}
        {status === 'paused' && (
          <>
            <Button onClick={resume} variant="gold">
              Resume
            </Button>
            <Button onClick={endSession} variant="ghost">
              End Session
            </Button>
          </>
        )}
        {status === 'done' && (
          <Button onClick={abandonSession} variant="ghost">
            Start Another
          </Button>
        )}
      </div>
      {status !== 'idle' && status !== 'done' && (
        <button onClick={abandonSession} className="text-xs text-muted hover:text-danger transition-colors cursor-pointer">
          Abandon session
        </button>
      )}
    </div>
  );
}
