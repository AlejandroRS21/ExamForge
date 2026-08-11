// OpenSloth — Practice flow helpers (pure)
// Shared by practice-client (finish summary) and the Writing practice panel
// (feedback display). Pure functions: no side effects, unit-testable.

/** Display-ready summary of a finish-route response (CompleteResult subset). */
export interface PracticeFinishSummary {
  correctCount: number;
  questionCount: number;
  answerCount: number;
  totalScore: number | null;
  isPartial: boolean;
}

/** Normalize the server finish payload into safe display numbers (SE-05: partial → null score). */
export function summarizePracticeResult(data: unknown): PracticeFinishSummary {
  const d = (data ?? {}) as Record<string, unknown>;
  return {
    correctCount: Number(d.correctCount ?? 0),
    questionCount: Number(d.questionCount ?? 0),
    answerCount: Number(d.answerCount ?? 0),
    totalScore: typeof d.totalScore === "number" ? d.totalScore : null,
    isPartial: Boolean(d.isPartial),
  };
}

/** Shape consumed by <WritingFeedback> after a writing evaluation. */
export interface WritingFeedbackSubmissionDisplay {
  id: string;
  writingPrompt: {
    id: string;
    prompt: string;
    wordCountMin: number;
    wordCountMax: number;
  };
  content: string;
  wordCount: number;
  scores: unknown;
  feedback: unknown;
}

/** Build a WritingFeedback submission from an evaluate-route response + editor state. */
export function buildWritingFeedbackSubmission(args: {
  submissionId: string;
  prompt: { id: string; prompt: string; wordCountMin: number; wordCountMax: number };
  content: string;
  scores: unknown;
  feedback: unknown;
}): WritingFeedbackSubmissionDisplay {
  const wordCount = args.content.trim() ? args.content.trim().split(/\s+/).length : 0;
  return {
    id: args.submissionId,
    writingPrompt: args.prompt,
    content: args.content,
    wordCount,
    scores: args.scores,
    feedback: args.feedback,
  };
}
