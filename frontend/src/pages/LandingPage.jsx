import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Menu, X } from 'lucide-react';
import { API_BASE_URL } from '../services/apiClient';
import useAuthStore from '../store/useAuthStore';
import { CurlDiagram, Logo } from '../components/ui';
import { cx } from '../utils/format';

const specs = [
  { value: '92%', label: 'Form clarity' },
  { value: '1.4k', label: 'Sessions analysed' },
  { value: '120ms', label: 'Signal refresh' },
  { value: '<200ms', label: 'On-device latency' },
];

const measures = [
  { title: 'Posture', copy: 'Shoulder, elbow and wrist alignment, scored out of 100 on every frame.' },
  { title: 'Range of motion', copy: 'Flags half reps. You get the angle you reached, not just a count.' },
  { title: 'Elbow drift', copy: 'Notices when the elbow creeps forward to cheat the weight up.' },
  { title: 'Tempo', copy: 'Picks up when you rush the lowering phase as fatigue sets in.' },
  { title: 'Grip pressure', copy: 'With the FitMon band, pressure joins the picture to spot overload.' },
  { title: 'Injury risk', copy: 'Rolls it all into one number you can actually act on.' },
];

const sampleRows = [
  { rep: 9, range: '36–154°', form: 88, pressure: 52, flag: null },
  { rep: 10, range: '37–152°', form: 84, pressure: 55, flag: null },
  { rep: 11, range: '44–149°', form: 61, pressure: 58, flag: 'Elbow forward' },
  { rep: 12, range: '51–141°', form: 47, pressure: 81, flag: 'Pressure spike' },
];

const steps = [
  { title: 'Prop up your phone or laptop', desc: 'Side-on, arm in frame. No markers, no suit.' },
  { title: 'Press start and curl', desc: 'Cues appear the moment your form slips.' },
  { title: 'End the set', desc: 'FitMon writes a report with a grade and what to fix.' },
  { title: 'Come back stronger', desc: 'History shows whether your form is trending up.' },
];

