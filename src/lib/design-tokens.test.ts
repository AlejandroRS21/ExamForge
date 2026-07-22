// ExamForge — Neuroinclusive Design Token Tests
// Verifies WCAG AA contrast for the soft blue/green palette + status tokens,
// and that the Tailwind v4 token wiring in globals.css is real (no dead tokens).
// No jsdom/RTL by design decision — pure token-string + math assertions only.

import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "fs";
import path from "path";
import {
  contrastRatio,
  parseOklch,
  lightPalette,
  darkPalette,
  statusTokens,
  getStatusToneClasses,
  focusRingColor,
  focusWarmTokens,
} from "./design-tokens";

const GLOBALS_CSS_PATH = path.resolve(__dirname, "../app/globals.css");

// ─── Shared test infra — hoisted so multiple describe blocks below can reuse
// the same parsed globals.css / source-tree data without redundant re-reads. ───

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

const themeContent = extractThemeBlocks(readFileSync(GLOBALS_CSS_PATH, "utf8"));

const SRC_DIR = path.resolve(__dirname, "..");

function collectSourceFiles(dir: string): string[] {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name === ".next") continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectSourceFiles(fullPath));
    } else if (
      /\.(ts|tsx)$/.test(entry.name) &&
      !/\.(test|spec)\.(ts|tsx)$/.test(entry.name)
    ) {
      files.push(fullPath);
    }
  }
  return files;
}

const sourceText = collectSourceFiles(SRC_DIR)
  .map((file) => readFileSync(file, "utf8"))
  .join("\n");

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

// ─── Focus ring — CRITICAL-1 (verify report): dark mode failed 3:1 UI-
// component AA with no test coverage at all. Proves both modes independently
// against each mode's own --background using the same contrastRatio() used
// throughout this file.

describe("focus ring contrast (WCAG AA UI component, >=3:1)", () => {
  it("light mode focus ring meets 3:1 against light background", () => {
    expect(contrastRatio(lightPalette.background, focusRingColor.light)).toBeGreaterThanOrEqual(3);
  });

  it("dark mode focus ring meets 3:1 against dark background", () => {
    expect(contrastRatio(darkPalette.background, focusRingColor.dark)).toBeGreaterThanOrEqual(3);
  });

  it("dark mode focus ring has a .dark override distinct from the light value", () => {
    expect(focusRingColor.dark).not.toBe(focusRingColor.light);
  });
});

// ─── Focus warm — single primary-CTA accent (Dashboard "Readiness Journey") ─
// base/surface are the approved mockup's ground-truth hex; foreground was
// fixed to reuse lightPalette.foreground (see contrast test below). Unlike
// focusRingColor, this has no .dark override — verified below that it
// doesn't need one.

