# FitMon UI redesign

The previous UI was critiqued before the redesign using the `design:design-critique` skill. This file has the findings and the new design system that addresses them.

## Design critique: FitMon v1 (before)

### Overall impression
The product idea comes through, but the UI looked like a generic marketing template. The app screens were led by oversized display type instead of the training data people come to see. Two visual languages (warm beige and periwinkle) ran side by side, and the report had no visuals at all.

### Usability
| Finding | Severity | Recommendation |
|---|---|---|
| Top pill navbar has no mobile layout. Five links and Logout overflow on phones, and gyms are a phone-first setting | 🔴 Critical | Use a sidebar on desktop and a bottom tab bar on mobile |
| The Session screen shows Reps, Angle and Form twice (camera overlay and side panel). A red "Connection issue" banner competes with the Start button | 🟡 Moderate | Keep one compact overlay on the camera and one detail panel. Make the status a pill next to the main action |
| Report charts and the risk gauge were written in `ReportPage.jsx` but never rendered, so the report is a plain list of rows | 🟡 Moderate | Show score rings, a risk gauge and a per-rep chart |
| The Workouts page loads 12 YouTube iframes at once, which is slow and heavy on data | 🟡 Moderate | Show thumbnails and load the player when a card is clicked. Add muscle-group filter chips |
| The mentor role saw trainee nav links that redirect away | 🟢 Minor | Make the nav depend on the user's role |

### Visual hierarchy
- **What draws the eye first:** the 64px Syne "Good afternoon, Sanjay". It should be the last session's scores.
- **Emphasis:** every metric uses the same accent blue, so color carries no meaning. Injury risk is pink even at a low 18%.
- **Whitespace:** big empty bands on the landing page. The 4-step checklist in a 3-column grid leaves one orphan card.

### Consistency
| Element | Issue | Recommendation |
|---|---|---|
| Typography | Inter (index.html), Syne + DM Sans (CSS) and a very wide display face mixed on one page | One family: Geist, plus Geist Mono for numbers |
| Color | Warm `#f6f5f2` pages next to blue-tinted ones. The primary button `#5b84f5` doesn't match the link blue `#1f4ed8` | One set of tokens. A single lime accent for actions, and fixed meanings for data colors |
| Icons | Emoji (🔥📊⚡), letter placeholders and text glyphs ("OK", "->") used as icons | Use Lucide icons everywhere |
| Styling | About 4,400 lines of hand-written CSS plus many inline `style={{}}` objects | Use Tailwind v4 (already installed but unused) with theme tokens |

### Accessibility
- **Color contrast:** muted text `#7a8792` on `#f6f5f2` is about 3.4:1 and fails WCAG AA for the small uppercase labels. "Needs Work" `#ff4d6d` on white is about 3.2:1 and also fails.
- **Focus:** there are no visible focus styles on custom buttons or pills.
- **Motion:** the rotating hero text and waves ignore `prefers-reduced-motion`.

### What worked well
- The copy is clear and specific: "Make risk visible before it builds" is a strong line.
- The session flow (camera → live metrics → report → PDF) is already coherent.
- The underlying data (posture, stability, smoothness, pressure, risk) is rich enough to visualize well.

### Priority recommendations
1. **Responsive app shell:** sidebar on desktop, bottom tab bar on mobile, nav that depends on role.
2. **Data-first screens:** score rings, gauges and color-coded tiles, with greetings and titles demoted.
3. **One token-based design system** in Tailwind v4, AA contrast, visible focus rings and reduced-motion support.

## Round 2 — removing the "AI-generated" look

The first redesign fixed the usability issues, but it relied on the visual tropes of generated SaaS templates:
- a near-black UI with a neon accent and glowing blurs
- a grid-paper hero backdrop, bento cards and colored icon chips
- score rings everywhere and mono uppercase labels
- a "NEW" pill and a fake dashboard as the hero image

Round 2 keeps the structure and logic but gives the product its own voice, drawn from training logs, gym scoreboards and printed sports scorecards.

