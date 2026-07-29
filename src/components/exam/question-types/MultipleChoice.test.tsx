// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MultipleChoice } from "./MultipleChoice";

describe("MultipleChoice component (Duolingo 2x2 UX)", () => {
  const defaultOptions = ["Apple", "Banana", "Cherry", "Date"];

  it("renders 4 options in a 2x2 grid with A-D badges", () => {
    render(
      <MultipleChoice
        questionId="q1"
        options={defaultOptions}
        selectedAnswer={null}
        onAnswer={vi.fn()}
      />
    );

    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("Apple")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
    expect(screen.getByText("Banana")).toBeInTheDocument();
  });

  it("emits correct string answer payload on click", () => {
    const handleAnswer = vi.fn();
    render(
      <MultipleChoice
        questionId="q1"
        options={defaultOptions}
        selectedAnswer={null}
        onAnswer={handleAnswer}
      />
    );

    fireEvent.click(screen.getByText("Banana"));
    expect(handleAnswer).toHaveBeenCalledWith("q1", "B");
  });

  it("selects options via number keys 1-4", () => {
    const handleAnswer = vi.fn();
    const { container } = render(
      <MultipleChoice
        questionId="q1"
        options={defaultOptions}
        selectedAnswer={null}
        onAnswer={handleAnswer}
      />
    );

    const group = container.querySelector('[role="radiogroup"]')!;
    fireEvent.keyDown(group, { key: "3" });
    expect(handleAnswer).toHaveBeenCalledWith("q1", "C");
  });

  it("navigates options via arrow keys", () => {
    const handleAnswer = vi.fn();
    const { container } = render(
      <MultipleChoice
        questionId="q1"
        options={defaultOptions}
        selectedAnswer={null}
        onAnswer={handleAnswer}
      />
    );

    const group = container.querySelector('[role="radiogroup"]')!;
    const buttons = screen.getAllByRole("radio");

    // Focused at 0 (A), ArrowRight -> 1 (B)
    fireEvent.keyDown(group, { key: "ArrowRight" });
    expect(document.activeElement).toBe(buttons[1]);
  });
});
