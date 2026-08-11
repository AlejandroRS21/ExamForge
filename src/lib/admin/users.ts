// OpenSloth — Admin User Management
// T-804: List users, view activity, admin role assignment

import prisma from "@/lib/prisma";
import type { Role } from "@/generated/prisma/client";
import type { UserListItem } from "@/lib/admin/users-shared";

export interface UserActivitySummary {
  totalAttempts: number;
  completedAttempts: number;
  totalCorrect: number;
  totalQuestions: number;
  streak: number;
  achievementCount: number;
}

/**
 * List users with pagination and search.
 */
export async function listUsers(filters: {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: Role;
}): Promise<{ items: UserListItem[]; total: number; page: number; totalPages: number }> {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 20;
  const skip = (page - 1) * pageSize;

  const where: any = {};
  if (filters.role) where.role = filters.role;
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { email: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        examAttempts: {
          select: { id: true, status: true, completedAt: true },
          orderBy: { completedAt: "desc" },
          take: 1,
        },
        _count: { select: { examAttempts: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    items: users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
      attemptCount: u._count.examAttempts,
      lastActiveAt: u.examAttempts[0]?.completedAt ?? null,
    })),
    total,
    page,
    totalPages: Math.ceil(total / pageSize),
  };
}

/**
 * Get a user's activity summary.
 */
export async function getUserActivity(userId: string): Promise<UserActivitySummary> {
  const [attempts, streak, achievementCount] = await Promise.all([
    prisma.examAttempt.findMany({
      where: { userId, status: "COMPLETED" },
      select: { correctCount: true, questionCount: true },
    }),
    prisma.dailyStreak.findUnique({
      where: { userId },
      select: { currentStreak: true },
    }),
    prisma.achievement.count({ where: { userId } }),
  ]);

  return {
    totalAttempts: attempts.length,
    completedAttempts: attempts.length,
    totalCorrect: attempts.reduce((s, a) => s + a.correctCount, 0),
    totalQuestions: attempts.reduce((s, a) => s + a.questionCount, 0),
    streak: streak?.currentStreak ?? 0,
    achievementCount,
  };
}

/**
 * Update a user's role.
 */
export async function updateUserRole(userId: string, role: Role, updatedByUserId: string) {
  // Prevent self-demotion
  if (userId === updatedByUserId) {
    throw new Error("Cannot change your own role");
  }

  return prisma.user.update({
    where: { id: userId },
    data: { role },
    select: { id: true, name: true, email: true, role: true },
  });
}


