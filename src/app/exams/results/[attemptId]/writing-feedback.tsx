// ExamForge — Writing Feedback Component
// Displays rubric scores and AI-generated feedback for writing submissions

"use client";

import { getWritingRubricCriteria } from "@/lib/scoring";

// Accept Prisma JSON types via the interface
interface WritingSubmissionDisplay {
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

interface WritingFeedbackProps {
  submissions: WritingSubmissionDisplay[];
}

export function WritingFeedback({ submissions }: WritingFeedbackProps) {
  if (submissions.length === 0) return null;

  const criteria = getWritingRubricCriteria();

  return (
    <div className="space-y-6">
      {submissions.map((submission) => {
        const scores = (submission.scores as Record<string, number>) ?? {};
        const feedback = (submission.feedback as Record<string, string>) ?? {};
        const hasFeedback = Object.keys(feedback).length > 0;

        return (
          <div key={submission.id} className="rounded-xl border bg-card p-6 space-y-4">
            {/* Prompt */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-1">Task</h3>
              <p className="text-sm leading-relaxed">{submission.writingPrompt.prompt}</p>
            </div>

            {/* Word count */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>
                Word count: <strong>{submission.wordCount}</strong>
              </span>
              <span>
                Target: {submission.writingPrompt.wordCountMin}–{submission.writingPrompt.wordCountMax}
              </span>
              {submission.wordCount < submission.writingPrompt.wordCountMin && (
                <span className="text-amber-500 font-medium">Under word limit</span>
              )}
              {submission.wordCount > submission.writingPrompt.wordCountMax && (
                <span className="text-amber-500 font-medium">Over word limit</span>
              )}
            </div>

            {/* Rubric scores */}
            {hasFeedback && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold">Rubric Assessment</h4>
                {criteria.map((criterion) => {
                  const score = scores[criterion.key] ?? 0;
                  const feedbackText = feedback[criterion.key] ?? "";

                  return (
                    <div key={criterion.key} className="rounded-lg border p-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium">{criterion.label}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            {criterion.description}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {[0, 1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className={`w-2.5 h-2.5 rounded-full ${
                                score > star ? "bg-primary" : "bg-muted-foreground/20"
                              }`}
                            />
                          ))}
                          <span className="ml-2 text-sm font-semibold w-4">{score}</span>
                        </div>
                      </div>
                      {feedbackText && (
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {feedbackText}
                        </p>
                      )}
                    </div>
                  );
                })}

                {/* Total writing score */}
                {(() => {
                  const total = Object.values(scores).reduce((a: number, b: number) => a + b, 0);
                  const avg = total / criteria.length;
                  return (
                    <div className="rounded-lg bg-muted/30 p-3 flex items-center justify-between">
                      <span className="text-sm font-medium">Total Writing Score</span>
                      <span className="text-sm font-bold">
                        {total}/20 ({avg.toFixed(1)} average)
                      </span>
                    </div>
                  );
                })()}

                {/* Overall feedback */}
                {feedback.overall && (
                  <div className="rounded-lg bg-primary/5 border border-primary/10 p-4">
                    <p className="text-sm leading-relaxed">{feedback.overall}</p>
                  </div>
                )}
              </div>
            )}

            {/* No evaluation yet */}
            {!hasFeedback && (
              <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                Writing evaluation will appear once reviewed.
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
