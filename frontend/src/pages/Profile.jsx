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
      <PageHeader label="Profile" title={user?.name || 'Trainee'} />

      <div className="grid gap-12 lg:grid-cols-[280px_1fr]">
        <aside>
          <div className="grid aspect-square w-28 place-items-center bg-ink">
            <span className="display text-5xl text-paper">{initials}</span>
          </div>
          <dl className="mt-6 border-t border-ink text-sm">
            <div className="flex justify-between gap-4 border-b border-rule py-3">
              <dt className="text-muted">Email</dt>
              <dd className="truncate font-medium">{user?.email || '—'}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-rule py-3">
              <dt className="text-muted">Role</dt>
              <dd className="font-medium capitalize">{user?.role || 'trainee'}</dd>
            </div>
          </dl>
        </aside>

        <div>
          {/* Goal */}
          <section aria-labelledby="goal-title" className="border-t-2 border-ink pt-5">
            <div className="flex items-baseline justify-between gap-3">
              <h2 id="goal-title" className="label text-ink">Training goal</h2>
              {!isEditingGoal ? (
                <button type="button" onClick={() => { setGoalInput(goal || ''); setIsEditingGoal(true); }} className="btn-text">
                  {goal ? 'Change' : 'Set a goal'}
                </button>
              ) : null}
            </div>

            {isEditingGoal ? (
              <form onSubmit={handleSaveGoal} className="mt-4 flex flex-col gap-3 sm:flex-row">
                <label htmlFor="goal-input" className="sr-only">Training goal</label>
                <input id="goal-input" type="text" className="field" value={goalInput} onChange={(e) => setGoalInput(e.target.value)} placeholder="e.g. Improve posture" autoFocus />
                <div className="flex gap-2">
                  <button type="submit" className="btn btn-ink">Save</button>
                  <button type="button" onClick={() => setIsEditingGoal(false)} className="btn btn-line">Cancel</button>
                </div>
              </form>
            ) : (
              <p className={cx('display mt-4', goal ? 'text-[40px] sm:text-[52px]' : 'text-3xl text-muted')}>{goal || 'No goal yet'}</p>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted">Try:</span>
              {GOAL_SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => { setGoalInput(suggestion); setIsEditingGoal(true); }}
                  className="tag tag-plain hover:border-ink hover:text-ink"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </section>

          {/* Stats */}
          <dl className="mt-12 grid grid-cols-3 border-y border-ink">
            <div className="py-5 pr-4">
              <dt className="label">Streak</dt>
              <dd className="figure mt-2 text-[48px] text-signal">{streak ?? 0}<span className="ml-1 text-base text-muted">days</span></dd>
            </div>
            <div className="border-l border-rule py-5 pl-5">
              <dt className="label">Sessions</dt>
              <dd className="figure mt-2 text-[48px]">{totalSessions ?? 0}</dd>
            </div>
            <div className="border-l border-rule py-5 pl-5">
              <dt className="label">Accuracy</dt>
              <dd className="figure mt-2 text-[48px]">{accuracyRate ?? 0}<span className="ml-0.5 text-base text-muted">%</span></dd>
              <Meter value={accuracyRate ?? 0} segments={10} className="mt-3 h-2" />
            </div>
          </dl>

          {/* Recent */}
          <section className="mt-12" aria-labelledby="recent-title">
            <div className="mb-3 flex items-baseline justify-between">
              <h2 id="recent-title" className="label text-ink">Recent sessions</h2>
              <Link to="/history" className="btn-text">Full log</Link>
            </div>

            {isLoading ? (
              <div className="flex flex-col gap-2">{[0, 1, 2].map((i) => <div key={i} className="skeleton h-12" />)}</div>
            ) : recentSessions?.length > 0 ? (
              <ul className="border-t border-ink">
                {recentSessions.slice(0, 3).map((sess, idx) => {
                  const ts = getSessionTimestamp(sess);
                  return (
                    <li key={sess.id || idx} className="flex items-center justify-between gap-4 border-b border-rule py-3.5">
                      <span className="font-semibold">
                        {ts ? new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Unknown date'}
                      </span>
                      <span className="text-sm text-ink-2 tabular-nums">Posture {sess.avgPostureScore || 0}</span>
                      <RiskTag score={sess.injuryRiskScore || 0} />
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="border-t border-ink pt-4 text-sm text-ink-2">
                Nothing yet. <Link to="/session" className="font-semibold text-ink underline decoration-signal decoration-2 underline-offset-4">Start a session</Link> and it'll show here.
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
