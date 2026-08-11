// OpenSloth — In-Context Frame Component
// Renders question prompt text with clean inline embedded answer inputs and stripped residual underscores

"use client";

import React from "react";

interface ContextFrameProps {
  promptText?: string;
  hint?: string;
  readingPassage?: string;
  children: React.ReactNode;
}

/**
 * Clean MC options embedded in prompt text (e.g., "Sentence text.\n\nA) opt1 B) opt2...")
 */
function sanitizePromptText(text: string): string {
  if (!text) return "";
  // Strip trailing option text starting with A) or A.
  return text.split(/\n\s*[A-D][\)\.]/)[0].trim();
}

export function ContextFrame({
  promptText,
  hint,
  readingPassage,
  children,
}: ContextFrameProps) {
  const cleanText = sanitizePromptText(promptText ?? "");
  const hasBlankPlaceholder = /__+/.test(cleanText);

  return (
    <div className="space-y-4 w-full">
      {/* Optional Reading Passage */}
      {readingPassage && (
        <div className="rounded-xl border border-border bg-card p-5 text-sm leading-relaxed text-foreground shadow-sm">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Reading Context
          </h4>
          <p className="whitespace-pre-line">{readingPassage}</p>
        </div>
      )}

      {/* Main Question Card with In-Context Sentence/Input */}
      <div className="rounded-2xl border-2 border-border bg-card p-6 shadow-sm space-y-4">
        {cleanText && (
          <div className="text-base font-medium leading-relaxed text-foreground">
            {hasBlankPlaceholder ? (
              // Replace any sequence of 2+ underscores with the inline input slot cleanly
              <div className="flex flex-wrap items-center gap-2 text-base leading-loose">
                {cleanText.split(/__+/).map((part, index, array) => (
                  <React.Fragment key={index}>
                    <span>{part}</span>
                    {index < array.length - 1 && (
                      <div className="inline-flex items-center mx-1 my-1">
                        {children}
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            ) : (
              // Standard prompt text heading
              <p className="text-base text-foreground font-semibold mb-3">
                {cleanText}
              </p>
            )}
          </div>
        )}

        {/* If prompt does NOT contain '___', render children below */}
        {!hasBlankPlaceholder && (
          <div className="pt-1">{children}</div>
        )}

        {/* Hint collapsible */}
        {hint && (
          <details className="text-xs text-muted-foreground border-t border-border pt-3 mt-2">
            <summary className="cursor-pointer font-medium hover:text-foreground transition-colors inline-flex items-center gap-1.5">
              💡 Need a hint?
            </summary>
            <p className="mt-2 p-3 rounded-xl bg-info/10 text-info border border-info/20 text-xs leading-relaxed">
              {hint}
            </p>
          </details>
        )}
      </div>
    </div>
  );
}
