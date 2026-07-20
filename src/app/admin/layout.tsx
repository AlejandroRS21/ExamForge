// ExamForge — Admin Layout
// Sidebar navigation + role guard

import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

const sidebarLinks = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/questions", label: "Question Bank", icon: "📝" },
  { href: "/admin/questions/generate", label: "AI Questions", icon: "🤖" },
  { href: "/admin/generate", label: "Learning Content", icon: "🎯" },
  { href: "/admin/review", label: "Review Queue", icon: "✅" },
  { href: "/admin/parts", label: "Exam Parts", icon: "📋" },
  { href: "/admin/users", label: "Users", icon: "👥" },
  { href: "/admin/notebooklm", label: "NotebookLM", icon: "📓" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/login?callbackUrl=/admin");
  }

  const role = (session.user as any).role;
  if (role !== "ADMIN" && role !== "EDITOR") {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-muted/30 flex flex-col">
        <div className="p-6 border-b">
          <Link href="/admin" className="text-lg font-bold tracking-tight">
            ExamForge
          </Link>
          <p className="text-xs text-muted-foreground mt-1">Admin Panel</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {sidebarLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
              {session.user.name?.charAt(0) ?? "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {session.user.name ?? "Admin"}
              </p>
              <p className="text-xs text-muted-foreground capitalize">{role.toLowerCase()}</p>
            </div>
          </div>
          <Link
            href="/dashboard"
            className="mt-3 block text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-breathing">{children}</div>
      </main>
    </div>
  );
}
