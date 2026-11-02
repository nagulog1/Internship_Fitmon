import { createElement } from 'react';
import { Activity, ArrowRight, ArrowUpRight, Clock, Dumbbell, FileText, Gauge, Repeat, ScanLine, ShieldAlert, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import useSessionStore from '../stores/useSessionStore';
import { IconChip, PageHeader, ScoreRing, StatTile } from '../components/ui';
import { getRisk, scoreTone } from '../utils/format';

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const sessionActive = useSessionStore((state) => state.sessionActive);
  const repCount = useSessionStore((state) => state.repCount);
  const postureScore = useSessionStore((state) => state.postureScore);
  const averageFsr = useSessionStore((state) => state.averageFsr);
  const engagementStatus = useSessionStore((state) => state.engagementStatus);
  const lastCompletedReport = useSessionStore((state) => state.lastCompletedReport);

  const firstName = user?.name?.split(' ')[0] || 'Athlete';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const hasData = sessionActive || Boolean(lastCompletedReport);
  const posture = sessionActive ? postureScore : lastCompletedReport?.avgPostureScore ?? 0;
  const reps = sessionActive ? repCount : lastCompletedReport?.totalReps;
  const pressure = sessionActive
    ? Math.round(averageFsr || 0)
    : Math.round(lastCompletedReport?.perRepData?.at?.(-1)?.avgFsr ?? 0) || null;
  const riskScore = lastCompletedReport?.injuryRiskScore ?? 0;
  const risk = getRisk(riskScore);

  return (
    <div className="animate-fade-up">
      <PageHeader
        eyebrow={new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        title={`${greeting}, ${firstName}`}
        description="Keep your training consistent and watch your form improve session by session."
        actions={
          <Link to="/session" className="btn btn-primary">
            {sessionActive ? 'Resume session' : 'Start session'}
            <ArrowRight className="size-4" />
          </Link>
        }
      />

      {sessionActive ? (
        <Link
          to="/session"
          className="mb-6 flex items-center gap-3 rounded-2xl border border-lime/25 bg-lime/[0.06] px-5 py-4 transition-colors hover:bg-lime/[0.09]"
        >
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-lime opacity-60" />
            <span className="relative inline-flex size-2.5 rounded-full bg-lime" />
          </span>
          <p className="text-sm">
            <span className="font-medium text-fg">Session in progress.</span>{' '}
            <span className="text-fg-2">Your live metrics are updating below.</span>
          </p>
          <span className="ml-auto flex items-center gap-1 text-sm font-medium text-lime">
            Resume <ArrowUpRight className="size-4" />
          </span>
        </Link>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Snapshot */}
        <section className="card card-pad lg:col-span-2" aria-labelledby="snapshot-title">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <p className="eyebrow">{sessionActive ? 'Live now' : 'Last session'}</p>
              <h2 id="snapshot-title" className="mt-1 text-lg font-medium">
                {sessionActive ? 'Live session snapshot' : 'Performance snapshot'}
              </h2>
            </div>
            {lastCompletedReport && !sessionActive ? (
              <Link to="/report/latest" state={{ report: lastCompletedReport }} className="btn btn-ghost btn-sm">
                <FileText className="size-4" />
                View report
              </Link>
            ) : null}
          </div>

          {hasData ? (
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-stretch">
              <div className="flex flex-col items-center justify-center rounded-2xl bg-white/[0.02] px-8 py-6">
                <ScoreRing value={posture} size={148} stroke={12} tone={scoreTone(posture)} label="Posture score" />
              </div>
              <div className="grid w-full flex-1 grid-cols-2 gap-3">
                <StatTile label="Reps" value={reps ?? '—'} icon={Repeat} tone="lime" className="bg-transparent" />
                <StatTile label="Pressure" value={pressure ?? '—'} icon={Zap} tone="cyan" className="bg-transparent" />
                {sessionActive ? (
                  <StatTile label="Form quality" value={formatEngagement(engagementStatus)} icon={Gauge} tone="violet" className="bg-transparent" />
                ) : (
                  <StatTile label="Injury risk" value={`${riskScore}`} unit="%" icon={ShieldAlert} tone={risk.tone} className="bg-transparent" />
                )}
                <StatTile
                  label="Accuracy"
                  value={sessionActive ? '—' : lastCompletedReport?.accuracy ?? '—'}
                  unit={!sessionActive && lastCompletedReport?.accuracy != null ? '%' : undefined}
                  icon={Activity}
                  tone="fg"
                  className="bg-transparent"
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-line-strong px-6 py-12 text-center">
              <ScoreRing value={0} size={96} stroke={8} display="—" />
              <div>
                <p className="font-medium">No sessions yet</p>
                <p className="mt-1 text-sm text-fg-2">Complete your first session to see posture, reps and risk here.</p>
              </div>
              <Link to="/session" className="btn btn-primary btn-sm">
                Start first session
              </Link>
            </div>
          )}
        </section>

        {/* Quick actions */}
        <section className="flex flex-col gap-3" aria-label="Quick actions">
          <QuickAction icon={ScanLine} tone="lime" title="Start a session" desc="Track your form live with your camera." to="/session" />
          <QuickAction icon={Clock} tone="cyan" title="Session history" desc="Review past sessions and download reports." to="/history" />
          <QuickAction icon={Dumbbell} tone="violet" title="Workout library" desc="Guided technique videos by muscle group." to="/workout" />
        </section>
      </div>

      {/* Getting started */}
      <section className="mt-10" aria-labelledby="steps-title">
        <h2 id="steps-title" className="mb-4 text-lg font-medium">
          How a session works
        </h2>
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { title: 'Set up', text: 'Open Session and stand side-on, fully in frame.' },
            { title: 'Follow cues', text: 'Live guidance flags posture and tempo issues.' },
            { title: 'Finish', text: 'End the session to generate your AI report.' },
            { title: 'Improve', text: 'Track progress over time in History.' },
          ].map((step, index) => (
            <li key={step.title} className="card p-5">
              <span className="num text-xs text-lime">0{index + 1}</span>
              <p className="mt-3 font-medium">{step.title}</p>
              <p className="mt-1 text-sm text-fg-2">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

function QuickAction({ icon, title, desc, to, tone }) {
  return (
    <Link to={to} className="card group flex flex-1 items-center gap-4 p-5 transition-colors hover:border-line-strong hover:bg-elevated">
      <IconChip icon={icon} tone={tone} className="size-11 rounded-2xl" />
      <div className="min-w-0 flex-1">
        <p className="font-medium">{title}</p>
        <p className="mt-0.5 text-sm text-fg-2">{desc}</p>
      </div>
      {createElement(ArrowRight, { className: 'size-4 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-fg', 'aria-hidden': true })}
    </Link>
  );
}

function formatEngagement(status) {
  switch (status) {
    case 'good':
      return 'Strong';
    case 'low':
    case 'low_engagement':
      return 'Low';
    case 'risk':
    case 'injury_risk':
      return 'Risk';
    case 'weak_peak':
      return 'Weak peak';
    default:
      return 'Normal';
  }
}
