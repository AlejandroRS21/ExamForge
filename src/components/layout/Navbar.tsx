// OpenSloth — App Shell Navbar (A-SH-1)
// Shared global nav for every authenticated area (route group (app)/):
// brand + Spanish links. Server component — purely presentational.
// Landing (/page.tsx) and auth/ stay bare and never render this.

import Link from "next/link";

const navLinks = [
  { href: "/dashboard", label: "Inicio" },
  { href: "/exams", label: "Exámenes" },
  { href: "/dashboard/goals", label: "Progreso" },
];

export function Navbar() {
  return (
    <div className="flex items-center gap-6">
      <Link
        href="/dashboard"
        className="text-lg font-bold tracking-tight hover:text-primary transition-colors"
      >
        OpenSloth
      </Link>
      <nav className="flex items-center gap-normal">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}