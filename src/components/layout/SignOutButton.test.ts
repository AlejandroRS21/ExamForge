// OpenSloth — SignOutButton behavior (A-SH-2 logout-flow)
// Clicking logout must invalidate the session and redirect to the landing
// page. The action is extracted (signOutAction) so it is unit-testable
// without a renderer: mock @/lib/auth and assert the real call parameters.

import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth", () => ({ signOut: vi.fn() }));

import { signOut as mockSignOut } from "@/lib/auth";
import { SignOutButton, signOutAction } from "./SignOutButton";

describe("SignOutButton (A-SH-2)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls the app signOut and redirects to landing on logout", async () => {
    await signOutAction();
    expect(mockSignOut).toHaveBeenCalledExactlyOnceWith({ redirectTo: "/" });
  });

  it("renders a submit form wired to the sign-out action", () => {
    const el = SignOutButton() as unknown as {
      type: string;
      props: { action: typeof signOutAction; children: unknown };
    };
    expect(el.type).toBe("form");
    expect(el.props.action).toBe(signOutAction);
    const btn = el.props.children as {
      type: string;
      props: { type: string; children: string };
    };
    expect(btn.type).toBe("button");
    expect(btn.props.type).toBe("submit");
    expect(btn.props.children).toBe("Cerrar sesión");
  });
});