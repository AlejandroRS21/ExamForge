"use client";

import React, { useEffect, useState } from "react";

export type MicroFeedbackType = "correct" | "incorrect" | "combo" | null;

export interface MicroFeedbackProps {
  type: MicroFeedbackType;
  comboCount?: number;
  onDismiss?: () => void;
  autoDismissMs?: number;
}

export function MicroFeedback({
  type,
  comboCount = 0,
  onDismiss,
  autoDismissMs = 800,
}: MicroFeedbackProps) {
  const [visible, setVisible] = useState<boolean>(Boolean(type));

  useEffect(() => {
    if (!type) {
      setVisible(false);
      return;
    }

    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      onDismiss?.();
    }, autoDismissMs);

    return () => clearTimeout(timer);
  }, [type, autoDismissMs, onDismiss]);

  if (!visible || !type) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
      {type === "correct" && (
        <div
          data-testid="micro-feedback-correct"
          className="flex animate-bounce flex-col items-center justify-center rounded-full bg-emerald-500/90 p-6 text-white shadow-lg backdrop-blur-sm"
        >
          <svg
            className="h-16 w-16 stroke-current stroke-[3]"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          {/* Particle dots */}
          <div className="absolute -inset-4 flex items-center justify-center">
            <span className="h-2 w-2 animate-ping rounded-full bg-emerald-300" />
          </div>
        </div>
      )}

      {type === "incorrect" && (
        <div
          data-testid="micro-feedback-incorrect"
          className="flex animate-shake flex-col items-center justify-center rounded-full bg-rose-500/90 p-6 text-white shadow-lg backdrop-blur-sm"
        >
          <svg
            className="h-16 w-16 stroke-current stroke-[3]"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      )}

      {type === "combo" && comboCount > 0 && (
        <div
          data-testid="micro-feedback-combo"
          className="flex animate-pulse scale-110 flex-col items-center justify-center rounded-2xl bg-amber-500/95 px-8 py-4 text-white shadow-xl backdrop-blur-sm"
        >
          <span className="text-3xl font-black tracking-wider drop-shadow-md">
            {comboCount}x Combo!
          </span>
        </div>
      )}
    </div>
  );
}

// ponytail: Basic CSS animation classes used. Upgrade to Framer Motion if complex physics required.
