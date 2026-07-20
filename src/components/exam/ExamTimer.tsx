// ExamForge — Server-Authoritative Timer Component
// EE-05: Timer SHALL continue counting if tab loses focus (server-authoritative)
// Shows local countdown from last known value, syncs via heartbeat every 30s
// Server drift > 5s → server time overrides client

"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface ExamTimerProps {
  attemptId: string;
  initialRemainingSeconds: number;
  initialVersion: number;
  onTimeout: () => void;
  onTick?: (remainingSeconds: number) => void;
}

export function ExamTimer({
  attemptId,
  initialRemainingSeconds,
  initialVersion,
  onTimeout,
  onTick,
}: ExamTimerProps) {
  const [remainingSeconds, setRemainingSeconds] = useState(initialRemainingSeconds);
  const [serverVersion, setServerVersion] = useState(initialVersion);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
  const tickRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutCalledRef = useRef(false);
  const remainingRef = useRef(remainingSeconds);

  // Keep ref in sync
  useEffect(() => {
    remainingRef.current = remainingSeconds;
  }, [remainingSeconds]);

  // Local countdown tick every second
  useEffect(() => {
    if (remainingSeconds <= 0 || isExpired) return;

    tickRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        const next = Math.max(0, prev - 1);
        if (next <= 0) {
          setIsExpired(true);
          if (tickRef.current) clearInterval(tickRef.current);
          if (heartbeatRef.current) clearInterval(heartbeatRef.current);
        }
        return next;
      });
    }, 1000);

    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [remainingSeconds, isExpired]);

  // Heartbeat sync every 30s
  useEffect(() => {
    const doHeartbeat = async () => {
      if (isExpired || timeoutCalledRef.current) return;

      setIsSyncing(true);
      try {
        const res = await fetch("/api/exams/heartbeat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ attemptId }),
        });

        if (!res.ok) {
          console.warn("[ExamTimer] Heartbeat failed:", res.status);
          return;
        }

        const data = await res.json();

        if (data.completed) {
          setIsExpired(true);
          timeoutCalledRef.current = true;
          onTimeout();
          return;
        }

        // Server drift override: if diff > 5s, use server time
        const localEstimate = remainingRef.current;
        const serverValue = data.remainingSeconds;
        const drift = Math.abs(localEstimate - serverValue);

        if (drift > 5) {
          setRemainingSeconds(serverValue);
        }

        setServerVersion(data.version);
      } catch (err) {
        console.error("[ExamTimer] Heartbeat error:", err);
      } finally {
        setIsSyncing(false);
      }
    };

    // Initial heartbeat
    doHeartbeat();

    // Schedule every 30s
    heartbeatRef.current = setInterval(doHeartbeat, 30000);

    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    };
  }, [attemptId, isExpired, onTimeout]);

  // Report remaining seconds to parent
  useEffect(() => {
    onTick?.(remainingSeconds);
  }, [remainingSeconds, onTick]);

  // Format as MM:SS
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const formatted = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  // Visual urgency states
  const isUrgent = remainingSeconds <= 300; // 5 minutes
  const isCritical = remainingSeconds <= 60; // 1 minute

  // TimerChip — matches the approved Pencil ExamPractice mockup (id EPS1o,
  // node "TimerChip"): a neutral `secondary` pill, never red/destructive at
  // any urgency level. Urgency is communicated via the "Nearly done"/"Time
  // running out" text labels only (still within the chip's neutral palette),
  // never via color. The critical-state pulse is intentionally the plain
  // Tailwind `animate-pulse` utility so the existing global
  // `@media (prefers-reduced-motion: reduce)` rule in globals.css (which
  // forces all animation/transition durations to 0.01ms) already disables
  // it for users who request reduced motion — no separate logic needed.
  return (
    <div
      className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-secondary-foreground"
      aria-live="polite"
      aria-label={`${minutes} minutes and ${seconds} seconds remaining`}
    >
      <span aria-hidden="true" className="text-sm leading-none">⏱</span>
      <span className={`font-mono text-sm font-medium tabular-nums ${isCritical ? "animate-pulse" : ""}`}>
        {formatted}
      </span>

      {isSyncing && (
        <span className="w-1.5 h-1.5 rounded-full bg-secondary-foreground/50" title="Syncing..." />
      )}

      {isUrgent && (
        <span className="text-[10px] font-medium uppercase tracking-wider text-secondary-foreground/80">
          {isCritical ? "Time running out" : "Nearly done"}
        </span>
      )}
    </div>
  );
}

/**
 * Hook to sync timer display with parent state.
 * Extracts remaining seconds for progress bar calculation.
 */
export function useTimerDisplay(remainingSeconds: number) {
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  return {
    formatted: `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
    minutes,
    seconds,
    isUrgent: remainingSeconds <= 300,
    isCritical: remainingSeconds <= 60,
    isExpired: remainingSeconds <= 0,
  };
}
