// OpenSloth — Moment Engine Types
// Client-side event layer for dopamine-reward moments.

export type MomentEventType =
  | "EXAM_COMPLETE"
  | "BADGE_UNLOCKED"
  | "STREAK_MILESTONE"
  | "GOAL_ACHIEVED"
  | "STREAK_RESET";

export interface MomentEvent {
  type: MomentEventType;
  /** UUID for deduplication */
  id: string;
  payload?: {
    achievementLabel?: string;
    goalType?: string;
    streakDays?: number;
  };
}
