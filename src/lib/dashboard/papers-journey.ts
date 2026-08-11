// OpenSloth — Papers Journey
// Neuroinclusive UI adoption: pure builder for the Dashboard "Readiness
// Journey" mockup's paper-node row. This app's schema (prisma/schema.prisma
// ExamPart.paper) only ever has "R&UoE" or "Writing" — there is no
// Listening/Speaking paper, so this never fabricates nodes beyond what
// `aggregateByPaper()` actually returns.

import type { PaperAccuracy } from "./paper-breakdown";

export interface PapersJourneyNode {
  paper: string;
  label: string;
  /** null (em-dash in the UI) when the paper has zero real attempts. */
  accuracy: number | null;
  isCurrent: boolean;
}

const PAPER_LABELS: Record<string, string> = {
  "R&UoE": "Reading & Use of English",
  Writing: "Writing",
};

/**
 * Builds one journey node per paper actually present in `paperBreakdown`
 * (the output of `aggregateByPaper()`). `currentPaper` is the paper of the
 * user's active resume-CTA target, or null when there is no resume CTA —
 * in which case no node is marked `isCurrent`.
 */
export function buildPapersJourney(
  paperBreakdown: PaperAccuracy[],
  currentPaper: string | null,
): PapersJourneyNode[] {
  return paperBreakdown.map((p) => ({
    paper: p.paper,
    label: PAPER_LABELS[p.paper] ?? p.paper,
    accuracy: p.attempts > 0 ? p.accuracy : null,
    isCurrent: currentPaper !== null && p.paper === currentPaper,
  }));
}
