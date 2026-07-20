// ExamForge — "Continue where you left off" CTA formatter
// Neuroinclusive UI adoption: pure logic extracted from the Dashboard's
// in-progress-attempt lookup (see resume.ts `getLatestInProgressAttempt`)
// so the display text can be unit tested without a database.

export interface ResumeCtaInput {
  attemptId: string;
  partId: string;
  partLabel: string;
  partDescription: string | null;
  /** Number of questions already answered in this attempt. */
  answeredCount: number;
  questionCount: number;
}

export interface ResumeCta {
  title: string;
  subtitle: string;
  resumeHref: string;
}

export function buildResumeCta(input: ResumeCtaInput): ResumeCta {
  const descriptionSegment = input.partDescription ? ` — ${input.partDescription}` : "";

  // Writing parts persist questionCount=0 (answers live in WritingSubmission,
  // not the Answer relation) — there is no "question X of Y" to report.
  if (input.questionCount <= 0) {
    return {
      title: "Continue where you left off",
      subtitle: `${input.partLabel}${descriptionSegment}`,
      resumeHref: `/exams/practice/${input.partId}`,
    };
  }

  const nextPosition = Math.min(input.answeredCount + 1, input.questionCount);

  return {
    title: "Continue where you left off",
    subtitle: `${input.partLabel}${descriptionSegment}, question ${nextPosition} of ${input.questionCount}`,
    resumeHref: `/exams/practice/${input.partId}`,
  };
}
