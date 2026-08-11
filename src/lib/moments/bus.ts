// OpenSloth — Moment Engine Pub/Sub Bus
// Tiny event bus: subscribe/publish. No external deps.

import type { MomentEvent } from "./types";

type Listener = (event: MomentEvent) => void;

const listeners: Set<Listener> = new Set();

/** Subscribe to moment events. Returns an unsubscribe function. */
export function subscribe(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Publish a moment event to all subscribers. Never throws. */
export function publish(event: MomentEvent): void {
  for (const fn of listeners) {
    try {
      fn(event);
    } catch (err) {
      console.warn("[MomentBus] Listener error swallowed:", err);
    }
  }
}
