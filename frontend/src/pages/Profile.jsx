import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import useProfileStore from '../stores/useProfileStore';
import { authorizedRequest } from '../services/apiClient';
import { Meter, PageHeader, RiskTag } from '../components/ui';
import { cx, getSessionTimestamp } from '../utils/format';

const GOAL_SUGGESTIONS = ['Improve posture', 'Build endurance', 'Recover from injury'];
// Keep in step with the limits in backend/src/controllers/profileController.js.
const NAME_MAX_LENGTH = 60;
const GOAL_MAX_LENGTH = 80;
const ARM_CHOICES = [
  { value: 'auto', label: 'Auto', hint: 'Live sessions track whichever arm the camera sees best.' },
  { value: 'left', label: 'Left', hint: 'Live sessions track your left arm. Keep it on the side facing the camera.' },
  { value: 'right', label: 'Right', hint: 'Live sessions track your right arm. Keep it on the side facing the camera.' },
];

export default function Profile() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const setAuthState = useAuthStore((state) => state.setAuthState);
  const {
    streak, totalSessions, accuracyRate, recentSessions,
    fetchProfileMetrics, isLoading, error,
  } = useProfileStore();

  // null when not editing, otherwise the field to focus first.
  const [editing, setEditing] = useState(null);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (user) fetchProfileMetrics(user);
  }, [user, fetchProfileMetrics]);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(''), 4000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const goal = user?.goal || '';
  const trackedArm = user?.preferences?.trackedArm || 'auto';
  const armLabel = ARM_CHOICES.find((choice) => choice.value === trackedArm)?.label || 'Auto';

  const startEditing = (field) => {
    setNotice('');
    setEditing(field);
  };

  const handleSaved = (updatedUser) => {
    setAuthState({ user: updatedUser, token });
    setEditing(null);
    setNotice('Profile saved.');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
    : 'T';

  return (
    <div className="animate-rise">
      <PageHeader
        kicker="Profile"
        title={user?.name || 'Trainee'}
        actions={
          <>
            <p role="status" aria-live="polite" className="text-sm font-medium text-good empty:hidden">{notice}</p>
            {!editing ? <button type="button" onClick={() => startEditing('name')} className="btn btn-dark">Edit profile</button> : null}
          </>
        }
      />

      <div className="grid gap-3 lg:grid-cols-[320px_1fr]">
        <aside className="card flex flex-col p-6">
          <div className="grid size-20 place-items-center rounded-full bg-ink text-2xl font-medium text-on-ink">{initials}</div>
          <dl className="mt-10 text-sm">
            <div className="flex justify-between gap-4 border-b border-line py-3">
              <dt className="text-ink-2">Email</dt>
              <dd className="truncate font-medium">{user?.email || '—'}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-line py-3">
              <dt className="text-ink-2">Role</dt>
              <dd className="font-medium capitalize">{user?.role || 'trainee'}</dd>
            </div>
            <div className="flex justify-between gap-4 py-3">
              <dt className="text-ink-2">Dominant arm</dt>
              <dd className="font-medium">{armLabel}</dd>
            </div>
          </dl>
        </aside>

        {editing ? (
          <ProfileEditor
            user={user}
            token={token}
            focusField={editing}
            onCancel={() => setEditing(null)}
            onSaved={handleSaved}
          />
        ) : (
          <section aria-labelledby="goal-title" className="card card-pad">
            <div className="flex items-baseline justify-between gap-3">
              <h2 id="goal-title" className="text-sm text-ink-2">Training goal</h2>
              <button type="button" onClick={() => startEditing('goal')} className="link">
                {goal ? 'Change' : 'Set a goal'}
              </button>
            </div>
            <p className={cx('headline mt-8', goal ? 'text-[48px] sm:text-[64px]' : 'text-4xl text-muted')}>{goal || 'No goal yet'}</p>
            {error ? <p role="alert" className="mt-4 text-sm text-bad">Couldn't reach your session data: {error}</p> : null}
          </section>
        )}
      </div>

      <dl className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="relative isolate overflow-hidden rounded-[4px] bg-panel p-6 text-white">
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

/** Edits name, training goal and dominant arm, and saves them through PATCH /api/profile. */
function ProfileEditor({ user, token, focusField, onCancel, onSaved }) {
  const initial = {
    name: user?.name || '',
    goal: user?.goal || '',
    trackedArm: user?.preferences?.trackedArm || 'auto',
  };
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [failure, setFailure] = useState('');

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const payload = { name: form.name.trim(), goal: form.goal.trim(), trackedArm: form.trackedArm };
  const unchanged = payload.name === initial.name && payload.goal === initial.goal && payload.trackedArm === initial.trackedArm;
  const armHint = ARM_CHOICES.find((choice) => choice.value === form.trackedArm)?.hint;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving || unchanged) return;

    const found = {};
    if (!payload.name) found.name = 'Add a name.';
    else if (payload.name.length > NAME_MAX_LENGTH) found.name = `Keep your name to ${NAME_MAX_LENGTH} characters.`;
    if (payload.goal.length > GOAL_MAX_LENGTH) found.goal = `Keep your goal to ${GOAL_MAX_LENGTH} characters.`;
    setErrors(found);
    if (Object.keys(found).length) return;

    setSaving(true);
    setFailure('');
    try {
      const { user: updatedUser } = await authorizedRequest('/api/profile', token, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      onSaved(updatedUser);
    } catch (err) {
      if (err.fields) {
        setErrors(err.fields);
        setFailure('Some fields need fixing.');
      } else {
        setFailure(`Your changes did not save. ${err.message}`);
      }
      setSaving(false);
    }
  };

  return (
    <section aria-labelledby="edit-title" className="card card-pad">
      <h2 id="edit-title" className="text-sm text-ink-2">Edit profile</h2>
      <form
        onSubmit={handleSubmit}
        onKeyDown={(event) => event.key === 'Escape' && !saving && onCancel()}
        noValidate
        aria-busy={saving}
        className="mt-6 flex flex-col gap-8"
      >
        <EditField label="Name" htmlFor="p-name" error={errors.name}>
          <input
            id="p-name"
            className="field"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            maxLength={NAME_MAX_LENGTH}
            autoComplete="name"
            autoFocus={focusField === 'name'}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? 'p-name-error' : undefined}
          />
        </EditField>

        <EditField label="Training goal (optional)" htmlFor="p-goal" error={errors.goal}>
          <input
            id="p-goal"
            className="field"
            value={form.goal}
            onChange={(e) => update('goal', e.target.value)}
            maxLength={GOAL_MAX_LENGTH}
            placeholder="e.g. Improve posture"
            autoFocus={focusField === 'goal'}
            aria-invalid={errors.goal ? true : undefined}
            aria-describedby={errors.goal ? 'p-goal-error' : undefined}
          />
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted">Try</span>
            {GOAL_SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => update('goal', suggestion)}
                aria-pressed={form.goal === suggestion}
                className="tag tag-plain h-8 px-3.5 hover:bg-ink hover:text-on-ink aria-pressed:bg-ink aria-pressed:text-on-ink"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </EditField>

        <fieldset>
          <legend className="text-sm text-muted">Dominant arm</legend>
          <div className="mt-3 inline-flex rounded-full bg-ink/[0.06] p-1">
            {ARM_CHOICES.map((choice) => (
              <button
                key={choice.value}
                type="button"
                className="seg"
                aria-pressed={form.trackedArm === choice.value}
                onClick={() => update('trackedArm', choice.value)}
              >
                {choice.label}
              </button>
            ))}
          </div>
          <p className="mt-3 text-sm text-ink-2">{armHint}</p>
          {errors.trackedArm ? <p className="mt-2 text-sm text-bad">{errors.trackedArm}</p> : null}
        </fieldset>

        {failure ? <p role="alert" className="text-sm font-medium text-bad">{failure}</p> : null}

        <div className="flex flex-wrap gap-2">
          <button type="submit" className="btn btn-dark" disabled={saving || unchanged}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
          <button type="button" onClick={onCancel} className="btn btn-outline" disabled={saving}>Cancel</button>
        </div>
      </form>
    </section>
  );
}

function EditField({ label, htmlFor, error, children }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={htmlFor} className="text-sm text-muted">{label}</label>
      {children}
      {error ? <p id={`${htmlFor}-error`} className="text-sm text-bad">{error}</p> : null}
    </div>
  );
}
