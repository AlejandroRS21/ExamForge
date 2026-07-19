// ExamForge — Neuroinclusive Design Token Tests
// Verifies WCAG AA contrast for the soft blue/green palette + status tokens,
// and that the Tailwind v4 token wiring in globals.css is real (no dead tokens).
// No jsdom/RTL by design decision — pure token-string + math assertions only.

import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import path from "path";
import {
  contrastRatio,
  parseOklch,
  lightPalette,
  darkPalette,
  statusTokens,
} from "./design-tokens";

const GLOBALS_CSS_PATH = path.resolve(__dirname, "../app/globals.css");

// ─── contrastRatio() — pure math, no fixtures needed ────────────────────────

describe("contrastRatio", () => {
  it("returns 21:1 for pure black vs pure white", () => {
    const ratio = contrastRatio("oklch(0 0 0)", "oklch(1 0 0)");
    expect(ratio).toBeCloseTo(21, 0);
  });

  it("returns 1:1 for a color against itself", () => {
    const ratio = contrastRatio("oklch(0.5 0.1 200)", "oklch(0.5 0.1 200)");
    expect(ratio).toBeCloseTo(1, 5);
  });

  it("is symmetric — argument order does not change the ratio", () => {
    const a = "oklch(0.985 0.006 95)";
    const b = "oklch(0.30 0.03 250)";
    expect(contrastRatio(a, b)).toBeCloseTo(contrastRatio(b, a), 10);
  });

  it("computes a known mid-range ratio for the primary/primary-foreground pair", () => {
    const ratio = contrastRatio(lightPalette.primary, lightPalette.primaryForeground);
    // Real computed value from the oklab->linear-sRGB conversion, not a guess.
    expect(ratio).toBeGreaterThan(4.9);
    expect(ratio).toBeLessThan(5.1);
  });
});

// ─── Light palette — WCAG AA (4.5:1 text, 3:1 UI component) ────────────────

describe("lightPalette contrast (WCAG AA)", () => {
  const textPairs: Array<[string, string, string]> = [
    ["background/foreground", lightPalette.background, lightPalette.foreground],
    ["card/cardForeground", lightPalette.card, lightPalette.cardForeground],
    ["popover/popoverForeground", lightPalette.popover, lightPalette.popoverForeground],
    ["primary/primaryForeground", lightPalette.primary, lightPalette.primaryForeground],
    ["secondary/secondaryForeground", lightPalette.secondary, lightPalette.secondaryForeground],
    ["background/mutedForeground", lightPalette.background, lightPalette.mutedForeground],
    ["muted/mutedForeground", lightPalette.muted, lightPalette.mutedForeground],
    ["accent/accentForeground", lightPalette.accent, lightPalette.accentForeground],
    ["destructive/destructiveForeground", lightPalette.destructive, lightPalette.destructiveForeground],
  ];

  it.each(textPairs)("%s meets 4.5:1 normal-text AA", (_name, fg, bg) => {
    expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(4.5);
  });

  const uiComponentPairs: Array<[string, string, string]> = [
    ["background/border", lightPalette.background, lightPalette.border],
    ["background/ring", lightPalette.background, lightPalette.ring],
  ];

  it.each(uiComponentPairs)("%s meets 3:1 UI-component AA", (_name, a, b) => {
    expect(contrastRatio(a, b)).toBeGreaterThanOrEqual(3);
  });
});

// ─── Dark palette — WCAG AA ─────────────────────────────────────────────────

describe("darkPalette contrast (WCAG AA)", () => {
  const textPairs: Array<[string, string, string]> = [
    ["background/foreground", darkPalette.background, darkPalette.foreground],
    ["card/cardForeground", darkPalette.card, darkPalette.cardForeground],
    ["popover/popoverForeground", darkPalette.popover, darkPalette.popoverForeground],
    ["primary/primaryForeground", darkPalette.primary, darkPalette.primaryForeground],
    ["secondary/secondaryForeground", darkPalette.secondary, darkPalette.secondaryForeground],
    ["background/mutedForeground", darkPalette.background, darkPalette.mutedForeground],
    ["muted/mutedForeground", darkPalette.muted, darkPalette.mutedForeground],
    ["accent/accentForeground", darkPalette.accent, darkPalette.accentForeground],
    ["destructive/destructiveForeground", darkPalette.destructive, darkPalette.destructiveForeground],
  ];

  it.each(textPairs)("%s meets 4.5:1 normal-text AA", (_name, fg, bg) => {
    expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(4.5);
  });

  const uiComponentPairs: Array<[string, string, string]> = [
    ["background/border", darkPalette.background, darkPalette.border],
    ["background/ring", darkPalette.background, darkPalette.ring],
  ];

  it.each(uiComponentPairs)("%s meets 3:1 UI-component AA", (_name, a, b) => {
    expect(contrastRatio(a, b)).toBeGreaterThanOrEqual(3);
  });
});

