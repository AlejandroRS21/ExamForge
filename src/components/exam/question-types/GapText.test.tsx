// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { GapText } from "./GapText";

describe("GapText component (Duolingo Style)", () => {
  const defaultItems = [
    { id: "s1", text: "First sentence" },
    { id: "s2", text: "Second sentence" },
  ];

  it("renders available sentences initially", () => {
    render(
      <GapText
        questionId="q1"
        items={defaultItems}
        selectedAnswer={null}
        onAnswer={vi.fn()}
      />
    );

    expect(screen.getByText("First sentence")).toBeInTheDocument();
    expect(screen.getByText("Second sentence")).toBeInTheDocument();
  });

  it("emits string[] payload when sentence is placed", () => {
    const handleAnswer = vi.fn();
    render(
      <GapText
        questionId="q1"
        items={defaultItems}
        selectedAnswer={null}
        onAnswer={handleAnswer}
      />
    );

    fireEvent.click(screen.getByText("First sentence"));
    expect(handleAnswer).toHaveBeenCalledWith("q1", ["s1"]);
  });

  it("supports removing a placed sentence", () => {
    const handleAnswer = vi.fn();
    render(
      <GapText
        questionId="q1"
        items={defaultItems}
        selectedAnswer={["s1", "s2"]}
        onAnswer={handleAnswer}
      />
    );

    const removeBtn = screen.getByLabelText("Remove sentence 1");
    fireEvent.click(removeBtn);
    expect(handleAnswer).toHaveBeenCalledWith("q1", ["s2"]);
  });
});
