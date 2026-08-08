// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MatchItems } from "./MatchItems";

describe("MatchItems component (Duolingo Style)", () => {
  const defaultItems = [{ id: "item1", text: "Paragraph 1" }];
  const defaultOptions = [
    { id: "A", label: "Topic A" },
    { id: "B", label: "Topic B" },
  ];

  it("renders items and options legend", () => {
    render(
      <MatchItems
        questionId="q1"
        items={defaultItems}
        options={defaultOptions}
        selectedAnswer={null}
        onAnswer={vi.fn()}
      />
    );

    expect(screen.getByText("Paragraph 1")).toBeInTheDocument();
    expect(screen.getAllByText("Topic A").length).toBeGreaterThan(0);
  });

  it("emits Record<string, string> payload on match select", () => {
    const handleAnswer = vi.fn();
    render(
      <MatchItems
        questionId="q1"
        items={defaultItems}
        options={defaultOptions}
        selectedAnswer={null}
        onAnswer={handleAnswer}
      />
    );

    const optionButton = screen.getAllByText("Topic A")[1]; // button inside item
    fireEvent.click(optionButton);
    expect(handleAnswer).toHaveBeenCalledWith("q1", { item1: "A" });
  });

  it("allows clearing a match", () => {
    const handleAnswer = vi.fn();
    render(
      <MatchItems
        questionId="q1"
        items={defaultItems}
        options={defaultOptions}
        selectedAnswer={{ item1: "A" }}
        onAnswer={handleAnswer}
      />
    );

    const clearButton = screen.getByText("✕ Clear");
    fireEvent.click(clearButton);
    expect(handleAnswer).toHaveBeenCalledWith("q1", {});
  });
});
