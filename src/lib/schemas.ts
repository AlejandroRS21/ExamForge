// ExamForge — Zod schemas for all API inputs
// Uses Zod v4 API

import { z } from "zod/v4";

// ─── Auth Schemas ───────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters").max(100),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100)
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain uppercase, lowercase, and a number",
      ),
    confirmPassword: z.string(),
    anonymousSessionId: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// ─── Exam Schemas ───────────────────────────────────────────────────────────

export const answerSubmitSchema = z.object({
  attemptId: z.string().cuid(),
  questionId: z.string().cuid(),
  givenAnswer: z.any().optional(), // Type-dependent, validated per type by exam engine; optional for in-progress saves
  timeSpentSeconds: z.number().int().min(0).max(3600).default(0),
});

// NotebookLM MCP Generation Schemas

export const generateContentSchema = z.object({
  sourceType: z.enum(["URL", "TEXT", "YOUTUBE"]),
  sourceData: z.string().min(1, "Source data is required"),
  contentType: z.enum(["QUIZ", "AUDIO", "FLASHCARDS", "MINDMAP"]),
  createdById: z.string().cuid(),
  notebookId: z.string().optional(),
});

export const heartbeatSchema = z.object({
  attemptId: z.string().cuid(),
});

export const completeAttemptSchema = z.object({
  attemptId: z.string().cuid(),
});

export const createAttemptSchema = z.object({
  type: z.enum(["PRACTICE", "MOCK"]),
  partId: z.string().cuid().optional(),
  anonymousSessionId: z.string().optional(),
});

export const writingEvaluateSchema = z.object({
  attemptId: z.string().cuid(),
  writingPromptId: z.string().cuid(),
  content: z.string().min(1, "Content is required").max(10000),
});

// ─── Admin Schemas ──────────────────────────────────────────────────────────

export const generateQuestionsSchema = z.object({
  examPartId: z.string().cuid(),
  count: z.number().int().min(1).max(25).default(10),
  difficulty: z.enum(["A", "B", "C"]).optional(),
});

export const approveQuestionsSchema = z.object({
  questionIds: z.array(z.string().cuid()).min(1),
  status: z.enum(["ACTIVE", "REJECTED"]),
});

export const updateQuestionSchema = z.object({
  id: z.string().cuid(),
  prompt: z.any().optional(),
  options: z.any().optional(),
  correctAnswer: z.any().optional(),
  explanation: z.string().optional(),
  difficulty: z.enum(["A", "B", "C"]).optional(),
  skillsTested: z.array(z.string()).optional(),
  status: z.enum(["DRAFT", "ACTIVE", "REJECTED"]).optional(),
});

export const upsertPartSchema = z.object({
  id: z.string().cuid().optional(),
  label: z.string().min(1),
  paper: z.enum(["R&UoE", "Writing"]),
  partNumber: z.number().int().min(1).max(7),
  description: z.string().optional(),
  timeMinutes: z.number().int().min(1).max(180),
  questionCount: z.number().int().min(0),
  sortOrder: z.number().int(),
});

export const updateUserRoleSchema = z.object({
  userId: z.string().cuid(),
  role: z.enum(["USER", "ADMIN", "EDITOR", "VIEWER"]),
});

// ─── Dashboard / Analytics Schemas ──────────────────────────────────────────

export const setGoalSchema = z.object({
  type: z.enum(["accuracy", "streak"]),
  target: z.number().int().min(1).max(100),
});

// ─── NotebookLM Schemas ─────────────────────────────────────────────────────

export const reviewContentSchema = z.object({
  action: z.enum(["APPROVE", "REJECT"]),
  reason: z.string().optional(),
});

export const audioSubmitSchema = z.object({
  answers: z.record(z.string(), z.string()),
});

export const flashcardReviewSchema = z.object({
  cardId: z.string().min(1),
  rating: z.number().int().min(0).max(3),
});

// ─── Types ──────────────────────────────────────────────────────────────────

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type AnswerSubmitInput = z.infer<typeof answerSubmitSchema>;
export type HeartbeatInput = z.infer<typeof heartbeatSchema>;
export type CompleteAttemptInput = z.infer<typeof completeAttemptSchema>;
export type CreateAttemptInput = z.infer<typeof createAttemptSchema>;
export type WritingEvaluateInput = z.infer<typeof writingEvaluateSchema>;
export type GenerateQuestionsInput = z.infer<typeof generateQuestionsSchema>;
export type ApproveQuestionsInput = z.infer<typeof approveQuestionsSchema>;
export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>;
export type UpsertPartInput = z.infer<typeof upsertPartSchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
export type SetGoalInput = z.infer<typeof setGoalSchema>;
export type GenerateContentInput = z.infer<typeof generateContentSchema>;
export type ReviewContentInput = z.infer<typeof reviewContentSchema>;
export type AudioSubmitInput = z.infer<typeof audioSubmitSchema>;
export type FlashcardReviewInput = z.infer<typeof flashcardReviewSchema>;
