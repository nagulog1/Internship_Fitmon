import { useEffect, useRef, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Link } from 'react-router-dom';
import useTheme from '../hooks/useTheme';
import { CURL_ANGLE_MAX, CURL_ANGLE_MIN, CURL_STILL_ANGLE, curlProgress } from '../utils/curlMotion';
import { cx, getRisk } from '../utils/format';

/** Switches between light and dark. `glass` is for placing it over a photo. */
export function ThemeToggle({ glass = false, className = '' }) {
  const { theme, toggleTheme } = useTheme();
  const label = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
  const Icon = theme === 'dark' ? Sun : Moon;
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className={cx(
        'grid size-10 shrink-0 place-items-center rounded-full transition-colors',
        glass ? 'border border-white/50 bg-white/10 text-white backdrop-blur-md hover:bg-white/20' : 'bg-surface text-ink-2 hover:text-ink',
        className,
      )}
    >
      <Icon className="size-4" aria-hidden />
    </button>
  );
}

/** The curl tracker: shoulder, elbow and wrist, with the range of motion dotted around the elbow. */
function LogoRing({ className = '' }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <circle cx="32" cy="32" r="30.5" fill="none" stroke="rgb(255 255 255 / 0.4)" strokeWidth="1.2" />
      <path d="M29.5 22.4 A 24.5 24.5 0 0 1 51.6 46.8" fill="none" stroke="rgb(255 255 255 / 0.4)" strokeWidth="2" strokeLinecap="round" strokeDasharray="0 5" />
      <path d="M23 15 L27.1 46.8 L44.3 29.4" fill="none" stroke="#ffffff" strokeWidth="2.8" />
      <circle cx="23" cy="14.6" r="3.9" fill="#0e1013" stroke="#ffffff" strokeWidth="2.2" />
      <circle cx="27.1" cy="46.8" r="5.4" fill="#def52b" />
      <circle cx="44.3" cy="29.4" r="3.9" fill="#0e1013" stroke="#def52b" strokeWidth="2.2" />
    </svg>
  );
}

function LogoBadge({ className = '' }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <circle cx="32" cy="32" r="32" fill="#0e1013" />
      <path d="M23.3 15.3 L27.3 46 L44 29.3" fill="none" stroke="#ffffff" strokeWidth="3.4" />
      <circle cx="23.3" cy="15.3" r="4.6" fill="#ffffff" />
      <circle cx="27.3" cy="46" r="6" fill="#def52b" />
      <circle cx="44" cy="29.3" r="4.6" fill="#def52b" />
    </svg>
  );
}

/** `inverted` is for dark panels and photos. Otherwise it follows the light or dark theme. */
export function LogoMark({ inverted = false, className = 'size-8' }) {
  if (inverted) return <LogoRing className={cx('shrink-0', className)} />;
  return (
    <>
      <LogoBadge className={cx('logo-on-light shrink-0', className)} />
      <LogoRing className={cx('logo-on-dark shrink-0', className)} />
    </>
  );
}

export function LogoWordmark({ inverted = false }) {
  return (
    <span>
      Fit<span className={inverted ? 'text-volt' : 'text-volt-deep'}>/</span>Mon
    </span>
  );
}

