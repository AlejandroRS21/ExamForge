// OpenSloth — App Shell Header (A-SH-1)
// Right side of the shared app-shell bar: shows the signed-in user and
// always renders SignOutButton so logout works from every authenticated
// page (A-SH-2 cross-area). Server component; session passed from the
// (app)/layout guard to avoid a second auth() call per request.

import { SignOutButton } from "@/components/layout/SignOutButton";

interface HeaderProps {
  session: {
    user?: { name?: string | null } | null;
  } | null;
}

export function Header({ session }: HeaderProps) {
  const name = session?.user?.name ?? "Estudiante";
  return (
    <div className="flex items-center gap-3">
      <span className="hidden sm:inline text-sm text-muted-foreground">
        {name}
      </span>
      <SignOutButton />
    </div>
  );
}