// @vitest-environment jsdom
import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ContextFrame } from "./ContextFrame";

describe("ContextFrame component", () => {
  it("renders prompt text and embeds children inline when ___ is present", () => {
    render(
      <ContextFrame promptText="She has been working ___ two years.">
        <input data-testid="inline-input" />
      </ContextFrame>
    );

    expect(screen.getByText("She has been working")).toBeInTheDocument();
    expect(screen.getByText("two years.")).toBeInTheDocument();
    expect(screen.getByTestId("inline-input")).toBeInTheDocument();
  });

  it("renders reading passage when provided", () => {
    render(
      <ContextFrame
        promptText="Choose the correct answer"
        readingPassage="Once upon a time in Cambridge..."
      >
        <div>Answer choices</div>
      </ContextFrame>
    );

    expect(screen.getByText("Once upon a time in Cambridge...")).toBeInTheDocument();
    expect(screen.getByText("Choose the correct answer")).toBeInTheDocument();
  });
});
