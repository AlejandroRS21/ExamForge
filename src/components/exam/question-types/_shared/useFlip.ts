// OpenSloth — CSS-only FLIP Animation Hook
// Measures DOM rect before/after state changes and applies CSS transforms.
// Respects prefers-reduced-motion by short-circuiting animation.

"use client";

import { useRef, useCallback } from "react";

export function useFlip() {
  const rectsRef = useRef<Map<string, DOMRect>>(new Map());

  const isReducedMotion = useCallback(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return false;
    }
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const register = useCallback((key: string, el: HTMLElement | null) => {
    if (!el) {
      rectsRef.current.delete(key);
      return;
    }
    rectsRef.current.set(key, el.getBoundingClientRect());
  }, []);

  const play = useCallback(
    (elements: Map<string, HTMLElement | null>) => {
      if (isReducedMotion()) return;

      elements.forEach((el, key) => {
        if (!el) return;
        const firstRect = rectsRef.current.get(key);
        if (!firstRect) return;

        const lastRect = el.getBoundingClientRect();
        const deltaX = firstRect.left - lastRect.left;
        const deltaY = firstRect.top - lastRect.top;

        if (deltaX === 0 && deltaY === 0) return;

        // Invert
        el.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        el.style.transition = "none";

        // Play
        requestAnimationFrame(() => {
          el.style.transform = "";
          el.style.transition = "transform 250ms cubic-bezier(0.2, 0, 0, 1)";
        });
      });
    },
    [isReducedMotion]
  );

  return { register, play, isReducedMotion };
}
