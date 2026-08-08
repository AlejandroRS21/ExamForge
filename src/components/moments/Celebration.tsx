// ExamForge — Celebration Overlay Component
// SVG burst + copy card + aria-live. Respects prefers-reduced-motion.

"use client";

import { useEffect, useRef, useState } from "react";
import type { MomentEvent } from "@/lib/moments/types";

const EMOJI: Record<string, string> = {
  EXAM_COMPLETE: "🎓",
  BADGE_UNLOCKED: "🏅",
  STREAK_MILESTONE: "🔥",
  GOAL_ACHIEVED: "🎯",
  STREAK_RESET: "✨",
};

const LABEL: Record<string, string> = {
  EXAM_COMPLETE: "Exam Complete",
  BADGE_UNLOCKED: "Badge Unlocked",
  STREAK_MILESTONE: "Streak Milestone",
  GOAL_ACHIEVED: "Goal Achieved",
  STREAK_RESET: "Streak Reset",
};

const DISMISS_DELAY_MS = 3500;

interface CelebrationProps {
  event: MomentEvent;
  copy: string;
  onDismiss: () => void;
}

export function Celebration({ event, copy, onDismiss }: CelebrationProps) {
  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timerRef.current = setTimeout(onDismiss, DISMISS_DELAY_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [onDismiss]);

  // Keyboard dismiss (Escape)
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onDismiss();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onDismiss]);

  const emoji = EMOJI[event.type] ?? "⭐";
  const label = LABEL[event.type] ?? event.type;
  const announcement = copy ? `${label}: ${copy}` : label;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label={`Celebration: ${label}`}
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
    >
      {/* Background overlay */}
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm pointer-events-auto" />

      {/* Card */}
      <div
        className="relative z-10 max-w-xs w-full mx-4 rounded-2xl border bg-card shadow-xl p-6 text-center pointer-events-auto"
        role="status"
      >
        {/* SVG burst — hidden in reduced-motion (CSS rule in globals.css flattens to 0.01ms anyway) */}
        {!prefersReduced && (
          <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none" aria-hidden="true">
            <svg
              className="w-full h-full animate-spin"
              style={{ animationDuration: "8s" }}
              viewBox="0 0 200 200"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {Array.from({ length: 12 }).map((_, i) => {
                const angle = (i * 30 * Math.PI) / 180;
                const x1 = 100 + 60 * Math.cos(angle);
                const y1 = 100 + 60 * Math.sin(angle);
                const x2 = 100 + 90 * Math.cos(angle);
                const y2 = 100 + 90 * Math.sin(angle);
                const hue = (i * 30) % 360;
                return (
                  <line
                    key={i}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={`hsl(${hue} 70% 60%)`}
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="animate-pulse"
                    style={{ animationDelay: `${i * 80}ms` }}
                  />
                );
              })}
            </svg>
          </div>
        )}

        {/* Emoji */}
        <div className="text-5xl mb-3" aria-hidden="true">{emoji}</div>

        {/* Title */}
        <h2 className="text-lg font-bold mb-1">{label}</h2>

        {/* Reinforcement copy — shows when loaded */}
        {copy && (
          <p className="text-sm text-muted-foreground mb-4">{copy}</p>
        )}

        {/* Dismiss button */}
        <button
          onClick={onDismiss}
          className="mt-2 rounded-lg border border-border px-4 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
          aria-label="Dismiss celebration"
        >
          Dismiss
        </button>

        {/* Achievement detail if present */}
        {event.payload?.achievementLabel && (
          <p className="mt-2 text-xs font-medium text-primary">
            {event.payload.achievementLabel}
          </p>
        )}
      </div>

      {/* Screen-reader announcement — always fires, regardless of motion pref */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>
    </div>
  );
}
