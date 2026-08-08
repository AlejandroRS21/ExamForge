import { useState, useCallback, useEffect } from "react";
import {
  playCorrect,
  playIncorrect,
  playCombo,
  playHeartLost,
  isMuted as checkIsMuted,
  setMuted as updateMuted,
} from "@/lib/audio/sound-fx";

export function useMicroFeedback() {
  const [muted, setMutedState] = useState<boolean>(false);

  useEffect(() => {
    setMutedState(checkIsMuted());
  }, []);

  const toggleMute = useCallback(() => {
    const next = !checkIsMuted();
    updateMuted(next);
    setMutedState(next);
  }, []);

  const triggerCorrect = useCallback(() => {
    playCorrect();
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([30, 50, 30]);
    }
  }, []);

  const triggerIncorrect = useCallback(() => {
    playIncorrect();
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
  }, []);

  const triggerCombo = useCallback((count: number) => {
    playCombo(count);
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([40, 40, 40]);
    }
  }, []);

  const triggerHeartLost = useCallback(() => {
    playHeartLost();
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([150]);
    }
  }, []);

  return {
    muted,
    toggleMute,
    triggerCorrect,
    triggerIncorrect,
    triggerCombo,
    triggerHeartLost,
  };
}

// ponytail: Basic vibrate patterns used. Add web haptics API integration when browser support improves.
