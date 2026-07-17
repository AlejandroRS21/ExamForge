// ExamForge — Gapped Text Component
// Ordered sequence matching for GT questions (Part 5)
// Shows sentences/paragraphs to insert into gaps, user selects order

"use client";

interface GapItem {
  id: string;
  text: string;
}

interface GapTextProps {
  questionId: string;
  items: GapItem[]; // The sentences to order
  selectedAnswer: string[] | null; // Ordered array of item IDs
  onAnswer: (questionId: string, answer: string[]) => void;
  disabled?: boolean;
}

export function GapText({
  questionId,
  items,
  selectedAnswer,
  onAnswer,
  disabled = false,
}: GapTextProps) {
  // Items not yet placed in the answer
  const placedIds = selectedAnswer ?? [];
  const available = items.filter((item) => !placedIds.includes(item.id));
  const placed = placedIds
    .map((id) => items.find((i) => i.id === id))
    .filter(Boolean) as GapItem[];

  const handlePlaceItem = (itemId: string) => {
    onAnswer(questionId, [...placedIds, itemId]);
  };

  const handleRemoveItem = (index: number) => {
    const newOrder = [...placedIds];
    newOrder.splice(index, 1);
    onAnswer(questionId, newOrder);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newOrder = [...placedIds];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    onAnswer(questionId, newOrder);
  };

  const handleMoveDown = (index: number) => {
    if (index >= placedIds.length - 1) return;
    const newOrder = [...placedIds];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    onAnswer(questionId, newOrder);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Available items */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Available Sentences
        </h4>
        {available.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">All sentences placed.</p>
        ) : (
          available.map((item) => (
            <button
              key={item.id}
              onClick={() => handlePlaceItem(item.id)}
              disabled={disabled}
              className="w-full text-left rounded-lg border border-dashed border-border bg-muted/30 p-3 text-sm
                hover:border-primary/50 hover:bg-primary/5 transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {item.text}
            </button>
          ))
        )}
      </div>

      {/* Ordered placement */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Your Order
        </h4>
        {placed.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            Click sentences from the left to build your order.
          </p>
        ) : (
          placed.map((item, index) => (
            <div
              key={item.id}
              className="flex items-start gap-2 rounded-lg border bg-background p-3"
            >
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                {index + 1}
              </span>
              <div className="flex-1 text-sm">{item.text}</div>
              <div className="flex flex-col gap-1 flex-shrink-0">
                <button
                  onClick={() => handleMoveUp(index)}
                  disabled={disabled || index === 0}
                  className="w-7 h-7 flex items-center justify-center rounded hover:bg-muted text-muted-foreground
                    disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Move up"
                >
                  ↑
                </button>
                <button
                  onClick={() => handleRemoveItem(index)}
                  disabled={disabled}
                  className="w-7 h-7 flex items-center justify-center rounded hover:bg-destructive/10 text-destructive
                    disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Remove"
                >
                  ✕
                </button>
                <button
                  onClick={() => handleMoveDown(index)}
                  disabled={disabled || index >= placed.length - 1}
                  className="w-7 h-7 flex items-center justify-center rounded hover:bg-muted text-muted-foreground
                    disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Move down"
                >
                  ↓
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
