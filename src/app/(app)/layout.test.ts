// OpenSloth — (app) layout chrome + auth guard (A-SH-1/2)
// The group layout must render Navbar + Header (which includes
// SignOutButton) and redirect unauthenticated users to login; landing and
// auth routes must stay bare (no app-shell chrome). Source-approval.

import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";

const layout = readFileSync(new URL("./layout.tsx", import.meta.url), "utf-8");
const landing = readFileSync(new URL("../page.tsx", import.meta.url), "utf-8");
const login = readFileSync(
  new URL("../auth/login/page.tsx", import.meta.url),
  "utf-8"
);

describe("(app)/layout.tsx (A-SH-1/2)", () => {
  it("renders the shared Navbar and Header chrome", () => {
    expect(layout).toContain('from "@/components/layout/Navbar"');
    expect(layout).toContain('from "@/components/layout/Header"');
    expect(layout).toContain("<Navbar />");
    expect(layout).toContain("<Header ");
  });

  it("redirects unauthenticated users to login (unauth-redirect)", () => {
    expect(layout).toContain('import { auth } from "@/lib/auth"');
    expect(layout).toContain("!session?.user");
    expect(layout).toContain('redirect("/auth/login")');
  });

  it("leaves landing bare — no app-shell chrome", () => {
    expect(landing).not.toContain("components/layout");
    expect(landing).not.toContain("SignOutButton");
  });

  it("leaves the auth pages bare — no app-shell chrome", () => {
    expect(login).not.toContain("components/layout");
    expect(login).not.toContain("SignOutButton");
  });
});