// ExamForge — Admin Users Management
// T-804: List users, view activity, admin role assignment

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { listUsers } from "@/lib/admin/users";
import type { UserListItem } from "@/lib/admin/users-shared";
import { UsersClient } from "./users-client";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    role?: string;
  }>;
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");
  const role = session.user.role;
  if (role !== "ADMIN") redirect("/dashboard");

  const params = await searchParams;

  const result = await listUsers({
    page: parseInt(params.page ?? "1"),
    search: params.search || undefined,
    role: (params.role as any) || undefined,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground mt-1">
          View and manage users, assign roles.
        </p>
      </div>

      <UsersClient
        users={result.items}
        pagination={{
          page: result.page,
          totalPages: result.totalPages,
          total: result.total,
        }}
        currentUserId={session.user.id!}
      />
    </div>
  );
}