const navLinks = [
  { href: '#measures', label: 'What it measures' },
  { href: '#how', label: 'How it works' },
  { href: '#hardware', label: 'Hardware' },
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
    <div className="min-h-screen overflow-x-hidden bg-paper" id="top">
      {/* ── MASTHEAD ── */}
      <header className="sticky top-0 z-50 border-b border-ink bg-paper/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
          <Logo />
          <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="text-[13px] font-semibold tracking-[0.04em] text-ink-2 uppercase hover:text-ink">
                {link.label}
              </a>
            ))}
          </nav>
          <div className="hidden items-center gap-5 lg:flex">
            {!user ? <Link to="/login" className="btn-text">Sign in</Link> : null}
            <Link to={primaryHref} className="btn btn-ink btn-sm">
              {user ? 'Open app' : 'Start training'}
            </Link>
          </div>
          <button type="button" className="grid size-10 place-items-center lg:hidden" onClick={() => setMenuOpen((v) => !v)} aria-expanded={menuOpen} aria-label="Menu">
            {menuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
        {menuOpen ? (
          <div className="border-t border-ink bg-paper px-4 pb-6 lg:hidden">
            <nav className="flex flex-col" aria-label="Mobile">
              {navLinks.map((link) => (
                <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className="display border-b border-rule py-4 text-3xl">
                  {link.label}
                </a>
              ))}
            </nav>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <Link to="/login" className="btn btn-line">Sign in</Link>
              <Link to={primaryHref} className="btn btn-ink">Start training</Link>
            </div>
          </div>
        ) : null}
      </header>

      {/* ── HERO ── */}
      <section className="mx-auto grid max-w-7xl gap-12 px-4 pt-12 pb-16 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:px-8 lg:pt-20 lg:pb-24">
        <div className="animate-rise lg:col-span-7">
          <p className="label text-ink">Form coaching from your webcam</p>
          <h1 className="display mt-6 text-[72px] sm:text-[112px] xl:text-[144px]">
            Every rep
            <br />
            on the
            <br />
            record<span className="text-signal">.</span>
          </h1>
          <p className="mt-8 max-w-lg text-lg leading-relaxed text-ink-2">
            FitMon watches your bicep curls through the camera you already have, scores your posture on every rep, and tells you
            what to fix before it turns into a sore elbow.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-5">
            <Link to={primaryHref} className="btn btn-signal btn-lg">
              Try a session <ArrowRight className="size-4" />
            </Link>
            <a href="#how" className="btn-text">See how it works</a>
          </div>
        </div>

        <figure className="lg:col-span-5 lg:pt-10">
          <div className="graph-paper border border-ink bg-sheet p-6 sm:p-8">
            <CurlDiagram className="mx-auto w-full max-w-[420px]" />
          </div>
          <figcaption className="mt-3 flex justify-between gap-4 text-xs text-muted">
            <span><span className="font-semibold text-ink">Fig. 1</span> What FitMon reads on every curl.</span>
            <span className="tabular-nums">Rep 11 of 12</span>
          </figcaption>
        </figure>
      </section>

      {/* ── SPEC STRIP ── */}
      <section className="border-y border-ink" aria-label="Specs">
        <dl className="mx-auto grid max-w-7xl grid-cols-2 px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
          {specs.map((spec, i) => (
            <div key={spec.label} className={cx('py-6', i % 2 === 1 && 'border-l border-rule pl-5', i >= 2 && 'border-t border-rule lg:border-t-0', i > 0 && 'lg:border-l lg:pl-8')}>
              <dd className="figure text-5xl sm:text-6xl">{spec.value}</dd>
              <dt className="label mt-2">{spec.label}</dt>
            </div>
          ))}
        </dl>
      </section>

      {/* ── WHAT IT MEASURES ── */}
      <section id="measures" className="mx-auto grid max-w-7xl scroll-mt-16 gap-12 px-4 py-20 sm:px-6 lg:grid-cols-12 lg:px-8 lg:py-28">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <p className="label text-ink">What it measures</p>
            <h2 className="display mt-5 text-[52px] sm:text-[64px]">Six things it watches so you don't have to.</h2>
          </div>
        </div>
        <ol className="grid gap-x-10 sm:grid-cols-2 lg:col-span-8">
          {measures.map((item, i) => (
            <li key={item.title} className="border-t border-ink py-6">
              <div className="flex items-baseline gap-4">
                <span className="figure text-xl text-signal">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="text-xl font-bold">{item.title}</h3>
              </div>
              <p className="mt-2 pl-10 text-[15px] leading-relaxed text-ink-2">{item.copy}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ── READOUT (dark) ── */}
      <section className="bg-ink text-paper">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-12 lg:px-8 lg:py-28">
          <div className="lg:col-span-5">
            <p className="text-[11px] font-semibold tracking-[0.08em] text-paper/60 uppercase">Why it matters</p>
            <h2 className="display mt-5 text-[52px] sm:text-[64px]">
              Catch the drift <span className="text-signal">before</span> it hurts.
            </h2>
            <p className="mt-6 max-w-md text-[17px] leading-relaxed text-paper/75">
              Form rarely breaks all at once. It slides a few degrees at a time as you tire. FitMon logs every rep so you can see
              exactly where the set started to go.
            </p>
            <Link to={primaryHref} className="btn btn-signal mt-8">Log your first set</Link>
          </div>

          <div className="lg:col-span-7">
            <div className="flex items-baseline justify-between border-b border-paper/30 pb-3">
              <p className="text-[11px] font-semibold tracking-[0.08em] text-paper/60 uppercase">Sample readout · last four reps</p>
              <p className="text-[11px] font-semibold tracking-[0.08em] text-paper/60 uppercase">Bicep curl · 12 kg</p>
            </div>
            <table className="w-full text-left tabular-nums">
              <thead>
                <tr className="border-b border-paper/15 text-[11px] tracking-[0.08em] text-paper/60 uppercase">
                  <th scope="col" className="py-3 pr-3 font-semibold">Rep</th>
                  <th scope="col" className="py-3 pr-3 font-semibold">Range</th>
                  <th scope="col" className="py-3 pr-3 font-semibold">Form</th>
                  <th scope="col" className="hidden py-3 pr-3 font-semibold sm:table-cell">Pressure</th>
                  <th scope="col" className="py-3 font-semibold">Flag</th>
                </tr>
              </thead>
              <tbody>
                {sampleRows.map((row) => (
                  <tr key={row.rep} className="border-b border-paper/15">
                    <td className="figure py-4 pr-3 text-3xl">{row.rep}</td>
                    <td className="py-4 pr-3 text-paper/80">{row.range}</td>
                    <td className={cx('figure py-4 pr-3 text-3xl', row.form < 60 ? 'text-signal' : '')}>{row.form}</td>
                    <td className="hidden py-4 pr-3 text-paper/80 sm:table-cell">{row.pressure}</td>
                    <td className="py-4">
                      {row.flag ? (
                        <span className="tag border-signal text-signal">{row.flag}</span>
                      ) : (
                        <span className="text-xs font-semibold tracking-[0.06em] text-paper/50 uppercase">Clean</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" className="mx-auto max-w-7xl scroll-mt-16 px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="flex flex-col gap-4 border-b-2 border-ink pb-6 md:flex-row md:items-end md:justify-between">
          <h2 className="display text-[52px] sm:text-[64px]">Setup to report in one set.</h2>
          <p className="max-w-sm text-[15px] text-ink-2">No wearables required. The band adds pressure data if you have one.</p>
        </div>
        <ol className="grid sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <li key={step.title} className={cx('border-b border-rule py-8 sm:pr-8', i > 0 && 'lg:border-l lg:pl-8', i % 2 === 1 && 'sm:border-l sm:pl-8 lg:pl-8')}>
              <span className="figure text-[80px] text-ink/15">{i + 1}</span>
              <h3 className="mt-2 text-lg font-bold">{step.title}</h3>
              <p className="mt-2 text-[15px] text-ink-2">{step.desc}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ── HARDWARE ── */}
      <section id="hardware" className="scroll-mt-16 border-y border-ink bg-sheet">
        <div className="mx-auto grid max-w-7xl lg:grid-cols-2">
          <figure className="relative min-h-[360px] border-ink lg:border-r">
            <img src="/landing/fitness-band.png" alt="The FitMon pressure band worn on an athlete's wrist" loading="lazy" className="absolute inset-0 size-full object-cover" />
            <figcaption className="absolute bottom-0 left-0 bg-ink px-4 py-2 text-xs text-paper">
              <span className="font-semibold">Fig. 2</span> FSR band on the working wrist.
            </figcaption>
          </figure>
          <div className="px-4 py-16 sm:px-10 lg:py-24">
            <p className="label text-ink">Optional hardware</p>
            <h2 className="display mt-5 text-[52px] sm:text-[64px]">A band you forget you're wearing.</h2>
            <p className="mt-6 max-w-md text-[17px] leading-relaxed text-ink-2">
              A lightweight force-sensor band streams grip load over Wi-Fi. Combined with the camera, FitMon can tell a heavy rep
              from a bad one.
            </p>
            <dl className="mt-10 border-t border-ink">
              {[['Sensors', 'FSR array'], ['Connectivity', 'ESP8266 · Wi-Fi'], ['Build', 'Flexible, sweat-safe']].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 border-b border-rule py-3 text-[15px]">
                  <dt className="text-muted">{k}</dt>
                  <dd className="font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-signal">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-16 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-8 lg:py-20">
          <h2 className="display max-w-3xl text-[60px] sm:text-[88px]">Train with a second pair of eyes.</h2>
          <div className="flex flex-wrap gap-3">
            <Link to={primaryHref} className="btn btn-lg bg-ink text-paper hover:bg-paper hover:text-ink">
              Start training <ArrowRight className="size-4" />
            </Link>
            <a href="#contact" className="btn btn-lg border border-ink text-ink hover:bg-ink hover:text-paper">Book a demo</a>
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" className="mx-auto grid max-w-7xl scroll-mt-16 gap-12 px-4 py-20 sm:px-6 lg:grid-cols-12 lg:px-8 lg:py-28">
        <div className="lg:col-span-5">
          <p className="label text-ink">For gyms, clinics & teams</p>
          <h2 className="display mt-5 text-[52px] sm:text-[64px]">Run FitMon with your athletes.</h2>
          <p className="mt-6 max-w-md text-[17px] leading-relaxed text-ink-2">
            Tell us about your program and who you train. We reply within a day, usually sooner.
          </p>
        </div>

        <form className="lg:col-span-7" onSubmit={handleContactSubmit} noValidate>
          <div className="grid gap-x-6 gap-y-5 border-t-2 border-ink pt-6 sm:grid-cols-2">
            <Field label="Name" htmlFor="c-name">
              <input id="c-name" className="field" name="name" value={contactForm.name} onChange={handleContactChange} required autoComplete="name" />
            </Field>
            <Field label="Email" htmlFor="c-email">
              <input id="c-email" className="field" type="email" name="email" value={contactForm.email} onChange={handleContactChange} required autoComplete="email" />
            </Field>
            <Field label="Organisation" htmlFor="c-org" optional className="sm:col-span-2">
              <input id="c-org" className="field" name="organization" placeholder="Gym, clinic, team…" value={contactForm.organization} onChange={handleContactChange} autoComplete="organization" />
            </Field>
            <Field label="Message" htmlFor="c-msg" className="sm:col-span-2">
              <textarea id="c-msg" className="field" rows="5" name="message" value={contactForm.message} onChange={handleContactChange} required />
            </Field>
          </div>
          {contactStatus ? (
            <p role="status" aria-live="polite" className={cx('mt-5 border-l-4 bg-sheet px-4 py-3 text-sm font-medium', contactStatus.type === 'success' ? 'border-good text-good' : 'border-bad text-bad')}>
              {contactStatus.message}
            </p>
          ) : null}
          <button type="submit" className="btn btn-ink btn-lg mt-6" disabled={isSubmitting}>
            {isSubmitting ? 'Sending…' : 'Send message'}
          </button>
        </form>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-ink">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="display -mb-[0.12em] pt-10 text-[22vw] leading-[0.8] lg:text-[240px]" aria-hidden>
            Fitmon<span className="text-signal">.</span>
          </p>
          <div className="flex flex-col gap-4 border-t border-rule py-6 text-sm sm:flex-row sm:items-center sm:justify-between">
            <nav className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Footer">
              {navLinks.map((link) => (
                <a key={link.href} href={link.href} className="text-ink-2 hover:text-ink">{link.label}</a>
              ))}
            </nav>
            <p className="text-muted">© {new Date().getFullYear()} FitMon. Training guidance, not medical advice.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Field({ label, htmlFor, optional, className = '', children }) {
  return (
    <div className={cx('flex flex-col gap-2', className)}>
      <label htmlFor={htmlFor} className="label text-ink">
        {label}
        {optional ? <span className="ml-1.5 font-normal tracking-normal text-muted normal-case">optional</span> : null}
      </label>
      {children}
    </div>
  );
}
