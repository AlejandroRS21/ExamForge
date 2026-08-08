# Delta Spec: Redesign Cute Sloth Theme Across All Screens

## MODIFIED Requirements

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
- THEN the form MUST render warm input field highlights, tactile 3D button feedback, and Castellano validation/welcome copy.
