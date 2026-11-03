import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Pause, Play, X } from 'lucide-react';
import { API_BASE_URL } from '../services/apiClient';
import useAuthStore from '../store/useAuthStore';
import CurlModel3D from '../components/CurlModel3D';
import { CornerArrow, Logo, LogoMark, LogoWordmark, RiskScale, ThemeToggle } from '../components/ui';
import { cx } from '../utils/format';

const sampleRows = [
  { rep: 9, range: '36-154°', form: 88, pressure: 52, flag: null },
  { rep: 10, range: '37-152°', form: 84, pressure: 55, flag: null },
  { rep: 11, range: '44-149°', form: 61, pressure: 58, flag: 'Elbow forward' },
  { rep: 12, range: '51-141°', form: 47, pressure: 81, flag: 'Pressure spike' },
];

const steps = [
  { title: 'Set up', desc: 'Prop up your phone or laptop side-on, arm in frame. No markers, no suit.' },
  { title: 'Curl', desc: 'Press start and train. Cues appear the moment your form slips.' },
  { title: 'Review', desc: 'End the set and FitMon writes a report with a grade and what to fix.' },
  { title: 'Improve', desc: 'History shows whether your form is trending up, session by session.' },
];

const heroPhotos = [
  { src: '/landing/hero/arm-dumbbell.jpg', alt: '' },
  { src: '/landing/hero/bench-press.jpg', alt: '' },
  { src: '/landing/hero/curl-bw.jpg', alt: '' },
  { src: '/landing/hero/wristband.jpg', alt: '' },
  { src: '/landing/hero/tracker.jpg', alt: '' },
];

const navLinks = [
  { href: '#measures', label: 'Platform' },
  { href: '#how', label: 'How it works' },
  { href: '#hardware', label: 'Band' },
  { href: '#contact', label: 'Contact' },
];

