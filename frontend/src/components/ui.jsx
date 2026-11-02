import { Link } from 'react-router-dom';
import { cx, getRisk } from '../utils/format';

export function Logo({ to = '/', className = '', inverted = false }) {
  return (
    <Link
      to={to}
      aria-label="FitMon home"
      className={cx('inline-flex items-baseline gap-[3px] leading-none', inverted ? 'text-paper' : 'text-ink', className)}
    >
      <span className="display text-[26px]">Fitmon</span>
      <span className="inline-block size-[7px] translate-y-[-1px] bg-signal" aria-hidden />
    </Link>
  );
}

export function PageHeader({ label, title, description, actions, className = '' }) {
  return (
    <header className={cx('mb-8 flex flex-col gap-5 border-b-2 border-ink pb-5 md:flex-row md:items-end md:justify-between', className)}>
      <div className="min-w-0">
        {label ? <p className="label mb-3">{label}</p> : null}
        <h1 className="display text-[44px] sm:text-[60px]">{title}</h1>
        {description ? <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ink-2">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}

const toneText = {
  good: 'text-good',
  warn: 'text-warn',
  bad: 'text-bad',
  info: 'text-info',
  signal: 'text-signal',
  ink: 'text-ink',
};

const toneFill = {
  good: 'bg-good',
  warn: 'bg-warn',
  bad: 'bg-bad',
  info: 'bg-info',
  signal: 'bg-signal',
  ink: 'bg-ink',
};

/** Big scoreboard number with a label above it. */
export function Figure({ label, value, unit, tone = 'ink', size = 'md', children, className = '' }) {
  const sizes = { sm: 'text-[32px]', md: 'text-[52px]', lg: 'text-[72px] sm:text-[88px]' };
  return (
    <div className={cx('min-w-0', className)}>
      <p className="label">{label}</p>
      <p className={cx('figure mt-2', sizes[size], toneText[tone])}>
        {value}
        {unit ? <span className="ml-1 align-baseline text-[0.38em] font-semibold text-muted">{unit}</span> : null}
      </p>
      {children}
    </div>
  );
}

/** Segmented bar — reads like a gym equipment display rather than a soft progress bar. */
export function Meter({ value = 0, max = 100, segments = 20, tone = 'ink', className = '' }) {
  const clamped = Math.max(0, Math.min(max, Number(value) || 0));
  const filled = Math.round((clamped / max) * segments);
  return (
    <div className={cx('flex h-2.5 gap-[3px]', className)} role="meter" aria-valuemin={0} aria-valuemax={max} aria-valuenow={Math.round(clamped)}>
      {Array.from({ length: segments }, (_, i) => (
        <span key={i} className={cx('flex-1 transition-colors duration-300', i < filled ? toneFill[tone] : 'bg-ink/10')} />
      ))}
    </div>
  );
}

/** Linear Safe → Watch → High scale with a marker. */
export function RiskScale({ score = 0, className = '' }) {
  const clamped = Math.max(0, Math.min(100, Number(score) || 0));
  return (
    <div className={className}>
      <div className="relative flex h-2.5">
        <span className="w-1/4 bg-good/80" />
        <span className="w-[30%] bg-warn/70" />
        <span className="flex-1 bg-bad/80" />
        <span
          className="absolute -top-1.5 h-[22px] w-[3px] -translate-x-1/2 bg-ink ring-2 ring-paper transition-[left] duration-500"
          style={{ left: `${clamped}%` }}
          aria-hidden
        />
      </div>
      <div className="mt-2 flex text-[10px] font-semibold tracking-[0.08em] text-muted uppercase">
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
      {risk.label}
      {showScore ? <span className="tabular-nums">{Math.round(Number(score) || 0)}%</span> : null}
    </span>
  );
}

export function EmptyState({ title, description, action, className = '' }) {
  return (
    <div className={cx('graph-paper flex flex-col items-start border border-dashed border-ink/30 px-6 py-12 sm:px-10', className)}>
      <p className="display text-3xl">{title}</p>
      {description ? <p className="mt-2 max-w-md text-[15px] text-ink-2">{description}</p> : null}
      {action ? <div className="mt-6 flex flex-wrap gap-2">{action}</div> : null}
    </div>
  );
}

export function Notice({ tone = 'bad', title, children }) {
  const bar = { bad: 'border-bad', warn: 'border-warn', info: 'border-info' }[tone];
  const text = { bad: 'text-bad', warn: 'text-warn', info: 'text-info' }[tone];
  return (
    <div role="alert" className={cx('border-l-4 bg-sheet px-4 py-3', bar)}>
      {title ? <p className={cx('text-sm font-semibold', text)}>{title}</p> : null}
      {children ? <div className="mt-0.5 text-sm text-ink-2">{children}</div> : null}
    </div>
  );
}

/**
 * Side-on line drawing of a bicep curl, annotated the way FitMon reads it.
 * Used on the landing and login pages instead of a stock dashboard mock-up.
 */
export function CurlDiagram({ className = '', inverted = false }) {
  const ink = inverted ? 'var(--color-paper)' : 'var(--color-ink)';
  const soft = inverted ? 'rgb(242 240 234 / 0.35)' : 'rgb(18 18 18 / 0.3)';
  const bg = inverted ? 'var(--color-ink)' : 'var(--color-paper)';
  const note = inverted ? 'rgb(242 240 234 / 0.7)' : 'var(--color-muted)';
  return (
    <svg viewBox="0 0 470 470" className={className} role="img" aria-label="Diagram of a bicep curl with the elbow angle, shoulder drift and range of motion annotated">
      {/* extended (ghost) forearm + motion path */}
      <line x1="176" y1="250" x2="196" y2="400" stroke={soft} strokeWidth="10" strokeLinecap="round" strokeDasharray="2 14" />
      <path d="M196 400 A 150 150 0 0 0 306 152" fill="none" stroke={soft} strokeWidth="1.5" strokeDasharray="5 6" />

      {/* body (kept lighter so the working arm reads first) */}
      <circle cx="170" cy="40" r="24" fill="none" stroke={soft} strokeWidth="5" />
      <line x1="168" y1="66" x2="160" y2="96" stroke={soft} strokeWidth="6" strokeLinecap="round" />
      <line x1="158" y1="96" x2="146" y2="300" stroke={soft} strokeWidth="16" strokeLinecap="round" />
      <line x1="146" y1="300" x2="156" y2="460" stroke={soft} strokeWidth="12" strokeLinecap="round" />
      {/* upper arm + forearm (curled) */}
      <line x1="164" y1="100" x2="176" y2="250" stroke={ink} strokeWidth="11" strokeLinecap="round" />
      <line x1="176" y1="250" x2="300" y2="160" stroke="var(--color-signal)" strokeWidth="11" strokeLinecap="round" />
      <rect x="292" y="136" width="30" height="46" rx="3" fill={ink} transform="rotate(-36 307 159)" />

      {/* elbow angle arc */}
      <path d="M172 200 A 50 50 0 0 1 216 221" fill="none" stroke="var(--color-signal)" strokeWidth="3" />
      {[[164, 100], [176, 250], [300, 160]].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="7" fill={bg} stroke={ink} strokeWidth="3" />
      ))}

      {/* annotations */}
      <g fontFamily="Archivo, sans-serif" fontWeight="700" fill={ink}>
        <line x1="150" y1="100" x2="30" y2="100" stroke={ink} strokeWidth="1" />
        <text x="30" y="90" fontSize="11" letterSpacing="1" fill={note}>SHOULDER DRIFT</text>
        <text x="30" y="126" fontSize="26" style={{ fontStretch: '75%' }}>3°</text>

        <line x1="160" y1="250" x2="30" y2="250" stroke={ink} strokeWidth="1" />
        <text x="30" y="240" fontSize="11" letterSpacing="1" fill="var(--color-signal)">ELBOW ANGLE</text>
        <text x="30" y="278" fontSize="30" style={{ fontStretch: '75%' }}>42°</text>

        <line x1="300" y1="330" x2="340" y2="330" stroke={ink} strokeWidth="1" />
        <text x="346" y="320" fontSize="11" letterSpacing="1" fill={note}>RANGE</text>
        <text x="346" y="350" fontSize="26" style={{ fontStretch: '75%' }}>38–152°</text>
      </g>
    </svg>
  );
}
