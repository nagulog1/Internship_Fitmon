import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import useProfileStore from '../stores/useProfileStore';
import { Meter, PageHeader, RiskTag } from '../components/ui';
import { cx, getSessionTimestamp } from '../utils/format';

const GOAL_SUGGESTIONS = ['Improve posture', 'Build endurance', 'Recover from injury'];

export default function Profile() {
  const user = useAuthStore((state) => state.user);
  const {
    goal, streak, totalSessions, accuracyRate, recentSessions,
    fetchProfileMetrics, updateGoal, isLoading,
  } = useProfileStore();

  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState('');

  useEffect(() => {
    if (user) fetchProfileMetrics(user);
  }, [user, fetchProfileMetrics]);

  const handleSaveGoal = async (event) => {
    event?.preventDefault();
    if (user?.uid) await updateGoal(user.uid, goalInput);
    setIsEditingGoal(false);
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
    : 'T';

  return (
    <div className="animate-rise">
      <PageHeader kicker="Profile" title={user?.name || 'Trainee'} />

      <div className="grid gap-3 lg:grid-cols-[320px_1fr]">
        <aside className="card flex flex-col p-6">
          <div className="grid size-20 place-items-center rounded-full bg-ink text-2xl font-medium text-white">{initials}</div>
          <dl className="mt-10 text-sm">
            <div className="flex justify-between gap-4 border-b border-line py-3">
              <dt className="text-ink-2">Email</dt>
              <dd className="truncate font-medium">{user?.email || '—'}</dd>
            </div>
            <div className="flex justify-between gap-4 py-3">
              <dt className="text-ink-2">Role</dt>
              <dd className="font-medium capitalize">{user?.role || 'trainee'}</dd>
            </div>
          </dl>
        </aside>

        <section aria-labelledby="goal-title" className="card card-pad">
          <div className="flex items-baseline justify-between gap-3">
            <h2 id="goal-title" className="text-sm text-ink-2">Training goal</h2>
            {!isEditingGoal ? (
              <button type="button" onClick={() => { setGoalInput(goal || ''); setIsEditingGoal(true); }} className="link">
                {goal ? 'Change' : 'Set a goal'}
              </button>
            ) : null}
          </div>

          {isEditingGoal ? (
            <form onSubmit={handleSaveGoal} className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end">
              <label htmlFor="goal-input" className="sr-only">Training goal</label>
              <input id="goal-input" type="text" className="field text-2xl" value={goalInput} onChange={(e) => setGoalInput(e.target.value)} placeholder="e.g. Improve posture" autoFocus />
              <div className="flex gap-2">
                <button type="submit" className="btn btn-dark">Save</button>
                <button type="button" onClick={() => setIsEditingGoal(false)} className="btn btn-outline">Cancel</button>
              </div>
            </form>
          ) : (
            <p className={cx('headline mt-8', goal ? 'text-[48px] sm:text-[64px]' : 'text-4xl text-muted')}>{goal || 'No goal yet'}</p>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted">Try</span>
            {GOAL_SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => { setGoalInput(suggestion); setIsEditingGoal(true); }}
                className="tag tag-plain h-8 px-3.5 hover:bg-ink hover:text-white"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </section>
      </div>

      <dl className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="relative isolate overflow-hidden rounded-[4px] bg-ink p-6 text-white">
          <dt className="text-sm text-white/75">Streak</dt>
          <dd className="stat mt-10 text-7xl text-volt">{streak ?? 0}<span className="ml-1 text-lg tracking-normal text-white/70">days</span></dd>
        </div>
        <div className="card p-6">
          <dt className="text-sm text-ink-2">Sessions</dt>
          <dd className="stat mt-10 text-7xl">{totalSessions ?? 0}</dd>
        </div>
        <div className="card p-6">
          <dt className="text-sm text-ink-2">Accuracy</dt>
          <dd className="stat mt-10 text-7xl">{accuracyRate ?? 0}<span className="ml-0.5 text-lg tracking-normal text-muted">%</span></dd>
          <Meter value={accuracyRate ?? 0} className="mt-4" />
        </div>
      </dl>

      <section className="mt-16" aria-labelledby="recent-title">
        <div className="mb-5 flex items-baseline justify-between">
          <h2 id="recent-title" className="lede text-3xl">Recent sessions</h2>
          <Link to="/history" className="link">Full log</Link>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-3">{[0, 1, 2].map((i) => <div key={i} className="skeleton h-16" />)}</div>
        ) : recentSessions?.length > 0 ? (
          <ul className="card divide-y divide-line">
            {recentSessions.slice(0, 3).map((sess, idx) => {
              const ts = getSessionTimestamp(sess);
              return (
                <li key={sess.id || idx} className="flex items-center justify-between gap-4 px-6 py-4">
                  <span className="font-medium">
                    {ts ? new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Unknown date'}
                  </span>
                  <span className="text-sm text-ink-2 tabular-nums">Posture {sess.avgPostureScore || 0}</span>
                  <RiskTag score={sess.injuryRiskScore || 0} />
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="card px-6 py-8 text-ink-2">
            Nothing yet. <Link to="/session" className="font-medium text-ink underline underline-offset-4">Start a session</Link> and it'll show here.
          </div>
        )}
      </section>
    </div>
  );
}
