import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Check, Flame, Pencil, Target, X } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import useProfileStore from '../stores/useProfileStore';
import { PageHeader, RiskBadge, StatTile } from '../components/ui';
import { getSessionTimestamp } from '../utils/format';

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
    <div className="animate-fade-up">
      <PageHeader eyebrow="Profile" title="Your profile" />

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Identity */}
        <section className="card card-pad relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-br from-lime/20 via-cyan/10 to-transparent" aria-hidden />
          <div className="relative">
            <div className="grid size-16 place-items-center rounded-2xl border-4 border-card bg-lime text-xl font-semibold text-lime-ink">
              {initials}
            </div>
            <p className="mt-4 text-lg font-medium">{user?.name || 'Trainee'}</p>
            <p className="truncate text-sm text-muted">{user?.email || '—'}</p>
            <span className="badge badge-neutral mt-4 capitalize">{user?.role || 'trainee'}</span>
          </div>
        </section>

        {/* Goal */}
        <section className="card card-pad lg:col-span-2" aria-labelledby="goal-title">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 id="goal-title" className="flex items-center gap-2 font-medium">
              <Target className="size-4 text-lime" />
              Training goal
            </h2>
            {!isEditingGoal ? (
              <button type="button" onClick={() => { setGoalInput(goal || ''); setIsEditingGoal(true); }} className="btn btn-ghost btn-sm">
                <Pencil className="size-3.5" />
                Edit
              </button>
            ) : null}
          </div>

          {isEditingGoal ? (
            <form onSubmit={handleSaveGoal} className="flex flex-col gap-3 sm:flex-row">
              <label htmlFor="goal-input" className="sr-only">Training goal</label>
              <input
                id="goal-input"
                type="text"
                className="input"
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                placeholder="e.g. Improve posture"
                autoFocus
              />
              <div className="flex gap-2">
                <button type="submit" className="btn btn-primary">
                  <Check className="size-4" />
                  Save
                </button>
                <button type="button" onClick={() => setIsEditingGoal(false)} className="btn btn-ghost" aria-label="Cancel">
                  <X className="size-4" />
                </button>
              </div>
            </form>
          ) : (
            <p className="text-xl font-medium tracking-tight">
              {goal || <span className="text-base font-normal text-muted">No goal set yet. Add one to stay focused.</span>}
            </p>
          )}

          <div className="mt-5 flex flex-wrap gap-2">
            {GOAL_SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => {
                  setGoalInput(suggestion);
                  setIsEditingGoal(true);
                }}
                className="badge badge-neutral h-7 px-3 transition-colors hover:bg-white/10 hover:text-fg"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </section>
      </div>

      <section className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3" aria-label="Your stats">
        <StatTile label="Current streak" value={streak ?? 0} unit="days" icon={Flame} tone="amber" />
        <StatTile label="Total sessions" value={totalSessions ?? 0} icon={BarChart3} tone="cyan" />
        <StatTile label="Accuracy rate" value={accuracyRate ?? 0} unit="%" icon={Target} tone="lime" progress={accuracyRate ?? 0} />
      </section>

      <section className="mt-10" aria-labelledby="recent-title">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="recent-title" className="text-lg font-medium">Recent activity</h2>
          <Link to="/history" className="text-sm text-fg-2 hover:text-fg">View all →</Link>
        </div>

        {isLoading ? (
          <div className="grid gap-3">
            {[0, 1, 2].map((i) => <div key={i} className="skeleton h-16" />)}
          </div>
        ) : recentSessions?.length > 0 ? (
          <ul className="card divide-y divide-line">
            {recentSessions.slice(0, 3).map((sess, idx) => {
              const ts = getSessionTimestamp(sess);
              return (
                <li key={sess.id || idx} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div>
                    <p className="font-medium">
                      {ts ? new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown date'}
                    </p>
                    <p className="text-sm text-muted">
                      Posture <span className="num text-fg-2">{sess.avgPostureScore || 0}</span>/100
                    </p>
                  </div>
                  <RiskBadge score={sess.injuryRiskScore || 0} />
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="card px-6 py-10 text-center text-sm text-muted">
            No recent activity.{' '}
            <Link to="/session" className="font-medium text-lime hover:underline">Start a session</Link> to see it here.
          </div>
        )}
      </section>
    </div>
  );
}
