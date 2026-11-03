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
    <div className="relative isolate aspect-[4/3] w-full overflow-hidden rounded-[4px] bg-panel text-white sm:aspect-video">
      <Webcam
        ref={webcamRef}
        audio={false}
        mirrored
        className="absolute inset-0 -z-20 size-full object-cover"
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
        className="absolute inset-0 -z-20 size-full object-cover"
        style={{ transform: 'scaleX(-1)' }}
      />
      <div className="photo-scrim absolute inset-0 -z-10" aria-hidden />

      {cameraError ? (
        <div className="absolute inset-0 flex items-end bg-panel/85 p-6 sm:p-8">
          <div className="max-w-md">
            <p className="headline text-5xl">Camera unavailable</p>
            <p className="mt-4 text-sm text-white/80">{cameraError}</p>
          </div>
        </div>
      ) : null}

      <div className="absolute inset-x-0 top-0 flex items-center justify-between p-5 text-sm sm:p-6">
        <span className="text-white/85">{sessionActive ? 'Recording' : 'Live camera'}</span>
        {sessionActive ? (
          <span className="tag tag-volt">
            <span className="size-1.5 animate-pulse-soft rounded-full bg-on-volt" /> Rec
          </span>
        ) : (
          <span className="text-white/85">Bicep curl</span>
        )}
      </div>

      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 p-5 sm:p-6">
        <div>
          <p className="stat text-[72px] sm:text-[110px]">{repCount}</p>
          <p className="mt-1 text-sm text-white/85">Reps · {phase}</p>
        </div>
        <div className="hidden items-stretch gap-6 sm:flex">
          <span className="w-px bg-white/40" aria-hidden />
          <div className="text-center">
            <p className="stat text-5xl">{angle}°</p>
            <p className="mt-1 text-sm text-white/85">Elbow angle</p>
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
