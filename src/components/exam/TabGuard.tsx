// OpenSloth — Tab Guard Component
// EE-05: Multiple tabs → warn user on second tab open
// Detects if the same exam attempt is open in another tab via BroadcastChannel API

"use client";

import { useState, useEffect } from "react";

interface TabGuardProps {
  attemptId: string;
  /** Callback when a duplicate tab is detected */
  onDuplicateDetected?: () => void;
}

export function TabGuard({ attemptId, onDuplicateDetected }: TabGuardProps) {
  const [showWarning, setShowWarning] = useState(false);
  const [otherTabUrl, setOtherTabUrl] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("BroadcastChannel" in window)) return;

    const channel = new BroadcastChannel(`exam:${attemptId}`);

    // Send a ping to check for other tabs
    channel.postMessage({ type: "ping", url: window.location.href, timestamp: Date.now() });

    // Listen for pongs from other tabs
    const handleMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data || !data.type) return;

      switch (data.type) {
        case "ping":
          // Another tab pinged us — respond with pong
          channel.postMessage({ type: "pong", url: window.location.href, timestamp: Date.now() });
          break;

        case "pong":
          // Another tab is open
          setShowWarning(true);
          setOtherTabUrl(data.url);
          onDuplicateDetected?.();
          break;
      }
    };

    channel.addEventListener("message", handleMessage);

    // Cleanup
    return () => {
      channel.removeEventListener("message", handleMessage);
      channel.close();
    };
  }, [attemptId, onDuplicateDetected]);

  if (!showWarning) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-background/80 backdrop-blur-sm pt-20">
      <div className="max-w-md rounded-xl border bg-card p-6 shadow-lg text-center space-y-4">
        <div className="text-3xl">⚠️</div>
        <h2 className="text-lg font-bold">Exam Open in Another Tab</h2>
        <p className="text-sm text-muted-foreground">
          It looks like you have this exam open in another browser tab. Having the same
          exam in multiple tabs can cause conflicts with your answers.
        </p>
        {otherTabUrl && (
          <p className="text-xs text-muted-foreground">
            Other tab: {new URL(otherTabUrl).pathname}
          </p>
        )}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => {
              setShowWarning(false);
            }}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground
              hover:bg-primary/90 transition-colors"
          >
            Continue Here
          </button>
          <button
            onClick={() => {
              window.location.href = "/exams";
            }}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium
              hover:bg-muted transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
