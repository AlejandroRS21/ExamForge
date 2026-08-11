// OpenSloth — SignOutButton (A-SH-2)
// Server component: the logout form posts a Server Action that calls the
// app's signOut (src/lib/auth.ts) and redirects to the landing page.
// Auth.js v5 server-side signOut invalidates the JWT session cookie.

import { signOut } from "@/lib/auth";

export async function signOutAction() {
  "use server";
  await signOut({ redirectTo: "/" });
}

export function SignOutButton() {
  return (
    <form action={signOutAction}>
      <button
        type="submit"
        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        Cerrar sesión
      </button>
    </form>
  );
}