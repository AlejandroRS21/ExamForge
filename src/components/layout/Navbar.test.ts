// OpenSloth — Navbar guard (A-SH-1 nav-present)
// The shared nav must show brand + Inicio/Exámenes/Progreso links with
// Spanish labels. Source-approval (no renderer installed).

import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";

describe("components/layout/Navbar (A-SH-1)", () => {
  const src = readFileSync(new URL("./Navbar.tsx", import.meta.url), "utf-8");

  it("links the brand to the authenticated home", () => {
    expect(src).toContain('href="/dashboard"');
  });

  it("renders Spanish nav labels Inicio, Exámenes, Progreso", () => {
    expect(src).toContain('label: "Inicio"');
    expect(src).toContain('label: "Exámenes"');
    expect(src).toContain('label: "Progreso"');
  });

  it("points Inicio→/dashboard, Exámenes→/exams, Progreso→/dashboard/goals", () => {
    expect(src).toContain('{ href: "/dashboard", label: "Inicio" }');
    expect(src).toContain('{ href: "/exams", label: "Exámenes" }');
    expect(src).toContain('{ href: "/dashboard/goals", label: "Progreso" }');
  });

  it("contains no English nav labels", () => {
    expect(src).not.toContain('"Exams"');
    expect(src).not.toContain('"Dashboard"');
    expect(src).not.toContain('"Home"');
  });
});