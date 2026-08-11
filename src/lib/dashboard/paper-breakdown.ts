// OpenSloth — Paper-Level Breakdown
// Neuroinclusive UI adoption: the Dashboard "Progress by paper" chart groups
// the existing per-part `partBreakdown` data by its real `paper` field
// (e.g. "R&UoE", "Writing" — see prisma/schema.prisma ExamPart.paper) rather
// than fabricating CEFR papers (Reading/Use of English/Listening/Speaking)
// that this app's data model does not currently implement.

import type { PartBreakdown } from "./stats";

export interface PaperAccuracy {
  paper: string;
  /** Average accuracy across parts of this paper that have >=1 attempt. 0 if none attempted. */
  accuracy: number;
  /** Total attempts summed across all parts of this paper. */
  attempts: number;
  isWeak: boolean;
}

/**
 * A paper is flagged weak when its attempted-parts average accuracy falls
 * below this threshold — mirrors the per-part weak-area threshold already
 * used in `getDashboardStats()` (see stats.ts `weakAreas` filter, < 60%).
 */
export const PAPER_WEAK_THRESHOLD = 60;

/**
 * Groups per-part accuracy data by `paper` and averages accuracy across the
 * parts that have real attempts. Papers are returned in first-seen order —
 * only papers actually present in `partBreakdown` are included, so the chart
 * never renders a paper this app has no exam parts for.
 */
export function aggregateByPaper(partBreakdown: PartBreakdown[]): PaperAccuracy[] {
  const order: string[] = [];
  const groups = new Map<string, PartBreakdown[]>();

  for (const part of partBreakdown) {
    if (!groups.has(part.paper)) {
      groups.set(part.paper, []);
      order.push(part.paper);
    }
    groups.get(part.paper)!.push(part);
  }

  return order.map((paper) => {
    const parts = groups.get(paper)!;
    const attempted = parts.filter((p) => p.attempts > 0);
    const attempts = parts.reduce((sum, p) => sum + p.attempts, 0);
    const accuracy =
      attempted.length > 0
        ? Math.round((attempted.reduce((sum, p) => sum + p.accuracy, 0) / attempted.length) * 10) / 10
        : 0;

    return {
      paper,
      accuracy,
      attempts,
      isWeak: attempted.length > 0 && accuracy < PAPER_WEAK_THRESHOLD,
    };
  });
}
