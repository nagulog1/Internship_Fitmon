export function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function scoreTone(score) {
  if (score >= 80) return 'lime';
  if (score >= 60) return 'amber';
  return 'rose';
}

export function getRisk(score) {
  const value = Number(score) || 0;
  if (value < 25) return { level: 'Low', label: 'Low risk', tone: 'lime', badge: 'badge-good', filter: 'Low Risk' };
  if (value < 55) return { level: 'Moderate', label: 'Moderate', tone: 'amber', badge: 'badge-warn', filter: 'Moderate Risk' };
  return { level: 'High', label: 'High risk', tone: 'rose', badge: 'badge-bad', filter: 'High Risk' };
}

export function getSessionTimestamp(session) {
  const ts = session?.startedAt ?? session?.createdAt ?? session?.endedAt;
  if (!ts) return 0;
  if (typeof ts === 'number') return ts;
  if (typeof ts?.toDate === 'function') return ts.toDate().getTime();
  if (typeof ts?.seconds === 'number') return ts.seconds * 1000;
  const parsed = new Date(ts).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function formatDuration(seconds) {
  if (!seconds && seconds !== 0) return '—';
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}
