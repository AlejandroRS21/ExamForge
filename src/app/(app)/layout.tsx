// OpenSloth — App Shell Layout (A-SH-1/2)
// Route group (app)/: one source of truth for the authenticated chrome.
// Renders Navbar (brand + nav) and Header (user + SignOutButton) on every
// authed route; unauthenticated users are redirected to login. Landing
// (/page.tsx) and auth/ live at the root and stay bare. URLs unchanged —
// route groups do not affect the path.

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Navbar } from "@/components/layout/Navbar";
import { Header } from "@/components/layout/Header";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-3">
          <Navbar />
          <Header session={session} />
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}