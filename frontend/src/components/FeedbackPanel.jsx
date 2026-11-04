import { useEffect, useRef, useState } from 'react';
import { Meter } from './ui';
import { cx, scoreTone } from '../utils/format';
import useSessionStore from '../stores/useSessionStore';

export default function FeedbackPanel() {
  const repCount = useSessionStore((s) => s.repCount);
  const angle = useSessionStore((s) => s.angle);
  const postureScore = useSessionStore((s) => s.postureScore);
  const elbowStability = useSessionStore((s) => s.elbowStability);
  const smoothness = useSessionStore((s) => s.smoothness);
  const averageFsr = useSessionStore((s) => s.averageFsr);
  const engagementStatus = useSessionStore((s) => s.engagementStatus);
  const feedbackMessages = useSessionStore((s) => s.feedbackMessages);
  const repState = useSessionStore((s) => s.repState);
  const sessionActive = useSessionStore((s) => s.sessionActive);

  const [displayedReps, setDisplayedReps] = useState(repCount);
  const [displayedPosture, setDisplayedPosture] = useState(postureScore);
  const [displayedPressure, setDisplayedPressure] = useState(averageFsr);
  const [displayedForm, setDisplayedForm] = useState(engagementStatus);
  const [delayedMessages, setDelayedMessages] = useState([]);

  const queueRef = useRef([]);
  const seenIdsRef = useRef(new Set());
  const timerRef = useRef(null);

  useEffect(() => {
    if (repCount !== displayedReps) {
      const timer = setTimeout(() => setDisplayedReps(repCount), 300);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [displayedReps, repCount]);

  useEffect(() => {
    if (postureScore !== displayedPosture) {
      const timer = setTimeout(() => setDisplayedPosture(postureScore), 300);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [displayedPosture, postureScore]);

  useEffect(() => {
    if (averageFsr !== displayedPressure) {
      const timer = setTimeout(() => setDisplayedPressure(averageFsr), 300);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [averageFsr, displayedPressure]);

  useEffect(() => {
    if (engagementStatus !== displayedForm) {
      const timer = setTimeout(() => setDisplayedForm(engagementStatus), 300);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [displayedForm, engagementStatus]);

  useEffect(() => {
    if (sessionActive) return undefined;
    setDelayedMessages([]);
    queueRef.current = [];
    seenIdsRef.current = new Set();
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    return undefined;
  }, [sessionActive]);

  useEffect(() => {
    if (!sessionActive) return undefined;
    if (!feedbackMessages?.length) {
      setDelayedMessages([]);
      return undefined;
    }

    feedbackMessages.forEach((msg) => {
      if (!seenIdsRef.current.has(msg.id)) {
        seenIdsRef.current.add(msg.id);
        queueRef.current.push(msg);
      }
    });

    const pumpQueue = () => {
      if (!queueRef.current.length) {
        timerRef.current = null;
        return;
      }

      const next = queueRef.current.shift();
      setDelayedMessages((prev) => {
        const updated = [...prev, next];
        return updated.slice(-3);
      });

      timerRef.current = setTimeout(pumpQueue, 700);
    };

    if (!timerRef.current) {
      timerRef.current = setTimeout(pumpQueue, 700);
    }

    return undefined;
  }, [feedbackMessages, sessionActive]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  const getRepStateLabel = () => {
    switch (repState) {
      case 'DOWN': return 'Ready';
      case 'UP': return 'Contracted';
      case 'READY': return 'Tracking';
      case 'CURLING': return 'Curling up';
      case 'PEAK': return 'Peak';
      case 'EXTENDING': return 'Extending';
      default: return sessionActive ? 'Tracking' : 'Waiting to start';
    }
  };

  const getEngagementLabel = (status) => {
    switch (status) {
      case 'good': return { text: 'Strong', tagClass: 'tag-good' };
      case 'low':
      case 'low_engagement':
        return { text: 'Low', tagClass: 'tag-warn' };
      case 'risk':
      case 'injury_risk':
        return { text: 'Risk', tagClass: 'tag-bad' };
      case 'weak_peak': return { text: 'Weak peak', tagClass: 'tag-warn' };
      case 'sensor_live': return { text: 'Sensor live', tagClass: 'tag-info' };
      case 'no_sensor': return { text: 'No sensor', tagClass: 'tag-plain' };
      default: return { text: 'Normal', tagClass: 'tag-plain' };
    }
  };

  const engagement = getEngagementLabel(displayedForm);
  const postureUpdating = displayedPosture !== postureScore;
  const pressureUpdating = displayedPressure !== averageFsr;
  const formUpdating = displayedForm !== engagementStatus;
  const anglePct = Math.max(0, Math.min(100, ((Number(angle) || 0) / 180) * 100));
  const postureTone = sessionActive ? scoreTone(displayedPosture) : 'ink';

  return (
    <div className="flex flex-col gap-3">
      <div className="card p-6">
        <div className="flex items-start justify-between gap-4">
          <p className="text-sm text-ink-2">Posture</p>
          <span className="flex items-center gap-2 text-sm">
            {sessionActive ? <span className="size-1.5 animate-pulse-soft rounded-full bg-good" /> : null}
            {getRepStateLabel()}
          </span>
        </div>
        <p className={cx('stat mt-8 text-[80px] transition-opacity', toneClass[postureTone], postureUpdating && 'opacity-60')}>
          {displayedPosture}
          <span className="ml-1 text-xl tracking-normal text-muted">/100</span>
        </p>
        <Meter value={displayedPosture} tone={postureTone} className="mt-5" />
        <p className="sr-only" aria-live="polite">{displayedReps} reps</p>
      </div>

      <div className="card p-6">
        <div className="flex items-baseline justify-between">
          <p className="text-sm text-ink-2">Elbow angle</p>
          <p className="stat text-3xl">{angle}°</p>
        </div>
        <div className="relative mt-5 h-1 rounded-full bg-ink/10">
          <span
            className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface bg-ink shadow transition-[left] duration-150"
            style={{ left: `${anglePct}%` }}
          />
        </div>
        <div className="mt-3 flex justify-between text-xs text-muted">
          <span>0° flexed</span>
          <span>180° extended</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Tile label="Stability" value={elbowStability} unit="%" tone={scoreTone(elbowStability)} />
        <Tile label="Smoothness" value={smoothness} tone={scoreTone(smoothness)} />
        <Tile label="Pressure" value={Math.round(displayedPressure || 0)} tone="info" dim={pressureUpdating} />
        <div className="card flex flex-col justify-between gap-6 p-5">
          <p className="text-sm text-ink-2">Form</p>
          <span className={cx('tag self-start transition-opacity', engagement.tagClass, formUpdating && 'opacity-60')}>{engagement.text}</span>
        </div>
      </div>

      <div className="card p-6">
        <p className="text-sm text-ink-2">Coaching cues</p>
        {delayedMessages.length > 0 ? (
          <ol className="mt-4 flex flex-col gap-2" aria-live="polite">
            {delayedMessages.map((msg) => (
              <li key={msg.id} className="flex animate-rise items-start gap-3 text-[15px]">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-warn" aria-hidden />
                {msg.text}
              </li>
            ))}
          </ol>
        ) : (
          <p className="lede mt-4 text-xl text-ink-2">
            {sessionActive ? 'Looking clean. Cues show up here if your form drifts.' : 'Cues show up here once you start.'}
          </p>
        )}
      </div>
    </div>
  );
}

const toneClass = { good: 'text-good', warn: 'text-warn', bad: 'text-bad', info: 'text-info', ink: 'text-ink' };

function Tile({ label, value, unit, tone = 'ink', dim }) {
  return (
    <div className="card flex flex-col justify-between gap-6 p-5">
      <p className="text-sm text-ink-2">{label}</p>
      <p className={cx('stat text-4xl transition-opacity', toneClass[tone], dim && 'opacity-60')}>
        {value}
        {unit ? <span className="ml-0.5 text-base tracking-normal text-muted">{unit}</span> : null}
      </p>
    </div>
  );
}
