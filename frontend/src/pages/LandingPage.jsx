import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { API_BASE_URL } from '../services/apiClient';
import useAuthStore from '../store/useAuthStore';
import { CornerArrow, CurlDiagram, Logo } from '../components/ui';
import { cx } from '../utils/format';

const specs = [
  { value: '92%', caption: 'Form clarity' },
  { value: '1.4k', caption: 'Sessions analysed' },
  { value: '120ms', caption: 'Signal refresh' },
  { value: '<200ms', caption: 'On-device feedback' },
];

const measures = [
  { title: 'Posture', copy: 'Shoulder, elbow and wrist alignment, scored out of 100 on every frame.' },
  { title: 'Range of motion', copy: 'Flags half reps. You see the angle you reached, not just a count.' },
  { title: 'Elbow drift', copy: 'Notices when the elbow creeps forward to cheat the weight up.' },
  { title: 'Tempo', copy: 'Picks up when you rush the lowering phase as fatigue sets in.' },
  { title: 'Grip pressure', copy: 'With the FitMon band, load joins the picture to spot overload.' },
  { title: 'Injury risk', copy: 'Rolls it all into one number you can actually act on.' },
];

const sampleRows = [
  { rep: 9, range: '36–154°', form: 88, pressure: 52, flag: null },
  { rep: 10, range: '37–152°', form: 84, pressure: 55, flag: null },
  { rep: 11, range: '44–149°', form: 61, pressure: 58, flag: 'Elbow forward' },
  { rep: 12, range: '51–141°', form: 47, pressure: 81, flag: 'Pressure spike' },
];

