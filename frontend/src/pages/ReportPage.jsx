import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowDownToLine } from 'lucide-react';
import { buildReportPdf, getReportPdfFileName } from '../utils/reportPdf';
import { EmptyState, Meter, Notice, PageHeader, RiskScale, RiskTag, Stat } from '../components/ui';
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
              <Link to="/session" className="btn btn-volt-flat">Start a session</Link>
              <Link to="/history" className="btn btn-outline">Open history</Link>
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
      <PageHeader
        kicker={`Session report${validDate ? ` · ${startedAt.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}` : ''}`}
        title="Bicep curl"
        actions={
          <>
            <button type="button" onClick={handleDownloadPdf} disabled={isDownloadingPdf} className="btn btn-outline">
              <ArrowDownToLine className="size-4" />
              {isDownloadingPdf ? 'Preparing PDF…' : 'Download PDF'}
            </button>
            <Link to="/session" className="btn btn-volt-flat">Go again</Link>
          </>
        }
      />

      {pdfError ? (
        <div className="mb-3">
          <Notice title="PDF download issue">{pdfError}</Notice>
        </div>
      ) : null}

      {/* Headline */}
      <section className="grid gap-3 lg:grid-cols-[1fr_1fr_1fr]" aria-label="Headline scores">
        <div className="relative isolate flex min-h-[260px] flex-col justify-between overflow-hidden rounded-[4px] bg-panel p-6 text-white">
          <p className="text-sm text-white/75">Grade</p>
          <div className="flex items-end justify-between gap-4">
            <span className="stat text-[150px] leading-[0.75] text-volt">{grade}</span>
            <p className="text-right text-sm text-white/80">
              {goodReps} of {reps.length || repCountValue}
              <br />
              reps clean
            </p>
          </div>
        </div>
        <div className="card flex flex-col justify-between p-6">
          <p className="text-sm text-ink-2">Posture</p>
          <Stat value={postureScoreValue} unit="/100" size="lg" tone={scoreTone(postureScoreValue) === 'good' ? 'ink' : scoreTone(postureScoreValue)}>
            <Meter value={postureScoreValue} tone={scoreTone(postureScoreValue)} className="mt-5" />
          </Stat>
        </div>
        <div className="card flex flex-col justify-between p-6">
          <div className="flex items-start justify-between">
            <p className="text-sm text-ink-2">Injury risk</p>
            <RiskTag score={riskScore} />
          </div>
          <Stat value={riskScore} unit="%" size="lg" tone={risk.tone}>
            <RiskScale score={riskScore} className="mt-5" />
          </Stat>
        </div>
      </section>

      <dl className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          ['Reps', repCountValue, ''],
          ['Accuracy', report.accuracy ?? '—', '%'],
          ['Time', formatDuration(report.duration), ''],
          ['Avg pressure', Math.round(averageFsrValue || 0), ''],
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

      {/* Coach notes */}
      <section className="card card-pad mt-3" aria-label="Coach notes">
        <p className="text-sm text-ink-2">Coach's note</p>
        <p className="lede mt-5 max-w-4xl text-[28px] sm:text-[36px]">
          {insights.summary || `You completed ${report.totalReps} reps with ${report.accuracy}% accuracy.`}
        </p>
        <div className="mt-10 grid gap-8 border-t border-line pt-8 sm:grid-cols-3">
          <NoteList title="What worked" dot="bg-good" items={insights.positiveFeedback} empty="Keep logging sessions to see highlights." />
          <NoteList title="Fix next" dot="bg-warn" items={insights.improvements} empty="No corrections this time." />
          <NoteList title="Watch out" dot="bg-bad" items={cautions} empty="Nothing flagged." />
        </div>
      </section>

      {/* Chart */}
      <section className="card card-pad mt-3" aria-labelledby="chart-title">
        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
          <h2 id="chart-title" className="lede text-3xl">Rep by rep</h2>
          <div className="flex flex-wrap gap-5 text-sm text-ink-2">
            <Legend swatch="h-[3px] bg-ink" label="Form" />
            <Legend swatch="h-[2px] bg-info" label="Pressure" />
            <Legend swatch="h-0 border-t-2 border-dashed border-muted" label="Consistency" />
            <Legend swatch="size-2 rounded-full bg-bad" label="Flagged rep" />
          </div>
        </div>
        <RepPerformanceChart reps={reps} />
      </section>

      {/* Table */}
      {reps.length ? (
        <section className="card mt-3 overflow-hidden" aria-labelledby="reps-title">
          <h2 id="reps-title" className="lede px-6 pt-6 text-3xl sm:px-8 sm:pt-8">Rep log</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm tabular-nums">
              <thead>
                <tr className="border-b border-line text-left text-ink-2">
                  {['Rep', 'Form', 'Pressure score', 'Avg pressure', 'Range', 'Consistency', ''].map((h) => (
                    <th key={h || 'status'} scope="col" className="px-3 py-3 font-normal first:pl-6 sm:first:pl-8">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reps.map((rep) => (
                  <tr key={rep.repNumber} className="border-b border-line last:border-0">
                    <td className="px-3 py-3.5 pl-6 sm:pl-8">{rep.repNumber}</td>
                    <td className={cx('px-3 py-3.5 font-medium', rep.formScore >= 60 ? 'text-ink' : 'text-bad')}>{rep.formScore}</td>
                    <td className="px-3 py-3.5 text-ink-2">{rep.fsrScore ?? '—'}</td>
                    <td className="px-3 py-3.5 text-ink-2">{rep.avgFsr ?? '—'}</td>
                    <td className="px-3 py-3.5 text-ink-2">
                      {rep.minAngle != null && rep.maxAngle != null ? `${Math.round(rep.minAngle)}–${Math.round(rep.maxAngle)}°` : '—'}
                    </td>
                    <td className="px-3 py-3.5 text-ink-2">{rep.fusionScore ?? '—'}</td>
                    <td className="px-3 py-3.5 pr-6 text-right sm:pr-8">
                      {rep.correct ? <span className="tag tag-good">Clean</span> : <span className="tag tag-bad">Fix</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function NoteList({ title, dot, items, empty }) {
  return (
    <div>
      <h3 className="flex items-center gap-2 text-sm font-medium">
        <span className={cx('size-2 rounded-full', dot)} aria-hidden />
        {title}
      </h3>
      {items?.length ? (
        <ul className="mt-3 flex flex-col gap-2">
          {items.map((item) => (
            <li key={item} className="text-[15px] leading-snug text-ink-2">{item}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-muted">{empty}</p>
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
      <div className="grid h-48 place-items-center rounded-[4px] bg-canvas text-sm text-ink-2">
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
          <line x1={left} x2={CHART_WIDTH - right} y1={yAt(tick)} y2={yAt(tick)} stroke="var(--color-line)" />
          <text x={left - 8} y={yAt(tick) + 4} fill="var(--color-muted)" fontSize="11" textAnchor="end">{tick}</text>
        </g>
      ))}
      <rect x={left} y={yAt(60)} width={usableWidth} height={yAt(0) - yAt(60)} fill="rgb(198 47 34 / 0.035)" />
      <text x={CHART_WIDTH - right - 4} y={yAt(0) - 8} fill="var(--color-bad)" fontSize="11" textAnchor="end">Form under 60</text>

      <polyline fill="none" stroke="var(--color-muted)" strokeWidth="1.5" strokeDasharray="5 5" points={pointsFor('fusionScore')} />
      <polyline fill="none" stroke="var(--color-info)" strokeWidth="2" points={pointsFor('fsrScore')} />
      <polyline fill="none" stroke="var(--color-ink)" strokeWidth="3" strokeLinejoin="round" points={pointsFor('formScore')} />

      {reps.map((rep, index) => (
        <g key={rep.repNumber}>
          {rep.correct ? (
            <circle cx={xAt(index)} cy={yAt(rep.formScore ?? 0)} r="4" fill="var(--color-surface)" stroke="var(--color-ink)" strokeWidth="2" />
          ) : (
            <circle cx={xAt(index)} cy={yAt(rep.formScore ?? 0)} r="5.5" fill="var(--color-bad)" stroke="var(--color-surface)" strokeWidth="2" />
          )}
          <text x={xAt(index)} y={CHART_HEIGHT - 6} textAnchor="middle" fill="var(--color-muted)" fontSize="11">{rep.repNumber}</text>
        </g>
      ))}
    </svg>
  );
}
