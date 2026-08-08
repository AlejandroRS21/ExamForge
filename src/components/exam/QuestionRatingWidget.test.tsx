// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QuestionRatingWidget } from "./QuestionRatingWidget";

describe("QuestionRatingWidget component", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders rating options and submits positive feedback", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(<QuestionRatingWidget questionId="q123" />);

    expect(screen.getByText("Was this exercise helpful and accurate?")).toBeInTheDocument();

    const helpfulBtn = screen.getByText("👍 Helpful");
    fireEvent.click(helpfulBtn);

    await waitFor(() => {
      expect(screen.getByText("✓ Thanks for your feedback!")).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith("/api/questions/rate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId: "q123", rating: "POSITIVE" }),
    });
  });
});
