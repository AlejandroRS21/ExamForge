// ExamForge — Open Cloze Input Component
// Text input for Cloze questions (Part 2)

"use client";

interface ClozeInputProps {
  questionId: string;
  selectedAnswer: string | null;
  onAnswer: (questionId: string, answer: string) => void;
  disabled?: boolean;
}

export function ClozeInput({
  questionId,
  selectedAnswer,
  onAnswer,
  disabled = false,
}: ClozeInputProps) {
  return (
    <div className="space-y-2">
      <input
        type="text"
        value={selectedAnswer ?? ""}
        onChange={(e) => onAnswer(questionId, e.target.value)}
        disabled={disabled}
        placeholder="Type your answer..."
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
