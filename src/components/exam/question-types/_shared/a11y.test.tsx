/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AnswerTile } from "./AnswerTile";

describe("AnswerTile Accessibility & Keyboard Interaction", () => {
  it("renders with role option and aria-selected", () => {
    render(<AnswerTile selected={true}>Opción A</AnswerTile>);
    const tile = screen.getByRole("option");
    expect(tile).toHaveAttribute("aria-selected", "true");
    expect(tile).toHaveAttribute("tabindex", "0");
  });

  it("handles click activation on button", () => {
    const handleClick = vi.fn();
    render(<AnswerTile onClick={handleClick}>Opción B</AnswerTile>);
    const tile = screen.getByRole("option");

    fireEvent.click(tile);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
