// @vitest-environment jsdom
import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { CorrectionCard } from "./CorrectionCard";

describe("CorrectionCard component", () => {
  it("renders correct state with success styling and answers", () => {
    render(
      <CorrectionCard
        isCorrect={true}
        givenAnswer="on"
        correctAnswer="on"
        explanation="'Working on' is the correct phrasal verb."
        skillsTested={["grammar", "phrasal verbs"]}
      />
    );

    expect(screen.getByText("Correct!")).toBeInTheDocument();
    expect(screen.getAllByText("on").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("'Working on' is the correct phrasal verb.")).toBeInTheDocument();
    expect(screen.getByText("phrasal verbs")).toBeInTheDocument();
  });

  it("renders incorrect state with expected vs given comparison", () => {
    render(
      <CorrectionCard
        isCorrect={false}
        givenAnswer="in"
        correctAnswer="on"
        explanation="Preposition error."
      />
    );

    expect(screen.getByText("Incorrect — Study Feedback")).toBeInTheDocument();
    expect(screen.getByText("in")).toBeInTheDocument();
    expect(screen.getByText("on")).toBeInTheDocument();
    expect(screen.getByText("Preposition error.")).toBeInTheDocument();
  });
});
