# Proposal: Redesign Cute Sloth Theme Across All Screens

## Intent

Extend the warm, friendly "Perezoso" Sloth design system across remaining ExamForge screens (`/exams`, `/exams/practice/[partId]`, `/flashcards`, `/challenges`, `/auth/login`, `/auth/register`) using Castellano (ES) messaging, tactile 3D controls, and custom vector icons to achieve 100% theme consistency without backend or data layer breakage.

## Scope

### In Scope
- Refactor `/exams`: Exam selection list, category filters, progress cards with Perezoso sloth mascot and Castellano copy.
- Refactor `/exams/practice/[partId]`: Exam practice simulator view, interactive questions, tactile 3D buttons, mascot feedback headers.
- Refactor `/flashcards`: Flashcard deck selection, flip review interface, tactile action buttons ("Fácil", "Normal", "Difícil").
- Refactor `/challenges`: Daily challenge hub, streak cards, reward milestones with sloth mascot graphics.
- Refactor `/auth/login` & `/auth/register`: Authentication screens with friendly sloth welcome header, warm input fields, 3D submit buttons.
- Standardize Castellano de España tone across all modified views.

### Out of Scope
- Modifying authentication state, NextAuth config, DB schemas, or API endpoints.
- Base design tokens definition (reuses `sloth-design-system` capabilities from `redesign-cute-sloth-theme`).
- Dark mode theme variants.

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- `sloth-design-system`: Extend scope to cover all secondary and auth screens.
- `exam-simulator-ui`: Applied to `/exams` list and `/exams/practice/[partId]`.
- `flashcards-ui`: Warm flashcard review UI with tactile 3D flip controls.
- `challenges-ui`: Daily challenge hub with Perezoso streak milestones.
- `auth-ui`: Warm login/register forms with sloth mascot guidance.

## Approach

1. Utilize established design tokens, tactile 3D button utility classes, and `Perezoso` mascot component variants (`idle`, `thinking`, `cheering`).
2. Replace all emojis and generic elements across target screens with custom SVG icons.
3. Update all copy to natural Castellano de España ("¡A tu ritmo!", "Repaso diario", "Accede a tu cuenta").
4. Wrap form controls and card wrappers with warm borders (`#E5D9CC`), soft shadows, and 3D tactile interaction feedback.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/app/exams/page.tsx` | Modified | Sloth theme exam catalog list & filter tags |
| `src/app/exams/practice/[partId]/page.tsx` | Modified | Tactile 3D practice mode & sloth status header |
| `src/app/flashcards/page.tsx` | Modified | Warm 3D flashcard flip interface |
| `src/app/challenges/page.tsx` | Modified | Daily challenges & mascot milestone cards |
| `src/app/auth/login/page.tsx` | Modified | Warm login form with sloth mascot header |
| `src/app/auth/register/page.tsx` | Modified | Warm registration form & Castellano copy |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Contrast issues on small text inside 3D buttons | Low | Enforce white text on dark warm buttons and dark text on warm light buttons |
| UI layout shift on flashcard flip transition | Med | Preserve existing fixed height/width layout containers during refactor |

## Rollback Plan

Revert Git commits modifying the 6 target page routes. Zero DB or API impact.

## Dependencies

- Existing `Perezoso` mascot component and design tokens from `redesign-cute-sloth-theme`.

## Success Criteria

- [ ] All 6 target screens (`/exams`, `/exams/practice/[partId]`, `/flashcards`, `/challenges`, `/auth/login`, `/auth/register`) render Perezoso mascot and tactile 3D controls.
- [ ] Castellano de España messaging verified across all 6 screens.
- [ ] 0 emojis used across new interfaces (100% custom SVGs / mascot).
