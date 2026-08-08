// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { HeartDisplay } from "./HeartDisplay";

describe("HeartDisplay", () => {
  it("renders correct heart count", () => {
    render(<HeartDisplay hearts={3} maxHearts={5} nextRegenInSeconds={1200} />);
    expect(screen.getByTestId("heart-count").textContent).toBe("3");
    expect(screen.getAllByTestId("heart-icon")).toHaveLength(5);
  });

  it("shows regen timer when hearts < maxHearts", () => {
    render(<HeartDisplay hearts={3} maxHearts={5} nextRegenInSeconds={65} />);
    expect(screen.getByTestId("regen-timer").textContent).toBe("01:05");
  });

  it("hides regen timer when hearts equal or exceed maxHearts", () => {
    render(<HeartDisplay hearts={5} maxHearts={5} nextRegenInSeconds={0} />);
    expect(screen.queryByTestId("regen-timer")).toBeNull();
  });

  it("handles zero hearts state", () => {
    render(<HeartDisplay hearts={0} maxHearts={5} nextRegenInSeconds={1800} />);
    expect(screen.getByTestId("heart-count").textContent).toBe("0");
    expect(screen.getByTestId("regen-timer").textContent).toBe("30:00");
  });

  it("renders infinity in casual/practice mode", () => {
    render(<HeartDisplay hearts={5} maxHearts={5} isCasual />);
    expect(screen.getByTestId("heart-count").textContent).toBe("∞");
    expect(screen.queryByTestId("regen-timer")).toBeNull();
  });
});
