import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, getFirestore, query, where } from 'firebase/firestore';
import { ArrowDownToLine } from 'lucide-react';
import { firebaseApp } from '../firebase/config';
import useAuthStore from '../store/useAuthStore';
import { buildReportPdf, getReportPdfFileName } from '../utils/reportPdf';
import { EmptyState, Meter, PageHeader, RiskTag } from '../components/ui';
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
    <div className="animate-rise">
      <PageHeader label="Training log" title="History" />

      {summary ? (
        <dl className="mb-10 grid grid-cols-2 border-b border-ink pb-6 md:grid-cols-4">
          {[
            ['Sessions', summary.count],
            ['Total reps', summary.reps],
            ['Avg posture', summary.posture],
            ['Avg risk', `${summary.risk}%`],
          ].map(([label, value], i) => (
            <div key={label} className={cx(i > 0 && 'md:border-l md:border-rule md:pl-6', i % 2 === 1 && 'border-l border-rule pl-5', i >= 2 && 'mt-5 md:mt-0')}>
              <dt className="label">{label}</dt>
              <dd className="figure mt-2 text-[44px]">{value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      <div className="mb-2 flex gap-6 overflow-x-auto border-b border-rule" aria-label="Filter by risk">
        {FILTERS.map((f) => (
          <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)} className="tab">
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col gap-2 pt-4" aria-busy="true" aria-label="Loading sessions">
          {[0, 1, 2, 3].map((i) => <div key={i} className="skeleton h-14" />)}
        </div>
      ) : filteredSessions.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-sm tabular-nums">
            <thead>
              <tr className="border-b border-ink text-left">
                {['Date', 'Reps', 'Posture', 'Time', 'Risk', ''].map((h) => (
                  <th key={h || 'actions'} scope="col" className="label py-3 pr-4 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredSessions.map((sess) => {
                const repsCount = sess.totalReps ?? (sess.correctReps || 0) + (sess.incorrectReps || 0);
                const posture = sess.avgPostureScore || 0;
                const ts = getSessionTimestamp(sess);
                return (
                  <tr key={sess.id} className="border-b border-rule hover:bg-sheet">
                    <td className="py-4 pr-4">
                      <p className="font-semibold">{ts ? new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Unknown'}</p>
                      <p className="text-xs text-muted">{ts ? new Date(ts).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : ''}</p>
                    </td>
                    <td className="figure py-4 pr-4 text-2xl">{repsCount || 0}</td>
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-3">
                        <span className="figure w-8 text-2xl">{posture}</span>
                        <Meter value={posture} segments={10} tone={scoreTone(posture)} className="h-2 w-24" />
                      </div>
                    </td>
                    <td className="py-4 pr-4 text-ink-2">{formatDuration(sess.duration)}</td>
                    <td className="py-4 pr-4"><RiskTag score={sess.injuryRiskScore || 0} /></td>
                    <td className="py-4 text-right">
                      <button type="button" onClick={() => handleDownload(sess)} className="btn-text">
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
          className="mt-6"
          title={sessions.length ? 'Nothing at this risk level' : 'Your log is empty'}
          description={sessions.length ? 'Try another filter.' : 'Finish a session and it shows up here with its scores and a PDF report.'}
          action={
            sessions.length ? (
              <button type="button" className="btn btn-line" onClick={() => setFilter('All')}>Show all</button>
            ) : (
              <Link to="/session" className="btn btn-ink">Start a session</Link>
            )
          }
        />
      )}
    </div>
  );
}
