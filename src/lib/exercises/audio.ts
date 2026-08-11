// OpenSloth — Audio Exercise Service
// Queries, scoring, and progress tracking for audio-based listening exercises

import prisma from "@/lib/prisma";
import type { AudioExercise, ContentStatus } from "@/generated/prisma/client";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface AudioExerciseSummary {
  id: string;
  title: string;
  mimeType: string;
  duration: number | null;
  status: ContentStatus;
  attemptCount: number;
  createdAt: Date;
}

export interface AudioExerciseDetail extends AudioExerciseSummary {
  transcript: string | null;
  questions: AudioQuestion[] | null;
  audioData: Buffer | null;
}

export interface AudioQuestion {
  id: string;
  type: "MC" | "TF";
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface AudioQuestions {
  items: AudioQuestion[];
}

export interface SubmitResult {
  exerciseId: string;
  totalQuestions: number;
  correctAnswers: number;
  score: number; // 0-100 percentage
  details: Array<{
    questionId: string;
    correct: boolean;
    correctAnswer: string;
  }>;
}

// ─── Queries ────────────────────────────────────────────────────────────────

/**
 * List all PUBLISHED audio exercises (metadata only — no blob data).
 * Students see only published content; admins see everything via GeneratedContent review flow.
 */
export async function listAudioExercises(): Promise<AudioExerciseSummary[]> {
  const exercises = await prisma.audioExercise.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      mimeType: true,
      duration: true,
      status: true,
      attemptCount: true,
      createdAt: true,
    },
  });

  return exercises.map((ex) => ({
    ...ex,
    status: ex.status as ContentStatus,
  }));
}

/**
 * Get a single audio exercise with full data including blob and questions.
 */
export async function getAudioExercise(id: string): Promise<AudioExerciseDetail | null> {
  const exercise = await prisma.audioExercise.findUnique({
    where: { id },
  });

  if (!exercise) return null;

  // Only serve published exercises to students
  if (exercise.status !== "PUBLISHED") return null;

  return {
    id: exercise.id,
    title: exercise.title,
    mimeType: exercise.mimeType,
    duration: exercise.duration,
    status: exercise.status as ContentStatus,
    attemptCount: exercise.attemptCount,
    createdAt: exercise.createdAt,
    transcript: exercise.transcript ?? null,
    questions: exercise.questions as unknown as AudioQuestion[] | null,
    audioData: exercise.audioData ? Buffer.from(exercise.audioData) : null,
  };
}

/**
 * Validate that an exercise exists and is published.
 */
export async function getPublishedExercise(id: string): Promise<{ exists: boolean; title?: string }> {
  const exercise = await prisma.audioExercise.findUnique({
    where: { id },
    select: { id: true, title: true, status: true },
  });

  if (!exercise || exercise.status !== "PUBLISHED") {
    return { exists: false };
  }

  return { exists: true, title: exercise.title };
}

// ─── Scoring ────────────────────────────────────────────────────────────────

/**
 * Score student answers against the stored questions JSON.
 *
 * Questions format expected on AudioExercise.questions:
 * ```json
 * {
 *   "items": [
 *     { "id": "q1", "type": "MC", "question": "...", "options": [...], "correctAnswer": "0" },
 *     { "id": "q2", "type": "TF", "question": "...", "options": ["True", "False"], "correctAnswer": "0" }
 *   ]
 * }
 * ```
 *
 * Student answers format: Record<string, string> where key is question id and value is selected option index/string.
 */
export function scoreAnswers(
  questions: AudioQuestions | null,
  studentAnswers: Record<string, string>,
): SubmitResult {
  const items = questions?.items ?? [];
  const details: SubmitResult["details"] = [];

  for (const q of items) {
    const studentAnswer = studentAnswers[q.id]?.trim() ?? "";
    // Normalize: treat "0", "false", "FALSE" etc. consistently by trimming and lowercasing
    const isCorrect = studentAnswer.toLowerCase() === q.correctAnswer.toLowerCase();
    details.push({
      questionId: q.id,
      correct: isCorrect,
      correctAnswer: q.correctAnswer,
    });
  }

  const totalQuestions = items.length;
  const correctAnswers = details.filter((d) => d.correct).length;
  const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

  return {
    exerciseId: "",
    totalQuestions,
    correctAnswers,
    score,
    details,
  };
}

/**
 * Submit answers for an audio exercise, store attempt, and return scoring result.
 * Increments the attempt counter on the exercise.
 */
export async function submitAnswers(
  exerciseId: string,
  studentAnswers: Record<string, string>,
): Promise<SubmitResult & { attemptCount: number }> {
  const exercise = await prisma.audioExercise.findUnique({
    where: { id: exerciseId },
    select: {
      id: true,
      questions: true,
      attemptCount: true,
      status: true,
    },
  });

  if (!exercise || exercise.status !== "PUBLISHED") {
    throw new Error("Audio exercise not found or not published");
  }

  const questions = exercise.questions as unknown as AudioQuestions | null;
  const result = scoreAnswers(questions, studentAnswers);
  result.exerciseId = exerciseId;

  // Increment attempt count
  const updated = await prisma.audioExercise.update({
    where: { id: exerciseId },
    data: { attemptCount: { increment: 1 } },
    select: { attemptCount: true },
  });

  return {
    ...result,
    attemptCount: updated.attemptCount,
  };
}

// ─── Progress Tracking ──────────────────────────────────────────────────────

/**
 * Get the user's listening exercise statistics (aggregate).
 * Queries total completed exercises and average score across all exercises with data.
 *
 * Note: For Phase 3, simple attempt counting is used.
 * Full per-user progress via ExamAttempt or a dedicated progress model
 * is planned for a later phase.
 */
export async function getUserProgress(_userId: string) {
  // Placeholder for future user-level progress tracking
  // Phase 3 uses exercise-level attemptCount only
  return {
    totalExercisesAttempted: 0,
    averageScore: 0,
    exercisesCompleted: 0,
  };
}
