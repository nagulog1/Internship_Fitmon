import { createElement, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  FileText,
  Gauge,
  Mail,
  Menu,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Timer,
  Waves,
  X,
  Zap,
} from 'lucide-react';
import { API_BASE_URL } from '../services/apiClient';
import useAuthStore from '../store/useAuthStore';
import { Logo, ScoreRing } from '../components/ui';
import { cx } from '../utils/format';

const stats = [
  { value: '92%', label: 'Form clarity' },
  { value: '1.4k', label: 'Sessions analyzed' },
  { value: '120ms', label: 'Signal refresh' },
  { value: '<200ms', label: 'On-device latency' },
];

const features = [
  { icon: ScanLine, tone: 'lime', title: 'Live posture guidance', copy: 'Confidence cues that stay visible while you move through each rep.' },
  { icon: Zap, tone: 'cyan', title: 'Pressure-aware feedback', copy: 'Pairs motion with load to surface early stress patterns.' },
  { icon: ShieldCheck, tone: 'amber', title: 'Risk scoring', copy: 'Maps micro-errors into a single, readable safety score.' },
  { icon: Sparkles, tone: 'violet', title: 'Session intelligence', copy: 'Highlights what improved, what drifted, and where to focus next.' },
  { icon: FileText, tone: 'lime', title: 'Coach-ready reports', copy: 'Shareable summaries built for mentors and clinical partners.' },
  { icon: Building2, tone: 'cyan', title: 'Ready for scale', copy: 'Built for studios, colleges, and performance labs.' },
];

const steps = [
  { title: 'Open a session', desc: 'Position the camera and confirm the athlete profile.' },
  { title: 'Move with cues', desc: 'Follow posture guidance while live metrics update.' },
  { title: 'See risk live', desc: 'Pressure and form scores respond on every rep.' },
  { title: 'Review the report', desc: 'Export a full summary for the next workout.' },
];

const signals = [
  { icon: Gauge, title: 'Range consistency', copy: 'Detects subtle drift in elbow and shoulder alignment across sets.' },
  { icon: Waves, title: 'Load balance', copy: 'Highlights pressure spikes before they become injury risk.' },
  { icon: Timer, title: 'Tempo control', copy: 'Tracks speed changes that reduce quality over time.' },
];

const navLinks = [
  { href: '#platform', label: 'Platform' },
  { href: '#signals', label: 'Signals' },
  { href: '#how', label: 'How it works' },
  { href: '#contact', label: 'Contact' },
];

const rotatingWords = ['athletes', 'gym bros', 'rehab', 'coaches'];

const toneChip = {
  lime: 'bg-lime/10 text-lime',
  cyan: 'bg-cyan/10 text-cyan',
  amber: 'bg-amber/10 text-amber',
  violet: 'bg-violet/10 text-violet',
};

