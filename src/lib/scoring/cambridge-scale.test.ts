// OpenSloth — Cambridge Scale Tests
// T-806: Vitest smoke tests for scale estimation

import { describe, it, expect } from "vitest";
import {
  estimateCambridgeScale,
  getScaleGrade,
  SCORE_DISCLAIMER,
} from "./cambridge-scale";

describe("estimateCambridgeScale", () => {
  it("returns 120 for 0% raw score", () => {
    const result = estimateCambridgeScale(0);
    expect(result).toBe(120);
  });

  it("returns 190 for 100% raw score", () => {
    const result = estimateCambridgeScale(100);
    expect(result).toBe(190);
  });

  it("returns a value between 120-190 for mid-range score", () => {
    const result = estimateCambridgeScale(65);
    expect(result).toBeGreaterThanOrEqual(120);
    expect(result).toBeLessThanOrEqual(190);
  });

  it("is non-decreasing with raw score", () => {
    const low = estimateCambridgeScale(40);
    const mid = estimateCambridgeScale(60);
    const high = estimateCambridgeScale(80);
    expect(low).toBeLessThanOrEqual(mid);
    expect(mid).toBeLessThanOrEqual(high);
  });
});

describe("getScaleGrade", () => {
  it('returns "A" for score >= 180', () => {
    expect(getScaleGrade(190)).toBe("A");
    expect(getScaleGrade(180)).toBe("A");
  });

  it('returns "B" for score 173-179', () => {
    expect(getScaleGrade(176)).toBe("B");
    expect(getScaleGrade(173)).toBe("B");
  });

  it('returns "C" for score 160-172', () => {
    expect(getScaleGrade(165)).toBe("C");
    expect(getScaleGrade(160)).toBe("C");
  });

  it('returns "B1" for score 140-159', () => {
    expect(getScaleGrade(150)).toBe("B1");
    expect(getScaleGrade(140)).toBe("B1");
  });

  it('returns "Below B1" for score < 140', () => {
    expect(getScaleGrade(130)).toBe("Below B1");
    expect(getScaleGrade(120)).toBe("Below B1");
  });
});

describe("SCORE_DISCLAIMER", () => {
  it("contains required disclaimer text (B-L-2 Spanish copy)", () => {
    expect(SCORE_DISCLAIMER).toContain("estimada");
    expect(SCORE_DISCLAIMER).toContain("oficial");
    expect(SCORE_DISCLAIMER).toContain("Cambridge");
  });
});
