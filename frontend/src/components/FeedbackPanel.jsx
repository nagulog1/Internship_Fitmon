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
  const repsUpdating = displayedReps !== repCount;
  const postureUpdating = displayedPosture !== postureScore;
  const pressureUpdating = displayedPressure !== averageFsr;
  const formUpdating = displayedForm !== engagementStatus;
  const anglePct = Math.max(0, Math.min(100, ((Number(angle) || 0) / 180) * 100));
  const postureTone = sessionActive ? scoreTone(displayedPosture) : 'ink';

  return (
    <div className="flex flex-col border-t-2 border-ink">
      {/* Reps */}
      <div className="flex items-end justify-between gap-4 border-b border-rule py-5">
        <div>
          <p className="label">Reps</p>
          <p className={cx('figure mt-1 text-[96px] text-signal transition-opacity', repsUpdating && 'opacity-60')}>{displayedReps}</p>
        </div>
        <p className="pb-3 text-right text-sm font-semibold tracking-[0.04em] uppercase">
          {sessionActive ? <span className="mr-2 inline-block size-2 animate-blink bg-signal align-middle" /> : null}
          {getRepStateLabel()}
        </p>
      </div>

      {/* Posture */}
      <Row label="Posture" value={displayedPosture} unit="/100" tone={postureTone} dim={postureUpdating}>
        <Meter value={displayedPosture} tone={postureTone === 'ink' ? 'ink' : postureTone} className="mt-3" />
      </Row>

      {/* Elbow angle */}
      <Row label="Elbow angle" value={`${angle}°`}>
        <div className="relative mt-3 h-2.5 bg-ink/10">
          <span className="absolute inset-y-0 left-0 bg-ink transition-[width] duration-150" style={{ width: `${anglePct}%` }} />
        </div>
        <div className="mt-1.5 flex justify-between text-[10px] font-semibold tracking-[0.08em] text-muted uppercase">
          <span>Flexed 0°</span>
          <span>180° Extended</span>
        </div>
      </Row>

      <div className="grid grid-cols-2">
        <Row label="Stability" value={elbowStability} unit="%" tone={scoreTone(elbowStability)} compact className="pr-5" />
        <Row label="Smoothness" value={smoothness} tone={scoreTone(smoothness)} compact className="border-l pl-5" />
        <Row label="Pressure" value={Math.round(displayedPressure || 0)} tone="info" compact dim={pressureUpdating} className="pr-5" />
        <div className="border-b border-l border-rule py-4 pl-5">
          <p className="label">Form</p>
          <span className={cx('tag mt-3 text-xs transition-opacity', engagement.tagClass, formUpdating && 'opacity-60')}>{engagement.text}</span>
        </div>
      </div>

      {/* Cues */}
      <div className="py-5">
        <p className="label">Coaching cues</p>
        {delayedMessages.length > 0 ? (
          <ol className="mt-3 flex flex-col gap-2" aria-live="polite">
            {delayedMessages.map((msg) => (
              <li key={msg.id} className="animate-rise border-l-4 border-signal bg-sheet px-3 py-2.5 text-[15px] font-medium">
                {msg.text}
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-3 text-sm text-ink-2">
            {sessionActive ? 'Nothing to fix yet. Cues show up here if your form drifts.' : 'Cues show up here once you start.'}
          </p>
        )}
      </div>
    </div>
  );
}

const toneClass = { good: 'text-good', warn: 'text-warn', bad: 'text-bad', info: 'text-info', ink: 'text-ink' };

function Row({ label, value, unit, tone = 'ink', dim, compact, className = '', children }) {
  return (
    <div className={cx('border-b border-rule', compact ? 'py-4' : 'py-5', className)}>
      <div className="flex items-baseline justify-between gap-3">
        <p className="label">{label}</p>
        <p className={cx('figure transition-opacity', compact ? 'text-[32px]' : 'text-[40px]', toneClass[tone], dim && 'opacity-60')}>
          {value}
          {unit ? <span className="ml-0.5 text-[0.45em] text-muted">{unit}</span> : null}
        </p>
      </div>
      {children}
    </div>
  );
}