// ─── Semantic status tokens — success/warning/error/info ───────────────────

describe("statusTokens contrast (WCAG AA)", () => {
  const tones = ["success", "warning", "error", "info"] as const;

  for (const mode of ["light", "dark"] as const) {
    for (const tone of tones) {
      const token = statusTokens[mode][tone];

      it(`${mode}.${tone} solid (base/foreground) meets 4.5:1`, () => {
        expect(contrastRatio(token.base, token.foreground)).toBeGreaterThanOrEqual(4.5);
      });

      it(`${mode}.${tone} surface text (surface/base) meets 4.5:1`, () => {
        expect(contrastRatio(token.surface, token.base)).toBeGreaterThanOrEqual(4.5);
      });
    }
  }

  it("uses the --error token name, not --danger", () => {
    expect(statusTokens.light.error).toBeDefined();
    expect((statusTokens.light as Record<string, unknown>).danger).toBeUndefined();
  });
});

// ─── Hue range compliance (spec: primary 200-220, accent 150-170) ──────────

describe("palette hue ranges", () => {
  it("light primary hue falls within 200-220", () => {
    const { h } = parseOklch(lightPalette.primary);
    expect(h).toBeGreaterThanOrEqual(200);
    expect(h).toBeLessThanOrEqual(220);
  });

  it("dark primary hue falls within 200-220", () => {
    const { h } = parseOklch(darkPalette.primary);
    expect(h).toBeGreaterThanOrEqual(200);
    expect(h).toBeLessThanOrEqual(220);
  });

  it("light accent hue falls within 150-170", () => {
    const { h } = parseOklch(lightPalette.accent);
    expect(h).toBeGreaterThanOrEqual(150);
    expect(h).toBeLessThanOrEqual(170);
  });

  it("dark accent hue falls within 150-170", () => {
    const { h } = parseOklch(darkPalette.accent);
    expect(h).toBeGreaterThanOrEqual(150);
    expect(h).toBeLessThanOrEqual(170);
  });

  it("background is off-white/cream (high lightness, low chroma) in light mode", () => {
    const { l, c } = parseOklch(lightPalette.background);
    expect(l).toBeGreaterThan(0.95);
    expect(c).toBeLessThan(0.02);
  });

  it("foreground is muted, not pure black, in light mode", () => {
    const { l } = parseOklch(lightPalette.foreground);
    expect(l).toBeGreaterThan(0.15);
    expect(l).toBeLessThan(0.5);
  });
});

// ─── globals.css structural checks — dead-token + bug-fix regressions ───────

describe("globals.css token wiring", () => {
  const css = readFileSync(GLOBALS_CSS_PATH, "utf8");

  function extractThemeBlocks(source: string): string {
    const blocks: string[] = [];
    const regex = /@theme[^{]*\{/g;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(source)) !== null) {
      const start = match.index + match[0].length;
      let depth = 1;
      let i = start;
      while (i < source.length && depth > 0) {
        if (source[i] === "{") depth++;
        if (source[i] === "}") depth--;
        i++;
      }
      blocks.push(source.slice(start, i - 1));
    }
    return blocks.join("\n");
  }

  const themeContent = extractThemeBlocks(css);

  it("does not hardcode font-family: Arial on body", () => {
    expect(css).not.toMatch(/font-family:\s*Arial/i);
  });

  const spacingTokens = ["--spacing-compact", "--spacing-normal", "--spacing-generous", "--spacing-breathing"];
  it.each(spacingTokens)("%s is wired inside an @theme block", (token) => {
    expect(themeContent).toContain(token);
  });

  it("--leading-reading is wired inside an @theme block", () => {
    expect(themeContent).toContain("--leading-reading");
  });

  it("--container-content is wired inside an @theme block", () => {
    expect(themeContent).toContain("--container-content");
  });

  it("--default-transition-duration is wired inside an @theme block", () => {
    expect(themeContent).toContain("--default-transition-duration");
  });

  const statusTokenNames = ["--success", "--warning", "--error", "--info"];
  it.each(statusTokenNames)("%s semantic status token is declared", (token) => {
    // Match declaration, not substring of a longer token name (e.g. --error-foreground).
    const declRegex = new RegExp(`${token}:\\s*oklch`);
    expect(css).toMatch(declRegex);
  });

  it("does not declare a --danger token", () => {
    expect(css).not.toMatch(/--danger:/);
  });

  it("fixes the destructive/destructive-foreground bug — values are byte-different", () => {
    const destructiveMatch = css.match(/--destructive:\s*(oklch\([^)]*\))/);
    const destructiveFgMatch = css.match(/--destructive-foreground:\s*(oklch\([^)]*\))/);
    expect(destructiveMatch).not.toBeNull();
    expect(destructiveFgMatch).not.toBeNull();
    expect(destructiveMatch![1]).not.toBe(destructiveFgMatch![1]);
  });
});
