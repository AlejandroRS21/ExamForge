// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { ComboBanner } from "./ComboBanner";

describe("ComboBanner", () => {
  it("renders combo count and multiplier text", () => {
    render(<ComboBanner comboCount={5} multiplier={1.5} />);
    expect(screen.getByTestId("combo-banner")).not.toBeNull();
    expect(screen.getByTestId("combo-count").textContent).toContain("5");
    expect(screen.getByTestId("combo-multiplier").textContent).toContain("1.5x");
  });

  it("hides when comboCount is 0", () => {
    render(<ComboBanner comboCount={0} multiplier={1.0} />);
    expect(screen.queryByTestId("combo-banner")).toBeNull();
  });
});
