import { useCallback, useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import {
  closePoseDetector,
  detectPose,
  drawLandmarks,
  initializePoseDetector,
} from '../services/poseDetector';
import socketService from '../services/socketService';
import useSessionStore from '../stores/useSessionStore';
import { BicepCurlEngine } from '../utils/cvLogic';

const FRAME_INTERVAL = 100;
const curlEngine = new BicepCurlEngine();

export default function WebcamFeed() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const lastFrameTime = useRef(0);
  const [cameraError, setCameraError] = useState('');

  const sessionActive = useSessionStore((s) => s.sessionActive);
  const setPoseReady = useSessionStore((s) => s.setPoseReady);
  const updateFeedback = useSessionStore((s) => s.updateFeedback);
  const resetLiveFeedback = useSessionStore((s) => s.resetLiveFeedback);
  const angle = useSessionStore((s) => s.angle);
  const repCount = useSessionStore((s) => s.repCount);
  const repState = useSessionStore((s) => s.repState);

  useEffect(() => {
    curlEngine.reset();
    if (!sessionActive) {
      resetLiveFeedback();
    }
  }, [resetLiveFeedback, sessionActive]);

  useEffect(() => {
    initializePoseDetector(() => {
      setPoseReady(true);
    });

    return () => {
      closePoseDetector();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [setPoseReady]);

  const handleUserMedia = useCallback(() => {
    setCameraError('');
  }, []);

  const handleUserMediaError = useCallback((error) => {
    const message = error?.name === 'NotReadableError'
      ? 'Camera is busy. Close other apps using the camera and refresh this page.'
      : 'Camera access failed. Allow browser camera permission and try again.';

    setPoseReady(false);
    setCameraError(message);
  }, [setPoseReady]);

  useEffect(() => {
    function processFrame() {
      const now = performance.now();
      if (now - lastFrameTime.current < FRAME_INTERVAL) {
        animationRef.current = requestAnimationFrame(processFrame);
        return;
      }
      lastFrameTime.current = now;

      const video = webcamRef.current?.video;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState < 2) {
        animationRef.current = requestAnimationFrame(processFrame);
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      const landmarks = detectPose(video, now);

      if (landmarks) {
        drawLandmarks(ctx, landmarks, canvas.width, canvas.height);
        if (sessionActive) {
          const results = curlEngine.processFrame(landmarks, Date.now());
          updateFeedback(results);

          if (results.valid) {
            socketService.sendCVResults({
              ...results,
              landmarks,
            });
          }
        }
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      animationRef.current = requestAnimationFrame(processFrame);
    }

    animationRef.current = requestAnimationFrame(processFrame);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [sessionActive, updateFeedback]);

  const phase = PHASE_LABELS[repState] || 'Idle';

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden bg-ink sm:aspect-video">
      <Webcam
        ref={webcamRef}
        audio={false}
        mirrored
        className="absolute inset-0 size-full object-cover"
        onUserMedia={handleUserMedia}
        onUserMediaError={handleUserMediaError}
        videoConstraints={{
          width: 640,
          height: 480,
          facingMode: 'user',
          frameRate: { ideal: 15, max: 30 },
        }}
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 size-full object-cover"
        style={{ transform: 'scaleX(-1)' }}
      />

      {/* corner registration marks */}
      {['top-3 left-3 border-t-2 border-l-2', 'top-3 right-3 border-t-2 border-r-2', 'bottom-3 left-3 border-b-2 border-l-2', 'bottom-3 right-3 border-b-2 border-r-2'].map((pos) => (
        <span key={pos} className={`pointer-events-none absolute size-5 border-paper/70 ${pos}`} aria-hidden />
      ))}

      {cameraError ? (
        <div className="absolute inset-0 flex items-center bg-ink/90 p-8">
          <div className="max-w-sm text-paper">
            <p className="display text-4xl">Camera unavailable</p>
            <p className="mt-2 text-sm text-paper/75">{cameraError}</p>
          </div>
        </div>
      ) : null}

      <div className="absolute top-6 left-8 flex items-center gap-2 text-[11px] font-semibold tracking-[0.1em] text-paper uppercase">
        {sessionActive ? (
          <>
            <span className="size-2 animate-blink bg-signal" />
            Rec
          </>
        ) : (
          'Camera'
        )}
      </div>

      <div className="absolute right-8 bottom-6 left-8 flex items-end justify-between gap-4">
        <div className="hidden gap-6 text-paper sm:flex">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.1em] text-paper/70 uppercase">Angle</p>
            <p className="figure text-3xl">{angle}°</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold tracking-[0.1em] text-paper/70 uppercase">Phase</p>
            <p className="figure text-3xl">{phase}</p>
          </div>
        </div>
        <div className="ml-auto bg-signal px-4 pt-2 pb-3 text-ink">
          <p className="text-[10px] font-semibold tracking-[0.1em] uppercase">Reps</p>
          <p className="figure text-5xl sm:text-6xl">{repCount}</p>
        </div>
      </div>
    </div>
  );
}

const PHASE_LABELS = {
  IDLE: 'Idle',
  READY: 'Tracking',
  DOWN: 'Down',
  UP: 'Up',
  CURLING: 'Curling',
  PEAK: 'Peak',
  EXTENDING: 'Lowering',
};
