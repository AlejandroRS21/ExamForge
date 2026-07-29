# Proposal: Redesign Cute Sloth Theme

## Intent

Transform ExamForge frontend UI into a warm, friendly, gamified experience centered on a Sloth mascot ("Perezoso"), using a warm tactile palette, Fredoka/Quicksand typography, Castellano (ES) copy, custom SVG iconography (no emojis), and bouncy 3D UI elements to make exam prep stress-free and engaging.

## Scope

### In Scope
- Define warm design tokens, color variables (#FAF6F0, #FF6B35, #FFB703, #2A9D8F, deep brown text), and tactile 3D button utilities in `globals.css` / `design-tokens.ts`.
- Perezoso SVG mascot component supporting emotional states (`idle`, `cheering`, `thinking`).
- Custom SVG icon library replacing generic icons and emojis across target components.
- Redesign Landing Page (`src/app/page.tsx`) with Castellano slogan ("Consigue tus certificados a tu ritmo y sin estrés"), hero mascot, and warm card grid.
- Redesign Main Dashboard (`src/app/dashboard/page.tsx`) with sloth streak tracker, warm stats cards, and action triggers.
- Redesign Practice Simulator UI with calm study layout, mascot feedback header, and tactile answer buttons.

### Out of Scope
- Backend exam scoring, session management, or API route logic changes.
- User authentication model or database schema modifications.
- Dark mode theme toggle (aesthetic is unified warm light palette).

## Capabilities

### New Capabilities
- `sloth-design-system`: Theme design tokens, Perezoso mascot SVG states, warm color palette, tactile 3D button classes, and custom SVG icon library.

### Modified Capabilities
- `landing-page`: Spanish Castellano copy integration, hero sloth layout, warm feature cards.
- `dashboard-ui`: Warm stats cards, sloth streak component, gamified progress trackers.
- `exam-simulator-ui`: Calm study view, tactile answer buttons, sloth feedback state header/footer.

## Approach

1. Extend CSS tokens and design configuration for warm color variables, tactile 3D shadow utilities, and Google Fonts (`Fredoka` and `Quicksand`).
2. Build reusable Perezoso SVG mascot component (`src/components/mascot/Perezoso.tsx`) with state variants.
3. Create standalone SVG icon set (`src/components/icons/`) eliminating all emoji dependencies.
4. Refactor Landing, Dashboard, and Exam Simulator components to apply sloth theme while maintaining existing functional props and state flow.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/app/globals.css` | Modified | Add design tokens, color variables, 3D tactile button utilities |
| `src/lib/design-tokens.ts` | Modified | Update palette definitions and contrast map thresholds |
| `src/app/layout.tsx` | Modified | Load Fredoka & Quicksand fonts |
| `src/components/mascot/` | New | Perezoso sloth SVG mascot component and states |
| `src/components/icons/` | New | Custom SVG icon components |
| `src/app/page.tsx` | Modified | Redesign landing page with Castellano slogan and hero sloth |
| `src/app/dashboard/page.tsx` | Modified | Redesign dashboard with sloth streak and warm cards |
| `src/components/exam/` | Modified | Redesign practice simulator with calm view and 3D buttons |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| WCAG AA contrast ratio failure with warm yellow/green tokens | Med | Run `design-tokens.test.ts` automated contrast assertions |
| Mascot animation causing cognitive distraction in exam simulator | Med | Use static calm mascot posture in practice mode |

## Rollback Plan

Revert Git commits touching `src/app/`, `src/lib/design-tokens.ts`, `src/components/`, and `openspec/`. No backend migrations involved.

## Dependencies

- `@next/font` / Google Fonts (`Fredoka`, `Quicksand`)

## Success Criteria

- [ ] Design tokens pass WCAG AA contrast suite in `design-tokens.test.ts`.
- [ ] Landing page header displays "Consigue tus certificados a tu ritmo y sin estrés".
- [ ] Landing Page, Dashboard, and Simulator render Perezoso mascot and custom SVGs with zero emoji usage.
- [ ] Practice Simulator interactive controls render 3D tactile button styling.
