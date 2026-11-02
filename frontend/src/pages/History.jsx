import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, getFirestore, query, where } from 'firebase/firestore';
import { ArrowDownToLine } from 'lucide-react';
import { firebaseApp } from '../firebase/config';
import useAuthStore from '../store/useAuthStore';
import { buildReportPdf, getReportPdfFileName } from '../utils/reportPdf';
import { EmptyState, Meter, PageHeader, RiskTag } from '../components/ui';
import { formatDuration, getRisk, getSessionTimestamp, scoreTone } from '../utils/format';

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
    <div className="animate-rise">
      <PageHeader kicker="Training log" title="History" description="Every session you've finished, with its scores and a PDF report." />

      {summary ? (
        <dl className="mb-3 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            ['Sessions', summary.count, ''],
            ['Total reps', summary.reps, ''],
            ['Avg posture', summary.posture, '/100'],
            ['Avg risk', summary.risk, '%'],
          ].map(([label, value, unit]) => (
            <div key={label} className="card p-6">
              <dt className="text-sm text-ink-2">{label}</dt>
              <dd className="stat mt-8 text-5xl">
                {value}
                {unit ? <span className="ml-0.5 text-lg tracking-normal text-muted">{unit}</span> : null}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}

      <div className="mb-3 flex gap-1 overflow-x-auto rounded-full bg-surface p-1 sm:inline-flex" aria-label="Filter by risk">
        {FILTERS.map((f) => (
          <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)} className="seg">
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col gap-3" aria-busy="true" aria-label="Loading sessions">
          {[0, 1, 2, 3].map((i) => <div key={i} className="skeleton h-20" />)}
        </div>
      ) : filteredSessions.length > 0 ? (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm tabular-nums">
            <thead>
              <tr className="border-b border-line text-left text-ink-2">
                {['Date', 'Reps', 'Posture', 'Time', 'Risk', ''].map((h) => (
                  <th key={h || 'actions'} scope="col" className="px-4 py-4 font-normal first:pl-6 last:pr-6">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredSessions.map((sess) => {
                const repsCount = sess.totalReps ?? (sess.correctReps || 0) + (sess.incorrectReps || 0);
                const posture = sess.avgPostureScore || 0;
                const ts = getSessionTimestamp(sess);
                return (
                  <tr key={sess.id} className="border-b border-line last:border-0 hover:bg-canvas/50">
                    <td className="px-4 py-5 pl-6">
                      <p className="font-medium">{ts ? new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Unknown'}</p>
                      <p className="text-xs text-muted">{ts ? new Date(ts).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : ''}</p>
                    </td>
                    <td className="stat px-4 py-5 text-3xl">{repsCount || 0}</td>
                    <td className="px-4 py-5">
                      <div className="flex items-center gap-4">
                        <span className="stat w-10 text-3xl">{posture}</span>
                        <Meter value={posture} tone={scoreTone(posture)} className="w-24" />
                      </div>
                    </td>
                    <td className="px-4 py-5 text-ink-2">{formatDuration(sess.duration)}</td>
                    <td className="px-4 py-5"><RiskTag score={sess.injuryRiskScore || 0} /></td>
                    <td className="px-4 py-5 pr-6 text-right">
                      <button type="button" onClick={() => handleDownload(sess)} className="btn btn-sm btn-outline">
                        <ArrowDownToLine className="size-3.5" /> PDF
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          title={sessions.length ? 'Nothing here' : 'Your log is empty'}
          description={sessions.length ? 'No sessions at this risk level. Try another filter.' : 'Finish a session and it shows up here with its scores and a PDF report.'}
          action={
            sessions.length ? (
              <button type="button" className="btn btn-outline" onClick={() => setFilter('All')}>Show all</button>
            ) : (
              <Link to="/session" className="btn btn-volt-flat">Start a session</Link>
            )
          }
        />
      )}
    </div>
  );
}
