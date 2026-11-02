import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import useSessionStore from '../stores/useSessionStore';
import { EmptyState, Figure, Meter, PageHeader, RiskScale } from '../components/ui';
import { cx, getRisk, scoreTone } from '../utils/format';

const ENGAGEMENT = {
  good: 'Strong',
  low: 'Low',
  low_engagement: 'Low',
  risk: 'Risk',
  injury_risk: 'Risk',
  weak_peak: 'Weak peak',
};

const shortcuts = [
  { to: '/history', title: 'History', copy: 'Every session, scored. Download PDFs.' },
  { to: '/workout', title: 'Workouts', copy: 'Technique videos by muscle group.' },
  { to: '/profile', title: 'Profile', copy: 'Your goal, streak and accuracy.' },
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
      <PageHeader
        label={new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
        title={`${greeting}, ${firstName}.`}
        actions={
          <Link to="/session" className="btn btn-signal btn-lg">
            {sessionActive ? 'Back to session' : 'Start a session'}
            <ArrowRight className="size-4" />
          </Link>
        }
      />

      {sessionActive ? (
        <Link to="/session" className="mb-8 flex items-center gap-3 bg-ink px-5 py-3.5 text-paper hover:bg-ink/90">
          <span className="size-2 animate-blink bg-signal" aria-hidden />
          <span className="text-sm font-semibold tracking-[0.04em] uppercase">Session recording</span>
          <span className="hidden text-sm text-paper/70 sm:inline">Numbers below are live.</span>
          <ArrowUpRight className="ml-auto size-4" />
        </Link>
      ) : null}

      {/* Scoreboard */}
      <section aria-labelledby="scoreboard-title">
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <h2 id="scoreboard-title" className="label text-ink">
            {sessionActive ? 'Live session' : 'Last session'}
          </h2>
          {lastCompletedReport && !sessionActive ? (
            <Link to="/report/latest" state={{ report: lastCompletedReport }} className="btn-text">
              Full report <ArrowUpRight className="size-3.5" />
            </Link>
          ) : null}
        </div>

        {hasData ? (
          <div className="grid grid-cols-2 border-y border-ink lg:grid-cols-4">
            <Cell index={0}>
              <Figure label="Posture" value={posture} unit="/100" size="lg" tone={scoreTone(posture) === 'good' ? 'ink' : scoreTone(posture)}>
                <Meter value={posture} tone={scoreTone(posture)} className="mt-4" />
              </Figure>
            </Cell>
            <Cell index={1}>
              <Figure label="Reps" value={reps} size="lg" tone="signal">
                <p className="mt-4 text-sm text-ink-2">Bicep curl</p>
              </Figure>
            </Cell>
            <Cell index={2}>
              <Figure label="Pressure" value={pressure} size="lg" tone="info">
                <p className="mt-4 text-sm text-ink-2">Avg FSR reading</p>
              </Figure>
            </Cell>
            <Cell index={3}>
              {sessionActive ? (
                <Figure label="Form" value={ENGAGEMENT[engagementStatus] || 'Normal'} size="md" className="pt-4" />
              ) : (
                <Figure label="Injury risk" value={riskScore} unit="%" size="lg" tone={risk.tone}>
                  <RiskScale score={riskScore} className="mt-4" />
                </Figure>
              )}
            </Cell>
          </div>
        ) : (
          <EmptyState
            title="No sessions yet"
            description="Your first session takes about two minutes. Stand side-on to the camera and curl. FitMon does the counting."
            action={<Link to="/session" className="btn btn-ink">Start your first session</Link>}
          />
        )}
      </section>

      <div className="mt-14 grid gap-12 lg:grid-cols-[1fr_1.4fr]">
        {/* Shortcuts */}
        <section aria-labelledby="shortcuts-title">
          <h2 id="shortcuts-title" className="label mb-3 text-ink">Go to</h2>
          <ul className="border-t border-ink">
            {shortcuts.map((item) => (
              <li key={item.to} className="border-b border-rule">
                <Link to={item.to} className="group flex items-center gap-4 py-4">
                  <span className="display w-32 text-2xl transition-colors group-hover:text-signal">{item.title}</span>
                  <span className="flex-1 text-sm text-ink-2">{item.copy}</span>
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* How it works */}
        <section aria-labelledby="how-title">
          <h2 id="how-title" className="label mb-3 text-ink">How a session works</h2>
          <ol className="grid border-t border-ink sm:grid-cols-2">
            {[
              ['Set up', 'Stand side-on, working arm fully in frame. Good light helps.'],
              ['Curl', 'Move at your own pace. Cues appear if your elbow drifts.'],
              ['Stop', 'End the session and FitMon writes your report.'],
              ['Compare', 'Check History to see if your form is trending up.'],
            ].map(([title, text], index) => (
              <li key={title} className="flex gap-4 border-b border-rule py-4 sm:odd:pr-6 sm:even:border-l sm:even:pl-6">
                <span className="figure text-3xl text-signal">{index + 1}</span>
                <div>
                  <p className="font-semibold">{title}</p>
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

function Cell({ index, children }) {
  return (
    <div
      className={cx(
        'border-rule py-6',
        index % 2 === 1 ? 'border-l pl-5' : 'pr-5',
        index >= 2 && 'border-t lg:border-t-0',
        index > 0 && 'lg:border-l lg:pl-6',
        index < 3 && 'lg:pr-6'
      )}
    >
      {children}
    </div>
  );
}
