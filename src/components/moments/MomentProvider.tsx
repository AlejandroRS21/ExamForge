// OpenSloth — Moment Engine Provider
// Client boundary. Mounts MomentLayer and exposes useMoments().

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { publish, subscribe } from "@/lib/moments/bus";
import { isMuted, setMuted } from "@/lib/moments/mute";
import type { MomentEvent } from "@/lib/moments/types";
import { MomentLayer } from "./MomentLayer";

interface MomentsContextValue {
  emit: (event: MomentEvent) => void;
  muted: boolean;
  setMuted: (value: boolean) => void;
}

const MomentsContext = createContext<MomentsContextValue | null>(null);

export function MomentProvider({ children }: { children: React.ReactNode }) {
  const [muted, setMutedState] = useState(false);

  useEffect(() => {
    setMutedState(isMuted());
  }, []);

  const handleSetMuted = useCallback((value: boolean) => {
    setMuted(value);
    setMutedState(value);
  }, []);

  const emit = useCallback((event: MomentEvent) => {
    try {
      publish(event);
    } catch (err) {
      console.warn("[MomentProvider] emit error swallowed:", err);
    }
  }, []);

  return (
    <MomentsContext.Provider value={{ emit, muted, setMuted: handleSetMuted }}>
      {children}
      <MomentLayer />
    </MomentsContext.Provider>
  );
}

export function useMoments(): MomentsContextValue {
  const ctx = useContext(MomentsContext);
  if (!ctx) {
    throw new Error("useMoments must be used inside MomentProvider");
  }
  return ctx;
}

export { subscribe };
