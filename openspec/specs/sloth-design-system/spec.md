# Specification: sloth-design-system

## Capability: `sloth-design-system`

### Requirement: Design Tokens and Tactile Styling

The system MUST define CSS variables and TypeScript constants for warm color tokens, typography classes for Fredoka and Quicksand, and 3D tactile button utilities.

#### Scenario: Design token color palette and contrast compliance
- GIVEN the application theme initialization
- WHEN design tokens are loaded in `src/lib/design-tokens.ts` and `src/app/globals.css`
- THEN primary colors MUST include Warm Beige (`#FAF6F0`), Energetic Orange (`#FF6B35`), Warm Gold (`#FFB703`), Deep Teal (`#2A9D8F`), and Deep Brown text (`#2B1E1A`)
- AND all text-to-background contrast combinations MUST achieve WCAG AA compliance (ratio ≥ 4.5:1).

#### Scenario: Tactile 3D button utility classes
- GIVEN a user views interactive elements
- WHEN applying tactile 3D button styling (inline arbitrary shadow classes such as `shadow-[0_4px_0_0_...]` or the `.btn-tactile-*` utilities)
- THEN elements MUST render a 3D bottom border/shadow offset
- AND the active/pressed state MUST translate the element downward to mimic a physical press.

### Requirement: Sloth Mascot Component (`Perezoso`)

The system MUST provide a standalone SVG mascot component supporting dynamic posture/emotional states without external image files or emojis.

#### Scenario: Sloth mascot state rendering
- GIVEN the `SlothMascot` component
- WHEN rendered with state `happy`, `cheering`, `calm`, or `studying`
- THEN it MUST return pure inline vector graphics corresponding to the posture
- AND in practice mode (`calm` state), vector animation MUST remain static to prevent user distraction.

### Requirement: Custom SVG Iconography

The system MUST provide a dedicated set of custom SVG icons replacing generic icons and emojis.

#### Scenario: Icon replacement with zero emojis
- GIVEN any UI view in the application
- WHEN displaying operational indicators (Target, Flame, Cpu, Award, Star, Play, Check)
- THEN custom SVG icon components MUST be rendered
- AND no raw emoji unicode characters SHALL be present in component output.

### Requirement: Sloth Theme Exams Index & Filters

The system MUST display the exam catalog and category filters at `src/app/exams/page.tsx` using Perezoso sloth design tokens, custom SVG icons, tactile 3D control cards, and Castellano copy.

#### Scenario: View and filter exam catalog
- GIVEN a user on `/exams`
- WHEN selecting a category filter tag or searching an exam
- THEN the system MUST render tactile 3D active filter states and update the exam list with Perezoso progress cards in Castellano without layout shift.

### Requirement: Sloth Practice Simulator with Calm Timer Guard

The system MUST render the exam practice simulator at `src/app/exams/practice/[partId]/page.tsx` with Perezoso mascot feedback headers, 3D action buttons, and a calm Sloth timer guard that visually reassures the student without stress-inducing alarms.

#### Scenario: Calm timer warning during practice
- GIVEN a student taking a timed practice exam on `/exams/practice/[partId]`
- WHEN remaining time drops below 5 minutes
- THEN the calm Sloth timer guard MUST switch to a calm mascot state with non-intrusive warm warning styling and Castellano message ("¡Sin prisas! Vas bien.").

### Requirement: Sloth Flashcards Decks & Tactile Viewer

The system MUST render flashcard deck selection and flip viewer at `src/app/flashcards/page.tsx` with tactile 3D rating buttons ("Fácil", "Normal", "Difícil") and Perezoso review mascot states.

#### Scenario: Reviewing flashcards with tactile feedback
- GIVEN a user reviewing a flashcard deck on `/flashcards`
- WHEN flipping a card and rating memory difficulty
- THEN the viewer MUST maintain fixed container dimensions while applying tactile 3D button press feedback and Castellano copy.

### Requirement: Sloth Daily Challenges & Medals Hub

The system MUST display daily challenges, streaks, and reward milestones at `src/app/challenges/page.tsx` using Perezoso graphics, custom SVG medals, and warm progress cards.

#### Scenario: Viewing challenge progress and milestone unlock
- GIVEN a user on `/challenges`
- WHEN viewing daily tasks or completed streak milestones
- THEN the system MUST display Perezoso mascot cheering badges, custom SVG icons, and Castellano progress indicators.

### Requirement: Sloth Auth Forms

The system MUST display `/auth/login` and `/auth/register` with Perezoso welcome headers, warm `#E5D9CC` borders, tactile 3D submit buttons, and Castellano form guidance.

#### Scenario: Submitting auth forms
- GIVEN a user on login or register routes
- WHEN interacting with input fields and clicking the submit button
- THEN the form MUST render warm input field highlights and tactile 3D button feedback, with Castellano validation/welcome copy.