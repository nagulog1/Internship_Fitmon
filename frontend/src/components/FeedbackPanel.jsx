import { createElement, useEffect, useRef, useState } from 'react';
import { AlertTriangle, Gauge, MessageSquareText, Shield, Target, TrendingUp, Zap } from 'lucide-react';
import { ProgressBar, ScoreRing } from './ui';
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
      case 'good': return { text: 'Strong', badgeClass: 'badge-good' };
      case 'low':
      case 'low_engagement':
        return { text: 'Low', badgeClass: 'badge-warn' };
      case 'risk':
      case 'injury_risk':
        return { text: 'Risk', badgeClass: 'badge-bad' };
      case 'weak_peak': return { text: 'Weak peak', badgeClass: 'badge-warn' };
      case 'sensor_live': return { text: 'Sensor live', badgeClass: 'badge-info' };
      case 'no_sensor': return { text: 'No sensor', badgeClass: 'badge-neutral' };
      default: return { text: 'Normal', badgeClass: 'badge-neutral' };
    }
  };

  const engagement = getEngagementLabel(displayedForm);
  const repsUpdating = displayedReps !== repCount;
  const postureUpdating = displayedPosture !== postureScore;
  const pressureUpdating = displayedPressure !== averageFsr;
  const formUpdating = displayedForm !== engagementStatus;
  const anglePct = Math.max(0, Math.min(100, ((Number(angle) || 0) / 180) * 100));

  return (
    <div className="flex flex-col gap-3">
      {/* Rep counter + posture */}
      <div className="card flex items-center gap-5 p-5">
        <div className="flex-1">
          <p className="text-[13px] text-fg-2">Reps</p>
          <p className={cx('num mt-1 text-6xl leading-none font-medium transition-opacity', repsUpdating && 'opacity-60')}>
            {displayedReps}
          </p>
          <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-lime">
            <span className={cx('size-1.5 rounded-full bg-lime', sessionActive && 'animate-pulse-dot')} />
            {getRepStateLabel()}
          </p>
        </div>
        <ScoreRing
          value={displayedPosture}
          size={104}
          stroke={9}
          tone={sessionActive ? scoreTone(displayedPosture) : 'lime'}
          label="Posture"
          className={cx('transition-opacity', postureUpdating && 'opacity-70')}
        />
      </div>

      {/* Elbow angle */}
      <div className="card p-5">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-[13px] text-fg-2">
            <Gauge className="size-4 text-muted" /> Elbow angle
          </span>
          <span className="num text-lg font-medium">{angle}°</span>
        </div>
        <div className="relative mt-4 h-2 rounded-full bg-gradient-to-r from-lime/50 via-cyan/40 to-violet/50">
          <span
            className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-bg bg-fg shadow transition-[left] duration-150"
            style={{ left: `${anglePct}%` }}
          />
        </div>
        <div className="num mt-2 flex justify-between text-[10px] text-muted">
          <span>0° flexed</span>
          <span>180° extended</span>
        </div>
      </div>

      {/* Quality metrics */}
      <div className="grid grid-cols-2 gap-3">
        <MetricCard icon={Shield} label="Stability" value={`${elbowStability}`} unit="%" progress={elbowStability} tone={scoreTone(elbowStability)} />
        <MetricCard icon={TrendingUp} label="Smoothness" value={`${smoothness}`} progress={smoothness} tone={scoreTone(smoothness)} />
        <MetricCard
          icon={Zap}
          label="Pressure"
          value={`${Math.round(displayedPressure || 0)}`}
          progress={displayedPressure || 0}
          tone="cyan"
          dim={pressureUpdating}
        />
        <div className="card flex flex-col gap-3 p-4">
          <span className="flex items-center gap-2 text-[13px] text-fg-2">
            <Target className="size-4 text-muted" /> Form
          </span>
          <span className={cx('badge self-start text-[13px] transition-opacity', engagement.badgeClass, formUpdating && 'opacity-60')}>
            {engagement.text}
          </span>
        </div>
      </div>

      {/* Coaching feedback */}
      <div className="card p-5">
        <p className="flex items-center gap-2 text-[13px] text-fg-2">
          <MessageSquareText className="size-4 text-muted" /> Coaching cues
        </p>
        {delayedMessages.length > 0 ? (
          <ul className="mt-3 flex flex-col gap-2" aria-live="polite">
            {delayedMessages.map((msg) => (
              <li key={msg.id} className="flex animate-fade-up items-start gap-2.5 rounded-xl bg-amber/[0.07] px-3 py-2.5 text-sm text-fg">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber" />
                {msg.text}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-muted">
            {sessionActive ? 'Looking good. Cues will appear here if your form drifts.' : 'Cues appear here once the session starts.'}
          </p>
        )}
      </div>
    </div>
  );
}

const toneClass = { lime: 'text-lime', amber: 'text-amber', rose: 'text-rose', cyan: 'text-cyan' };

function MetricCard({ icon, label, value, unit, progress, tone, dim }) {
  return (
    <div className="card flex flex-col gap-3 p-4">
      <span className="flex items-center gap-2 text-[13px] text-fg-2">
        {createElement(icon, { className: 'size-4 text-muted', 'aria-hidden': true })} {label}
      </span>
      <p className={cx('num text-2xl leading-none font-medium transition-opacity', toneClass[tone], dim && 'opacity-60')}>
        {value}
        {unit ? <span className="ml-0.5 text-sm text-muted">{unit}</span> : null}
      </p>
      <ProgressBar value={progress} tone={tone} />
    </div>
  );
}