| Before (round 1) | After (round 2) |
|---|---|
| Dark UI, neon lime, glow and blur | Warm paper `#f2f0ea`, black ink, a single safety-orange signal color |
| Geist + Geist Mono | Archivo variable: condensed heavy display for headlines and numbers, normal width for text |
| Rounded floating cards, colored icon chips | Square corners, thin rules and full-width bands. Cards only where content needs a surface |
| Score rings, gauges | Scoreboard figures, segmented meters, a linear Safe → Watch → High risk scale |
| Fake dashboard mock-up in the hero | Annotated line drawing of a bicep curl (`CurlDiagram`) showing what the product measures |
| SaaS sidebar | Masthead with text navigation and an orange underline for the active page. Bottom tab bar on mobile |
| Generic marketing copy | Plain, specific copy ("tells you what to fix before it turns into a sore elbow") |

## Round 3: matching the Dribbble reference

The client supplied a reference: Halo Lab's *"Landing Page for Wearable Technology ✦ Skip"* on Dribbble. The whole site now follows its visual language, keeping all FitMon content:

| Reference element | How FitMon uses it |
|---|---|
| Full-bleed outdoor photo with white overlay type | Landing hero, dashboard banner, login panel, the "Band" section, the live camera and workout cards all use photo + `photo-scrim` + white type |
| Huge, light, tight upper-case headline ("MEET NEW MO/GO") | `.headline` in Inter Tight 450 with -0.05em tracking: "EVERY REP ON THE REC/ORD", page titles |
| Neon pill CTA with a detached white ring | `.btn-volt` (volt `#def52b` + 1.5px white outline, 3px offset). `.btn-volt-flat` on light surfaces |
| Small sentence-case corner labels ("Built to climb", "Collaboration") | `.kicker`: "Built for the gym floor", "Works with · Any webcam · FSR band" |
| White product card with ↗ arrow ("Power in motion") | `card` + `CornerArrow`: "Form in motion" with the curl diagram; "Last session" card on the dashboard |
| Big light sentence + "LEARN MORE" in volt | `.lede` + `.link-volt` |
| Light "+40% / Uphill support" stat behind a hairline divider | `.stat` + `Stat` component, used for every number in the app |

**Photography:** only one photo exists in the repo (`public/landing/fitness-band.png`, 635px). `hero.jpg` and `band-closeup.jpg` are sharpened upscales of it. Swap in higher-resolution brand photography when available; the layouts don't need to change. The source photo appears to be a third-party product shot, so confirm usage rights before launch.

## Design system (current)

| Token | Value | Use |
|---|---|---|
| `canvas` / `surface` | `#eceeed` / `#ffffff` | App background / cards |
| `ink` / `ink-2` / `muted` | `#0e1013` / `#464c52` / `#62686f` | Text |
| `volt` | `#def52b` | CTAs, accents on dark or photo backgrounds only. Text on volt is always ink |
| `good` / `warn` / `bad` / `info` | `#1a7f45` / `#a15c00` / `#c62f22` / `#2364c8` | Score, risk and pressure states |

- **Type:** Inter Tight 300–700. Classes: `headline`, `lede`, `stat`, `kicker`.
- **Controls:** `btn` (`-volt`, `-volt-flat`, `-dark`, `-outline`, `-glass`, `-bad`), `link`, `link-volt`, `seg` (pill filters), `field` (underline inputs), `tag-*`.
- **Surfaces:** `card`, `card-pad`, `photo-scrim`, `skeleton`.
- **Components** (`src/components/ui.jsx`): `Logo` (FIT/MON), `PageHeader`, `Stat`, `Meter`, `RiskScale`, `RiskTag`, `EmptyState`, `Notice`, `CornerArrow`, `CurlDiagram`.
- **Helpers** (`src/utils/format.js`): `cx`, `scoreTone`, `getRisk`, `getSessionTimestamp`, `formatDuration`.
