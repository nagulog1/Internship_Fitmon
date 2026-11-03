import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRightIcon,
  CheckIcon,
  CrosshairIcon,
  GaugeIcon,
  LockSimpleIcon,
  PersonSimpleIcon,
  PlusIcon,
  RulerIcon,
  TimerIcon,
  WebcamIcon,
} from '@phosphor-icons/react';
import { API_BASE_URL } from '../services/apiClient';
import useAuthStore from '../store/useAuthStore';
import CurlModel3D from '../components/CurlModel3D';
import { Logo, LogoMark, LogoWordmark, RiskScale, ThemeToggle } from '../components/ui';
import { cx } from '../utils/format';

const navLinks = [
  { id: 'checks', label: 'What it checks' },
  { id: 'how', label: 'How it works' },
  { id: 'band', label: 'Band' },
  { id: 'faq', label: 'FAQ' },
];

const benefits = [
  {
    icon: PersonSimpleIcon,
    title: 'Every rep scored',
    copy: 'Shoulder, elbow and wrist alignment, rated out of 100 on every frame.',
  },
  {
    icon: RulerIcon,
    title: 'No more half reps',
    copy: 'See the angle you actually reached, like 38 to 152°, not just a count.',
  },
  {
    icon: CrosshairIcon,
    title: 'Elbow stays pinned',
    copy: 'A cue appears the moment your elbow creeps forward to cheat the weight up.',
  },
  {
    icon: TimerIcon,
    title: 'Control on the way down',
    copy: 'Tempo tracking spots when you start rushing the lowering as you tire.',
  },
];

// One thought per line, so the breaks land where the sentence does.
const taglineLines = ['Form rarely breaks at once.', 'It slips a degree at a time', 'as you tire.', 'FitMon flags the rep it starts.'];

const sampleRows = [
  { rep: 9, range: '36 to 154°', form: 88, pressure: 52, flag: null },
  { rep: 10, range: '37 to 152°', form: 84, pressure: 55, flag: null },
  { rep: 11, range: '44 to 149°', form: 61, pressure: 58, flag: 'Elbow forward' },
  { rep: 12, range: '51 to 141°', form: 47, pressure: 81, flag: 'Pressure spike' },
];

// {{testimonial}}: add real quotes from people who have trained with FitMon as
// { quote, name, detail }. The block stays hidden while this list is empty.
const testimonials = [];

const steps = [
  { title: 'Set up', copy: 'Prop your phone or laptop to your side with your whole arm in frame. No markers, no suit.' },
  { title: 'Curl', copy: 'Press start and train. Cues show up the moment your form slips.' },
  { title: 'Review', copy: 'End the set for a grade, a rep by rep chart and a PDF. History shows if your form is trending up.' },
];

const faqs = [
  {
    q: 'Does my video get uploaded anywhere?',
    a: 'No. Pose detection runs in your browser, so the video stays on your computer. FitMon only sends the joint positions and scores it works out from each frame, which is what your report is built from.',
  },
  {
    q: 'What do I need to start?',
    a: 'A webcam, an up to date browser and a Google account to sign in. A phone or laptop propped up to your side works.',
  },
  {
    q: 'Which exercises does FitMon track?',
    a: 'Bicep curls. Every check on this page, from elbow drift to tempo, is tuned to the curl.',
  },
  {
    q: 'Do I need the FitMon band?',
    a: 'No. The camera alone scores posture, range, elbow drift and tempo. The band adds grip pressure so FitMon can tell a heavy rep from a sloppy one.',
  },
  {
    q: 'Where should the camera go?',
    a: 'Side on, with your shoulder, elbow and wrist in frame for the whole set. You do not need markers or special clothing.',
  },
  {
    q: 'What is in the report?',
    a: 'A grade for the set, a rep by rep chart of form and range, and a PDF you can download. When coaching notes are on, you also get a short summary of what to fix next time.',
  },
  {
    q: 'Can I see whether my form is improving?',
    a: 'Yes. Every report is saved to your history, so you can compare sessions and see which way your form is heading.',
  },
  {
    q: 'Is FitMon medical advice?',
    a: 'No. FitMon gives training guidance. If something hurts, stop and talk to a physiotherapist or doctor.',
  },
];

