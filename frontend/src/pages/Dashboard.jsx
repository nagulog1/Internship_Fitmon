import { Link } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import useSessionStore from '../stores/useSessionStore';
import { CornerArrow, Meter, RiskScale, Stat } from '../components/ui';
import { getRisk, scoreTone } from '../utils/format';

const ENGAGEMENT = {
  good: 'Strong',
  low: 'Low',
  low_engagement: 'Low',
  risk: 'Risk',
  injury_risk: 'Risk',
  weak_peak: 'Weak peak',
};

const shortcuts = [
  { to: '/history', title: 'History', copy: 'Every session, scored, with PDF reports.' },
  { to: '/workout', title: 'Workouts', copy: 'Technique videos by muscle group.' },
  { to: '/profile', title: 'Profile', copy: 'Your goal, streak and accuracy.' },
];

const steps = [
  ['Set up', 'Stand side-on, working arm fully in frame.'],
  ['Curl', 'Cues appear if your elbow drifts.'],
  ['Stop', 'End the session and get your report.'],
  ['Compare', 'Check History to see the trend.'],
];

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const sessionActive = useSessionStore((state) => state.sessionActive);
  const repCount = useSessionStore((state) => state.repCount);
  const postureScore = useSessionStore((state) => state.postureScore);
  const averageFsr = useSessionStore((state) => state.averageFsr);
  const engagementStatus = useSessionStore((state) => state.engagementStatus);
  const lastCompletedReport = useSessionStore((state) => state.lastCompletedReport);

  const firstName = user?.name?.split(' ')[0] || 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening';

  const hasData = sessionActive || Boolean(lastCompletedReport);
  const posture = sessionActive ? postureScore : lastCompletedReport?.avgPostureScore ?? 0;
  const reps = sessionActive ? repCount : lastCompletedReport?.totalReps ?? 0;
  const pressure = sessionActive
    ? Math.round(averageFsr || 0)
    : Math.round(lastCompletedReport?.perRepData?.at?.(-1)?.avgFsr ?? 0) || '—';
  const riskScore = lastCompletedReport?.injuryRiskScore ?? 0;
  const risk = getRisk(riskScore);

  return (
    <div className="animate-rise">
      {/* Photo banner */}
      <section className="relative isolate overflow-hidden rounded-[4px] bg-panel text-white">
        <img src="/landing/hero/arm-dumbbell.jpg" alt="" className="absolute inset-0 -z-20 size-full object-cover object-[50%_50%]" />
        <div className="photo-scrim absolute inset-0 -z-10" aria-hidden />
        <div className="grid min-h-[420px] gap-8 p-6 sm:p-10 lg:grid-cols-[1fr_260px]">
          <div className="flex flex-col justify-between gap-10">
            <p className="text-sm text-white/80">
              {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
            <div>
              <h1 className="headline text-[56px] sm:text-[96px]">
                {greeting},
                <br />
                {firstName}
              </h1>
              <Link to="/session" className="btn btn-volt mt-8">
                {sessionActive ? 'Back to your session' : 'Start a session'}
              </Link>
            </div>
          </div>

          <div className="flex flex-col justify-end">
            {hasData ? (
              <Link to={sessionActive ? '/session' : '/report/latest'} state={sessionActive ? undefined : { report: lastCompletedReport }} className="group card block p-5 text-ink">
                <div className="flex items-start justify-between">
                  <p className="text-[15px] font-medium">{sessionActive ? 'Live now' : 'Last session'}</p>
                  <CornerArrow className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
                <p className="stat mt-8 text-7xl">{posture}</p>
                <p className="mt-2 text-sm text-ink-2">Posture score</p>
                <Meter value={posture} tone={scoreTone(posture)} className="mt-4" />
              </Link>
            ) : (
              <div className="card p-5 text-ink">
                <p className="text-[15px] font-medium">No sessions yet</p>
                <p className="mt-2 text-sm text-ink-2">Your first one takes about two minutes.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {sessionActive ? (
        <p className="mt-4 flex items-center gap-2 text-sm text-ink-2">
          <span className="size-2 animate-pulse-soft rounded-full bg-good" /> Session recording. The numbers below are live.
        </p>
      ) : null}

      {/* Stats */}
      {hasData ? (
        <section className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label={sessionActive ? 'Live session' : 'Last session'}>
          <div className="card p-6">
            <p className="text-sm text-ink-2">Reps</p>
            <Stat value={reps} size="md" className="mt-10" />
          </div>
          <div className="card p-6">
            <p className="text-sm text-ink-2">Pressure</p>
            <Stat value={pressure} size="md" tone="info" className="mt-10" caption="Avg FSR reading" />
          </div>
          <div className="card p-6">
            <p className="text-sm text-ink-2">{sessionActive ? 'Form' : 'Accuracy'}</p>
            {sessionActive ? (
              <Stat value={ENGAGEMENT[engagementStatus] || 'Normal'} size="sm" className="mt-10" />
            ) : (
              <Stat value={lastCompletedReport?.accuracy ?? '—'} unit={lastCompletedReport?.accuracy != null ? '%' : undefined} size="md" className="mt-10" />
            )}
          </div>
          <div className="card p-6">
            <p className="text-sm text-ink-2">Injury risk</p>
            <Stat value={riskScore} unit="%" size="md" tone={risk.tone} className="mt-10">
              <RiskScale score={riskScore} className="mt-4" />
            </Stat>
          </div>
        </section>
      ) : null}

      <div className="mt-16 grid gap-12 lg:grid-cols-2">
        <section aria-labelledby="go-title">
          <h2 id="go-title" className="kicker mb-5">Go to</h2>
          <ul className="flex flex-col gap-3">
            {shortcuts.map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="group card flex items-center justify-between gap-6 p-6 transition-shadow hover:shadow-lg hover:shadow-ink/5">
                  <div>
                    <p className="lede text-3xl">{item.title}</p>
                    <p className="mt-1.5 text-sm text-ink-2">{item.copy}</p>
                  </div>
                  <CornerArrow className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="how-title">
          <h2 id="how-title" className="kicker mb-5">How a session works</h2>
          <ol className="grid grid-cols-2 gap-3">
            {steps.map(([title, text], i) => (
              <li key={title} className="card flex min-h-[170px] flex-col justify-between p-6">
                <span className="stat text-5xl text-ink/15">0{i + 1}</span>
                <div>
                  <p className="font-medium">{title}</p>
                  <p className="mt-1 text-sm text-ink-2">{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}
