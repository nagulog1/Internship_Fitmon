import { createElement } from 'react';
import { Link } from 'react-router-dom';
import { cx, getRisk } from '../utils/format';

export function Logo({ to = '/', className = '' }) {
  return (
    <Link to={to} className={cx('inline-flex items-center gap-2.5 font-semibold tracking-tight text-fg', className)}>
      <span className="grid size-8 place-items-center rounded-[10px] bg-lime text-lime-ink">
        <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M3 12h4l2.5-6 5 12 2.5-6h4" />
        </svg>
      </span>
      <span className="text-[17px]">
        Fit<span className="text-lime">Mon</span>
      </span>
    </Link>
  );
}

export function PageHeader({ eyebrow, title, description, actions, className = '' }) {
  return (
    <header className={cx('mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div className="min-w-0">
        {eyebrow ? <p className="eyebrow mb-2">{eyebrow}</p> : null}
        <h1 className="text-[28px] leading-tight font-semibold tracking-tight text-balance sm:text-[32px]">{title}</h1>
        {description ? <p className="mt-2 max-w-xl text-[15px] text-fg-2">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}

const toneText = {
  lime: 'text-lime',
  cyan: 'text-cyan',
  amber: 'text-amber',
  rose: 'text-rose',
  violet: 'text-violet',
  fg: 'text-fg',
};

const toneBg = {
  lime: 'bg-lime/10 text-lime',
  cyan: 'bg-cyan/10 text-cyan',
  amber: 'bg-amber/10 text-amber',
  rose: 'bg-rose/10 text-rose',
  violet: 'bg-violet/10 text-violet',
  fg: 'bg-white/[0.06] text-fg',
};

export function IconChip({ icon, tone = 'lime', className = '' }) {
  return (
    <span className={cx('grid size-9 shrink-0 place-items-center rounded-xl', toneBg[tone], className)}>
      {createElement(icon, { className: 'size-[18px]', 'aria-hidden': true })}
    </span>
  );
}

export function StatTile({ label, value, unit, icon, tone = 'fg', hint, progress, className = '' }) {
  return (
    <div className={cx('card flex flex-col gap-3 p-4 sm:p-5', className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[13px] text-fg-2">{label}</span>
        {icon ? createElement(icon, { className: cx('size-4', toneText[tone] || 'text-muted'), 'aria-hidden': true }) : null}
      </div>
      <p className={cx('num text-[28px] leading-none font-medium', toneText[tone])}>
        {value}
        {unit ? <span className="ml-1 text-sm font-normal text-muted">{unit}</span> : null}
      </p>
      {typeof progress === 'number' ? <ProgressBar value={progress} tone={tone === 'fg' ? 'lime' : tone} /> : null}
      {hint ? <p className="text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

const barTone = {
  lime: 'bg-lime',
  cyan: 'bg-cyan',
  amber: 'bg-amber',
  rose: 'bg-rose',
  violet: 'bg-violet',
};

export function ProgressBar({ value = 0, tone = 'lime', className = '' }) {
  const clamped = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div className={cx('h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]', className)} role="presentation">
      <div className={cx('h-full rounded-full transition-[width] duration-500', barTone[tone])} style={{ width: `${clamped}%` }} />
    </div>
  );
}

const ringStroke = {
  lime: 'var(--color-lime)',
  cyan: 'var(--color-cyan)',
  amber: 'var(--color-amber)',
  rose: 'var(--color-rose)',
  violet: 'var(--color-violet)',
};

export function ScoreRing({ value = 0, max = 100, size = 120, stroke = 10, tone = 'lime', label, display, className = '' }) {
  const numeric = Number(value) || 0;
  const pct = Math.max(0, Math.min(1, numeric / max));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className={cx('relative inline-grid place-items-center', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgb(255 255 255 / 0.07)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={ringStroke[tone]}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - pct)}
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.22, 1, 0.36, 1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="num leading-none font-medium" style={{ fontSize: size * 0.24 }}>
          {display ?? Math.round(numeric)}
        </span>
        {label ? <span className="mt-1 text-[11px] text-muted">{label}</span> : null}
      </div>
    </div>
  );
}

export function RiskBadge({ score, showScore = false }) {
  const risk = getRisk(score);
  return (
    <span className={cx('badge', risk.badge)}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {risk.label}
      {showScore ? <span className="num opacity-80">· {Math.round(Number(score) || 0)}%</span> : null}
    </span>
  );
}

export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="card flex flex-col items-center px-6 py-14 text-center">
      {icon ? <IconChip icon={icon} tone="fg" className="mb-4 size-12 rounded-2xl" /> : null}
      <h3 className="text-base font-medium">{title}</h3>
      {description ? <p className="mt-1.5 max-w-sm text-sm text-fg-2">{description}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function Alert({ tone = 'rose', icon, title, children }) {
  const styles = {
    rose: 'border-rose/25 bg-rose/[0.07] text-rose',
    amber: 'border-amber/25 bg-amber/[0.07] text-amber',
    cyan: 'border-cyan/25 bg-cyan/[0.07] text-cyan',
  };
  return (
    <div role="alert" className={cx('flex items-start gap-3 rounded-xl border px-4 py-3', styles[tone])}>
      {icon ? createElement(icon, { className: 'mt-0.5 size-4 shrink-0', 'aria-hidden': true }) : null}
      <div className="text-sm">
        {title ? <p className="font-medium">{title}</p> : null}
        {children ? <div className="text-fg-2">{children}</div> : null}
      </div>
    </div>
  );
}

