# Proposal: Connect Real NotebookLM MCP to ExamForge

## Intent

Replace the mock `callNotebookLM()` in `src/lib/notebooklm/generate.ts` with real NotebookLM MCP tool calls, add admin content management UI, and build student-facing content pages (audio, flashcards, quizzes, mind maps). Also apply neuroinclusive design principles from the 10+ ADHD/UX/color psychology sources already in the notebook.

## Scope

### In Scope
- Real MCP client abstraction layer replacing mock responses
- Admin UI: notebook browser, source management, generation triggers, status monitoring
- Student pages: audio player, flashcard review (SM-2), quiz renderer, mind map viewer
- Neuroinclusive design: focus-optimized color palette, chunked UI, gamification micro-interactions
- Prisma schema additions: `notebookId`, `artifactId`, `audioUrl`, `topics` fields
- Async generation pipeline with status polling (generations take 1-5 min)

### Out of Scope
- Replacing the existing R&UoE engine
- Real-time conversation practice (Interactive Mode)
- Video overview generation
- Multi-notebook orchestration / topic-based personalization
- Google AI Pro for Education tier migration

## Capabilities

### New Capabilities
- `notebooklm-client`: MCP tool abstraction with retry, rate-limit awareness, async polling
- `admin-content-manager`: UI for notebook/source browsing, generation triggers, review queue
- `student-content-pages`: Audio player, flashcard review, quiz renderer, mind map viewer
- `neuroinclusive-design`: Color palette, chunked layouts, gamification patterns from research

### Modified Capabilities
- `generation-service`: Replace mock MCP calls with real client; add `notebookId`/`artifactId` tracking
- `prisma-schema`: Extend `GeneratedContent`, `AudioExercise` with NotebookLM metadata fields

## Approach

1. **MCP Client Layer** (`src/lib/notebooklm/mcp-client.ts`): Thin wrapper around MCP tool calls via `nlm` CLI subprocess or direct HTTP. Handles auth, retries, rate limits.
2. **Replace Mock**: Swap `callNotebookLM()` to use the client. Map MCP response shapes to existing `rawResponse` schema.
3. **Schema Migration**: Add `notebookId`, `artifactId`, `audioUrl`, `downloadUrl`, `topics` to relevant models.
4. **Admin API Routes**: Extend existing routes; add `/api/notebooklm/notebooks`, `/api/notebooklm/sources`.
5. **Admin UI**: `/admin/notebooklm` page with notebook browser, source list, generation controls, review queue.
6. **Student Pages**: `/learn/audio/[id]`, `/learn/flashcards/[deckId]`, `/learn/quiz/[id]`, `/learn/mindmap/[id]`.
7. **Neuroinclusive Polish**: Apply research-backed colors and interaction patterns across new pages.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/lib/notebooklm/generate.ts` | Modified | Replace mock with real MCP client calls |
| `src/lib/notebooklm/mcp-client.ts` | New | MCP tool abstraction layer |
| `prisma/schema.prisma` | Modified | Add NotebookLM metadata fields |
| `src/app/admin/notebooklm/` | New | Admin content management pages |
| `src/app/learn/` | New | Student-facing content pages |
| `src/app/api/notebooklm/` | Modified | Extend routes for notebooks/sources |
| `src/lib/notebooklm/generate.test.ts` | Modified | Update tests for real MCP client |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Rate limits (3 audio/day, 10 quizzes/day free tier) | High | Cache aggressively, pre-generate overnight, show limits in admin UI |
| Generation latency (1-5 min) | High | Async pipeline with polling; status UI with progress indicators |
| MCP auth expiry (browser login required periodically) | Medium | Auth health monitoring, `nlm login` re-auth flow |
| Content quality variance | Medium | Admin review queue (already built); curated source materials |
| 400-line PR budget exceeded | High | Chain PRs: (1) MCP client + schema, (2) admin UI, (3) student pages |

## Rollback Plan

- Revert `generate.ts` to mock implementation (git revert)
- Remove new API routes and pages (git revert)
- Schema migration is additive only — no destructive changes, safe to keep
- MCP client layer is isolated — no dependency from core platform

## Success Criteria

- [ ] `callNotebookLM()` replaced with real MCP calls that succeed against live notebook
- [ ] Admin can browse 75 sources, trigger audio/quiz/flashcard generation, review results
- [ ] Student can play generated audio, review flashcards with SM-2, take quizzes
- [ ] Neuroinclusive color palette applied to all new pages
- [ ] All existing tests pass; new tests cover MCP client and response mapping
- [ ] Generation pipeline handles async completion (poll → update → notify)
