import { describe, it, expect } from "vitest";
import {
  toggleMatch,
  clearMatch,
  placeGapItem,
  removeGapItem,
  moveGapItemUp,
  moveGapItemDown,
  calculateNextIndex,
} from "./answer-logic";

describe("answer-logic pure functions", () => {
  it("toggles match item selection in MM", () => {
    const initial = { item1: "optA" };
    expect(toggleMatch(initial, "item1", "optA")).toEqual({});
    expect(toggleMatch(initial, "item2", "optB")).toEqual({ item1: "optA", item2: "optB" });
  });

  it("clears a match item", () => {
    const initial = { item1: "optA", item2: "optB" };
    expect(clearMatch(initial, "item1")).toEqual({ item2: "optB" });
  });

  it("handles gap item placement in GT", () => {
    expect(placeGapItem(["s1"], "s2")).toEqual(["s1", "s2"]);
    expect(placeGapItem(["s1", "s2"], "s1")).toEqual(["s1", "s2"]);
  });

  it("removes gap item by index in GT", () => {
    expect(removeGapItem(["s1", "s2", "s3"], 1)).toEqual(["s1", "s3"]);
  });

  it("moves gap items up and down in GT", () => {
    expect(moveGapItemUp(["s1", "s2", "s3"], 1)).toEqual(["s2", "s1", "s3"]);
    expect(moveGapItemDown(["s1", "s2", "s3"], 1)).toEqual(["s1", "s3", "s2"]);
  });

  it("calculates next focus index for keyboard navigation", () => {
    expect(calculateNextIndex(0, 4, "ArrowRight", 2)).toBe(1);
    expect(calculateNextIndex(1, 4, "ArrowDown", 2)).toBe(3);
    expect(calculateNextIndex(3, 4, "ArrowUp", 2)).toBe(1);
    expect(calculateNextIndex(0, 4, "ArrowLeft", 2)).toBe(3);
  });
});
