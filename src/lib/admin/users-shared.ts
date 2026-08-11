// OpenSloth — Admin User Shared Types & Constants
// Client-safe — does NOT import Prisma

import type { Role } from "@/generated/prisma/client";

export interface UserListItem {
  id: string;
  name: string | null;
  email: string | null;
  role: Role;
  createdAt: Date;
  attemptCount: number;
  lastActiveAt: Date | null;
}

export const ROLE_OPTIONS: { value: Role; label: string; description: string }[] = [
  { value: "USER", label: "User", description: "Regular student — can take exams and view results" },
  { value: "EDITOR", label: "Editor", description: "Can manage questions and exam parts" },
  { value: "ADMIN", label: "Admin", description: "Full access — all management features" },
  { value: "VIEWER", label: "Viewer", description: "Read-only access to admin panel" },
];
