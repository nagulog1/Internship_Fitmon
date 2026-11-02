import { Link } from 'react-router-dom';
import { cx, getRisk } from '../utils/format';

export function Logo({ to = '/', className = '', inverted = false }) {
  return (
    <Link
      to={to}
      aria-label="FitMon home"
      className={cx('headline inline-flex items-center text-[22px] leading-none tracking-[-0.04em]', inverted ? 'text-white' : 'text-ink', className)}
    >
      Fit<span className={inverted ? 'text-volt' : 'text-ink/40'}>/</span>Mon
    </Link>
  );
}

export function PageHeader({ kicker, title, description, actions, className = '' }) {
  return (
    <header className={cx('mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between', className)}>
      <div className="min-w-0">
        {kicker ? <p className="kicker mb-4">{kicker}</p> : null}
        <h1 className="headline text-[52px] sm:text-[76px]">{title}</h1>
        {description ? <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-2">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div> : null}
    </header>
  );
}

const toneText = {
  good: 'text-good',
  warn: 'text-warn',
  bad: 'text-bad',
  info: 'text-info',
  ink: 'text-ink',
};

const toneFill = {
  good: 'bg-good',
  warn: 'bg-warn',
  bad: 'bg-bad',
  info: 'bg-info',
  ink: 'bg-ink',
  volt: 'bg-volt',
};

/** "+40% / Uphill support" style stat: light number, caption underneath. */
export function Stat({ value, unit, caption, tone = 'ink', size = 'md', className = '', children }) {
  const sizes = { sm: 'text-4xl', md: 'text-6xl', lg: 'text-7xl sm:text-[88px]' };
  return (
    <div className={cx('min-w-0', className)}>
      <p className={cx('stat', sizes[size], toneText[tone])}>
        {value}
        {unit ? <span className="ml-1 text-[0.4em] tracking-normal text-muted">{unit}</span> : null}
      </p>
      {caption ? <p className="mt-2 text-sm text-ink-2">{caption}</p> : null}
      {children}
    </div>
  );
}

/** Thin progress line. */
export function Meter({ value = 0, max = 100, tone = 'ink', className = '' }) {
  const clamped = Math.max(0, Math.min(max, Number(value) || 0));
  return (
    <div className={cx('h-1 w-full overflow-hidden rounded-full bg-ink/10', className)} role="meter" aria-valuemin={0} aria-valuemax={max} aria-valuenow={Math.round(clamped)}>
      <div className={cx('h-full rounded-full transition-[width] duration-500', toneFill[tone])} style={{ width: `${(clamped / max) * 100}%` }} />
    </div>
  );
}

/** Safe → Watch → High scale with a marker. */
export function RiskScale({ score = 0, className = '' }) {
  const clamped = Math.max(0, Math.min(100, Number(score) || 0));
  return (
    <div className={className}>
      <div className="relative flex h-1 gap-1">
        <span className="w-1/4 rounded-full bg-good/70" />
        <span className="w-[30%] rounded-full bg-warn/60" />
        <span className="flex-1 rounded-full bg-bad/70" />
        <span
          className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-ink shadow transition-[left] duration-500"
          style={{ left: `${clamped}%` }}
          aria-hidden
        />
      </div>
      <div className="mt-2.5 flex text-xs text-muted">
        <span className="w-1/4">Safe</span>
        <span className="w-[30%]">Watch</span>
        <span className="flex-1 text-right">High</span>
      </div>
    </div>
  );
}

export function RiskTag({ score, showScore = false }) {
  const risk = getRisk(score);
  return (
    <span className={cx('tag', risk.tag)}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {risk.label}
      {showScore ? <span className="tabular-nums opacity-80">{Math.round(Number(score) || 0)}%</span> : null}
    </span>
  );
}

export function EmptyState({ title, description, action, className = '' }) {
  return (
    <div className={cx('card flex flex-col items-start px-6 py-14 sm:px-10', className)}>
      <p className="headline text-4xl">{title}</p>
      {description ? <p className="mt-4 max-w-md text-base text-ink-2">{description}</p> : null}
      {action ? <div className="mt-8 flex flex-wrap gap-3">{action}</div> : null}
    </div>
  );
}

export function Notice({ tone = 'bad', title, children }) {
  const dot = { bad: 'bg-bad', warn: 'bg-warn', info: 'bg-info' }[tone];
  return (
    <div role="alert" className="card flex items-start gap-3 px-5 py-4">
      <span className={cx('mt-1.5 size-2 shrink-0 rounded-full', dot)} aria-hidden />
      <div className="text-sm">
        {title ? <p className="font-medium">{title}</p> : null}
        {children ? <div className="mt-0.5 text-ink-2">{children}</div> : null}
      </div>
    </div>
  );
}

/** Small "↗" arrow used on cards, like the reference's product card. */
export function CornerArrow({ className = '' }) {
  return (
    <svg viewBox="0 0 12 12" className={cx('size-3', className)} fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M3 9 9 3M4 3h5v5" />
    </svg>
  );
}

/**
 * Side-on line drawing of a bicep curl, annotated the way FitMon reads it.
 */
export function CurlDiagram({ className = '', inverted = false }) {
  const ink = inverted ? '#ffffff' : 'var(--color-ink)';
  const soft = inverted ? 'rgb(255 255 255 / 0.3)' : 'rgb(14 16 19 / 0.22)';
  const bg = inverted ? 'var(--color-ink)' : '#ffffff';
  const note = inverted ? 'rgb(255 255 255 / 0.65)' : 'var(--color-muted)';
  const accent = inverted ? 'var(--color-volt)' : 'var(--color-ink)';
  return (
    <svg viewBox="0 0 470 470" className={className} role="img" aria-label="Diagram of a bicep curl with the elbow angle, shoulder drift and range of motion annotated">
      <line x1="176" y1="250" x2="196" y2="400" stroke={soft} strokeWidth="10" strokeLinecap="round" strokeDasharray="2 14" />
      <path d="M196 400 A 150 150 0 0 0 306 152" fill="none" stroke={soft} strokeWidth="1.5" strokeDasharray="5 6" />

      <circle cx="170" cy="40" r="24" fill="none" stroke={soft} strokeWidth="5" />
      <line x1="168" y1="66" x2="160" y2="96" stroke={soft} strokeWidth="6" strokeLinecap="round" />
      <line x1="158" y1="96" x2="146" y2="300" stroke={soft} strokeWidth="16" strokeLinecap="round" />
      <line x1="146" y1="300" x2="156" y2="460" stroke={soft} strokeWidth="12" strokeLinecap="round" />

      <line x1="164" y1="100" x2="176" y2="250" stroke={ink} strokeWidth="10" strokeLinecap="round" />
      <line x1="176" y1="250" x2="300" y2="160" stroke={accent} strokeWidth="10" strokeLinecap="round" />
      <rect x="292" y="136" width="30" height="46" rx="4" fill={ink} transform="rotate(-36 307 159)" />

      <path d="M172 200 A 50 50 0 0 1 216 221" fill="none" stroke={accent} strokeWidth="2.5" />
      {[[164, 100], [176, 250], [300, 160]].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="7" fill={bg} stroke={ink} strokeWidth="2.5" />
      ))}

      <g fontFamily="'Inter Tight', sans-serif" fill={ink}>
        <line x1="150" y1="100" x2="30" y2="100" stroke={ink} strokeWidth="0.75" />
        <text x="30" y="90" fontSize="13" fill={note}>Shoulder drift</text>
        <text x="30" y="128" fontSize="30" fontWeight="300" letterSpacing="-1">3°</text>

        <line x1="160" y1="250" x2="30" y2="250" stroke={ink} strokeWidth="0.75" />
        <text x="30" y="240" fontSize="13" fill={note}>Elbow angle</text>
        <text x="30" y="282" fontSize="34" fontWeight="300" letterSpacing="-1">42°</text>

        <line x1="300" y1="330" x2="340" y2="330" stroke={ink} strokeWidth="0.75" />
        <text x="346" y="320" fontSize="13" fill={note}>Range</text>
        <text x="346" y="354" fontSize="30" fontWeight="300" letterSpacing="-1">38–152°</text>
      </g>
    </svg>
  );
}
