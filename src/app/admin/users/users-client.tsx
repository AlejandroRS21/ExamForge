// ExamForge — Admin Users Client Component
// T-804: User list with search, role management

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ROLE_OPTIONS } from "@/lib/admin/users-shared";
import type { UserListItem } from "@/lib/admin/users-shared";

interface UsersClientProps {
  users: UserListItem[];
  pagination: { page: number; totalPages: number; total: number };
  currentUserId: string;
}

export function UsersClient({ users, pagination, currentUserId }: UsersClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    router.push(`/admin/users?${params.toString()}`);
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setMessage(null);
    try {
      const res = await fetch("/api/admin/users/role", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });
      if (res.ok) {
        setMessage({ type: "success", text: "Role updated successfully" });
        router.refresh();
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.error ?? "Failed to update role" });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    }
  };

  return (
    <div className="space-y-4">
      {message && (
        <div
          className={`rounded-lg px-4 py-3 text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex h-9 w-80 rounded-lg border border-input bg-background px-3 py-1 text-sm"
        />
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Search
        </button>
      </form>

      {/* Table */}
      {users.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center">
          <p className="text-sm text-muted-foreground">No users found.</p>
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Attempts
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Last Active
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        {(user.name ?? user.email ?? "U").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{user.name ?? "Unnamed"}</p>
                        <p className="text-xs text-muted-foreground">{user.email ?? "—"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      disabled={user.id === currentUserId}
                      className={`flex h-8 rounded-lg border px-2 py-1 text-xs font-medium ${
                        user.id === currentUserId ? "opacity-50 cursor-not-allowed" : ""
                      } ${
                        user.role === "ADMIN"
                          ? "border-purple-200 bg-purple-50 text-purple-700"
                          : user.role === "EDITOR"
                            ? "border-blue-200 bg-blue-50 text-blue-700"
                            : "border-gray-200"
                      }`}
                    >
                      {ROLE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{user.attemptCount}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                    {user.lastActiveAt
                      ? new Date(user.lastActiveAt).toLocaleDateString()
                      : "Never"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} users)
          </p>
          <div className="flex gap-2">
            {pagination.page > 1 && (
              <a
                href={`/admin/users?page=${pagination.page - 1}`}
                className="inline-flex items-center justify-center rounded-lg border px-3 py-1.5 text-sm hover:bg-accent transition-colors"
              >
                Previous
              </a>
            )}
            {pagination.page < pagination.totalPages && (
              <a
                href={`/admin/users?page=${pagination.page + 1}`}
                className="inline-flex items-center justify-center rounded-lg border px-3 py-1.5 text-sm hover:bg-accent transition-colors"
              >
                Next
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
