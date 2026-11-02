export function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

/** Maps a 0–100 quality score to a semantic tone. */
export function scoreTone(score) {
  if (score >= 80) return 'good';
  if (score >= 60) return 'warn';
  return 'bad';
}

export function getRisk(score) {
  const value = Number(score) || 0;
  if (value < 25) return { level: 'Low', label: 'Low risk', tone: 'good', tag: 'tag-good', filter: 'Low Risk' };
  if (value < 55) return { level: 'Moderate', label: 'Moderate', tone: 'warn', tag: 'tag-warn', filter: 'Moderate Risk' };
  return { level: 'High', label: 'High risk', tone: 'bad', tag: 'tag-bad', filter: 'High Risk' };
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
  return m > 0 ? `${m}:${String(s).padStart(2, '0')}` : `0:${String(s).padStart(2, '0')}`;
}
