// ExamForge — Word Formation Input Component
// Text input for Word Formation questions (Part 3)

"use client";

interface WordFormProps {
  questionId: string;
  selectedAnswer: string | null;
  onAnswer: (questionId: string, answer: string) => void;
  disabled?: boolean;
  stemWord?: string; // The base word to transform
}

export function WordForm({
  questionId,
  selectedAnswer,
  onAnswer,
  disabled = false,
  stemWord,
}: WordFormProps) {
  return (
    <div className="space-y-2">
      {stemWord && (
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-medium text-muted-foreground">Stem word:</span>
          <span className="text-sm font-semibold bg-muted px-3 py-1 rounded-md">{stemWord}</span>
        </div>
      )}
      <input
        type="text"
        value={selectedAnswer ?? ""}
        onChange={(e) => onAnswer(questionId, e.target.value)}
        disabled={disabled}
        placeholder="Write the correct form..."
        className="w-full max-w-md rounded-lg border border-input bg-background px-4 py-2.5 text-sm
          placeholder:text-muted-foreground/50
          focus:outline-none focus:ring-2 focus:ring-ring focus:border-input
          disabled:opacity-60 disabled:cursor-not-allowed"
        autoComplete="off"
        spellCheck={false}
      />
    </div>
  );
}
