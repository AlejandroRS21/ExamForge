// ExamForge — AudioPlayer Component
// Custom audio player with play/pause, seek progress bar, and speed control
// HTML5 Audio API — accessible keyboard controls (Space, arrows, Shift+arrows)

"use client";

import { useRef, useState, useEffect, useCallback } from "react";

interface AudioPlayerProps {
  /** Base64-encoded audio data */
  audioBase64: string | null;
  /** MIME type of the audio (e.g. "audio/mpeg") */
  mimeType: string;
  /** Optional duration in seconds for display before metadata loads */
  duration?: number | null;
  /** Optional className for styling wrapper */
  className?: string;
}

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5] as const;
const SEEK_STEP = 5; // seconds per arrow key press
const SEEK_STEP_LARGE = 10; // seconds per Shift+arrow press

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function AudioPlayer({
  audioBase64,
  mimeType,
  duration: propDuration,
  className = "",
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(propDuration ?? 0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // Create blob URL from base64 data on mount
  useEffect(() => {
    if (!audioBase64) return;

    try {
      const binaryStr = atob(audioBase64);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: mimeType });
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);

      return () => {
        URL.revokeObjectURL(url);
        setAudioUrl(null);
      };
    } catch {
      console.error("[AudioPlayer] Failed to decode audio data");
    }
  }, [audioBase64, mimeType]);

  // Attach audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => {
      if (isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
    };
  }, [audioUrl]);

  // Sync playback rate
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  // ─── Keyboard Controls ────────────────────────────────────────
  // Space = play/pause, Left/Right = seek ±5s, Shift+Left/Right = seek ±10s

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const audio = audioRef.current;
      if (!audio) return;

      // Only handle when focus is within the player
      if (!container.contains(e.target as Node)) return;

      switch (e.key) {
        case " ":
          e.preventDefault();
          if (isPlaying) {
            audio.pause();
          } else {
            audio.play().catch(() => {});
          }
          break;

        case "ArrowLeft":
          e.preventDefault();
          audio.currentTime = Math.max(0, audio.currentTime - (e.shiftKey ? SEEK_STEP_LARGE : SEEK_STEP));
          break;

        case "ArrowRight":
          e.preventDefault();
          audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + (e.shiftKey ? SEEK_STEP_LARGE : SEEK_STEP));
          break;
      }
    };

    container.addEventListener("keydown", handleKeyDown);
    return () => container.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => {
        // Autoplay may be blocked — user interaction starts it
      });
    }
  }, [isPlaying]);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const time = Number(e.target.value);
    audio.currentTime = time;
    setCurrentTime(time);
  }, []);

  const cycleSpeed = useCallback(() => {
    const currentIndex = SPEED_OPTIONS.indexOf(playbackRate as (typeof SPEED_OPTIONS)[number]);
    const nextIndex = (currentIndex + 1) % SPEED_OPTIONS.length;
    setPlaybackRate(SPEED_OPTIONS[nextIndex]);
  }, [playbackRate]);

  const rewind10 = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, audio.currentTime - 10);
  }, []);

  const forward10 = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 10);
  }, []);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!audioUrl) {
    return (
      <div className={`rounded-xl border bg-muted/10 p-8 text-center text-sm text-muted-foreground ${className}`} role="status" aria-label="Audio loading">
        <div className="space-y-2">
          <div className="h-8 w-8 mx-auto rounded-full bg-muted animate-pulse" aria-hidden="true" />
          <p>Audio content is being prepared.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`rounded-xl border bg-card p-4 space-y-3 ${className}`}
      role="region"
      aria-label="Audio player"
      tabIndex={-1}
    >
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="metadata"
        className="hidden"
        aria-hidden="true"
      />

      {/* Controls row */}
      <div className="flex items-center gap-3">
        {/* Play/Pause */}
        <button
          onClick={togglePlay}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={isPlaying ? "Pause" : "Play"}
          type="button"
        >
          {isPlaying ? (
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg className="h-5 w-5 ml-0.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <polygon points="6,4 20,12 6,20" />
            </svg>
          )}
        </button>

        {/* Progress bar */}
        <div className="flex-1 flex items-center gap-2">
          <span className="text-xs tabular-nums text-muted-foreground w-10 text-right">
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 h-1.5 appearance-none rounded-full bg-muted cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:h-3.5
              [&::-webkit-slider-thumb]:w-3.5
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-primary
              [&::-webkit-slider-thumb]:shadow-sm
              [&::-webkit-slider-thumb]:transition-transform
              [&::-webkit-slider-thumb]:hover:scale-125
              [&::-moz-range-thumb]:h-3.5
              [&::-moz-range-thumb]:w-3.5
              [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:bg-primary
              [&::-moz-range-thumb]:border-0
              [&::-moz-range-thumb]:shadow-sm"
            aria-label="Seek"
            aria-valuemin={0}
            aria-valuemax={duration}
            aria-valuenow={currentTime}
          />
          <span className="text-xs tabular-nums text-muted-foreground w-10">
            {formatTime(duration)}
          </span>
        </div>

        {/* Speed control */}
        <button
          onClick={cycleSpeed}
          className="flex h-8 w-12 items-center justify-center rounded-md border border-input bg-background text-xs font-medium tabular-nums hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`Playback speed: ${playbackRate}x`}
          title={`Speed: ${playbackRate}x`}
          type="button"
        >
          {playbackRate}x
        </button>
      </div>

      {/* Keyboard shortcut hints */}
      <div className="flex items-center gap-4 text-[10px] text-muted-foreground/60" aria-label="Keyboard shortcuts">
        <span><kbd className="rounded border bg-muted px-1 py-0.5 font-mono text-[10px]">Space</kbd> Play/Pause</span>
        <span><kbd className="rounded border bg-muted px-1 py-0.5 font-mono text-[10px]">←</kbd> <kbd className="rounded border bg-muted px-1 py-0.5 font-mono text-[10px]">→</kbd> Seek ±5s</span>
        <span><kbd className="rounded border bg-muted px-1 py-0.5 font-mono text-[10px]">Shift</kbd>+<kbd className="rounded border bg-muted px-1 py-0.5 font-mono text-[10px]">←</kbd> <kbd className="rounded border bg-muted px-1 py-0.5 font-mono text-[10px]">→</kbd> Seek ±10s</span>
        <button
          onClick={rewind10}
          className="hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Rewind 10 seconds"
          type="button"
        >
          -10s
        </button>
        <button
          onClick={forward10}
          className="hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Forward 10 seconds"
          type="button"
        >
          +10s
        </button>
      </div>
    </div>
  );
}
