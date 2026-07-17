// ExamForge — Multiple Matching Component
// Unordered set selection for MM questions (Parts 6 & 7)
// User matches items to categories/options

"use client";

interface MatchOption {
  id: string;
  label: string;
}

interface MatchItem {
  id: string;
  text: string;
}

interface MatchItemsProps {
  questionId: string;
  items: MatchItem[];
  options: MatchOption[];
  selectedAnswer: Record<string, string> | null; // itemId → optionId
  onAnswer: (questionId: string, answer: Record<string, string>) => void;
  disabled?: boolean;
}

export function MatchItems({
  questionId,
  items,
  options,
  selectedAnswer,
  onAnswer,
  disabled = false,
}: MatchItemsProps) {
  const currentMatches = selectedAnswer ?? {};

  const handleMatch = (itemId: string, optionId: string) => {
    onAnswer(questionId, { ...currentMatches, [itemId]: optionId });
  };

  return (
    <div className="space-y-6">
      {/* Options legend */}
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <span
            key={opt.id}
            className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium"
          >
            <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">
              {opt.id}
            </span>
            {opt.label}
          </span>
        ))}
      </div>

      {/* Items to match */}
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-lg border p-4 space-y-3"
          >
            <p className="text-sm leading-relaxed">{item.text}</p>
            <div className="flex flex-wrap gap-2">
              {options.map((opt) => {
                const isSelected = currentMatches[item.id] === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleMatch(item.id, opt.id)}
                    disabled={disabled}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors
                      ${
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-muted/80 text-muted-foreground"
                      }
                      disabled:opacity-60 disabled:cursor-not-allowed
                    `}
                  >
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold
                        ${isSelected ? "bg-primary-foreground/20" : "bg-background"}
                      `}
                    >
                      {opt.id}
                    </span>
                    {opt.label}
                  </button>
                );
              })}
              {currentMatches[item.id] && (
                <button
                  onClick={() => {
                    const updated = { ...currentMatches };
                    delete updated[item.id];
                    onAnswer(questionId, updated);
                  }}
                  disabled={disabled}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-destructive hover:bg-destructive/10 transition-colors"
                >
                  ✕ Clear
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