export function Logo({ to = '/', className = '', inverted = false }) {
  return (
    <Link
      to={to}
      aria-label="FitMon home"
      className={cx('headline inline-flex items-center gap-2 text-[22px] leading-none tracking-[-0.04em]', inverted ? 'text-white' : 'text-ink', className)}
    >
      <LogoMark inverted={inverted} />
      <LogoWordmark inverted={inverted} />
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
          className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface bg-ink shadow transition-[left] duration-500"
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

const CURL_SHOULDER = { x: 164, y: 100 };
const CURL_UPPER_ARM = 150;
const CURL_FOREARM = 153;
const toRadians = (degrees) => (degrees * Math.PI) / 180;
const pointAt = (center, radius, degrees) => ({
  x: center.x + radius * Math.cos(toRadians(degrees)),
  y: center.y + radius * Math.sin(toRadians(degrees)),
});
const arcTo = (center, radius, from, to) => {
  const end = pointAt(center, radius, to);
  return `A ${radius} ${radius} 0 0 ${to > from ? 1 : 0} ${end.x} ${end.y}`;
};
const arcPath = (center, radius, from, to) => {
  const start = pointAt(center, radius, from);
  return `M ${start.x} ${start.y} ${arcTo(center, radius, from, to)}`;
};

/**
 * Side-on drawing of a bicep curl, annotated the way FitMon reads it. The arm is
 * placed from the elbow angle, so the drawing always matches the number beside it.
 * The values are illustrative. Holds a still frame when the viewer prefers reduced motion.
 */
export function CurlDiagram({ className = '', inverted = false }) {
  const svgRef = useRef(null);
  const [progress, setProgress] = useState(() => (
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? (CURL_ANGLE_MAX - CURL_STILL_ANGLE) / (CURL_ANGLE_MAX - CURL_ANGLE_MIN)
      : 0
  ));

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    let frame = null;
    let last = null;
    let clock = 0;
    const tick = (now) => {
      if (last !== null) clock += (now - last) / 1000;
      last = now;
      setProgress(curlProgress(clock));
      frame = requestAnimationFrame(tick);
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = null;
      last = null;
    };
    // Only animate while the diagram is on screen.
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && frame === null) frame = requestAnimationFrame(tick);
      else if (!entry.isIntersecting) stop();
    });
    observer.observe(svgRef.current);

    return () => {
      observer.disconnect();
      stop();
    };
  }, []);

  const ink = inverted ? '#ffffff' : 'var(--color-ink)';
  const soft = inverted ? 'rgb(255 255 255 / 0.3)' : 'var(--color-line-strong)';
  const bg = inverted ? 'var(--color-panel)' : 'var(--color-surface)';
  const note = inverted ? 'rgb(255 255 255 / 0.65)' : 'var(--color-muted)';

  const angle = CURL_ANGLE_MAX - (CURL_ANGLE_MAX - CURL_ANGLE_MIN) * progress;
  const drift = 0.5 + 2.5 * progress;
  const elbow = {
    x: CURL_SHOULDER.x + CURL_UPPER_ARM * Math.sin(toRadians(drift)),
    y: CURL_SHOULDER.y + CURL_UPPER_ARM * Math.cos(toRadians(drift)),
  };
  const toShoulder = (Math.atan2(CURL_SHOULDER.y - elbow.y, CURL_SHOULDER.x - elbow.x) * 180) / Math.PI;
  const wrist = pointAt(elbow, CURL_FOREARM, toShoulder + angle);
  const extended = pointAt(elbow, CURL_FOREARM, toShoulder + CURL_ANGLE_MAX);
  const curled = pointAt(elbow, CURL_FOREARM, toShoulder + CURL_ANGLE_MIN);
  const wedgeStart = pointAt(elbow, 54, toShoulder);
  const hexagon = Array.from({ length: 6 }, (_, i) => {
    const corner = pointAt(wrist, 24, toShoulder + angle + 30 + i * 60);
    return `${corner.x},${corner.y}`;
  }).join(' ');

  return (
    <svg ref={svgRef} viewBox="0 0 470 470" className={className} role="img" aria-label="Animated diagram of a bicep curl. The elbow angle moves between 152 and 38 degrees while shoulder drift rises from 1 to 3 degrees">
      <circle cx="170" cy="40" r="24" fill="none" stroke={soft} strokeWidth="5" />
      <line x1="168" y1="66" x2="160" y2="96" stroke={soft} strokeWidth="6" strokeLinecap="round" />
      <line x1="158" y1="96" x2="146" y2="300" stroke={soft} strokeWidth="16" strokeLinecap="round" />
      <line x1="146" y1="300" x2="156" y2="460" stroke={soft} strokeWidth="12" strokeLinecap="round" />

      <line x1={CURL_SHOULDER.x} y1={CURL_SHOULDER.y} x2={CURL_SHOULDER.x} y2="282" stroke={ink} strokeWidth="1.5" strokeDasharray="3 6" />
      <line x1={elbow.x} y1={elbow.y} x2={extended.x} y2={extended.y} stroke={soft} strokeWidth="6" strokeLinecap="round" />
      <line x1={elbow.x} y1={elbow.y} x2={curled.x} y2={curled.y} stroke={soft} strokeWidth="6" strokeLinecap="round" />
      <path d={arcPath(elbow, CURL_FOREARM, toShoulder + CURL_ANGLE_MAX, toShoulder + CURL_ANGLE_MIN)} fill="none" stroke={soft} strokeWidth="1.5" strokeDasharray="5 6" />
      <path d={arcPath(elbow, CURL_FOREARM, toShoulder + CURL_ANGLE_MAX, toShoulder + angle)} fill="none" stroke={ink} strokeWidth="2.5" strokeLinecap="round" />

      <path
        d={`M ${elbow.x} ${elbow.y} L ${wedgeStart.x} ${wedgeStart.y} ${arcTo(elbow, 54, toShoulder, toShoulder + angle)} Z`}
        fill="var(--color-volt)"
        stroke={ink}
        strokeWidth="2"
      />
      <line x1={CURL_SHOULDER.x} y1={CURL_SHOULDER.y} x2={elbow.x} y2={elbow.y} stroke={ink} strokeWidth="12" strokeLinecap="round" />
      <line x1={elbow.x} y1={elbow.y} x2={wrist.x} y2={wrist.y} stroke={ink} strokeWidth="12" strokeLinecap="round" />
      <polygon points={hexagon} fill={ink} />
      {[CURL_SHOULDER, elbow, wrist].map((joint, i) => (
        <circle key={i} cx={joint.x} cy={joint.y} r="7" fill={bg} stroke={ink} strokeWidth="2.5" />
      ))}

      <g fontFamily="'Inter Tight', sans-serif" fill={ink} style={{ fontVariantNumeric: 'tabular-nums' }}>
        <line x1="12" y1="100" x2="152" y2="100" stroke={ink} strokeWidth="0.75" />
        <text x="12" y="90" fontSize="20" fill={note}>Shoulder drift</text>
        <text x="12" y="145" fontSize="44" fontWeight="300" letterSpacing="-1.5">{Math.max(1, Math.round(drift))}°</text>

        <line x1="12" y1="250" x2="150" y2="250" stroke={ink} strokeWidth="0.75" />
        <text x="12" y="240" fontSize="20" fill={note}>Elbow angle</text>
        <text x="12" y="295" fontSize="44" fontWeight="300" letterSpacing="-1.5">{Math.round(angle)}°</text>

        <line x1="298" y1="412" x2="460" y2="412" stroke={ink} strokeWidth="0.75" />
        <text x="298" y="402" fontSize="20" fill={note}>Range</text>
        <text x="298" y="456" fontSize="38" fontWeight="300" letterSpacing="-1.5">38-152°</text>
      </g>
    </svg>
  );
}