const steps = [
  { title: 'Set up', desc: 'Prop up your phone or laptop side-on, arm in frame. No markers, no suit.' },
  { title: 'Curl', desc: 'Press start and train. Cues appear the moment your form slips.' },
  { title: 'Review', desc: 'End the set and FitMon writes a report with a grade and what to fix.' },
  { title: 'Improve', desc: 'History shows whether your form is trending up, session by session.' },
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactStatus, setContactStatus] = useState(null);
  const [contactForm, setContactForm] = useState({ name: '', email: '', organization: '', message: '' });

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
      <section className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-ink text-white">
        <img
          src="/landing/hero.jpg"
          alt="Athlete wearing the FitMon band on their wrist"
          className="absolute inset-0 -z-20 size-full object-cover object-[60%_35%]"
          fetchPriority="high"
        />
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
            <div className="hidden items-center gap-3 lg:flex">
              {!user ? <Link to="/login" className="btn btn-sm btn-glass">Sign in</Link> : null}
              <Link to={primaryHref} className="btn btn-sm btn-volt-flat">{user ? 'Open app' : 'Get started'}</Link>
            </div>
            <button type="button" className="grid size-11 place-items-center rounded-full border border-white/40 bg-white/10 backdrop-blur-md lg:hidden" onClick={() => setMenuOpen((v) => !v)} aria-expanded={menuOpen} aria-label="Menu">
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
          {menuOpen ? (
            <div className="mx-5 rounded-[4px] bg-white p-5 text-ink shadow-2xl lg:hidden">
              <nav className="flex flex-col" aria-label="Mobile">
                {navLinks.map((link) => (
                  <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className="headline border-b border-line py-4 text-3xl">
                    {link.label}
                  </a>
                ))}
              </nav>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <Link to="/login" className="btn btn-outline">Sign in</Link>
                <Link to={primaryHref} className="btn btn-volt-flat">Get started</Link>
              </div>
            </div>
          ) : null}
        </header>

        <div className="relative mx-auto grid w-full max-w-[1320px] flex-1 grid-cols-1 px-5 pt-6 pb-8 sm:px-8 lg:grid-cols-[200px_1fr_260px] lg:gap-6">
          <p className="hidden text-sm text-white/75 lg:block">Built for the gym floor</p>

          <div className="animate-rise">
            <h1 className="headline text-[64px] sm:text-[112px] xl:text-[150px]">
              Every rep
              <br />
              on the
              <br />
              rec<span className="text-volt">/</span>ord
            </h1>
            <p className="mt-6 max-w-[260px] text-[15px] leading-snug text-white/90">
              Form coaching from the camera you already have.
            </p>
            <Link to={primaryHref} className="btn btn-volt mt-10">
              Start a session
            </Link>
          </div>

          <div className="mt-12 flex flex-col justify-between gap-8 lg:mt-0">
            <div className="hidden text-right lg:block">
              <p className="text-sm text-white/75">Works with</p>
              <p className="mt-2 text-lg font-medium tracking-tight">Any webcam · FSR band</p>
            </div>

            <a href="#measures" className="group card relative block w-full max-w-[260px] self-end p-5 text-ink lg:self-auto">
              <div className="flex items-start justify-between">
                <p className="text-[15px] font-medium">Form in motion</p>
                <CornerArrow className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
              <CurlDiagram className="mt-3 w-full" />
            </a>
          </div>
        </div>

        {/* Hero footer */}
        <div className="relative mx-auto grid w-full max-w-[1320px] gap-8 px-5 pb-10 sm:px-8 md:grid-cols-[1fr_auto] md:items-end lg:pl-[calc(200px+1.5rem+2rem)]">
          <div>
            <p className="lede max-w-xl text-[28px] sm:text-[38px]">Scores your posture on every rep, and tells you what to fix.</p>
            <a href="#measures" className="link-volt mt-5">Learn more</a>
          </div>
          <div className="flex items-stretch gap-8">
            <span className="hidden w-px bg-white/40 md:block" aria-hidden />
            <div className="pr-4 text-center">
              <p className="stat text-6xl">&lt;200ms</p>
              <p className="mt-2 text-sm text-white/85">On-device feedback</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── INTRO STATEMENT ── */}
      <section className="mx-auto max-w-[1320px] px-5 py-24 sm:px-8 lg:py-36">
        <p className="kicker">About FitMon</p>
        <p className="lede mt-8 max-w-5xl text-[34px] sm:text-[52px]">
          FitMon watches your bicep curls through your webcam, scores every rep, and flags drift{' '}
          <span className="text-muted">before it turns into a sore elbow. No suit, no markers, no guesswork.</span>
        </p>
        <dl className="mt-20 grid grid-cols-2 gap-y-10 border-t border-line pt-10 lg:grid-cols-4">
          {specs.map((spec, i) => (
            <div key={spec.caption} className={cx('pr-6', i > 0 && 'lg:border-l lg:border-line lg:pl-8', i % 2 === 1 && 'border-l border-line pl-6')}>
              <dd className="stat text-6xl sm:text-7xl">{spec.value}</dd>
              <dt className="mt-3 text-sm text-ink-2">{spec.caption}</dt>
            </div>
          ))}
        </dl>
      </section>

      {/* ── WHAT IT MEASURES ── */}
      <section id="measures" className="scroll-mt-4 bg-surface">
        <div className="mx-auto grid max-w-[1320px] gap-14 px-5 py-24 sm:px-8 lg:grid-cols-[1fr_1.15fr] lg:py-32">
          <div className="relative min-h-[460px] overflow-hidden rounded-[4px] bg-ink lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:max-h-[720px]">
            <img src="/landing/band-closeup.jpg" alt="Close-up of the FitMon band" loading="lazy" className="absolute inset-0 size-full object-cover" />
            <div className="photo-scrim absolute inset-0" aria-hidden />
            <div className="absolute inset-x-0 bottom-0 p-8 text-white">
              <p className="text-sm text-white/80">What it measures</p>
              <p className="headline mt-4 text-5xl sm:text-6xl">Six signals.<br />One score.</p>
            </div>
          </div>

          <ol className="flex flex-col">
            {measures.map((item, i) => (
              <li key={item.title} className="grid grid-cols-[48px_1fr] gap-4 border-b border-line py-8 first:pt-0">
                <span className="pt-2 text-sm text-muted tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h3 className="lede text-[32px] sm:text-[40px]">{item.title}</h3>
                  <p className="mt-3 max-w-md text-base leading-relaxed text-ink-2">{item.copy}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── READOUT (dark) ── */}
      <section className="bg-ink text-white">
        <div className="mx-auto grid max-w-[1320px] gap-14 px-5 py-24 sm:px-8 lg:grid-cols-[1fr_1.2fr] lg:py-32">
          <div>
            <p className="text-sm text-white/65">Why it matters</p>
            <h2 className="headline mt-6 text-[52px] sm:text-[76px]">
              Catch the
              <br />
              drift <span className="text-volt">early</span>
            </h2>
            <p className="mt-8 max-w-md text-[17px] leading-relaxed text-white/75">
              Form rarely breaks all at once. It slides a few degrees at a time as you tire. FitMon logs every rep so you can see
              exactly where the set started to go.
            </p>
            <Link to={primaryHref} className="btn btn-volt mt-10 outline-white/40">Log your first set</Link>
          </div>

          <div className="self-end">
            <div className="flex items-baseline justify-between border-b border-white/20 pb-4 text-sm text-white/65">
              <span>Sample readout · last four reps</span>
              <span>Bicep curl · 12 kg</span>
            </div>
            <table className="w-full text-left tabular-nums">
              <thead>
                <tr className="text-xs text-white/55">
                  <th scope="col" className="py-4 pr-3 font-normal">Rep</th>
                  <th scope="col" className="py-4 pr-3 font-normal">Range</th>
                  <th scope="col" className="py-4 pr-3 font-normal">Form</th>
                  <th scope="col" className="hidden py-4 pr-3 font-normal sm:table-cell">Pressure</th>
                  <th scope="col" className="py-4 text-right font-normal">Flag</th>
                </tr>
              </thead>
              <tbody>
                {sampleRows.map((row) => (
                  <tr key={row.rep} className="border-t border-white/12">
                    <td className="stat py-5 pr-3 text-4xl">{row.rep}</td>
                    <td className="py-5 pr-3 text-white/75">{row.range}</td>
                    <td className={cx('stat py-5 pr-3 text-4xl', row.form < 60 && 'text-volt')}>{row.form}</td>
                    <td className="hidden py-5 pr-3 text-white/75 sm:table-cell">{row.pressure}</td>
                    <td className="py-5 text-right">
                      {row.flag ? <span className="tag tag-volt">{row.flag}</span> : <span className="text-sm text-white/45">Clean</span>}
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
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="kicker">How it works</p>
            <h2 className="headline mt-6 text-[52px] sm:text-[76px]">One set.<br />One report.</h2>
          </div>
          <p className="max-w-sm text-base text-ink-2">No wearables required. The band adds pressure data if you have one.</p>
        </div>
        <ol className="mt-16 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <li key={step.title} className="card flex min-h-[260px] flex-col justify-between p-7">
              <span className="stat text-[72px] text-ink/15">0{i + 1}</span>
              <div>
                <h3 className="text-xl font-medium tracking-tight">{step.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-2">{step.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ── HARDWARE ── */}
      <section id="hardware" className="relative isolate scroll-mt-4 overflow-hidden bg-ink text-white">
        <img src="/landing/hero.jpg" alt="" loading="lazy" className="absolute inset-0 -z-20 size-full object-cover object-[70%_40%]" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink/85 via-ink/50 to-transparent" aria-hidden />
        <div className="mx-auto grid max-w-[1320px] gap-10 px-5 py-28 sm:px-8 lg:grid-cols-2 lg:py-40">
          <div>
            <p className="text-sm text-white/70">Optional hardware</p>
            <h2 className="headline mt-6 text-[52px] sm:text-[76px]">The FitMon<br />band</h2>
            <p className="mt-8 max-w-md text-[17px] leading-relaxed text-white/80">
              A lightweight force-sensor band streams grip load over Wi-Fi. Combined with the camera, FitMon can tell a heavy rep
              from a bad one.
            </p>
            <dl className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-white/25 pt-6">
              {[['Sensors', 'FSR array'], ['Link', 'ESP8266'], ['Build', 'Sweat-safe']].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xs text-white/60">{k}</dt>
                  <dd className="mt-1.5 font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="mx-auto max-w-[1320px] px-5 py-24 sm:px-8 lg:py-36">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <h2 className="headline text-[56px] sm:text-[96px] xl:text-[120px]">
            Train with
            <br />a second
            <br />pair of eyes
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link to={primaryHref} className="btn btn-lg btn-volt-flat">Start training</Link>
            <a href="#contact" className="btn btn-lg btn-outline">Book a demo</a>
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" className="scroll-mt-4 bg-surface">
        <div className="mx-auto grid max-w-[1320px] gap-14 px-5 py-24 sm:px-8 lg:grid-cols-2 lg:py-32">
          <div>
            <p className="kicker">For gyms, clinics &amp; teams</p>
            <h2 className="headline mt-6 text-[52px] sm:text-[76px]">Let's talk</h2>
            <p className="mt-8 max-w-md text-[17px] leading-relaxed text-ink-2">
              Tell us about your program and who you train. We reply within a day, usually sooner.
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
      <footer className="bg-ink text-white">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
          <div className="flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between">
            <nav className="flex flex-wrap gap-x-8 gap-y-2 text-sm" aria-label="Footer">
              {navLinks.map((link) => (
                <a key={link.href} href={link.href} className="text-white/70 hover:text-white">{link.label}</a>
              ))}
            </nav>
            <p className="text-sm text-white/55">© {new Date().getFullYear()} FitMon. Training guidance, not medical advice.</p>
          </div>
          <p className="headline -mb-[0.1em] border-t border-white/15 pt-8 text-[24vw] leading-[0.8] lg:text-[300px]" aria-hidden>
            Fit<span className="text-volt">/</span>Mon
          </p>
        </div>
      </footer>
    </div>
  );
}

function Field({ label, htmlFor, className = '', children }) {
  return (
    <div className={cx('flex flex-col', className)}>
      <label htmlFor={htmlFor} className="text-sm text-muted">{label}</label>
      {children}
    </div>
  );
}
