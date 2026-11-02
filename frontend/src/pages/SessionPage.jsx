import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Play, Square, WifiOff } from 'lucide-react';
import FeedbackPanel from '../components/FeedbackPanel';
import WebcamFeed from '../components/WebcamFeed';
import { Alert } from '../components/ui';
import { cx } from '../utils/format';
import socketService from '../services/socketService';
import useAuthStore from '../store/useAuthStore';
import useSessionStore from '../stores/useSessionStore';

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
    ? { label: 'Recording', tone: 'text-lime', dot: 'bg-lime animate-pulse-dot' }
    : isReady
      ? { label: 'Ready', tone: 'text-lime', dot: 'bg-lime' }
      : !poseReady
        ? { label: 'Loading tracker…', tone: 'text-amber', dot: 'bg-amber animate-pulse-dot' }
        : { label: 'Connecting…', tone: 'text-amber', dot: 'bg-amber animate-pulse-dot' };

  return (
    <div className="animate-fade-up">
      <header className="mb-6 flex flex-col gap-1">
        <p className="eyebrow">Bicep curl · Live session</p>
        <h1 className="text-[28px] leading-tight font-semibold tracking-tight sm:text-[32px]">
          {sessionActive ? 'Session in progress' : 'Ready when you are'}
        </h1>
        <p className="max-w-xl text-[15px] text-fg-2">
          {sessionActive
            ? 'Keep your elbow pinned and move through the full range. FitMon is scoring every rep.'
            : 'Stand side-on with your working arm fully in frame, then press Start.'}
        </p>
      </header>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex min-w-0 flex-col gap-4">
          <WebcamFeed />

          {socketError ? (
            <Alert tone="amber" icon={WifiOff} title="Can't reach the session server">
              Live metrics still run on this device. Reports need a connection, so refresh once you're back online.
            </Alert>
          ) : null}

          {/* Control dock */}
          <div className="card flex flex-col items-stretch gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div className="flex items-center gap-3">
              <span className={cx('size-2 rounded-full', status.dot)} aria-hidden />
              <div>
                <p className={cx('text-sm font-medium', status.tone)} role="status" aria-live="polite">
                  {status.label}
                </p>
                <p className="text-xs text-muted">
                  {sessionActive
                    ? 'End the session to generate your AI report.'
                    : isReady
                      ? 'Camera and tracking are ready.'
                      : 'Please wait while the camera and tracker start.'}
                </p>
              </div>
            </div>

            {!sessionActive ? (
              <button type="button" onClick={handleStart} disabled={!poseReady || !token} className="btn btn-primary btn-lg sm:min-w-44">
                <Play className="size-4 fill-current" />
                Start session
              </button>
            ) : (
              <button type="button" onClick={handleEnd} disabled={isGeneratingReport} className="btn btn-danger btn-lg sm:min-w-44">
                {isGeneratingReport ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Generating report…
                  </>
                ) : (
                  <>
                    <Square className="size-3.5 fill-current" />
                    End session
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        <aside aria-label="Live feedback">
          <FeedbackPanel />
        </aside>
      </div>
    </div>
  );
}
