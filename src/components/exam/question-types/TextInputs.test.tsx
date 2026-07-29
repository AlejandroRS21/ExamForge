// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ClozeInput } from "./ClozeInput";
import { WordForm } from "./WordForm";
import { KeyTransform } from "./KeyTransform";

describe("Text Input Question Components (Duolingo Polish)", () => {
  it("ClozeInput emits string payload on change", () => {
    const handleAnswer = vi.fn();
    render(
      <ClozeInput
        questionId="q1"
        selectedAnswer=""
        onAnswer={handleAnswer}
      />
    );

    const input = screen.getByPlaceholderText("Type word...");
    fireEvent.change(input, { target: { value: "however" } });
    expect(handleAnswer).toHaveBeenCalledWith("q1", "however");
  });

  it("WordForm displays stemWord badge and emits string payload", () => {
    const handleAnswer = vi.fn();
    render(
      <WordForm
        questionId="q2"
        stemWord="CREATE"
        selectedAnswer=""
        onAnswer={handleAnswer}
      />
    );

    expect(screen.getByText("CREATE")).toBeInTheDocument();
    const input = screen.getByPlaceholderText("Write derived word...");
    fireEvent.change(input, { target: { value: "creation" } });
    expect(handleAnswer).toHaveBeenCalledWith("q2", "creation");
  });

  it("KeyTransform displays leadIn/keyword and emits string payload", () => {
    const handleAnswer = vi.fn();
    render(
      <KeyTransform
        questionId="q3"
        leadIn="She started working early."
        keyword="BEFORE"
        selectedAnswer=""
        onAnswer={handleAnswer}
      />
    );

    expect(screen.getByText("She started working early.")).toBeInTheDocument();
    expect(screen.getByText("BEFORE")).toBeInTheDocument();

    const textarea = screen.getByPlaceholderText("Write the transformed sentence...");
    fireEvent.change(textarea, { target: { value: "before anyone else" } });
    expect(handleAnswer).toHaveBeenCalledWith("q3", "before anyone else");
  });
});
