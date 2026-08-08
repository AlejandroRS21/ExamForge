// ExamForge — Answer Tile Primitive Component
// Tactile interactive tile for MC, GT, MM inputs with keyboard & animation support

"use client";

import React, { forwardRef } from "react";

export interface AnswerTileProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  disabled?: boolean;
  badge?: string;
  className?: string;
  children: React.ReactNode;
}

export const AnswerTile = forwardRef<HTMLButtonElement, AnswerTileProps>(
  ({ selected = false, disabled = false, badge, className = "", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        role="option"
        disabled={disabled}
        aria-selected={selected}
        aria-pressed={selected}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (props.onKeyDown) props.onKeyDown(e);
        }}
        className={`
          relative flex items-center gap-3 rounded-xl p-4 text-left transition-all duration-200 cursor-pointer
          border-2 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
          ${
            selected
              ? "border-primary bg-primary/10 shadow-sm text-foreground font-medium"
              : "border-border bg-card hover:border-primary/40 hover:bg-accent/40 text-foreground"
          }
          ${disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}
          ${className}
        `}
        {...props}
      >
        {badge && (
          <span
            className={`
              flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-colors
              ${
                selected
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground group-hover:bg-primary/20"
              }
            `}
          >
            {badge}
          </span>
        )}
        <div className="flex-1 text-sm leading-relaxed">{children}</div>
      </button>
    );
  }
);

AnswerTile.displayName = "AnswerTile";
