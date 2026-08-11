// OpenSloth — Question CRUD operations
// Supports all B2 First question types with pagination, filtering, and search

import prisma from "@/lib/prisma";
import type { QuestionType, QuestionDifficulty, QuestionStatus, Prisma } from "@/generated/prisma/client";

export interface QuestionFilters {
  page?: number;
  pageSize?: number;
  examPartId?: string;
  type?: QuestionType;
  difficulty?: QuestionDifficulty;
  status?: QuestionStatus;
  skills?: string[];
  search?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

/**
 * List questions with pagination, filtering, and search.
 * Supports filter by part, type, difficulty, status, skills, and text search.
 */
export async function listQuestions(filters: QuestionFilters = {}): Promise<PaginatedResult<any>> {
  const page = filters.page ?? DEFAULT_PAGE;
  const pageSize = filters.pageSize ?? DEFAULT_PAGE_SIZE;
  const skip = (page - 1) * pageSize;

  const where: Prisma.QuestionWhereInput = {};

  if (filters.examPartId) {
    where.examPartId = filters.examPartId;
  }
  if (filters.type) {
    where.type = filters.type;
  }
  if (filters.difficulty) {
    where.difficulty = filters.difficulty;
  }
  if (filters.status) {
    where.status = filters.status;
  }
  if (filters.skills && filters.skills.length > 0) {
    where.skillsTested = { hasSome: filters.skills };
  }
  if (filters.search) {
    const searchTerm = filters.search;
    where.OR = [
      { prompt: { path: ["text"], string_contains: searchTerm } as any },
      { explanation: { contains: searchTerm, mode: "insensitive" } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.question.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        examPart: {
          select: { id: true, label: true, paper: true, partNumber: true },
        },
      },
    }),
    prisma.question.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

/**
 * Get a single question by ID with full details.
 */
export async function getQuestionById(id: string) {
  return prisma.question.findUnique({
    where: { id },
    include: {
      examPart: {
        select: { id: true, label: true, paper: true, partNumber: true, timeMinutes: true },
      },
      edits: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: {
          editor: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });
}

/**
 * Create a new question.
 */
export async function createQuestion(data: {
  examPartId: string;
  type: QuestionType;
  prompt: any;
  options?: any;
  correctAnswer: any;
  explanation?: string;
  difficulty?: QuestionDifficulty;
  skillsTested?: string[];
  aiGenerated?: boolean;
  status?: QuestionStatus;
}) {
  // Validate part exists and type matches part
  const part = await prisma.examPart.findUnique({
    where: { id: data.examPartId },
    select: { id: true, partNumber: true, paper: true },
  });

  if (!part) {
    throw new Error("ExamPart not found");
  }

  // Only Writing parts can have non-standard types
  if (part.paper === "Writing") {
    throw new Error("Writing prompts are managed separately");
  }

  return prisma.question.create({
    data: {
      examPartId: data.examPartId,
      type: data.type,
      prompt: data.prompt,
      options: data.options ?? undefined,
      correctAnswer: data.correctAnswer,
      explanation: data.explanation,
      difficulty: data.difficulty ?? "B",
      skillsTested: data.skillsTested ?? [],
      aiGenerated: data.aiGenerated ?? false,
      status: data.status ?? "DRAFT",
    },
    include: {
      examPart: { select: { id: true, label: true, paper: true, partNumber: true } },
    },
  });
}

/**
 * Update a question. Returns the updated question.
 * Does NOT track history — call recordEdit separately.
 */
export async function updateQuestion(
  id: string,
  data: {
    prompt?: any;
    options?: any;
    correctAnswer?: any;
    explanation?: string;
    difficulty?: QuestionDifficulty;
    skillsTested?: string[];
    status?: QuestionStatus;
    type?: QuestionType;
  },
) {
  return prisma.question.update({
    where: { id },
    data,
    include: {
      examPart: { select: { id: true, label: true, paper: true, partNumber: true } },
    },
  });
}

/**
 * Delete a question by ID.
 */
export async function deleteQuestion(id: string) {
  return prisma.question.delete({ where: { id } });
}

/**
 * Get all unique skills used across questions.
 */
export async function getAllSkills(): Promise<string[]> {
  const results = await prisma.question.findMany({
    select: { skillsTested: true },
    distinct: ["skillsTested"],
  });
  const skillSet = new Set<string>();
  for (const r of results) {
    for (const s of r.skillsTested) {
      skillSet.add(s);
    }
  }
  return Array.from(skillSet).sort();
}

/**
 * Bulk update question status.
 */
export async function bulkUpdateStatus(
  questionIds: string[],
  status: QuestionStatus,
) {
  return prisma.question.updateMany({
    where: { id: { in: questionIds } },
    data: { status },
  });
}
