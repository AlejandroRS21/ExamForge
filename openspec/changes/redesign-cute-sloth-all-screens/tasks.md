# Tasks: Redesign Cute Sloth Theme Across All Screens

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~228 net (per design) |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Chain strategy | pending |
| Delivery strategy | ask-on-risk |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Helpers + 6 pages (T1-T9) | PR 1 (single) | `npm run build` | `npm run dev` -> visit `/exams`, `/exams/practice/[partId]`, `/flashcards`, `/challenges`, `/auth/login`, `/auth/register` | Revert `src/components/ui/*` + `src/app/*` commits; zero DB/API impact |

## Task List (dependency-ordered)

- [x] **T1** deps: - | `src/components/ui/SlothPageHeader.tsx` (new)
  Shared warm page header: mascot pose prop, title, subtitle, optional back-link. Extract common exam/flashcards header markup. `ponestail:` static header, no animation.
  ~40 lines

- [x] **T2** deps: T1 | `src/components/ui/TactileButton.tsx` (new)
  3D tactile button reusing existing `.btn-tactile-*` utilities in `globals.css`; props `variant` (primary/secondary), `disabled`, `aria-pressed`.
  ~35 lines

- [x] **T3** deps: T1,T2 | `src/app/exams/page.tsx`
  Replace header with `SlothPageHeader`; swap emoji 🎓🎯⏱️ with `SlothIcons` SVG; tactile filter tags + progress cards; keep data/filter logic + Castellano copy.
  ~35 lines

- [x] **T4** deps: T1,T2 | `src/app/exams/practice/[partId]/page.tsx`, `practice-client.tsx`
  Header via `SlothPageHeader`; tactile answer buttons; replace 🎓⏱️ emojis; add Calm Sloth Timer Guard aside (presentational - mascot `calm` pose + "¡Sin prisas! Vas bien." when <5min, warm non-alarm styling, no timer wiring).
  ~45 lines

- [x] **T5** deps: T1,T2 | `src/app/flashcards/page.tsx`, `src/components/flashcards/FlashcardViewer.tsx`
  Rating copy -> "Fácil", "Normal", "Difícil" (keep 0|1|2|3 values + keyboard); fixed flip container dims; TactileButton on rating actions; 📚 -> SlothIcons.
  ~30 lines

- [x] **T6** deps: T1,T2 | `src/app/challenges/page.tsx`
  Replace 🏆🏅🥇🥈🥉📊 with custom SVG icons; `SlothPageHeader`; warm streak/medal cards; keep challenge logic.
  ~30 lines

- [x] **T7** deps: T1,T2 | `src/app/auth/login/page.tsx`, `login-form.tsx`
  Warm `SlothPageHeader` welcome; `#E5D9CC` warm borders on inputs; TactileButton submit; Castellano copy. No auth state changes.
  ~20 lines

- [x] **T8** deps: T1,T2 | `src/app/auth/register/page.tsx`, `register-form.tsx`
  Same as T7 for register: SlothPageHeader, tactile submit, warm field borders; no auth/DB changes.
  ~20 lines

- [x] **T9** deps: T3-T8 | repo-wide
  Gate: run `npm run build && npm test` - both MUST be green; fix any TypeScript/lint/test failures introduced by T1-T8.
  ~1 line (verify)

## Phase & Test Notes

- Test-first where meaningful: T4 timer-guard scenario (spec "Calm timer warning") verified via RSC render smoke + manual dev visit; no unit harness for presentational aside.
- `ponestail:` comments in T1 (static header) and T4 (guard presentational, no countdown wiring) flag intentional simplifications.
- No RED tests required separately: all changes are presentational refactors of existing behavior.
