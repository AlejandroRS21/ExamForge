// OpenSloth — Moment Layer
// Subscribes to the bus; renders one Celebration at a time (FIFO queue).

"use client";

import { useEffect, useState } from "react";
import { subscribe } from "@/lib/moments/bus";
import { playChime } from "@/lib/moments/audio";
import { vibrate } from "@/lib/moments/haptics";
import { fetchCopy } from "@/lib/moments/copy";
import type { MomentEvent } from "@/lib/moments/types";
import { Celebration } from "./Celebration";

export function MomentLayer() {
  const [queue, setQueue] = useState<MomentEvent[]>([]);
  const [current, setCurrent] = useState<MomentEvent | null>(null);
  const [copy, setCopy] = useState<string>("");

  // Subscribe to bus
  useEffect(() => {
    return subscribe((evt) => {
      setQueue((prev) => [...prev, evt]);
    });
  }, []);

  // Dequeue
  useEffect(() => {
    if (!current && queue.length > 0) {
      const [next, ...rest] = queue;
      setQueue(rest);
      setCurrent(next);
      setCopy("");

      // Fire side-effects
      playChime(next.type);
      vibrate();

      // Fetch copy async; celebration shows immediately, copy fills in
      const ctrl = new AbortController();
      fetchCopy(next.type, ctrl.signal).then(setCopy).catch(() => {});
      return () => ctrl.abort();
    }
  }, [current, queue]);

  function dismiss() {
    setCurrent(null);
    setCopy("");
  }

  if (!current) return null;

  return (
    <Celebration
      event={current}
      copy={copy}
      onDismiss={dismiss}
    />
  );
}
