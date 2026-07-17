// ExamForge — Key Word Transformation Component
// Text input for KT questions (Part 4) — shows the lead-in sentence and keyword

"use client";

interface KeyTransformProps {
  questionId: string;
  selectedAnswer: string | null;
  onAnswer: (questionId: string, answer: string) => void;
  disabled?: boolean;
  leadIn?: string; // The incomplete sentence
  keyword?: string; // The word that must be used
}

export function KeyTransform({
  questionId,
  selectedAnswer,
  onAnswer,
  disabled = false,
  leadIn,
  keyword,
}: KeyTransformProps) {
  return (
    <div className="space-y-3">
      {leadIn && (
        <div className="rounded-lg bg-muted/50 p-4 text-sm leading-relaxed border">
          {leadIn}
        </div>
      )}
      {keyword && (
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Keyword:</span>
          <span className="text-sm font-bold uppercase bg-primary/10 text-primary px-3 py-1 rounded-md border border-primary/20">
            {keyword}
          </span>
        </div>
      )}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">
          Complete the second sentence:
        </label>
        <textarea
          value={selectedAnswer ?? ""}
          onChange={(e) => onAnswer(questionId, e.target.value)}
          disabled={disabled}
          placeholder="Write the transformed sentence using the keyword..."
          rows={3}
          className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm
            placeholder:text-muted-foreground/50
            focus:outline-none focus:ring-2 focus:ring-ring focus:border-input
            disabled:opacity-60 disabled:cursor-not-allowed resize-none"
          autoComplete="off"
        />
      </div>
    </div>
  );
}
