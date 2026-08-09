# Design: Real NotebookLM MCP Integration & Student Content Views

## Technical Approach

Bridge ExamForge with real NotebookLM CLI/MCP tools (`nlm`) while providing robust mock fallbacks for local dev / offline testing. Add missing database metadata fields on `GeneratedContent` and `AudioExercise` to link Prisma entities directly to NotebookLM notebooks and artifacts. Complete the admin management interface (`/admin/notebooklm`) and high-contrast, neuroinclusive student learning views (`/learn/{audio,flashcards,quiz,mindmap}`).

## Architecture Decisions

| Decision | Option Chosen | Tradeoffs | Rationale |
|----------|---------------|-----------|-----------|
| MCP Transport | `execFile` wrapper over `nlm` CLI with `NOTEBOOKLM_USE_MOCK` override | CLI subprocess execution overhead (~50ms) vs direct web sockets | Cleanest isolation, reuses active `nlm` auth session stored on disk |
| Fallback Strategy | Auto-fallback to MockMCPClient on 401/429/500 or `NOTEBOOKLM_USE_MOCK=true` | Might obscure transient live MCP auth errors if not logged | Zero downtime for development & testing when MCP auth expires |
| Schema Extension | Add optional fields (`notebookId`, `artifactId`, `audioUrl`, `downloadUrl`, `topics`) | Slightly wider table schemas | 100% non-breaking additive migration; existing records remain intact |
| Async Polling | Fire-and-forget background worker + DB status updates (`PROCESSING` → `COMPLETED`/`FAILED`) | Next.js serverless route timeout risk if awaited | Async polling with 5-min timeout prevents HTTP response blocking |
| Neuroinclusive UI | Warm background (`#FAF6F0`), high-contrast (`#2B1E19`), 3D tactile buttons, zero raw emojis | Custom visual rules to enforce across all student routes | Reduces cognitive load for ADHD/neurodivergent learners |

## Data Flow

```
[Admin UI / Trigger] ──→ POST /api/notebooklm/generate ──→ Prisma (PENDING)
                                 │
                                 ▼
                     Async Background Pipeline
                                 │
                 ┌───────────────┴───────────────┐
                 ▼                               ▼
       NOTEBOOKLM_USE_MOCK=false       NOTEBOOKLM_USE_MOCK=true
      MCPClient.execNlm("nlm ...")        MockMCPClient
                 │                               │
                 ├─────── Error/Stale Auth ──────┤
                 │  (Transparent Mock Fallback)  │
                 ▼                               ▼
        pollUntilComplete()             Instant Mock Result
                 │                               │
                 └───────────────┬───────────────┘
                                 ▼
                   Prisma (COMPLETED + rawResponse)
                                 │
                        [Admin Review Queue]
                                 │
                       (Approve / Publish)
                                 │
                         [Student Views]
    /learn/audio  /learn/flashcards  /learn/quiz  /learn/mindmap
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `prisma/schema.prisma` | Modify | Add optional metadata fields to `GeneratedContent` and `AudioExercise` |
| `src/lib/notebooklm/mcp-client.ts` | Modify | Add `NOTEBOOKLM_USE_MOCK` flag check, fallback handler, polling helper |
| `src/lib/notebooklm/generate.ts` | Modify | Update generation service to populate new schema fields and handle fallback |
| `src/app/api/notebooklm/notebooks/route.ts` | Modify | Endpoint returning active notebooks & auth health status |
| `src/app/api/notebooklm/sources/route.ts` | Modify | Endpoint returning source count & list for selected notebook |
| `src/app/api/notebooklm/pending/route.ts` | Modify | Endpoint returning draft items awaiting admin approval |
| `src/app/admin/notebooklm/page.tsx` | Modify | Admin dashboard with notebook list, source counter, generator, draft queue |
| `src/app/learn/audio/[id]/page.tsx` | Modify | Audio player with transcript toggle & SlothMascot feedback |
| `src/app/learn/flashcards/[deckId]/page.tsx` | Modify | SM-2 spaced repetition card review with 3D tactile buttons |
| `src/app/learn/quiz/[id]/page.tsx` | Modify | Interactive quiz renderer with instant correction feedback |
| `src/app/learn/mindmap/[id]/page.tsx` | Modify | Collapsible visual mind map tree viewer |
| `src/components/ui/icons/SlothIcons.tsx` | Modify | Ensure full SVG icon set for zero-emoji neuroinclusive policy |

## Interfaces / Contracts

```typescript
// MCP Client Environment & Fallback Types
export interface MCPClientConfig {
  useMock: boolean;
  notebookId: string;
  pollIntervalMs: number; // 5000ms
  pollTimeoutMs: number;  // 300000ms (5 min)
}

// Enhanced GeneratedContent schema additions
export interface GeneratedContentSchemaAdditions {
  notebookId?: string | null;
  artifactId?: string | null;
  audioUrl?: string | null;
  downloadUrl?: string | null;
  topics: string[];
}

// Flashcard SM-2 Rating Payload
export type SM2Rating = "AGAIN" | "HARD" | "GOOD" | "EASY"; // 1, 2, 3, 5

export interface SM2ReviewResult {
  cardId: string;
  rating: SM2Rating;
  newEaseFactor: number;
  newInterval: number;
  newRepetitions: number;
  nextReviewAt: Date;
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `mcp-client.ts` fallback & rate-limiting | Vitest mocks for `execFile` returning 401/429/success + `NOTEBOOKLM_USE_MOCK` env toggle |
| Unit | SM-2 Spaced Repetition logic | Unit tests for rating calculations (Ease factor updates, interval increments) |
| Integration | `generate.ts` pipeline | Async generation trigger, DB status transition (`PENDING` → `PROCESSING` → `COMPLETED`), rawResponse persistence |
| Component | Neuroinclusive UI components | Test zero raw emojis, high-contrast color classes, keyboard focus traps |

## Threat Matrix

| Boundary | Minimum adversarial cases | Applicability | Design response | Planned RED tests |
|---|---|---|---|---|
| Documentation-like paths | `requirements.txt`, `CMakeLists.txt`, executable Markdown/MDX, `README.sh` | N/A | No documentation parsing or file execution | None |
| Git repository selection | `git -C`, relative paths, absolute paths | N/A | No Git command invocation | None |
| Commit state | staged, `commit -a`, empty index | N/A | No VCS operations | None |
| Push state | tracking branch, first push, explicit refspec | N/A | No remote push operations | None |
| PR commands | explicit `--head`, environment prefix, composed commands | N/A | No PR CLI interactions | None |
| Process integration | `nlm` binary CLI execution via `execFile` | Applicable | Strict argument array sanitization, no shell string execution (`shell: false`), path validation | Test input string containing shell injection characters (e.g. `; rm -rf /`, `$(whoami)`) to ensure `execFile` treats inputs strictly as CLI arguments |

## Migration / Rollout

No data migration required. Schema changes are strictly additive with optional/nullable fields (`notebookId`, `artifactId`, `audioUrl`, `downloadUrl`, `topics`). Database schema push (`prisma db push`) creates new columns cleanly without altering existing data.

## Open Questions

- None. Requirements, schema extensions, and fallback mechanics are fully defined.
