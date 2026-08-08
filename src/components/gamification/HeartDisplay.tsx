"use client";

import React, { useEffect, useState } from "react";

export interface HeartDisplayProps {
  hearts: number;
  maxHearts: number;
  nextRegenInSeconds?: number;
  isCasual?: boolean;
}

export function HeartDisplay({
  hearts,
  maxHearts,
  nextRegenInSeconds = 0,
  isCasual = false,
}: HeartDisplayProps) {
  const [animateLoss, setAnimateLoss] = useState(false);
  const [prevHearts, setPrevHearts] = useState(hearts);

  useEffect(() => {
    if (hearts < prevHearts) {
      setAnimateLoss(true);
      const timer = setTimeout(() => setAnimateLoss(false), 600);
      return () => clearTimeout(timer);
    }
    setPrevHearts(hearts);
  }, [hearts, prevHearts]);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 backdrop-blur-sm transition-all ${
        animateLoss ? "animate-bounce border-red-500/50 bg-red-950/30" : ""
      }`}
    >
      <div className="flex items-center gap-1">
        {Array.from({ length: maxHearts }).map((_, i) => {
          const filled = isCasual || i < hearts;
          return (
            <span
              key={i}
              data-testid="heart-icon"
              className={`text-lg transition-transform duration-300 ${
                filled
                  ? "text-red-500 scale-100 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                  : "text-slate-600 scale-90"
              } ${animateLoss && i === hearts ? "scale-125 text-red-600" : ""}`}
            >
              ♥
            </span>
          );
        })}
      </div>

      <span
        data-testid="heart-count"
        className="font-bold text-sm text-slate-100 min-w-[1ch] text-center"
      >
        {isCasual ? "∞" : hearts}
      </span>

      {!isCasual && hearts < maxHearts && nextRegenInSeconds > 0 && (
        <span
          data-testid="regen-timer"
          className="text-xs font-mono text-slate-400 border-l border-slate-700 pl-2 ml-1"
        >
          {formatTimer(nextRegenInSeconds)}
        </span>
      )}
    </div>
  );
}