describe("focusWarmTokens contrast", () => {
  it("does not join the 4-tone statusTokens object (it's a one-off CTA accent, not a status tone)", () => {
    expect((statusTokens.light as Record<string, unknown>).focusWarm).toBeUndefined();
  });

  it("base clears the >=3:1 UI-component minimum against the dark background, justifying no .dark override", () => {
    expect(contrastRatio(focusWarmTokens.base, darkPalette.background)).toBeGreaterThanOrEqual(3);
  });

  // The approved mockup's literal hex pair (#E8905A / #FEFEFB) only reached
  // ~2.4:1 — below the 4.5:1 every statusTokens solid pair passes, and below
  // even the 3:1 UI-component minimum. `foreground` was fixed to reuse
  // `lightPalette.foreground` instead of the mockup's literal value, which
  // brings this pair to AA-passing contrast like every other solid pair.
  it("base/foreground clears the 4.5:1 text contrast minimum", () => {
    const ratio = contrastRatio(focusWarmTokens.base, focusWarmTokens.foreground);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
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

  // REL-1 (PR1 review follow-up): the `-border` role must independently meet
  // the 3:1 UI-component contrast bar against its own paired surface — the
  // solid/surface-text pairs above don't cover this pairing.
  for (const mode of ["light", "dark"] as const) {
    for (const tone of tones) {
      const token = statusTokens[mode][tone];

      it(`${mode}.${tone} border meets 3:1 UI-component contrast against its surface`, () => {
        expect(contrastRatio(token.surface, token.border)).toBeGreaterThanOrEqual(3);
      });
    }
  }
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

  it("does not hardcode font-family: Arial on body", () => {
    expect(css).not.toMatch(/font-family:\s*Arial/i);
  });

  const spacingTokens = ["--spacing-normal", "--spacing-generous", "--spacing-breathing"];
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

// ─── getStatusToneClasses() — pure token-based class string helper ─────────
// Output IS the contract (the function's entire purpose is producing these
// exact class strings for JSX consumption) — asserting the return value here
// is a behavioral test, not implementation-detail coupling to a rendered DOM.

describe("getStatusToneClasses", () => {
  const tones = ["success", "warning", "error", "info"] as const;

  it.each(tones)("%s solid variant returns bg-{tone} + text-{tone}-foreground", (tone) => {
    expect(getStatusToneClasses(tone, "solid")).toBe(`bg-${tone} text-${tone}-foreground`);
  });

  it.each(tones)(
    "%s surface variant returns bg-{tone}-surface + text-{tone} + border-{tone}-border",
    (tone) => {
      expect(getStatusToneClasses(tone, "surface")).toBe(
        `bg-${tone}-surface text-${tone} border border-${tone}-border`,
      );
    },
  );

  it("solid and surface variants differ for the same tone", () => {
    expect(getStatusToneClasses("success", "solid")).not.toBe(getStatusToneClasses("success", "surface"));
  });
});

// ─── READ-1: design-tokens.ts / globals.css parity ──────────────────────────
// Kills dual-declaration drift: palette + status values are hand-maintained in
// TWO places (the TS source of truth and the CSS custom properties it
// mirrors). This asserts numeric equality so an edit to one without the other
// fails loudly instead of silently diverging.

describe("spacing/leading/width token adoption (PR3 — kills dead-token regression)", () => {
  // Mirrors the PR1->PR2 color-token guard: a token wired into `@theme` but
  // never referenced by any component is a silent regression waiting to
  // happen. This walks the actual page/component source tree (not just
  // globals.css) so the assertion fails if a future refactor strips the last
  // real usage of one of these utilities. (`sourceText`/`SRC_DIR` are hoisted
  // module-level consts, shared with the orphan-token audit block below.)

  // Exact utility classes the design doc's PR3 adoption plan names explicitly:
  // `max-w-2xl -> max-w-content`, `py-8 -> py-breathing`, `space-y-8 ->
  // space-y-generous`, `p-8 -> p-breathing` (admin), reading-prose `leading-reading`,
  // plus `gap-normal` consumed by the new LearnHeader nav.
  const expectedUtilities = ["max-w-content", "py-breathing", "space-y-generous", "p-breathing", "leading-reading", "gap-normal"];

  it.each(expectedUtilities)("%s is referenced by at least one component/page", (utility) => {
    expect(sourceText).toContain(utility);
  });

  it("LearnShell layout wires both the width and spacing tokens together", () => {
    const layout = readFileSync(path.resolve(__dirname, "../app/learn/layout.tsx"), "utf8");
    expect(layout).toContain("max-w-content");
    expect(layout).toContain("py-breathing");
  });
});

// ─── CRITICAL-2 (verify report): full declared-token orphan audit ──────────
// The block above only ever checked a hand-picked (curated) subset of
// utilities, so a passing suite never actually proved "zero orphaned
// tokens" — it silently excluded `--spacing-compact`, `--transition-fast`,
// and `--transition-slow`, all of which had zero real usages anywhere.
// This block instead PARSES the actual set of declared custom properties
// from globals.css (no hand-picked token list) and requires each one to
// prove real consumption, so a newly-added dead token fails loudly instead
// of silently falling outside an unmaintained allow-list.

describe("no orphaned design tokens (full declared-token audit)", () => {
  const css = readFileSync(GLOBALS_CSS_PATH, "utf8");

  function extractAllBlocks(source: string, selector: RegExp): string[] {
    const blocks: string[] = [];
    const flags = selector.flags.includes("g") ? selector.flags : `${selector.flags}g`;
    const re = new RegExp(selector.source, flags);
    let match: RegExpExecArray | null;
    while ((match = re.exec(source)) !== null) {
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
    return blocks;
  }

  // Every plain `:root { }` block (palette+status, then focus-ring/transition)
  // and every `.dark { }` block (palette+status override, focus-ring-color
  // override). Deliberately excludes `@theme` (generic Tailwind wiring,
  // audited separately below) and `@media` overrides (re-declarations of
  // tokens already captured here, e.g. forced-colors' `Highlight` value).
  const rootAndDarkSource = [
    ...extractAllBlocks(css, /:root\s*\{/g),
    ...extractAllBlocks(css, /\.dark\s*\{/g),
  ].join("\n");

  const declaredRootDarkTokens = new Set<string>();
  {
    const declRegex = /--([a-z0-9-]+):/g;
    let m: RegExpExecArray | null;
    while ((m = declRegex.exec(rootAndDarkSource)) !== null) {
      declaredRootDarkTokens.add(m[1]);
    }
  }

  it("token discovery regex still finds the known neuroinclusive tokens (guards against a silently broken parser)", () => {
    expect(declaredRootDarkTokens.size).toBeGreaterThan(10);
    for (const known of ["background", "focus-ring-color", "success-border"]) {
      expect(declaredRootDarkTokens.has(known)).toBe(true);
    }
  });

  // These are never referenced as a literal Tailwind utility class name —
  // they compose into other declarations via `var(--token)`, either directly
  // in a CSS rule (focus ring, transition) or via a `@theme` alias
  // (`--color-background: var(--background)`, etc). Proving `var(--token)`
  // appears elsewhere in globals.css is the correct non-orphan proof for
  // this group; the resulting `@theme` alias utilities are covered by the
  // dedicated palette/status contrast + `getStatusToneClasses` tests above.
  const selfConsumedViaVar = new Set([
    "background", "foreground", "card", "card-foreground", "popover", "popover-foreground",
    "primary", "primary-foreground", "secondary", "secondary-foreground", "muted", "muted-foreground",
    "accent", "accent-foreground", "destructive", "destructive-foreground", "border", "input", "ring",
    "radius",
    "success", "success-foreground", "success-surface", "success-border",
    "warning", "warning-foreground", "warning-surface", "warning-border",
    "error", "error-foreground", "error-surface", "error-border",
    "info", "info-foreground", "info-surface", "info-border",
    "focus-ring-width", "focus-ring-offset", "focus-ring-color",
    "transition-normal",
    "focus-warm", "focus-warm-foreground", "focus-warm-surface",
  ]);

  it.each([...declaredRootDarkTokens].sort())("--%s is consumed (not orphaned)", (name) => {
    expect(selfConsumedViaVar.has(name)).toBe(true);
    expect(css).toMatch(new RegExp(`var\\(--${name}\\)`));
  });

  // `@theme` also directly declares utility-generating tokens that have no
  // plain `:root` mirror (spacing/leading/container namespace). These must
  // resolve to a real, literally-used Tailwind utility class in src/ — this
  // is exactly the category `--spacing-compact` silently escaped.
  // Scope note: the regex below only matches the `spacing`/`leading`/
  // `container`/`color` namespaces (the ones this design system actually
  // added tokens to). It deliberately does not match `--radius-*` or
  // `--font-*` — pre-existing shadcn/Next.js scaffold defaults that predate
  // the neuroinclusive design system and are out of this change's scope.
  // `color-*` matches are skipped below: they're aliases of base tokens
  // already proven non-orphan via `var()` composition above.
  const NAMESPACE_UTILITY_PREFIXES: Record<string, string[]> = {
    spacing: [
      "p-", "px-", "py-", "pt-", "pb-", "pl-", "pr-",
      "gap-", "gap-x-", "gap-y-", "space-x-", "space-y-",
      "m-", "mx-", "my-", "mt-", "mb-", "ml-", "mr-", "w-", "h-",
    ],
    leading: ["leading-"],
    container: ["max-w-"],
  };

  const themeOnlyDeclared = new Map<string, { namespace: string; key: string }>();
  {
    const declRegex = /--(spacing|leading|container|color)-([a-z0-9-]+):/g;
    let m: RegExpExecArray | null;
    while ((m = declRegex.exec(themeContent)) !== null) {
      const [, namespace, key] = m;
      if (namespace === "color") continue; // color-* aliases: covered above via base token.
      themeOnlyDeclared.set(`${namespace}-${key}`, { namespace, key });
    }
  }

  it("discovers the @theme-only spacing/leading/container tokens", () => {
    expect(themeOnlyDeclared.size).toBeGreaterThan(0);
    expect(themeOnlyDeclared.has("container-content")).toBe(true);
  });

  it.each([...themeOnlyDeclared.entries()])("--%s resolves to a real utility used in src/", (fullName, { namespace, key }) => {
    const prefixes = NAMESPACE_UTILITY_PREFIXES[namespace] ?? [];
    const used = prefixes.some((prefix) => sourceText.includes(`${prefix}${key}`));
    expect(used).toBe(true);
  });

  it("--default-transition-duration composes the validated --transition-normal token", () => {
    expect(themeContent).toMatch(/--default-transition-duration:\s*var\(--transition-normal\)/);
  });
});

describe("design-tokens.ts / globals.css parity (dead-declaration drift guard)", () => {
  const css = readFileSync(GLOBALS_CSS_PATH, "utf8");

  function extractFirstBlock(source: string, selector: RegExp): string {
    const match = selector.exec(source);
    if (!match) {
      throw new Error(`Selector not found in globals.css: ${selector}`);
    }
    const start = match.index + match[0].length;
    let depth = 1;
    let i = start;
    while (i < source.length && depth > 0) {
      if (source[i] === "{") depth++;
      if (source[i] === "}") depth--;
      i++;
    }
    return source.slice(start, i - 1);
  }

  function getCssVar(block: string, name: string): string {
    const regex = new RegExp(`--${name}:\\s*(oklch\\([^)]*\\))`);
    const match = block.match(regex);
    if (!match) {
      throw new Error(`--${name} not declared in the expected globals.css block`);
    }
    return match[1];
  }

  function toKebab(key: string): string {
    return key.replace(/([A-Z])/g, "-$1").toLowerCase();
  }

  // First `:root { ... }` block holds the palette + status declarations;
  // a second, unrelated `:root` block later in the file holds focus-ring/
  // transition tokens only — intentionally not compared here.
  const rootBlock = extractFirstBlock(css, /:root\s*\{/);
  const darkBlock = extractFirstBlock(css, /\.dark\s*\{/);

  const paletteKeys = Object.keys(lightPalette) as Array<keyof typeof lightPalette>;

  describe.each(["light", "dark"] as const)("%s palette", (mode) => {
    const palette = mode === "light" ? lightPalette : darkPalette;
    const block = mode === "light" ? rootBlock : darkBlock;

    it.each(paletteKeys)(`%s matches globals.css --%s`, (key) => {
      const cssValue = getCssVar(block, toKebab(key));
      expect(parseOklch(palette[key])).toEqual(parseOklch(cssValue));
    });
  });

  const statusTones = ["success", "warning", "error", "info"] as const;
  const statusRoles = ["base", "foreground", "surface", "border"] as const;
  const roleToCssSuffix: Record<(typeof statusRoles)[number], string> = {
    base: "",
    foreground: "-foreground",
    surface: "-surface",
    border: "-border",
  };

  describe.each(["light", "dark"] as const)("%s status tokens", (mode) => {
    const block = mode === "light" ? rootBlock : darkBlock;

    for (const tone of statusTones) {
      for (const role of statusRoles) {
        it(`${tone}.${role} matches globals.css --${tone}${roleToCssSuffix[role]}`, () => {
          const tsValue = statusTokens[mode][tone][role];
          const cssValue = getCssVar(block, `${tone}${roleToCssSuffix[role]}`);
          expect(parseOklch(tsValue)).toEqual(parseOklch(cssValue));
        });
      }
    }
  });

  // No `.dark` override for focus-warm — only rootBlock is checked (see
  // "focusWarmTokens contrast" describe above for why light values are
  // reused as-is in dark mode).
  describe("focusWarmTokens", () => {
    it.each(["base", "foreground", "surface"] as const)("%s matches globals.css --focus-warm%s", (role) => {
      const suffix = role === "base" ? "" : `-${role}`;
      const cssValue = getCssVar(rootBlock, `focus-warm${suffix}`);
      expect(parseOklch(focusWarmTokens[role])).toEqual(parseOklch(cssValue));
    });
  });
});
