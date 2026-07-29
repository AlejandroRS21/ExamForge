# Delta Specification: Redesign Cute Sloth Theme

## Capability: `sloth-design-system` (NEW)

### Requirement: Design Tokens and Tactile Styling

The system MUST define CSS variables and TypeScript constants for warm color tokens, typography classes for Fredoka and Quicksand, and 3D tactile button utilities.

#### Scenario: Design token color palette and contrast compliance
- GIVEN the application theme initialization
- WHEN design tokens are loaded in `src/lib/design-tokens.ts` and `src/app/globals.css`
- THEN primary colors MUST include Warm Beige (`#FAF6F0`), Energetic Orange (`#FF6B35`), Warm Gold (`#FFB703`), Deep Teal (`#2A9D8F`), and Deep Brown text (`#2B1E1A`)
- AND all text-to-background contrast combinations MUST achieve WCAG AA compliance (ratio ≥ 4.5:1).

#### Scenario: Tactile 3D button utility classes
- GIVEN a user views interactive elements
- WHEN applying `.btn-tactile-primary` or `.btn-tactile-secondary`
- THEN elements MUST render a 3D bottom border/shadow offset
- AND active state MUST translate element downward to mimic physical press.

### Requirement: Sloth Mascot Component (`Perezoso`)

The system MUST provide a standalone SVG mascot component supporting dynamic posture/emotional states without external image files or emojis.

#### Scenario: Sloth mascot state rendering
- GIVEN the `SlothMascot` / `Perezoso` component
- WHEN rendered with state `happy`, `encouraging`, `calm`, or `celebrating`
- THEN it MUST return pure inline vector graphics corresponding to the posture
- AND in practice mode (`calm` state), vector animation MUST remain static to prevent user distraction.

### Requirement: Custom SVG Iconography

The system MUST provide a dedicated set of custom SVG icons replacing generic icons and emojis.

#### Scenario: Icon replacement with zero emojis
- GIVEN any UI view in the application
- WHEN displaying operational indicators (Target, Flame, Cpu, Award, Star, Play, Check)
- THEN custom SVG icon components from `src/components/ui/icons/` MUST be rendered
- AND no raw emoji unicode characters SHALL be present in component output.

---

## Capability: `landing-page` (MODIFIED)

### Requirement: Landing Page Copy and Hero Sloth

The system MUST render the landing page in Castellano (ES) with hero sloth mascot and warm feature cards.

#### Scenario: Landing page presentation in Castellano ES
- GIVEN an unauthenticated visitor accessing `src/app/page.tsx`
- WHEN the page loads
- THEN the main hero heading MUST display "Consigue tus certificados a tu ritmo y sin estrés"
- AND hero section MUST display the Perezoso mascot in `encouraging` state
- AND feature cards MUST use warm background tokens and custom SVG icons.

---

## Capability: `dashboard-ui` (MODIFIED)

### Requirement: Gamified Dashboard and Sloth Streak Tracker

The system MUST display student study metrics, progress bars, and streak counter with sloth-themed styling.

#### Scenario: Gamified dashboard streak and metrics display
- GIVEN an authenticated user viewing `src/app/dashboard/`
- WHEN the dashboard loads
- THEN the streak widget MUST display active consecutive study days alongside a custom Flame SVG icon and sloth indicator
- AND practice cards MUST display progress bars using Deep Teal (`#2A9D8F`) and Warm Gold (`#FFB703`) tokens.
