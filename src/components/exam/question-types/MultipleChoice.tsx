// ExamForge — Multiple Choice Question Component
// Renders radio buttons for MC questions (Part 1)

"use client";

interface MultipleChoiceProps {
  questionId: string;
  options: string[] | Record<string, string>;
  selectedAnswer: string | null;
  onAnswer: (questionId: string, answer: string) => void;
  disabled?: boolean;
}

export function MultipleChoice({
  questionId,
  options,
  selectedAnswer,
  onAnswer,
  disabled = false,
}: MultipleChoiceProps) {
  // Normalize options to array of { value, label }
  const optionEntries: { value: string; label: string }[] = Array.isArray(options)
    ? options.map((opt, i) => ({ value: String.fromCharCode(65 + i), label: opt }))
    : Object.entries(options).map(([key, val]) => ({ value: key, label: val }));

  return (
    <div className="space-y-3">
      {optionEntries.map(({ value, label }) => (
        <label
          key={value}
          className={`flex items-start gap-3 rounded-lg border p-4 cursor-pointer transition-colors
            ${
              selectedAnswer === value
                ? "border-primary bg-primary/5"
                : "border-border hover:border-muted-foreground/30"
            }
            ${disabled ? "opacity-60 cursor-not-allowed" : ""}
          `}
        >
          <input
            type="radio"
            name={questionId}
            value={value}
            checked={selectedAnswer === value}
            onChange={() => onAnswer(questionId, value)}
            disabled={disabled}
            className="mt-0.5 h-4 w-4 text-primary"
          />
          <span className="text-sm leading-relaxed">{label}</span>
        </label>
      ))}
    </div>
  );
}
