// OpenSloth — Part Navigation Sidebar
// EE-02: Part-based navigation SHALL allow jumping between completed questions
// Shows all parts in the exam, indicating current, completed, and upcoming status

"use client";

import { cn } from "@/lib/utils/cn";

export interface PartNavItem {
  id: string;
  label: string;
  paper: string;
  partNumber: number;
  questionCount: number;
  answeredCount: number;
  isActive: boolean;
  isAccessible: boolean;
}

interface PartNavigationProps {
  parts: PartNavItem[];
  currentPartId: string;
  onNavigate: (partId: string) => void;
}

export function PartNavigation({
  parts,
  currentPartId,
  onNavigate,
}: PartNavigationProps) {
  // Group by paper
  const ruoeParts = parts.filter((p) => p.paper === "R&UoE");
  const writingParts = parts.filter((p) => p.paper === "Writing");

  const renderPart = (part: PartNavItem) => {
    const progress = part.questionCount > 0
      ? Math.round((part.answeredCount / part.questionCount) * 100)
      : 0;

    return (
      <button
        key={part.id}
        onClick={() => onNavigate(part.id)}
        disabled={!part.isAccessible}
        className={cn(
          "w-full text-left rounded-lg p-3 transition-colors border",
          part.isActive
            ? "bg-primary text-primary-foreground border-primary"
            : part.isAccessible
              ? "hover:bg-accent border-border hover:border-muted-foreground/30"
              : "opacity-40 cursor-not-allowed border-border",
        )}
        aria-current={part.isActive ? "true" : undefined}
        aria-label={`${part.label}, ${progress}% complete`}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold">{part.label}</span>
          <span className="text-[10px] opacity-70">
            {part.answeredCount}/{part.questionCount}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 rounded-full bg-background/30 overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-300",
              part.isActive ? "bg-primary-foreground/40" : "bg-primary/30",
            )}
            style={{ width: `${progress}%` }}
          />
        </div>

        {part.isActive && (
          <span className="text-[10px] mt-1 block opacity-80 font-medium">Current</span>
        )}
      </button>
    );
  };

  return (
    <aside className="w-64 flex-shrink-0 border-r bg-muted/20 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-sm font-bold tracking-tight">Exam Parts</h2>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          {ruoeParts.filter((p) => p.answeredCount > 0).length}/{ruoeParts.length} completed
        </p>
      </div>

      {/* Parts list */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-2" aria-label="Part navigation">
        {ruoeParts.length > 0 && (
          <div className="space-y-1">
            <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2">
              Reading & Use of English
            </h3>
            {ruoeParts.map(renderPart)}
          </div>
        )}

        {writingParts.length > 0 && (
          <div className="space-y-1 pt-3 border-t">
            <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2">
              Writing
            </h3>
            {writingParts.map(renderPart)}
          </div>
        )}
      </nav>
    </aside>
  );
}
