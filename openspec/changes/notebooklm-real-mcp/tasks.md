# Tasks: Real NotebookLM MCP Integration & Student Content Views

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~350–450 |
| 400-line budget risk | Medium |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 backend/schema → PR 2 admin API+UI → PR 3 student pages+verify |
| Delivery strategy | ask-on-risk (default) |
| Chain strategy | pending — ask user |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Schema + mcp-client + generate service | PR 1 | `npx vitest run src/lib/notebooklm/mcp-client.test.ts src/lib/notebooklm/generate.test.ts` | `NOTEBOOKLM_USE_MOCK=true npm run dev` — admin triggers generation end-to-end | Revert mcp-client.ts/generate.ts; schema fields additive, keep |
| 2 | Admin API routes + admin UI | PR 2 | `npm run build` (routes typecheck) | Dev server, `/admin/notebooklm` with mock fallback | Revert routes + page.tsx only |
| 3 | Student pages (audio/flashcards/quiz/mindmap) | PR 3 | `npm run build && npm test` | Dev server, seed PUBLISHED record → open each `/learn/*` route | Revert `src/app/learn/*` only |

## Phase 1: Schema Foundation (T1)

- [x] 1.1 `prisma/schema.prisma`: add `audioUrl String?` + `topics String[] @default([])` to `GeneratedContent`; add `audioUrl String?` + `notebookId String?` to `AudioExercise`
- [x] 1.2 Run `npx prisma db push && npx prisma generate`

## Phase 2: MCP Client (T2)

- [x] 2.1 RED `mcp-client.test.ts`: args containing `; rm -rf /` and `$(whoami)` passed as literal CLI args, never shell (threat-matrix process-integration case)
- [x] 2.2 RED `mcp-client.test.ts`: 401/429/500 or `NOTEBOOKLM_USE_MOCK=true` → transparent mock fallback with fallback flag
- [x] 2.3 RED `mcp-client.test.ts`: `pollArtifactStatus` polls until `completed`/`failed`, 5-min timeout
- [x] 2.4 `mcp-client.ts`: `execFile` with `shell:false` + args sanitization, fallback handler, `pollArtifactStatus()` (`pollIntervalMs: 5000`, `pollTimeoutMs: 300000`)

## Phase 3: Generation Service (T3)

- [x] 3.1 RED `generate.test.ts`: `generateContent` persists `notebookId`/`artifactId`/`downloadUrl`/`topics`, PENDING→PROCESSING→COMPLETED transitions
- [x] 3.2 `generate.ts`: replace `callNotebookLM()` with MCPClient, populate new fields, keep response payload shape, mock fallback

## Phase 4: Admin API + UI (T4–T5)

- [x] 4.1 `src/app/api/notebooklm/notebooks/route.ts`: notebook list + auth health
- [x] 4.2 `src/app/api/notebooklm/sources/route.ts`: source count/list for selected notebook
- [x] 4.3 `src/app/api/notebooklm/pending/route.ts`: drafts awaiting admin approval
- [x] 4.4 `/admin/notebooklm/page.tsx`: notebook browser, source manager, generation trigger + progress indicator, review queue approve/reject

## Phase 5: Student Pages (T6–T9)

- [x] 5.1 `/learn/audio/[id]/page.tsx`: audio player, transcript toggle, SlothMascot feedback, zero raw emojis
- [x] 5.2 RED SM-2 unit: ease/interval/repetitions/nextReviewAt for AGAIN(1)/HARD(2)/GOOD(3)/EASY(5)
- [x] 5.3 `/learn/flashcards/[deckId]/page.tsx`: SM-2 review, 3D tactile buttons, progress display
- [x] 5.4 `/learn/quiz/[id]/page.tsx`: interactive quiz, instant correction feedback, chunked cards
- [x] 5.5 `/learn/mindmap/[id]/page.tsx`: collapsible mind map tree
- [x] 5.6 `src/components/ui/icons/SlothIcons.tsx`: complete SVG icon set enforcing zero-emoji policy

## Phase 6: Verification (T10)

- [x] 6.1 `npm run build && npm test` — all green
- [x] 6.2 Smoke-test admin + all four `/learn/*` routes with `NOTEBOOKLM_USE_MOCK=true`
