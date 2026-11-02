import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import FeedbackPanel from '../components/FeedbackPanel';
import WebcamFeed from '../components/WebcamFeed';
import { Notice } from '../components/ui';
import socketService from '../services/socketService';
import useAuthStore from '../store/useAuthStore';
import useSessionStore from '../stores/useSessionStore';
import { cx } from '../utils/format';

export default function SessionPage() {
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const isConnected = useSessionStore((state) => state.isConnected);
  const sessionActive = useSessionStore((state) => state.sessionActive);
  const poseReady = useSessionStore((state) => state.poseReady);
  const report = useSessionStore((state) => state.report);
  const isGeneratingReport = useSessionStore((state) => state.isGeneratingReport);
  const socketError = useSessionStore((state) => state.socketError);
  const resetSession = useSessionStore((state) => state.resetSession);

  useEffect(() => {
    if (!token) return undefined;
    socketService.connect(token);
    return () => {
      socketService.disconnect();
      resetSession();
    };
  }, [resetSession, token]);

  useEffect(() => {
    if (report) {
      navigate('/report/latest', { state: { report } });
    }
  }, [navigate, report]);

  const handleStart = useCallback(() => {
    if (!isConnected && token) socketService.connect(token);
    socketService.startSession();
  }, [isConnected, token]);

  const handleEnd = useCallback(() => {
    socketService.endSession();
  }, []);

  const isReady = poseReady && isConnected;

  const status = sessionActive
    ? { text: 'Recording', note: 'End the session when your set is done.', dot: 'bg-signal animate-blink' }
    : isReady
      ? { text: 'Ready', note: 'Camera and tracker are running.', dot: 'bg-good' }
      : !poseReady
        ? { text: 'Loading tracker', note: 'Downloading the pose model. A few seconds.', dot: 'bg-warn animate-blink' }
        : { text: 'Connecting', note: 'Reaching the session server.', dot: 'bg-warn animate-blink' };

  return (
    <div className="animate-rise">
      <header className="mb-6 flex flex-col gap-4 border-b-2 border-ink pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="label mb-3">Bicep curl</p>
          <h1 className="display text-[44px] sm:text-[60px]">{sessionActive ? 'Keep going.' : 'Session'}</h1>
        </div>
        <p className="max-w-sm text-[15px] text-ink-2 md:text-right">
          {sessionActive
            ? 'Elbow pinned, full range, steady tempo. FitMon is scoring every rep.'
            : 'Stand side-on with your working arm fully in frame, then press start.'}
        </p>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex min-w-0 flex-col gap-4">
          <WebcamFeed />

          {socketError ? (
            <Notice tone="warn" title="Can't reach the session server">
              Tracking still runs on this device, but your report needs the server. Refresh once you're back online.
            </Notice>
          ) : null}

          <div className="flex flex-col gap-4 border-y border-ink py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className={cx('size-2.5', status.dot)} aria-hidden />
              <div>
                <p className="text-sm font-semibold tracking-[0.04em] uppercase" role="status" aria-live="polite">
                  {status.text}
                </p>
                <p className="text-sm text-ink-2">{status.note}</p>
              </div>
            </div>

            {!sessionActive ? (
              <button type="button" onClick={handleStart} disabled={!poseReady || !token} className="btn btn-signal btn-lg sm:min-w-52">
                Start session
              </button>
            ) : (
              <button type="button" onClick={handleEnd} disabled={isGeneratingReport} className="btn btn-ink btn-lg sm:min-w-52">
                {isGeneratingReport ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Writing report…
                  </>
                ) : (
                  <>
                    <span className="size-2.5 bg-current" aria-hidden />
                    End session
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        <aside aria-label="Live readout">
          <FeedbackPanel />
        </aside>
      </div>
    </div>
  );
}
