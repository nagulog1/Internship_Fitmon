import { useCallback, useEffect, useRef, useState } from 'react';
import { Activity, Camera, CameraOff, Info } from 'lucide-react';
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
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-line bg-[#050607] sm:aspect-video">
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

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/40" />

      {cameraError ? (
        <div className="absolute inset-0 grid place-items-center bg-black/70 p-6 backdrop-blur-sm">
          <div className="flex max-w-sm flex-col items-center text-center">
            <span className="grid size-12 place-items-center rounded-2xl bg-rose/15 text-rose">
              <CameraOff className="size-5" />
            </span>
            <p className="mt-4 font-medium">Camera unavailable</p>
            <p className="mt-1 text-sm text-fg-2">{cameraError}</p>
          </div>
        </div>
      ) : null}

      {/* Top HUD */}
      <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-2 p-3 sm:p-4">
        <span className="flex items-center gap-2 rounded-full bg-black/55 px-3 py-1.5 text-xs font-medium text-fg backdrop-blur-md">
          <Camera className="size-3.5" />
          Camera
        </span>
        {sessionActive ? (
          <span className="flex items-center gap-2 rounded-full bg-rose px-3 py-1.5 text-xs font-semibold text-[#1d0606]">
            <span className="size-1.5 animate-pulse-dot rounded-full bg-[#1d0606]" />
            REC
          </span>
        ) : null}
      </div>

      {/* Bottom HUD */}
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-3 sm:p-5">
        <div className="flex items-center gap-2 rounded-full bg-black/55 px-3 py-1.5 text-xs text-fg-2 backdrop-blur-md">
          {sessionActive ? <Activity className="size-3.5 text-lime" /> : <Info className="size-3.5" />}
          <span className="hidden sm:inline">
            {sessionActive ? 'Move smoothly through the full range.' : 'Allow camera access, then press Start.'}
          </span>
          <span className="sm:hidden">{sessionActive ? 'Full range, smooth tempo' : 'Press Start to begin'}</span>
        </div>

        <div className="flex items-end gap-2">
          <HudStat label="Angle" value={`${angle}°`} />
          <HudStat label="Phase" value={phase} />
          <div className="rounded-2xl bg-black/60 px-4 py-2 text-right backdrop-blur-md">
            <p className="text-[10px] tracking-wider text-fg-2 uppercase">Reps</p>
            <p className="num text-3xl leading-none font-medium text-lime sm:text-4xl">{repCount}</p>
          </div>
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

function HudStat({ label, value }) {
  return (
    <div className="hidden rounded-2xl bg-black/55 px-3 py-2 backdrop-blur-md sm:block">
      <p className="text-[10px] tracking-wider text-fg-2 uppercase">{label}</p>
      <p className="num text-base leading-tight font-medium text-fg">{value}</p>
    </div>
  );
}