export default function LandingPage() {
  const user = useAuthStore((state) => state.user);
  const primaryHref = user ? '/dashboard' : '/login';
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactStatus, setContactStatus] = useState(null);
  const [contactForm, setContactForm] = useState({ name: '', email: '', organization: '', message: '' });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleContactChange = (event) => {
    const { name, value } = event.target;
    setContactForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleContactSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    const payload = {
      name: contactForm.name.trim(),
      email: contactForm.email.trim(),
      organization: contactForm.organization.trim(),
      message: contactForm.message.trim(),
    };

    if (!payload.name || !payload.email || !payload.message) {
      setContactStatus({ type: 'error', message: 'Please fill in your name, email, and message.' });
      return;
    }

    try {
      setIsSubmitting(true);
      setContactStatus(null);

      const response = await fetch(`${API_BASE_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.message || 'Unable to send your message right now.');
      }

      setContactStatus({ type: 'success', message: 'Thanks! We will reach out within 24 hours.' });
      setContactForm({ name: '', email: '', organization: '', message: '' });
    } catch (error) {
      setContactStatus({ type: 'error', message: error.message || 'Unable to send your message right now.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-bg" id="top">
      {/* ── NAV ── */}
      <header className={cx('fixed inset-x-0 top-0 z-50 transition-colors duration-300', scrolled || menuOpen ? 'border-b border-line bg-bg/80 backdrop-blur-xl' : 'border-b border-transparent')}>
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="rounded-full px-3.5 py-2 text-sm text-fg-2 transition-colors hover:text-fg">
                {link.label}
              </a>
            ))}
          </nav>
          <div className="hidden items-center gap-2 md:flex">
            {!user ? <Link to="/login" className="btn btn-sm text-fg-2 hover:text-fg">Sign in</Link> : null}
            <Link to={primaryHref} className="btn btn-primary btn-sm">
              {user ? 'Open app' : 'Get started'}
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
          <button type="button" className="btn-icon md:hidden" onClick={() => setMenuOpen((v) => !v)} aria-expanded={menuOpen} aria-label="Toggle menu">
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
        {menuOpen ? (
          <div className="border-t border-line px-4 pt-2 pb-5 md:hidden">
            <nav className="flex flex-col" aria-label="Mobile">
              {navLinks.map((link) => (
                <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className="border-b border-line py-3.5 text-[15px] text-fg-2">
                  {link.label}
                </a>
              ))}
            </nav>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Link to="/login" className="btn btn-ghost">Sign in</Link>
              <Link to={primaryHref} className="btn btn-primary">Get started</Link>
            </div>
          </div>
        ) : null}
      </header>

      {/* ── HERO ── */}
      <section className="relative pt-32 pb-20 sm:pt-40 lg:pb-28">
        <div className="grid-bg absolute inset-0 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]" aria-hidden />
        <div className="absolute top-0 left-1/2 h-[480px] w-[900px] -translate-x-1/2 rounded-full bg-lime/[0.08] blur-[140px]" aria-hidden />

        <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-[1.1fr_1fr]">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-white/[0.03] py-1 pr-3 pl-1 text-xs text-fg-2">
              <span className="rounded-full bg-lime px-2 py-0.5 text-[11px] font-semibold text-lime-ink">NEW</span>
              Live motion intelligence for strength training
            </span>
            <h1 className="mt-6 text-[44px] leading-[1.02] font-semibold tracking-[-0.035em] text-balance sm:text-6xl lg:text-[68px]">
              Precision feedback
              <br />
              for <RotatingText words={rotatingWords} />
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-fg-2">
              FitMon pairs computer vision with pressure sensing to surface risk, highlight technique drift, and keep every athlete moving with confidence.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link to={primaryHref} className="btn btn-primary btn-lg">
                Start a session
                <ArrowRight className="size-4" />
              </Link>
              <a href="#platform" className="btn btn-ghost btn-lg">Explore the platform</a>
            </div>
            <dl className="mt-12 flex flex-wrap gap-x-10 gap-y-4 text-sm">
              <div>
                <dt className="eyebrow">Deployment</dt>
                <dd className="mt-1 text-fg-2">Studio · Lab · University</dd>
              </div>
              <div>
                <dt className="eyebrow">Reporting</dt>
                <dd className="mt-1 text-fg-2">PDF + AI coach insights</dd>
              </div>
            </dl>
          </div>

          <HeroShowcase />
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="border-y border-line bg-surface/50">
        <dl className="mx-auto grid max-w-6xl grid-cols-2 px-4 sm:px-6 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <div key={stat.label} className={cx('px-2 py-8 sm:px-6', i > 0 && 'lg:border-l lg:border-line', i % 2 === 1 && 'border-l border-line lg:border-l')}>
              <dd className="num text-3xl font-medium sm:text-4xl">{stat.value}</dd>
              <dt className="mt-1 text-sm text-muted">{stat.label}</dt>
            </div>
          ))}
        </dl>
      </section>

      {/* ── PLATFORM (bento) ── */}
      <section id="platform" className="scroll-mt-20 py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading eyebrow="Platform" title="Professional insight for every training decision." sub="Designed for performance teams who need clear, high-signal data without adding friction to the workout." />

          <div className="mt-14 grid gap-4 md:grid-cols-6">
            {/* Hardware card */}
            <article className="card relative overflow-hidden md:col-span-4 md:row-span-2">
              <div className="grid h-full sm:grid-cols-2">
                <div className="flex flex-col justify-between p-6 sm:p-8">
                  <div>
                    <span className="eyebrow">FitMon band</span>
                    <h3 className="mt-3 text-2xl font-semibold tracking-tight text-balance">Hardware that feels invisible. Data that doesn't.</h3>
                    <p className="mt-3 text-sm leading-relaxed text-fg-2">
                      A lightweight FSR band captures load and balance in real time, paired with ESP8266 telemetry so the software stays focused on precision.
                    </p>
                  </div>
                  <dl className="mt-8 grid grid-cols-3 gap-3 border-t border-line pt-5 text-sm">
                    {[['Sensors', 'FSR array'], ['Link', 'ESP8266'], ['Wear', 'Sweat-safe']].map(([k, v]) => (
                      <div key={k}>
                        <dt className="text-xs text-muted">{k}</dt>
                        <dd className="mt-1 font-medium">{v}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
                <div className="relative min-h-64 overflow-hidden">
                  <img
                    src="/landing/fitness-band.png"
                    alt="FitMon fitness band worn on an athlete's wrist"
                    loading="lazy"
                    className="absolute inset-0 size-full object-cover"
                    onError={(event) => {
                      event.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-card via-card/10 to-transparent sm:via-transparent" />
                </div>
              </div>
            </article>

            {features.slice(0, 2).map((feature) => (
              <FeatureCard key={feature.title} feature={feature} className="md:col-span-2" />
            ))}
            {features.slice(2).map((feature) => (
              <FeatureCard key={feature.title} feature={feature} className="md:col-span-3" />
            ))}
          </div>
        </div>
      </section>

      {/* ── SIGNALS ── */}
      <section id="signals" className="scroll-mt-20 border-y border-line bg-surface/50 py-24 sm:py-32">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeading eyebrow="Signals" title="Make risk visible before it builds." sub="FitMon separates safe effort from risky compensation by tracking subtle changes in form, tempo, and pressure distribution." />
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to={primaryHref} className="btn btn-primary">See it live <ArrowRight className="size-4" /></Link>
              <a href="#contact" className="btn btn-ghost">Talk to a specialist</a>
            </div>
          </div>
          <ul className="flex flex-col gap-3">
            {signals.map((signal) => (
              <li key={signal.title} className="card flex items-start gap-4 p-5 transition-colors hover:border-line-strong">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/[0.05] text-lime">
                  {createElement(signal.icon, { className: 'size-5', 'aria-hidden': true })}
                </span>
                <div>
                  <h3 className="font-medium">{signal.title}</h3>
                  <p className="mt-1 text-sm text-fg-2">{signal.copy}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" className="scroll-mt-20 py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading eyebrow="How it works" title="From setup to report in four clear steps." sub="FitMon keeps the workflow focused so athletes stay engaged and coaches get the insight they need." />
          <ol className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <li key={step.title} className="relative">
                <div className="mb-5 flex items-center gap-3">
                  <span className="num grid size-9 place-items-center rounded-full border border-lime/40 text-sm text-lime">{i + 1}</span>
                  {i < steps.length - 1 ? <span className="hidden h-px flex-1 bg-gradient-to-r from-lime/40 to-transparent lg:block" aria-hidden /> : null}
                </div>
                <h3 className="font-medium">{step.title}</h3>
                <p className="mt-1.5 text-sm text-fg-2">{step.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-4 sm:px-6">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-lime px-6 py-16 text-center text-lime-ink sm:py-20">
          <div className="absolute inset-0 opacity-[0.12] [background-image:radial-gradient(#0c1200_1px,transparent_1px)] [background-size:18px_18px]" aria-hidden />
          <div className="relative">
            <h2 className="mx-auto max-w-2xl text-4xl font-semibold tracking-[-0.03em] text-balance sm:text-5xl">Make every rep count with FitMon.</h2>
            <p className="mx-auto mt-4 max-w-md text-lime-ink/75">Start a session in minutes and deliver professional-grade feedback with no extra hardware.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to={primaryHref} className="btn btn-lg bg-lime-ink text-lime hover:bg-black">
                Start now <ArrowRight className="size-4" />
              </Link>
              <a href="#contact" className="btn btn-lg border border-lime-ink/25 text-lime-ink hover:bg-lime-ink/5">Book a demo</a>
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" className="scroll-mt-20 py-24 sm:py-32">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Contact" title="Design your next training cycle with us." sub="Tell us about your program, the athletes you support, and the data you want to deliver every day." />
            <ul className="mt-8 flex flex-col gap-3 text-sm text-fg-2">
              {['Response in under 24 hours', 'Pilots for studios, labs and universities', 'Supports global teams'].map((line) => (
                <li key={line} className="flex items-center gap-2.5">
                  <CheckCircle2 className="size-4 text-lime" />
                  {line}
                </li>
              ))}
            </ul>
          </div>

          <form className="card card-pad flex flex-col gap-4 sm:p-8" onSubmit={handleContactSubmit} noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name" htmlFor="c-name">
                <input id="c-name" className="input" name="name" placeholder="Your name" value={contactForm.name} onChange={handleContactChange} required autoComplete="name" />
              </Field>
              <Field label="Email" htmlFor="c-email">
                <input id="c-email" className="input" type="email" name="email" placeholder="you@email.com" value={contactForm.email} onChange={handleContactChange} required autoComplete="email" />
              </Field>
            </div>
            <Field label="Organization" htmlFor="c-org" optional>
              <input id="c-org" className="input" name="organization" placeholder="Training studio or team" value={contactForm.organization} onChange={handleContactChange} autoComplete="organization" />
            </Field>
            <Field label="Message" htmlFor="c-msg">
              <textarea id="c-msg" className="input" rows="4" name="message" placeholder="How can FitMon help?" value={contactForm.message} onChange={handleContactChange} required />
            </Field>
            {contactStatus ? (
              <p
                role="status"
                aria-live="polite"
                className={cx('rounded-xl px-4 py-3 text-sm', contactStatus.type === 'success' ? 'bg-lime/10 text-lime' : 'bg-rose/10 text-rose')}
              >
                {contactStatus.message}
              </p>
            ) : null}
            <button type="submit" className="btn btn-primary btn-lg mt-2" disabled={isSubmitting}>
              <Mail className="size-4" />
              {isSubmitting ? 'Sending…' : 'Send message'}
            </button>
          </form>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <Logo />
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-fg-2" aria-label="Footer">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="hover:text-fg">{link.label}</a>
            ))}
          </nav>
          <p className="text-sm text-muted">© {new Date().getFullYear()} FitMon. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function SectionHeading({ eyebrow, title, sub }) {
  return (
    <div className="max-w-2xl">
      <p className="eyebrow text-lime">{eyebrow}</p>
      <h2 className="mt-4 text-3xl leading-[1.1] font-semibold tracking-[-0.03em] text-balance sm:text-[44px]">{title}</h2>
      {sub ? <p className="mt-4 text-lg leading-relaxed text-fg-2">{sub}</p> : null}
    </div>
  );
}

function FeatureCard({ feature, className }) {
  return (
    <article className={cx('card group p-6 transition-colors hover:border-line-strong hover:bg-elevated', className)}>
      <span className={cx('grid size-10 place-items-center rounded-xl', toneChip[feature.tone])}>
        {createElement(feature.icon, { className: 'size-5', 'aria-hidden': true })}
      </span>
      <h3 className="mt-5 font-medium">{feature.title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-fg-2">{feature.copy}</p>
    </article>
  );
}

function Field({ label, htmlFor, optional, children }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={htmlFor} className="text-[13px] font-medium text-fg-2">
        {label}
        {optional ? <span className="ml-1 font-normal text-muted">(optional)</span> : null}
      </label>
      {children}
    </div>
  );
}

function HeroShowcase() {
  const bars = [38, 52, 44, 70, 62, 84, 58, 76, 90, 66, 72, 88, 60, 80, 94, 70];
  return (
    <div className="relative animate-fade-up pb-10 [animation-delay:120ms] sm:pb-16" aria-hidden>
      <div className="absolute -inset-6 rounded-[36px] bg-gradient-to-br from-lime/15 via-transparent to-cyan/10 blur-2xl" />
      <div className="relative rounded-3xl border border-line-strong bg-card/90 p-5 shadow-2xl shadow-black/50 backdrop-blur sm:p-6">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-xs font-medium text-fg-2">
            <span className="size-1.5 animate-pulse-dot rounded-full bg-lime" />
            Live session · Bicep curl
          </span>
          <span className="badge badge-good">Aligned</span>
        </div>

        <div className="mt-6 flex items-center gap-6">
          <ScoreRing value={86} size={112} stroke={10} label="Form" />
          <div className="grid flex-1 grid-cols-2 gap-3">
            {[
              { k: 'Reps', v: '14', c: 'text-lime' },
              { k: 'Pressure', v: '62', c: 'text-cyan' },
              { k: 'Angle', v: '42°', c: 'text-fg' },
              { k: 'Tempo', v: '2.1s', c: 'text-fg' },
            ].map((m) => (
              <div key={m.k} className="rounded-xl bg-white/[0.03] px-3 py-2.5">
                <p className="text-[11px] text-muted">{m.k}</p>
                <p className={cx('num text-xl font-medium', m.c)}>{m.v}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-white/[0.02] p-4">
          <div className="mb-3 flex items-center justify-between text-[11px] text-muted">
            <span className="flex items-center gap-1.5"><Activity className="size-3.5" /> Form score per rep</span>
            <span className="num">last 16</span>
          </div>
          <div className="flex h-20 items-end gap-1.5">
            {bars.map((h, i) => (
              <span key={i} className={cx('flex-1 rounded-sm', h >= 70 ? 'bg-lime' : 'bg-lime/35')} style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
      </div>

      <div className="absolute -bottom-20 -left-4 hidden w-64 rounded-2xl border border-line-strong bg-elevated/95 p-4 shadow-xl shadow-black/40 backdrop-blur sm:block lg:-left-10">
        <p className="eyebrow">Session highlight</p>
        <p className="mt-2 text-sm font-medium">Shoulder alignment improved</p>
        <p className="mt-1 text-xs text-fg-2">Stability held across 4 consecutive sets.</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="badge badge-neutral">Report ready</span>
          <span className="flex items-center gap-1 text-xs font-medium text-lime">Low risk · 12% <ArrowUpRight className="size-3" /></span>
        </div>
      </div>
    </div>
  );
}

function RotatingText({ words }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
    const timer = setInterval(() => setIndex((prev) => (prev + 1) % words.length), 2200);
    return () => clearInterval(timer);
  }, [words.length]);

  return (
    <span className="relative inline-grid align-bottom text-lime">
      {words.map((word, idx) => (
        <span
          key={word}
          aria-hidden={idx !== index}
          className={cx(
            'col-start-1 row-start-1 transition-all duration-500 ease-out',
            idx === index ? 'translate-y-0 opacity-100 blur-0' : 'translate-y-3 opacity-0 blur-sm'
          )}
        >
          {word}
        </span>
      ))}
    </span>
  );
}
