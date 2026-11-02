import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowDownToLine,
  CheckCircle2,
  Clock,
  FileX2,
  Repeat,
  Target,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { buildReportPdf, getReportPdfFileName } from '../utils/reportPdf';
import { Alert, EmptyState, IconChip, RiskBadge, ScoreRing, StatTile } from '../components/ui';
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
      <div className="animate-fade-up pt-8">
        <EmptyState
          icon={FileX2}
          title="No report to show"
          description="Reports open right after a session ends. Past reports can be downloaded from History."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Link to="/session" className="btn btn-primary">Start a session</Link>
              <Link to="/history" className="btn btn-ghost">Open history</Link>
            </div>
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
  const goodReps = reps.filter((rep) => rep.correct).length;

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
    <div className="animate-fade-up">
      <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <p className="eyebrow">Session report</p>
            <RiskBadge score={riskScore} showScore />
          </div>
          <h1 className="text-[28px] leading-tight font-semibold tracking-tight sm:text-[32px]">Your workout report</h1>
          {startedAt && !Number.isNaN(startedAt.getTime()) ? (
            <p className="mt-2 text-fg-2">
              {startedAt.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={handleDownloadPdf} disabled={isDownloadingPdf} className="btn btn-ghost">
            <ArrowDownToLine className="size-4" />
            {isDownloadingPdf ? 'Generating PDF…' : 'Download PDF'}
          </button>
          <Link to="/session" className="btn btn-primary">
            <Repeat className="size-4" />
            New session
          </Link>
        </div>
      </header>

      {pdfError ? (
        <div className="mb-6">
          <Alert icon={AlertTriangle} title="PDF download issue">{pdfError}</Alert>
        </div>
      ) : null}

      {/* Headline scores */}
      <section className="grid gap-4 md:grid-cols-3" aria-label="Headline scores">
        <div className="card card-pad flex items-center gap-5">
          <div className={cx('grid size-24 shrink-0 place-items-center rounded-3xl text-5xl font-semibold', gradeStyle(grade))}>
            {grade}
          </div>
          <div>
            <p className="eyebrow">Overall grade</p>
            <p className="mt-2 text-sm text-fg-2">
              {goodReps} of {reps.length || repCountValue} reps hit clean form.
            </p>
          </div>
        </div>
        <div className="card card-pad flex items-center gap-5">
          <ScoreRing value={postureScoreValue} size={96} stroke={9} tone={scoreTone(postureScoreValue)} />
          <div>
            <p className="eyebrow">Posture score</p>
            <p className="mt-2 text-sm text-fg-2">Average across every tracked frame.</p>
          </div>
        </div>
        <div className="card card-pad">
          <p className="eyebrow">Injury risk</p>
          <RiskGauge score={riskScore} tone={risk.tone} />
        </div>
      </section>

      <section className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4" aria-label="Session stats">
        <StatTile label="Total reps" value={repCountValue} icon={Repeat} tone="lime" />
        <StatTile label="Accuracy" value={report.accuracy ?? '—'} unit="%" icon={Target} tone="fg" progress={report.accuracy ?? 0} />
        <StatTile label="Duration" value={formatDuration(report.duration)} icon={Clock} tone="fg" />
        <StatTile label="Avg pressure" value={Math.round(averageFsrValue || 0)} icon={Zap} tone="cyan" />
      </section>

      {/* Chart */}
      <section className="card card-pad mt-4" aria-labelledby="chart-title">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 id="chart-title" className="flex items-center gap-2 font-medium">
            <TrendingUp className="size-4 text-muted" />
            Rep-by-rep performance
          </h2>
          <div className="flex flex-wrap gap-4 text-xs text-fg-2">
            <LegendDot color="var(--color-lime)" label="Form" />
            <LegendDot color="var(--color-cyan)" label="Pressure" />
            <LegendDot color="var(--color-violet)" label="Consistency" />
          </div>
        </div>
        <RepPerformanceChart reps={reps} />
      </section>

      {/* Insights */}
      <section className="mt-4 grid gap-4 lg:grid-cols-3" aria-label="Coaching insights">
        <div className="card card-pad lg:col-span-3">
          <p className="eyebrow mb-2">AI summary</p>
          <p className="text-[15px] leading-relaxed text-fg">
            {insights.summary || `You completed ${report.totalReps} reps with ${report.accuracy}% accuracy.`}
          </p>
        </div>
        <InsightList title="What went well" icon={CheckCircle2} tone="lime" items={insights.positiveFeedback} empty="Keep training to unlock highlights." />
        <InsightList title="Focus next" icon={Target} tone="amber" items={insights.improvements} empty="No major corrections this time." />
        <InsightList
          title="Caution"
          icon={AlertTriangle}
          tone="rose"
          items={[...(insights.warnings || []), ...(insights.injuryExplanation ? [insights.injuryExplanation] : [])]}
          empty="No warnings flagged."
        />
      </section>

      {/* Rep table */}
      {reps.length ? (
        <section className="card mt-4 overflow-hidden" aria-labelledby="reps-title">
          <h2 id="reps-title" className="px-5 pt-5 pb-3 font-medium sm:px-6">Rep history</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-y border-line text-left text-xs text-muted">
                  {['Rep', 'Form', 'Pressure score', 'Avg pressure', 'Range', 'Consistency', 'Status'].map((h) => (
                    <th key={h} scope="col" className="px-5 py-3 font-medium first:pl-6">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="num">
                {reps.map((rep) => (
                  <tr key={rep.repNumber} className="border-b border-line last:border-0 hover:bg-white/[0.02]">
                    <td className="px-5 py-3 pl-6 text-fg-2">#{rep.repNumber}</td>
                    <td className={cx('px-5 py-3 font-medium', rep.formScore >= 60 ? 'text-lime' : 'text-rose')}>{rep.formScore}</td>
                    <td className="px-5 py-3 text-fg-2">{rep.fsrScore ?? '—'}</td>
                    <td className="px-5 py-3 text-fg-2">{rep.avgFsr ?? '—'}</td>
                    <td className="px-5 py-3 text-fg-2">
                      {rep.minAngle != null && rep.maxAngle != null ? `${Math.round(rep.minAngle)}°–${Math.round(rep.maxAngle)}°` : '—'}
                    </td>
                    <td className="px-5 py-3 text-fg-2">{rep.fusionScore ?? '—'}</td>
                    <td className="px-5 py-3 font-sans">
                      {rep.correct ? <span className="badge badge-good">Good</span> : <span className="badge badge-bad">Needs work</span>}
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

function gradeStyle(grade) {
  const g = String(grade).toUpperCase()[0];
  if (g === 'A') return 'bg-lime/15 text-lime';
  if (g === 'B') return 'bg-cyan/15 text-cyan';
  if (g === 'C') return 'bg-amber/15 text-amber';
  return 'bg-rose/15 text-rose';
}

function InsightList({ title, icon, tone, items, empty }) {
  return (
    <div className="card card-pad">
      <div className="mb-4 flex items-center gap-3">
        <IconChip icon={icon} tone={tone} className="size-8 rounded-lg" />
        <h3 className="font-medium">{title}</h3>
      </div>
      {items?.length ? (
        <ul className="flex flex-col gap-2.5">
          {items.map((item) => (
            <li key={item} className="flex gap-2.5 text-sm text-fg-2">
              <span className="mt-2 size-1 shrink-0 rounded-full bg-current opacity-60" aria-hidden />
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted">{empty}</p>
      )}
    </div>
  );
}

function RiskGauge({ score, tone }) {
  const clamped = Math.max(0, Math.min(100, score || 0));
  // Semi-circle arc: 180° sweep
  const r = 70;
  const cx0 = 90;
  const cy0 = 86;
  const arcLength = Math.PI * r;
  const angle = Math.PI * (1 - clamped / 100);
  const nx = cx0 + r * Math.cos(angle);
  const ny = cy0 - r * Math.sin(angle);
  const color = { lime: 'var(--color-lime)', amber: 'var(--color-amber)', rose: 'var(--color-rose)' }[tone];

  return (
    <div className="mt-2 flex flex-col items-center">
      <svg viewBox="0 0 180 100" className="w-full max-w-[220px]" aria-label={`Injury risk ${clamped} percent`} role="img">
        <path d={`M ${cx0 - r} ${cy0} A ${r} ${r} 0 0 1 ${cx0 + r} ${cy0}`} fill="none" stroke="rgb(255 255 255 / 0.07)" strokeWidth="12" strokeLinecap="round" />
        <path
          d={`M ${cx0 - r} ${cy0} A ${r} ${r} 0 0 1 ${cx0 + r} ${cy0}`}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={arcLength}
          strokeDashoffset={arcLength * (1 - clamped / 100)}
        />
        <circle cx={nx} cy={ny} r="7" fill="var(--color-bg)" stroke={color} strokeWidth="3" />
      </svg>
      <p className="num -mt-9 text-3xl font-medium">{clamped}%</p>
      <div className="mt-3 flex w-full max-w-[220px] justify-between text-[11px] text-muted">
        <span>Safe</span>
        <span>Watch</span>
        <span>High</span>
      </div>
    </div>
  );
}

function RepPerformanceChart({ reps }) {
  if (!reps.length) {
    return (
      <div className="grid h-48 place-items-center rounded-xl border border-dashed border-line-strong text-sm text-muted">
        Complete more reps to see a performance graph.
      </div>
    );
  }

  const maxScore = Math.max(100, ...reps.flatMap((rep) => [rep.formScore ?? 0, rep.fsrScore ?? 0, rep.fusionScore ?? 0]));
  const left = 32;
  const right = 12;
  const top = 12;
  const bottom = 28;
  const usableWidth = CHART_WIDTH - left - right;
  const usableHeight = CHART_HEIGHT - top - bottom;
  const stepX = reps.length > 1 ? usableWidth / (reps.length - 1) : 0;
  const xAt = (index) => left + (reps.length > 1 ? stepX * index : usableWidth / 2);
  const yAt = (value) => top + usableHeight - ((value / maxScore) * usableHeight);

  const pointsFor = (key) => reps.map((rep, index) => `${xAt(index)},${yAt(rep[key] ?? 0)}`).join(' ');
  const formArea = `${left},${top + usableHeight} ${pointsFor('formScore')} ${xAt(reps.length - 1)},${top + usableHeight}`;

  return (
    <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} className="h-auto w-full" role="img" aria-label="Line chart of form, pressure and consistency scores per rep">
      <defs>
        <linearGradient id="formFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--color-lime)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="var(--color-lime)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {[0, 25, 50, 75, 100].map((tick) => (
        <g key={tick}>
          <line x1={left} x2={CHART_WIDTH - right} y1={yAt(tick)} y2={yAt(tick)} stroke="rgb(255 255 255 / 0.06)" />
          <text x={left - 8} y={yAt(tick) + 4} fill="var(--color-muted)" fontSize="11" textAnchor="end" fontFamily="var(--font-mono)">
            {tick}
          </text>
        </g>
      ))}

      <polygon points={formArea} fill="url(#formFill)" />
      <polyline fill="none" stroke="var(--color-violet)" strokeWidth="2" strokeDasharray="4 5" strokeLinejoin="round" strokeLinecap="round" points={pointsFor('fusionScore')} />
      <polyline fill="none" stroke="var(--color-cyan)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" points={pointsFor('fsrScore')} />
      <polyline fill="none" stroke="var(--color-lime)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" points={pointsFor('formScore')} />

      {reps.map((rep, index) => (
        <g key={rep.repNumber}>
          <circle cx={xAt(index)} cy={yAt(rep.formScore ?? 0)} r="4" fill="var(--color-card)" stroke={rep.correct ? 'var(--color-lime)' : 'var(--color-rose)'} strokeWidth="2" />
          <text x={xAt(index)} y={CHART_HEIGHT - 8} textAnchor="middle" fill="var(--color-muted)" fontSize="11" fontFamily="var(--font-mono)">
            {rep.repNumber}
          </text>
        </g>
      ))}
    </svg>
  );
}

function LegendDot({ color, label }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="size-2 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}