const reassurances = ['No install', 'No payment details', 'Your video stays on your computer'];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const emptyContact = { name: '', email: '', organization: '', message: '' };

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function LandingPage() {
  const user = useAuthStore((state) => state.user);
  const primaryHref = user ? '/dashboard' : '/login';
  // One label for the primary action everywhere on the page.
  const primaryLabel = user ? 'Open your dashboard' : 'Start your first set';

  return (
    <div className="min-h-screen overflow-x-clip bg-canvas text-ink" id="top">
      <a href="#main" className="button button-primary sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50">
        Skip to content
      </a>

      <SiteNav primaryHref={primaryHref} primaryLabel={primaryLabel} />

      <main id="main">
        {/* ── HERO ── */}
        <section className="mx-auto grid max-w-[1320px] items-center gap-12 px-4 pt-24 pb-16 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:pt-40 lg:pb-24">
          <div className="min-w-0 animate-rise">
            <p className="caption-1 inline-flex items-center gap-2 text-ink-2">
              <span className="size-2 rounded-full bg-volt" aria-hidden />
              Every rep, on the record
            </p>
            <h1 className="heading-3 sm:heading-2 lg:heading-1 mt-4 max-w-[680px] text-gradient-hero">
              <span className="block">Fix your curl form</span>
              <span className="block">with just a webcam</span>
            </h1>
            <p className="body-7 mt-6 max-w-[680px] text-ink-2">
              FitMon watches your bicep curls through the camera you already have. It scores every rep out of 100 and cues
              you the moment your elbow drifts or you rush the way down.
            </p>
            <div className="mt-8">
              <Link to={primaryHref} className="button button-primary button-lg">
                {primaryLabel}
                <ArrowRightIcon className="size-5" weight="bold" aria-hidden />
              </Link>
            </div>
            <ul className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-6">
              <li className="caption-2 flex items-center gap-2 text-ink-2">
                <LockSimpleIcon className="size-4 shrink-0 text-ink" weight="bold" aria-hidden />
                Your video never leaves your computer
              </li>
              <li className="caption-2 flex items-center gap-2 text-ink-2">
                <WebcamIcon className="size-4 shrink-0 text-ink" weight="bold" aria-hidden />
                Any webcam, nothing to install
              </li>
            </ul>
          </div>

          <div className="animate-rise [animation-delay:120ms]">
            <img
              src="/landing/hero/arm-dumbbell.jpg"
              alt="An athlete curling a dumbbell, photographed side on"
              fetchPriority="high"
              className="aspect-[4/5] w-full rounded-3xl object-cover object-[10%_50%] lg:aspect-[5/6]"
            />
          </div>
        </section>

        {/* ── PROBLEM TO SOLUTION ── */}
        <section className="bg-surface">
          <Reveal className="mx-auto grid max-w-[1320px] items-center gap-12 px-4 py-16 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:py-24">
            <div>
              <p className="caption-1 text-muted">The problem</p>
              <h2 className="heading-4 sm:heading-3 lg:heading-2 mt-4 max-w-[680px]">A mirror can&rsquo;t see your elbow</h2>
              <p className="body-7 mt-6 text-ink-2">
                Mirrors show you from the front, but curl form breaks from the side. The elbow creeps forward, the range
                shrinks and the lowering speeds up as you tire. By the time it feels wrong, the bad reps are already done.
              </p>
              <p className="body-7 mt-4 text-ink">
                FitMon watches from the side and checks every rep while you lift, so you see a cue on the rep it starts.
              </p>
            </div>

            {/* The side-on view FitMon reads, next to the claim it illustrates. */}
            <figure className="w-full max-w-md justify-self-center rounded-2xl border border-line bg-canvas p-6 lg:justify-self-end">
              <figcaption className="flex items-center justify-between gap-2">
                <span className="title-4">Form in motion</span>
                <span className="caption-3 rounded-full bg-volt px-2 py-0.5 text-on-volt">Live</span>
              </figcaption>
              <CurlModel3D className="mt-4 w-full" />
            </figure>
          </Reveal>
        </section>

        {/* ── BENEFITS ── */}
        <section id="checks" className="mx-auto max-w-[1320px] scroll-mt-24 px-4 py-16 sm:px-8 lg:py-24">
          <Reveal>
            <p className="caption-1 text-muted">What it checks</p>
            <h2 className="heading-4 sm:heading-3 lg:heading-2 mt-4 max-w-[680px]">Five checks on every rep, rolled into one score</h2>
          </Reveal>
          <Reveal className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <article key={benefit.title} className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-6">
                  <span className="grid size-10 place-items-center rounded-full bg-volt text-on-volt">
                    <Icon className="size-5" weight="bold" aria-hidden />
                  </span>
                  <div>
                    <h3 className="title-2">{benefit.title}</h3>
                    <p className="body-6 mt-2 text-ink-2">{benefit.copy}</p>
                  </div>
                </article>
              );
            })}
            <article className="flex flex-col gap-6 rounded-2xl border border-line bg-surface p-6 sm:col-span-2 lg:col-span-2">
              <div className="flex items-start gap-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-volt text-on-volt">
                  <GaugeIcon className="size-5" weight="bold" aria-hidden />
                </span>
                <div>
                  <h3 className="title-2">One injury risk number</h3>
                  <p className="body-6 mt-2 max-w-md text-ink-2">
                    Everything above rolls into a single Safe, Watch or High score you can act on before the next set.
                  </p>
                </div>
              </div>
              <div className="mt-auto">
                <RiskScale score={62} />
                <p className="caption-5 mt-2 text-muted">Sample score from a tiring set</p>
              </div>
            </article>
          </Reveal>
        </section>

        {/* ── TAGLINE REVEAL ── */}
        <section aria-label="Why FitMon" className="px-4 py-16 sm:px-8 lg:py-24">
          <TaglineReveal lines={taglineLines} />
        </section>

        {/* ── PROOF ── */}
        <section className="bg-surface">
          <div className="mx-auto grid max-w-[1320px] gap-12 px-4 py-16 sm:px-8 lg:grid-cols-[1fr_1.2fr] lg:gap-16 lg:py-24">
            <Reveal>
              <p className="caption-1 text-muted">The rep log</p>
              <h2 className="heading-4 sm:heading-3 lg:heading-2 mt-4">See the exact rep your set went wrong</h2>
              <p className="body-7 mt-6 max-w-md text-ink-2">
                FitMon logs range, form and grip pressure for every rep. In this set, form held until rep 11, when the elbow
                started moving forward.
              </p>
            </Reveal>

            <Reveal className="self-end rounded-2xl border border-line p-4 sm:p-6">
              <div className="caption-2 flex flex-wrap items-baseline justify-between gap-2 text-muted">
                <span>Sample readout, last four reps</span>
                <span>Bicep curl, 12 kg</span>
              </div>
              <table className="mt-4 w-full text-left">
                <thead>
                  <tr className="caption-4 text-muted">
                    <th scope="col" className="py-2 pr-3 font-medium">Rep</th>
                    <th scope="col" className="py-2 pr-3 font-medium">Range</th>
                    <th scope="col" className="py-2 pr-3 font-medium">Form</th>
                    <th scope="col" className="hidden py-2 pr-3 font-medium sm:table-cell">Pressure</th>
                    <th scope="col" className="py-2 text-right font-medium">Flag</th>
                  </tr>
                </thead>
                <tbody className="font-mono tabular-nums">
                  {sampleRows.map((row) => (
                    <tr key={row.rep} className="border-t border-line">
                      <td className="py-4 pr-3 text-2xl">{row.rep}</td>
                      <td className="caption-2 py-4 pr-3 text-ink-2">{row.range}</td>
                      <td className={cx('py-4 pr-3 text-2xl', row.form < 60 && 'text-bad')}>{row.form}</td>
                      <td className="caption-2 hidden py-4 pr-3 text-ink-2 sm:table-cell">{row.pressure}</td>
                      <td className="py-4 text-right font-sans">
                        {row.flag ? <span className="tag tag-volt">{row.flag}</span> : <span className="caption-2 text-muted">Clean</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Reveal>

            {testimonials.length ? (
              <Reveal className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
                {testimonials.map((item) => (
                  <figure key={item.name} className="rounded-2xl border border-line p-6">
                    <blockquote className="body-7">{item.quote}</blockquote>
                    <figcaption className="caption-1 mt-4">
                      {item.name} <span className="text-muted">{item.detail}</span>
                    </figcaption>
                  </figure>
                ))}
              </Reveal>
            ) : null}
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section id="how" className="mx-auto max-w-[1320px] scroll-mt-24 px-4 py-16 sm:px-8 lg:py-24">
          <Reveal>
            <p className="caption-1 text-muted">How it works</p>
            <h2 className="heading-4 sm:heading-3 lg:heading-2 mt-4">One set, one report</h2>
            <p className="body-7 mt-4 max-w-xl text-ink-2">It runs in your browser, so there is nothing to install.</p>
          </Reveal>
          <Reveal as="ol" className="mt-12 grid gap-4 sm:grid-cols-3">
            {steps.map((step, i) => (
              <li key={step.title} className="rounded-2xl border border-line p-6">
                <span className="caption-3 font-mono text-volt-deep">0{i + 1}</span>
                <h3 className="heading-6 mt-4">{step.title}</h3>
                <p className="body-6 mt-2 text-ink-2">{step.copy}</p>
              </li>
            ))}
          </Reveal>
        </section>

        {/* ── BAND ── */}
        <section id="band" className="scroll-mt-24 bg-surface">
          <div className="mx-auto grid max-w-[1320px] items-center gap-12 px-4 py-16 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:py-24">
            <Reveal>
              <p className="caption-1 text-muted">Optional hardware</p>
              <h2 className="heading-4 sm:heading-3 lg:heading-2 mt-4">Add the FitMon band for grip pressure</h2>
              <p className="body-7 mt-6 max-w-md text-ink-2">
                A light band with a force sensor streams your grip load to FitMon over wifi. With the camera and the band
                together, FitMon can tell a heavy rep from a sloppy one.
              </p>
              <dl className="mt-8 grid max-w-md gap-6 border-t border-line pt-6 sm:grid-cols-3">
                {[
                  ['Sensor', 'Force sensing resistor'],
                  ['Board', 'ESP8266 over wifi'],
                  ['Needed?', 'No, the camera works alone'],
                ].map(([term, detail]) => (
                  <div key={term}>
                    <dt className="caption-5 text-muted">{term}</dt>
                    <dd className="title-4 mt-1">{detail}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
            <Reveal>
              <img
                src="/landing/hero/wristband.jpg"
                alt="A sensor band worn on an athlete's wrist"
                loading="lazy"
                className="aspect-[4/5] w-full rounded-3xl object-cover object-[50%_45%] lg:aspect-[5/6]"
              />
            </Reveal>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section id="faq" className="mx-auto grid max-w-[1320px] scroll-mt-24 gap-12 px-4 py-16 sm:px-8 lg:grid-cols-[1fr_1.4fr] lg:gap-16 lg:py-24">
          <Reveal>
            <p className="caption-1 text-muted">FAQ</p>
            <h2 className="heading-4 sm:heading-3 lg:heading-2 mt-4">Questions before your first set</h2>
            <p className="body-7 mt-4 max-w-sm text-ink-2">
              Something else on your mind? <a href="#contact" className="underline decoration-line-strong underline-offset-4 transition-colors duration-300 ease-fluid hover:decoration-ink">Send us a message</a>.
            </p>
          </Reveal>
          <Reveal>
            <FaqList items={faqs} />
          </Reveal>
        </section>

        {/* ── FINAL CTA ── */}
        <section className="mx-auto max-w-[1320px] px-4 pb-16 sm:px-8 lg:pb-24">
          <Reveal className="flex flex-col gap-8 rounded-3xl bg-panel p-8 text-white sm:p-16 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="heading-3 sm:heading-2 max-w-[680px]">
                <span className="block">Train with a</span>
                <span className="block">second pair of eyes</span>
              </h2>
              <ul className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-6">
                {reassurances.map((item) => (
                  <li key={item} className="caption-2 flex items-center gap-2 text-white/80">
                    <CheckIcon className="size-4 shrink-0 text-volt" weight="bold" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <Link to={primaryHref} className="button button-primary button-lg self-start focus-visible:outline-white lg:self-auto">
              {primaryLabel}
              <ArrowRightIcon className="size-5" weight="bold" aria-hidden />
            </Link>
          </Reveal>
        </section>

        {/* ── CONTACT (gyms and clinics) ── */}
        <section id="contact" className="scroll-mt-24 bg-surface">
          <div className="mx-auto grid max-w-[1320px] gap-12 px-4 py-16 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:py-24">
            <Reveal>
              <p className="caption-1 text-muted">For gyms, clinics and coaches</p>
              <h2 className="heading-4 sm:heading-3 lg:heading-2 mt-4">Bring FitMon to your team</h2>
              <p className="body-7 mt-6 max-w-md text-ink-2">
                Tell us about your program and who you train. We reply within a day.
              </p>
            </Reveal>
            <Reveal>
              <ContactForm />
            </Reveal>
          </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t border-line bg-canvas">
        <div className="mx-auto max-w-[1320px] px-4 sm:px-8">
          <div className="flex flex-col gap-6 py-8 sm:flex-row sm:items-center sm:justify-between">
            <nav className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Footer">
              {navLinks.map((link) => (
                <a key={link.id} href={`#${link.id}`} className="body-6 text-ink-2 transition-colors duration-300 ease-fluid hover:text-ink">
                  {link.label}
                </a>
              ))}
              <a href="#contact" className="body-6 text-ink-2 transition-colors duration-300 ease-fluid hover:text-ink">Contact</a>
              <Link to="/login" className="body-6 text-ink-2 transition-colors duration-300 ease-fluid hover:text-ink">Sign in</Link>
            </nav>
            <p className="caption-2 text-muted">© {new Date().getFullYear()} FitMon. Training guidance, not medical advice.</p>
          </div>
          <p className="headline flex items-center gap-[0.12em] border-t border-line pt-8 pb-2 text-6xl leading-none sm:text-8xl lg:text-9xl" aria-hidden>
            <LogoMark className="size-[0.95em]" />
            <LogoWordmark />
          </p>
        </div>
      </footer>
    </div>
  );
}

/** Floating bar on desktop; a full height panel on small screens. */
function SiteNav({ primaryHref, primaryLabel }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const active = useActiveSection(navLinks.map((link) => link.id));

  useEffect(() => {
    if (!menuOpen) return undefined;
    const close = (event) => event.key === 'Escape' && setMenuOpen(false);
    window.addEventListener('keydown', close);
    document.documentElement.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', close);
      document.documentElement.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <>
      <header className="fixed inset-x-0 top-4 z-40 flex justify-center px-4">
        <div className="flex items-center gap-2 rounded-full border border-line bg-surface/70 p-2 shadow-sm backdrop-blur-xl">
          <Logo className="px-2" />
          <nav className="hidden items-center md:flex" aria-label="Primary">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                aria-current={active === link.id ? 'true' : undefined}
                className={cx(
                  'title-4 rounded-full px-3 py-2 transition-colors duration-300 ease-fluid hover:bg-ink/5 hover:text-ink',
                  active === link.id ? 'bg-ink/5 text-ink' : 'text-ink-2',
                )}
              >
                {link.label}
              </a>
            ))}
          </nav>
          <ThemeToggle />
          <Link to={primaryHref} className="button button-primary button-sm hidden sm:inline-flex">{primaryLabel}</Link>
          <button
            type="button"
            className="relative grid size-10 place-items-center rounded-full text-ink transition-colors duration-300 ease-fluid hover:bg-ink/5 md:hidden"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            <span className={cx('absolute h-0.5 w-4 rounded-full bg-current transition-transform duration-500 ease-fluid', menuOpen ? 'rotate-45' : '-translate-y-1')} />
            <span className={cx('absolute h-0.5 w-4 rounded-full bg-current transition-transform duration-500 ease-fluid', menuOpen ? '-rotate-45' : 'translate-y-1')} />
          </button>
        </div>
      </header>

      <div
        id="mobile-menu"
        inert={!menuOpen}
        className={cx(
          'fixed inset-0 z-30 flex flex-col bg-canvas/95 px-4 pt-24 pb-8 backdrop-blur-2xl transition-opacity duration-500 ease-fluid md:hidden',
          menuOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      >
        <nav className="flex flex-col" aria-label="Mobile">
          {navLinks.map((link, i) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              onClick={() => setMenuOpen(false)}
              aria-current={active === link.id ? 'true' : undefined}
              style={{ transitionDelay: menuOpen ? `${Math.min(i * 60, 400)}ms` : '0ms' }}
              className={cx(
                'heading-4 border-b border-line py-4 transition-[opacity,transform] duration-500 ease-fluid',
                menuOpen ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0',
                active === link.id ? 'text-ink' : 'text-ink-2',
              )}
            >
              {link.label}
            </a>
          ))}
        </nav>
        <Link to={primaryHref} className="button button-primary button-lg mt-8 self-start">{primaryLabel}</Link>
      </div>
    </>
  );
}

/** The id of the section currently in the middle of the viewport, for the nav's current item. */
function useActiveSection(ids) {
  const [active, setActive] = useState(null);
  const key = ids.join(',');

  useEffect(() => {
    const sections = key.split(',').map((id) => document.getElementById(id)).filter(Boolean);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
          else setActive((current) => (current === entry.target.id ? null : current));
        });
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [key]);

  return active;
}

/** Rises 32px and fades in the first time it enters the viewport. */
function Reveal({ as = 'div', className = '', children }) {
  const Tag = as;
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShown(true);
        observer.disconnect();
      },
      { rootMargin: '0px 0px -10% 0px' },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag ref={ref} data-shown={shown} className={cx('reveal', className)}>
      {children}
    </Tag>
  );
}

/**
 * Large statement whose words go from muted to full ink one by one as it scrolls up the screen.
 * The scroll handler is only attached while the block is on screen and runs at most once a frame.
 */
function TaglineReveal({ lines }) {
  const ref = useRef(null);
  const words = lines.map((line) => line.split(' '));
  const total = words.flat().length;
  const [lit, setLit] = useState(() => (prefersReducedMotion() ? total : 0));

  useEffect(() => {
    if (prefersReducedMotion()) return undefined;
    const el = ref.current;
    let frame = null;

    const update = () => {
      frame = null;
      const rect = el.getBoundingClientRect();
      const start = window.innerHeight * 0.85;
      const end = window.innerHeight * 0.35;
      const progress = (start - rect.top) / (start - end + rect.height * 0.5);
      const next = Math.round(Math.min(1, Math.max(0, progress)) * total);
      setLit((current) => Math.max(current, next));
    };
    const onScroll = () => {
      if (frame === null) frame = requestAnimationFrame(update);
    };
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
      } else {
        window.removeEventListener('scroll', onScroll);
      }
    });
    observer.observe(el);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [total]);

  let index = 0;
  return (
    <p ref={ref} className="heading-4 sm:heading-3 lg:heading-2 mx-auto max-w-[680px]">
      {words.map((line, l) => (
        <span key={l} className="block">
          {line.map((word, w) => {
            const on = index++ < lit;
            return (
              <span key={w} data-on={on} className="tagline-word">
                {word}
                {w < line.length - 1 ? ' ' : null}
              </span>
            );
          })}
        </span>
      ))}
    </p>
  );
}

function FaqList({ items }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };

  return (
    <>
      <div className="border-t border-line">
        {items.map((item) => (
          <details key={item.q} className="group border-b border-line">
            <summary className="title-2 flex cursor-pointer list-none items-center justify-between gap-4 py-4 transition-colors duration-300 ease-fluid hover:text-ink-2 [&::-webkit-details-marker]:hidden">
              {item.q}
              <PlusIcon className="size-5 shrink-0 transition-transform duration-500 ease-fluid group-open:rotate-45" weight="bold" aria-hidden />
            </summary>
            <p className="body-3 max-w-xl pb-6 text-ink-2">{item.a}</p>
          </details>
        ))}
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </>
  );
}

function ContactForm() {
  const [form, setForm] = useState(emptyContact);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = (payload) => {
    const next = {};
    if (!payload.name) next.name = 'Add your name so we know who to reply to.';
    if (!payload.email) next.email = 'Add your email so we can reply.';
    else if (!EMAIL_PATTERN.test(payload.email)) next.email = 'That email looks incomplete. Check it and try again.';
    if (!payload.message) next.message = 'Tell us a little about your program.';
    return next;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      organization: form.organization.trim(),
      message: form.message.trim(),
    };

    const found = validate(payload);
    setErrors(found);
    if (Object.keys(found).length) {
      setStatus(null);
      return;
    }

    try {
      setIsSubmitting(true);
      setStatus(null);

      const response = await fetch(`${API_BASE_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.message || 'Your message did not send. Check your connection and try again.');
      }

      setStatus({ type: 'success', message: `Message sent. We will reply to ${payload.email} within a day.` });
      setForm(emptyContact);
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Your message did not send. Check your connection and try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldProps = (name) => ({
    id: `c-${name}`,
    name,
    value: form[name],
    onChange: handleChange,
    'aria-invalid': errors[name] ? true : undefined,
    'aria-describedby': errors[name] ? `c-${name}-error` : undefined,
  });

  return (
    <form onSubmit={handleSubmit} noValidate aria-busy={isSubmitting}>
      <div className="grid gap-8 sm:grid-cols-2">
        <Field label="Name" name="name" error={errors.name}>
          <input className="field" required autoComplete="name" {...fieldProps('name')} />
        </Field>
        <Field label="Email" name="email" error={errors.email}>
          <input className="field" type="email" required autoComplete="email" {...fieldProps('email')} />
        </Field>
        <Field label="Organisation (optional)" name="organization" className="sm:col-span-2">
          <input className="field" autoComplete="organization" {...fieldProps('organization')} />
        </Field>
        <Field label="Message" name="message" error={errors.message} className="sm:col-span-2">
          <textarea className="field" rows="4" required {...fieldProps('message')} />
        </Field>
      </div>
      <p role="status" aria-live="polite" className={cx('body-5 mt-6 empty:hidden', status?.type === 'success' ? 'text-good' : 'text-bad')}>
        {status?.message}
      </p>
      <button type="submit" className="button button-dark mt-8" disabled={isSubmitting}>
        {isSubmitting ? 'Sending message' : 'Send message'}
      </button>
    </form>
  );
}

function Field({ label, name, error, className = '', children }) {
  return (
    <div className={cx('flex flex-col gap-2', className)}>
      <label htmlFor={`c-${name}`} className="caption-1 text-muted">{label}</label>
      {children}
      {error ? <p id={`c-${name}-error`} className="caption-2 text-bad">{error}</p> : null}
    </div>
  );
}
