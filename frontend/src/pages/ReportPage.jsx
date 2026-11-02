import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowDownToLine } from 'lucide-react';
import { buildReportPdf, getReportPdfFileName } from '../utils/reportPdf';
import { EmptyState, Figure, Meter, Notice, RiskScale, RiskTag } from '../components/ui';
import { cx, formatDuration, getRisk, scoreTone } from '../utils/format';

const CHART_WIDTH = 760;
const CHART_HEIGHT = 240;

function calculateInjuryRisk(postureScoreValue, averageFsrValue, repCountValue, backendScore) {
  let totalRisk = Number.isFinite(backendScore) ? backendScore : null;

  if (totalRisk === null) {
    const postureRisk = Math.max(0, 100 - postureScoreValue);
    const fsrRisk = averageFsrValue < 20
      ? (20 - averageFsrValue) * 2
      : averageFsrValue > 80
        ? (averageFsrValue - 80) * 1.5
        : 0;
    const repRisk = repCountValue > 30 ? Math.min((repCountValue - 30) * 1.5, 30) : 0;
    totalRisk = (postureRisk * 0.5) + (fsrRisk * 0.3) + (repRisk * 0.2);
  }

  return Math.max(0, Math.min(100, Math.round(totalRisk)));
}

export default function ReportPage() {
  const location = useLocation();
  const report = location.state?.report;
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [pdfError, setPdfError] = useState('');

  if (!report) {
    return (
      <div className="animate-rise">
        <EmptyState
          title="No report to show"
          description="Reports open right after a session ends. Older ones are in History as PDFs."
          action={
            <>
              <Link to="/session" className="btn btn-ink">Start a session</Link>
              <Link to="/history" className="btn btn-line">Open history</Link>
            </>
          }
        />
      </div>
    );
  }

  const insights = report.insights || {};
  const reps = report.perRepData || [];
  const grade = insights.overallGrade || 'C';

  const averageFsrValue = Number.isFinite(report.avgFsr)
    ? report.avgFsr
    : reps.length
      ? reps.reduce((sum, rep) => sum + (rep.avgFsr ?? 0), 0) / reps.length
      : 0;
  const postureScoreValue = report.avgPostureScore ?? 0;
  const repCountValue = report.totalReps ?? 0;
  const riskScore = calculateInjuryRisk(postureScoreValue, averageFsrValue, repCountValue, report.injuryRiskScore);
  const risk = getRisk(riskScore);
  const startedAt = report.startedAt ? new Date(report.startedAt) : null;
  const validDate = startedAt && !Number.isNaN(startedAt.getTime());
  const goodReps = reps.filter((rep) => rep.correct).length;
  const cautions = [...(insights.warnings || []), ...(insights.injuryExplanation ? [insights.injuryExplanation] : [])];

  async function handleDownloadPdf() {
    if (isDownloadingPdf) return;
    try {
      setPdfError('');
      setIsDownloadingPdf(true);
      const pdf = buildReportPdf(report);
      if (!pdf) {
        setPdfError('Report data is not available yet.');
        return;
      }
      pdf.save(getReportPdfFileName(report));
    } catch (error) {
      setPdfError(error?.message || 'PDF generation failed in this browser session.');
    } finally {
      setIsDownloadingPdf(false);
    }
  }

  return (
    <div className="animate-rise">
      <header className="mb-8 flex flex-col gap-5 border-b-2 border-ink pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="label mb-3">
            Session report{validDate ? ` · ${startedAt.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}` : ''}
          </p>
          <h1 className="display text-[44px] sm:text-[60px]">Bicep curl</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={handleDownloadPdf} disabled={isDownloadingPdf} className="btn btn-line">
            <ArrowDownToLine className="size-4" />
            {isDownloadingPdf ? 'Preparing PDF…' : 'Download PDF'}
          </button>
          <Link to="/session" className="btn btn-signal">Go again</Link>
        </div>
      </header>

      {pdfError ? (
        <div className="mb-6">
          <Notice title="PDF download issue">{pdfError}</Notice>
        </div>
      ) : null}

      {/* Headline */}
      <section className="grid gap-px bg-ink/15 sm:grid-cols-[auto_1fr_1fr]" aria-label="Headline scores">
        <div className="flex items-center gap-5 bg-ink p-6 text-paper sm:pr-10">
          <span className="figure text-[120px] text-signal">{grade}</span>
          <div>
            <p className="text-[11px] font-semibold tracking-[0.08em] text-paper/70 uppercase">Grade</p>
            <p className="mt-1 max-w-[12ch] text-sm text-paper/90">
              {goodReps} of {reps.length || repCountValue} reps clean
            </p>
          </div>
        </div>
        <div className="bg-paper p-6">
          <Figure label="Posture" value={postureScoreValue} unit="/100" size="lg" tone={scoreTone(postureScoreValue) === 'good' ? 'ink' : scoreTone(postureScoreValue)}>
            <Meter value={postureScoreValue} tone={scoreTone(postureScoreValue)} className="mt-4" />
          </Figure>
        </div>
        <div className="bg-paper p-6">
          <Figure label="Injury risk" value={riskScore} unit="%" size="lg" tone={risk.tone}>
            <RiskScale score={riskScore} className="mt-4" />
          </Figure>
        </div>
      </section>

      <dl className="mt-px grid grid-cols-2 border-y border-ink md:grid-cols-4">
        {[
          ['Reps', repCountValue],
          ['Accuracy', `${report.accuracy ?? '—'}%`],
          ['Time', formatDuration(report.duration)],
          ['Avg pressure', Math.round(averageFsrValue || 0)],
        ].map(([label, value], i) => (
          <div key={label} className={cx('py-5', i % 2 === 1 && 'border-l border-rule pl-5', i >= 2 && 'border-t border-rule md:border-t-0', i > 0 && 'md:border-l md:pl-6', i === 0 ? 'pr-5' : '')}>
            <dt className="label">{label}</dt>
            <dd className="figure mt-2 text-[40px]">{value}</dd>
          </div>
        ))}
      </dl>

      {/* Coach notes */}
      <section className="mt-12 grid gap-10 lg:grid-cols-[1.2fr_1fr]" aria-label="Coach notes">
        <div>
          <h2 className="label mb-3 text-ink">Coach's note</h2>
          <p className="border-l-4 border-signal pl-5 text-xl leading-snug font-medium text-pretty">
            {insights.summary || `You completed ${report.totalReps} reps with ${report.accuracy}% accuracy.`}
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-3 lg:grid-cols-1">
          <NoteList title="Worked" mark="+" tone="text-good" items={insights.positiveFeedback} empty="Keep logging sessions to see highlights." />
          <NoteList title="Fix next" mark="→" tone="text-signal" items={insights.improvements} empty="No corrections this time." />
          <NoteList title="Watch" mark="!" tone="text-bad" items={cautions} empty="Nothing flagged." />
        </div>
      </section>

      {/* Chart */}
      <section className="mt-12" aria-labelledby="chart-title">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-3 border-b border-ink pb-3">
          <h2 id="chart-title" className="label text-ink">Rep by rep</h2>
          <div className="flex flex-wrap gap-5 text-xs font-semibold tracking-[0.04em] uppercase">
            <Legend swatch="h-[3px] bg-ink" label="Form" />
            <Legend swatch="h-[2px] bg-info" label="Pressure" />
            <Legend swatch="h-0 border-t-2 border-dashed border-muted" label="Consistency" />
            <Legend swatch="size-2 bg-bad" label="Flagged rep" />
          </div>
        </div>
        <RepPerformanceChart reps={reps} />
      </section>

      {/* Table */}
      {reps.length ? (
        <section className="mt-12" aria-labelledby="reps-title">
          <h2 id="reps-title" className="label mb-3 text-ink">Rep log</h2>
          <div className="overflow-x-auto border-t-2 border-ink">
            <table className="w-full min-w-[640px] text-sm tabular-nums">
              <thead>
                <tr className="border-b border-ink text-left">
                  {['#', 'Form', 'Pressure score', 'Avg pressure', 'Range', 'Consistency', ''].map((h) => (
                    <th key={h || 'status'} scope="col" className="label py-3 pr-4 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reps.map((rep) => (
                  <tr key={rep.repNumber} className="border-b border-rule">
                    <td className="py-2.5 pr-4 font-semibold">{rep.repNumber}</td>
                    <td className={cx('py-2.5 pr-4 font-semibold', rep.formScore >= 60 ? 'text-ink' : 'text-bad')}>{rep.formScore}</td>
                    <td className="py-2.5 pr-4 text-ink-2">{rep.fsrScore ?? '—'}</td>
                    <td className="py-2.5 pr-4 text-ink-2">{rep.avgFsr ?? '—'}</td>
                    <td className="py-2.5 pr-4 text-ink-2">
                      {rep.minAngle != null && rep.maxAngle != null ? `${Math.round(rep.minAngle)}–${Math.round(rep.maxAngle)}°` : '—'}
                    </td>
                    <td className="py-2.5 pr-4 text-ink-2">{rep.fusionScore ?? '—'}</td>
                    <td className="py-2.5 text-right">
                      {rep.correct ? <span className="tag tag-good">Clean</span> : <span className="tag tag-bad">Fix</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <div className="mt-10 flex justify-between gap-4 border-t border-rule pt-4 text-sm text-ink-2">
        <RiskTag score={riskScore} showScore />
        <Link to="/history" className="btn-text">All sessions</Link>
      </div>
    </div>
  );
}

function NoteList({ title, mark, tone, items, empty }) {
  return (
    <div>
      <h3 className="label text-ink">{title}</h3>
      {items?.length ? (
        <ul className="mt-2 flex flex-col gap-1.5">
          {items.map((item) => (
            <li key={item} className="flex gap-2.5 text-[15px]">
              <span className={cx('w-3 shrink-0 font-bold', tone)} aria-hidden>{mark}</span>
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-muted">{empty}</p>
      )}
    </div>
  );
}

function Legend({ swatch, label }) {
  return (
    <span className="flex items-center gap-2">
      <span className={cx('inline-block w-4', swatch)} />
      {label}
    </span>
  );
}

function RepPerformanceChart({ reps }) {
  if (!reps.length) {
    return (
      <div className="graph-paper grid h-48 place-items-center text-sm text-ink-2">
        Not enough reps to plot yet.
      </div>
    );
  }

  const maxScore = Math.max(100, ...reps.flatMap((rep) => [rep.formScore ?? 0, rep.fsrScore ?? 0, rep.fusionScore ?? 0]));
  const left = 30;
  const right = 10;
  const top = 10;
  const bottom = 26;
  const usableWidth = CHART_WIDTH - left - right;
  const usableHeight = CHART_HEIGHT - top - bottom;
  const stepX = reps.length > 1 ? usableWidth / (reps.length - 1) : 0;
  const xAt = (index) => left + (reps.length > 1 ? stepX * index : usableWidth / 2);
  const yAt = (value) => top + usableHeight - ((value / maxScore) * usableHeight);
  const pointsFor = (key) => reps.map((rep, index) => `${xAt(index)},${yAt(rep[key] ?? 0)}`).join(' ');

  return (
    <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} className="h-auto w-full" role="img" aria-label="Line chart of form, pressure and consistency scores for each rep">
      {[0, 25, 50, 75, 100].map((tick) => (
        <g key={tick}>
          <line x1={left} x2={CHART_WIDTH - right} y1={yAt(tick)} y2={yAt(tick)} stroke="rgb(18 18 18 / 0.1)" />
          <text x={left - 8} y={yAt(tick) + 4} fill="var(--color-muted)" fontSize="11" fontWeight="600" textAnchor="end">{tick}</text>
        </g>
      ))}
      <rect x={left} y={yAt(60)} width={usableWidth} height={yAt(0) - yAt(60)} fill="rgb(196 42 28 / 0.04)" />
      <text x={CHART_WIDTH - right - 4} y={yAt(0) - 8} fill="var(--color-bad)" fontSize="10" fontWeight="700" textAnchor="end" letterSpacing="1">FORM UNDER 60</text>

      <polyline fill="none" stroke="var(--color-muted)" strokeWidth="1.5" strokeDasharray="5 5" points={pointsFor('fusionScore')} />
      <polyline fill="none" stroke="var(--color-info)" strokeWidth="2" points={pointsFor('fsrScore')} />
      <polyline fill="none" stroke="var(--color-ink)" strokeWidth="3" strokeLinejoin="round" points={pointsFor('formScore')} />

      {reps.map((rep, index) => (
        <g key={rep.repNumber}>
          {rep.correct ? (
            <circle cx={xAt(index)} cy={yAt(rep.formScore ?? 0)} r="4" fill="var(--color-paper)" stroke="var(--color-ink)" strokeWidth="2.5" />
          ) : (
            <rect x={xAt(index) - 5} y={yAt(rep.formScore ?? 0) - 5} width="10" height="10" fill="var(--color-bad)" />
          )}
          <text x={xAt(index)} y={CHART_HEIGHT - 6} textAnchor="middle" fill="var(--color-muted)" fontSize="11" fontWeight="600">{rep.repNumber}</text>
        </g>
      ))}
    </svg>
  );
}
