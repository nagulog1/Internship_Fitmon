import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, getFirestore, query, where } from 'firebase/firestore';
import { ArrowDownToLine, CalendarDays, Clock, History as HistoryIcon, Repeat, ShieldAlert, Target } from 'lucide-react';
import { firebaseApp } from '../firebase/config';
import useAuthStore from '../store/useAuthStore';
import { buildReportPdf, getReportPdfFileName } from '../utils/reportPdf';
import { EmptyState, PageHeader, RiskBadge, ScoreRing, StatTile } from '../components/ui';
import { cx, formatDuration, getRisk, getSessionTimestamp, scoreTone } from '../utils/format';

const db = firebaseApp ? getFirestore(firebaseApp) : null;
const FILTERS = ['All', 'Low Risk', 'Moderate Risk', 'High Risk'];

export default function History() {
  const user = useAuthStore((state) => state.user);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    async function fetchSessions() {
      if (!db || (!user?.uid && !user?.email)) {
        setLoading(false);
        return;
      }
      try {
        const sessionsRef = collection(db, 'sessions');
        const queries = [];
        if (user?.uid) queries.push(getDocs(query(sessionsRef, where('uid', '==', user.uid))));
        if (user?.email) queries.push(getDocs(query(sessionsRef, where('email', '==', user.email))));

        const snapshots = await Promise.all(queries);
        const sessionMap = new Map();
        snapshots.forEach((snap) => {
          snap.forEach((docSnap) => {
            sessionMap.set(docSnap.id, { id: docSnap.id, ...docSnap.data() });
          });
        });

        const data = Array.from(sessionMap.values());
        data.sort((a, b) => getSessionTimestamp(b) - getSessionTimestamp(a));
        setSessions(data);
      } catch (e) {
        console.error('Failed to fetch history', e);
      } finally {
        setLoading(false);
      }
    }
    fetchSessions();
  }, [user]);

  const filteredSessions = sessions.filter((sess) => filter === 'All' || getRisk(sess.injuryRiskScore || 0).filter === filter);

  const summary = useMemo(() => {
    if (!sessions.length) return null;
    const avg = (key) => Math.round(sessions.reduce((sum, s) => sum + (Number(s[key]) || 0), 0) / sessions.length);
    const totalReps = sessions.reduce((sum, s) => sum + (s.totalReps ?? (s.correctReps || 0) + (s.incorrectReps || 0)), 0);
    return { count: sessions.length, posture: avg('avgPostureScore'), risk: avg('injuryRiskScore'), reps: totalReps };
  }, [sessions]);

  const handleDownload = (session) => {
    const pdf = buildReportPdf(session);
    if (!pdf) return;
    pdf.save(getReportPdfFileName(session));
  };

  return (
    <div className="animate-fade-up">
      <PageHeader eyebrow="History" title="Session history" description="Every session you've completed, with scores and downloadable reports." />

      {summary ? (
        <section className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Totals">
          <StatTile label="Sessions" value={summary.count} icon={CalendarDays} />
          <StatTile label="Total reps" value={summary.reps} icon={Repeat} tone="lime" />
          <StatTile label="Avg posture" value={summary.posture} icon={Target} tone={scoreTone(summary.posture)} />
          <StatTile label="Avg risk" value={summary.risk} unit="%" icon={ShieldAlert} tone={getRisk(summary.risk).tone} />
        </section>
      ) : null}

      <div aria-label="Filter by risk" className="mb-6 inline-flex max-w-full gap-1 overflow-x-auto rounded-full border border-line bg-surface p-1">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            role="tab"
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
            className={cx(
              'h-8 shrink-0 rounded-full px-4 text-[13px] font-medium transition-colors',
              filter === f ? 'bg-fg text-bg' : 'text-fg-2 hover:text-fg'
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-3" aria-busy="true" aria-label="Loading sessions">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton h-24" />
          ))}
        </div>
      ) : filteredSessions.length > 0 ? (
        <ul className="grid gap-3">
          {filteredSessions.map((sess) => {
            const repsCount = sess.totalReps ?? (sess.correctReps || 0) + (sess.incorrectReps || 0);
            const posture = sess.avgPostureScore || 0;
            const ts = getSessionTimestamp(sess);
            return (
              <li key={sess.id} className="card flex flex-col gap-4 p-4 transition-colors hover:border-line-strong sm:flex-row sm:items-center sm:gap-6 sm:p-5">
                <div className="flex items-center gap-4 sm:w-64">
                  <ScoreRing value={posture} size={56} stroke={5} tone={scoreTone(posture)} />
                  <div className="min-w-0">
                    <p className="font-medium">
                      {ts ? new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown date'}
                    </p>
                    <p className="text-sm text-muted">
                      {ts ? new Date(ts).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : ''}
                    </p>
                  </div>
                </div>

                <dl className="grid flex-1 grid-cols-3 gap-4 text-sm">
                  <div>
                    <dt className="text-xs text-muted">Reps</dt>
                    <dd className="num mt-0.5 text-base font-medium">{repsCount || 0}</dd>
                  </div>
                  <div>
                    <dt className="flex items-center gap-1 text-xs text-muted"><Clock className="size-3" />Duration</dt>
                    <dd className="num mt-0.5 text-base font-medium">{formatDuration(sess.duration)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Risk</dt>
                    <dd className="mt-1"><RiskBadge score={sess.injuryRiskScore || 0} /></dd>
                  </div>
                </dl>

                <button type="button" onClick={() => handleDownload(sess)} className="btn btn-ghost btn-sm self-start sm:self-center">
                  <ArrowDownToLine className="size-4" />
                  PDF
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState
          icon={HistoryIcon}
          title={sessions.length ? 'No sessions match this filter' : 'No sessions yet'}
          description={sessions.length ? 'Try a different risk level.' : 'Start your first session to see your history here.'}
          action={
            sessions.length ? (
              <button type="button" className="btn btn-ghost" onClick={() => setFilter('All')}>Show all</button>
            ) : (
              <Link to="/session" className="btn btn-primary">Start a session</Link>
            )
          }
        />
      )}
    </div>
  );
}
