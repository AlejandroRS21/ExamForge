// OpenSloth — Header guard (A-SH-1)
// The app-shell header must show the session user and render the
// SignOutButton so logout is available from every authenticated page.
// Source-approval (no renderer installed).

import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";

describe("components/layout/Header (A-SH-1)", () => {
  const src = readFileSync(new URL("./Header.tsx", import.meta.url), "utf-8");

  it("imports and renders SignOutButton", () => {
    expect(src).toContain('from "@/components/layout/SignOutButton"');
    expect(src).toContain("<SignOutButton />");
  });

  it("shows the session user name", () => {
    expect(src).toContain("session");
    expect(src).toContain("user?.name");
    expect(src).toContain('?? "Estudiante"');
  });
});