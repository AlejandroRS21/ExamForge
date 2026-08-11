"use client";

import React, { useEffect, useState } from "react";

export interface ComboBannerProps {
  comboCount: number;
  multiplier: number;
}

export function ComboBanner({ comboCount, multiplier }: ComboBannerProps) {
  const [scaleUp, setScaleUp] = useState(false);
  const [prevCount, setPrevCount] = useState(comboCount);

  useEffect(() => {
    if (comboCount > prevCount) {
      setScaleUp(true);
      const timer = setTimeout(() => setScaleUp(false), 300);
      return () => clearTimeout(timer);
    }
    setPrevCount(comboCount);
  }, [comboCount, prevCount]);

  if (comboCount <= 0) return null;

  return (
    <div
      data-testid="combo-banner"
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-slate-900 font-bold shadow-lg transition-transform duration-300 ${
        scaleUp ? "scale-110" : "scale-100"
      }`}
      style={{
        background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
      }}
    >
      <span className="text-xl">🔥</span>
      <span data-testid="combo-count" className="text-lg tracking-wide">
        {comboCount} COMBO
      </span>
      <span
        data-testid="combo-multiplier"
        className="ml-1 text-sm bg-slate-900/20 px-2 py-0.5 rounded-md text-slate-900 font-extrabold"
      >
        {multiplier}x XP
      </span>
    </div>
  );
}