export default function LandingPage() {
  const user = useAuthStore((state) => state.user);
  const primaryHref = user ? '/dashboard' : '/login';
  // One label for the sign-up intent everywhere on the page.
  const primaryLabel = user ? 'Open app' : 'Start training';
  const [menuOpen, setMenuOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactStatus, setContactStatus] = useState(null);
  const [contactForm, setContactForm] = useState({ name: '', email: '', organization: '', message: '' });
  const [heroPaused, setHeroPaused] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    if (heroPaused) return undefined;
    const timer = window.setInterval(() => setHeroIndex((i) => (i + 1) % heroPhotos.length), 5000);
    return () => window.clearInterval(timer);
  }, [heroPaused]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const close = (event) => event.key === 'Escape' && setMenuOpen(false);
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [menuOpen]);

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
    <div className="min-h-screen overflow-x-hidden bg-canvas" id="top">
      {/* ── HERO ── */}
      <section className="relative isolate flex min-h-[100dvh] flex-col overflow-hidden bg-panel text-white">
        {/* All photos stay mounted so each swap is instant; only the current one is visible. */}
        <div className="absolute inset-0 -z-20 brightness-[0.8]" aria-hidden>
          {heroPhotos.map((photo, i) => (
            <img
              key={photo.src}
              src={photo.src}
              alt=""
              fetchPriority={i === 0 ? 'high' : undefined}
              className={cx('absolute inset-0 size-full object-cover', i !== heroIndex && 'invisible')}
            />
          ))}
        </div>
        <div className="photo-scrim absolute inset-0 -z-10" aria-hidden />

        {/* Nav */}
        <header className="relative z-20">
          <div className="mx-auto flex h-20 max-w-[1320px] items-center justify-between gap-6 px-5 sm:px-8">
            <Logo inverted />
            <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
              {navLinks.map((link) => (
                <a key={link.href} href={link.href} className="text-sm text-white/80 transition-colors hover:text-white">
                  {link.label}
                </a>
              ))}
            </nav>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setHeroPaused((paused) => !paused)}
                aria-label={heroPaused ? 'Play background photos' : 'Pause background photos'}
                title={heroPaused ? 'Play background photos' : 'Pause background photos'}
                className="grid size-10 shrink-0 place-items-center rounded-full border border-white/50 bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20"
              >
                {heroPaused ? <Play className="size-4" aria-hidden /> : <Pause className="size-4" aria-hidden />}
              </button>
              <ThemeToggle glass />
              <div className="hidden items-center gap-3 lg:flex">
                {!user ? <Link to="/login" className="btn btn-sm btn-glass">Sign in</Link> : null}
                <Link to={primaryHref} className="btn btn-sm btn-volt-flat">{primaryLabel}</Link>
              </div>
              <button type="button" className="grid size-11 place-items-center rounded-full border border-white/40 bg-white/10 backdrop-blur-md lg:hidden" onClick={() => setMenuOpen((v) => !v)} aria-expanded={menuOpen} aria-label="Menu">
                {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
              </button>
            </div>
          </div>
          {menuOpen ? (
            <div className="mx-5 rounded-[4px] bg-surface p-5 text-ink shadow-2xl lg:hidden">
              <nav className="flex flex-col" aria-label="Mobile">
                {navLinks.map((link) => (
                  <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className="headline border-b border-line py-4 text-3xl">
                    {link.label}
                  </a>
                ))}
              </nav>
              <div className={cx('mt-5 grid gap-3', !user && 'grid-cols-2')}>
                {!user ? <Link to="/login" className="btn btn-outline">Sign in</Link> : null}
                <Link to={primaryHref} className="btn btn-volt-flat">{primaryLabel}</Link>
              </div>
            </div>
          ) : null}
        </header>

        <div className="relative mx-auto flex w-full max-w-[1320px] flex-1 flex-col justify-end gap-12 px-5 pt-10 pb-12 sm:px-8 lg:flex-row lg:items-end lg:justify-between lg:pb-16">
          <div className="min-w-0 animate-rise">
            <h1 className="headline text-[40px] sm:text-[64px] md:text-[80px] xl:text-[112px]">
              Every rep,
              <br />
              on the rec<span className="text-volt">/</span>ord
            </h1>
            <p className="mt-6 max-w-sm text-[17px] leading-snug text-white/90">
              Point any webcam at your arm. FitMon scores every curl and tells you what to fix.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
              <Link to={primaryHref} className="btn btn-volt">{primaryLabel}</Link>
              <a href="#how" className="link-volt">How it works</a>
            </div>
          </div>

          <a href="#measures" className="group card hidden w-[260px] shrink-0 p-5 text-ink md:block">
            <div className="flex items-start justify-between">
              <p className="text-[15px] font-medium">Form in motion</p>
              <CornerArrow className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
            <CurlModel3D className="mt-3 w-full" />
          </a>
        </div>
      </section>

      {/* ── INTRO STATEMENT ── */}
      <section className="mx-auto max-w-[1320px] px-5 py-24 sm:px-8 lg:py-36">
        <p className="lede max-w-5xl text-[32px] sm:text-[52px]">
          FitMon watches your bicep curls through your webcam, scores every rep, and flags drift{' '}
          <span className="text-muted">before it turns into a sore elbow. No suit, no markers, no guesswork.</span>
        </p>
      </section>

      {/* ── WHAT IT MEASURES ── */}
      <section id="measures" className="mx-auto max-w-[1320px] scroll-mt-4 px-5 pb-24 sm:px-8 lg:pb-32">
        <p className="kicker">What it measures</p>
        <h2 className="headline mt-6 text-[44px] sm:text-[64px]">Six signals.<br />One score.</h2>

        <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <MeasureTile
            title="Posture"
            copy="Shoulder, elbow and wrist alignment, scored out of 100 on every frame."
            photo={{ src: '/landing/hero/arm-dumbbell.jpg', alt: 'Arm curling a dumbbell' }}
            className="sm:col-span-2 lg:col-span-4 lg:min-h-[400px]"
          />
          <MeasureTile
            title="Range of motion"
            copy="Flags half reps. You see the angle you reached, not just a count."
            tone="volt"
            className="lg:col-span-2"
          />
          <MeasureTile
            title="Elbow drift"
            copy="Notices when the elbow creeps forward to cheat the weight up."
            className="lg:col-span-2"
          />
          <MeasureTile
            title="Tempo"
            copy="Picks up when you rush the lowering phase as fatigue sets in."
            className="lg:col-span-2"
          />
          <MeasureTile
            title="Grip pressure"
            copy="With the FitMon band, load joins the picture to spot overload."
            photo={{ src: '/landing/hero/tracker.jpg', alt: 'Person checking a fitness tracker on their wrist' }}
            className="lg:col-span-2"
          />
          <MeasureTile
            title="Injury risk"
            copy="Rolls it all into one number you can actually act on."
            className="sm:col-span-2 lg:col-span-6 lg:min-h-0"
            aside={
              <div>
                <RiskScale score={62} />
                <p className="mt-4 text-xs text-muted">Sample score from a tiring set</p>
              </div>
            }
          />
        </div>
      </section>

      {/* ── READOUT ── */}
      <section className="bg-surface">
        <div className="mx-auto grid max-w-[1320px] gap-14 px-5 py-24 sm:px-8 lg:grid-cols-[1fr_1.2fr] lg:py-32">
          <div>
            <h2 className="headline text-[44px] sm:text-[64px]">
              Catch the
              <br />
              drift <span className="text-volt-deep">early</span>
            </h2>
            <p className="mt-8 max-w-md text-[17px] leading-relaxed text-ink-2">
              Form rarely breaks all at once. It slides a few degrees at a time as you tire. FitMon logs every rep so you can see
              exactly where the set started to go.
            </p>
          </div>

          <div className="self-end">
            <div className="flex items-baseline justify-between border-b border-line-strong pb-4 text-sm text-muted">
              <span>Sample readout, last four reps</span>
              <span>Bicep curl, 12 kg</span>
            </div>
            <table className="w-full text-left tabular-nums">
              <thead>
                <tr className="text-xs text-muted">
                  <th scope="col" className="py-4 pr-3 font-normal">Rep</th>
                  <th scope="col" className="py-4 pr-3 font-normal">Range</th>
                  <th scope="col" className="py-4 pr-3 font-normal">Form</th>
                  <th scope="col" className="hidden py-4 pr-3 font-normal sm:table-cell">Pressure</th>
                  <th scope="col" className="py-4 text-right font-normal">Flag</th>
                </tr>
              </thead>
              <tbody>
                {sampleRows.map((row) => (
                  <tr key={row.rep} className="border-t border-line">
                    <td className="stat py-5 pr-3 text-4xl">{row.rep}</td>
                    <td className="py-5 pr-3 text-ink-2">{row.range}</td>
                    <td className={cx('stat py-5 pr-3 text-4xl', row.form < 60 && 'text-bad')}>{row.form}</td>
                    <td className="hidden py-5 pr-3 text-ink-2 sm:table-cell">{row.pressure}</td>
                    <td className="py-5 text-right">
                      {row.flag ? <span className="tag tag-volt">{row.flag}</span> : <span className="text-sm text-muted">Clean</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" className="mx-auto max-w-[1320px] scroll-mt-4 px-5 py-24 sm:px-8 lg:py-32">
        <h2 className="headline text-[44px] sm:text-[64px]">One set.<br />One report.</h2>
        <p className="mt-6 max-w-[65ch] text-base leading-relaxed text-ink-2">
          No install and no wearables: it runs in your browser. The band adds pressure data if you have one.
        </p>
        <ol className="mt-16 grid gap-x-8 gap-y-10 border-t border-line-strong pt-10 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <li key={step.title}>
              <h3 className="lede text-[28px] sm:text-[32px]">{step.title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-2">{step.desc}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ── HARDWARE ── */}
      <section id="hardware" className="scroll-mt-4 bg-surface">
        <div className="mx-auto grid max-w-[1320px] items-center gap-12 px-5 py-24 sm:px-8 lg:grid-cols-[1fr_1.1fr] lg:gap-20 lg:py-32">
          <div>
            <p className="kicker">Optional hardware</p>
            <h2 className="headline mt-6 text-[44px] sm:text-[64px]">The FitMon<br />band</h2>
            <p className="mt-8 max-w-md text-[17px] leading-relaxed text-ink-2">
              A lightweight force-sensor band streams grip load over Wi-Fi. Combined with the camera, FitMon can tell a heavy rep
              from a bad one.
            </p>
            <dl className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-line pt-6">
              {[['Sensors', 'FSR array'], ['Link', 'ESP8266'], ['Build', 'Sweat-safe']].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xs text-muted">{k}</dt>
                  <dd className="mt-1.5 font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <img
            src="/landing/hero/wristband.jpg"
            alt="A band worn on an athlete's wrist"
            loading="lazy"
            className="aspect-[4/5] w-full rounded-[4px] object-cover object-[50%_45%] lg:aspect-[5/6]"
          />
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="mx-auto max-w-[1320px] px-5 py-24 sm:px-8 lg:py-32">
        <div className="relative isolate flex min-h-[480px] flex-col justify-end overflow-hidden rounded-[4px] bg-panel p-8 text-white sm:p-12">
          <img src="/landing/hero/bench-press.jpg" alt="" loading="lazy" className="absolute inset-0 -z-20 size-full object-cover" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-panel/85 via-panel/35 to-transparent" aria-hidden />
          <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
            <h2 className="headline text-[44px] sm:text-[80px] xl:text-[104px]">
              Train with
              <br />a second
              <br />pair of eyes
            </h2>
            <Link to={primaryHref} className="btn btn-lg btn-volt self-start lg:self-auto">{primaryLabel}</Link>
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" className="scroll-mt-4 bg-surface">
        <div className="mx-auto grid max-w-[1320px] gap-14 px-5 py-24 sm:px-8 lg:grid-cols-2 lg:py-32">
          <div>
            <h2 className="headline text-[44px] sm:text-[64px]">Let's talk</h2>
            <p className="mt-8 max-w-md text-[17px] leading-relaxed text-ink-2">
              Run a gym, clinic or coaching team? Tell us about your program and who you train. We reply within a day.
            </p>
          </div>

          <form onSubmit={handleContactSubmit} noValidate>
            <div className="grid gap-x-8 gap-y-8 sm:grid-cols-2">
              <Field label="Name" htmlFor="c-name">
                <input id="c-name" className="field" name="name" value={contactForm.name} onChange={handleContactChange} required autoComplete="name" />
              </Field>
              <Field label="Email" htmlFor="c-email">
                <input id="c-email" className="field" type="email" name="email" value={contactForm.email} onChange={handleContactChange} required autoComplete="email" />
              </Field>
              <Field label="Organisation (optional)" htmlFor="c-org" className="sm:col-span-2">
                <input id="c-org" className="field" name="organization" value={contactForm.organization} onChange={handleContactChange} autoComplete="organization" />
              </Field>
              <Field label="Message" htmlFor="c-msg" className="sm:col-span-2">
                <textarea id="c-msg" className="field" rows="4" name="message" value={contactForm.message} onChange={handleContactChange} required />
              </Field>
            </div>
            {contactStatus ? (
              <p role="status" aria-live="polite" className={cx('mt-6 text-sm font-medium', contactStatus.type === 'success' ? 'text-good' : 'text-bad')}>
                {contactStatus.message}
              </p>
            ) : null}
            <button type="submit" className="btn btn-lg btn-dark mt-10" disabled={isSubmitting}>
              {isSubmitting ? 'Sending…' : 'Send message'}
            </button>
          </form>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-line bg-canvas">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
          <div className="flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between">
            <nav className="flex flex-wrap gap-x-8 gap-y-2 text-sm" aria-label="Footer">
              {navLinks.map((link) => (
                <a key={link.href} href={link.href} className="text-ink-2 hover:text-ink">{link.label}</a>
              ))}
            </nav>
            <p className="text-sm text-muted">© {new Date().getFullYear()} FitMon. Training guidance, not medical advice.</p>
          </div>
          <p className="headline flex items-center gap-[0.12em] border-t border-line pt-8 pb-[0.12em] text-[16vw] leading-[0.8] lg:text-[225px]" aria-hidden>
            <LogoMark className="size-[0.95em]" />
            <LogoWordmark />
          </p>
        </div>
      </footer>
    </div>
  );
}

const tileTones = {
  plain: { tile: 'bg-surface text-ink', copy: 'text-ink-2' },
  volt: { tile: 'bg-volt text-on-volt', copy: 'text-on-volt/75' },
  photo: { tile: 'bg-panel text-white', copy: 'text-white/80' },
};

/** One cell of the "what it measures" grid. A photo tile keeps white type over a darkened image. */
function MeasureTile({ title, copy, tone = 'plain', photo, aside, className = '' }) {
  const style = tileTones[photo ? 'photo' : tone];
  return (
    <div className={cx('relative isolate flex min-h-[260px] flex-col justify-end overflow-hidden rounded-[4px] p-7', style.tile, className)}>
      {photo ? (
        <>
          <img src={photo.src} alt={photo.alt} loading="lazy" className="absolute inset-0 -z-20 size-full object-cover" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-panel/85 via-panel/25 to-transparent" aria-hidden />
        </>
      ) : null}
      <div className={cx(aside && 'grid gap-8 lg:grid-cols-2 lg:items-end')}>
        <div>
          <h3 className="lede text-[28px] sm:text-[36px]">{title}</h3>
          <p className={cx('mt-3 max-w-sm text-[15px] leading-relaxed', style.copy)}>{copy}</p>
        </div>
        {aside}
      </div>
    </div>
  );
}

function Field({ label, htmlFor, className = '', children }) {
  return (
    <div className={cx('flex flex-col gap-2', className)}>
      <label htmlFor={htmlFor} className="text-sm text-muted">{label}</label>
      {children}
    </div>
  );
}
