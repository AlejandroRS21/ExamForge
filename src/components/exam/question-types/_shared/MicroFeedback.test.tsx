// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import React from "react";
import { MicroFeedback } from "./MicroFeedback";

describe("MicroFeedback", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders correct feedback checkmark and auto-dismisses after 800ms", () => {
    const onDismiss = vi.fn();
    const { rerender } = render(
      <MicroFeedback type="correct" onDismiss={onDismiss} />
    );

    expect(screen.getByTestId("micro-feedback-correct")).toBeDefined();

    act(() => {
      vi.advanceTimersByTime(800);
    });

    expect(onDismiss).toBeCalled();
  });

  it("renders incorrect feedback cross", () => {
    render(<MicroFeedback type="incorrect" />);
    expect(screen.getByTestId("micro-feedback-incorrect")).toBeDefined();
  });

  it("renders combo counter when streak count is provided", () => {
    render(<MicroFeedback type="combo" comboCount={5} />);
    expect(screen.getByText("5x Combo!")).toBeDefined();
  });
});
