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

## New design system

| Token | Value | Use |
|---|---|---|
| `bg` / `surface` / `card` / `elevated` | `#0a0b0d` / `#111316` / `#15171b` / `#1b1e23` | Dark layered surfaces |
| `fg` / `fg-2` / `muted` | `#f3f5f6` / `#b4bac0` / `#8a9198` | Text (muted is about 6:1 on `bg`) |
| `lime` | `#c6f24e` | Primary actions, good form, "live" |
| `cyan` | `#5ad8e6` | Pressure / sensor data |
| `amber` | `#ffb547` | Moderate risk, caution |
| `rose` | `#ff6b6b` | High risk, end session |

- **Type:** Geist (UI) and Geist Mono (all numbers, `tabular-nums`).
- **Shape:** 16–24px card radius, pill buttons, 1px hairline borders (`white/8%`).
- **Components** (in `src/index.css` and `src/components/ui.jsx`): `btn`, `card`, `badge-*`, `input`, `eyebrow`, `PageHeader`, `StatTile`, `ScoreRing`, `RiskBadge`, `EmptyState`.
