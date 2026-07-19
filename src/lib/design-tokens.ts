// ExamForge — Neuroinclusive Design Tokens
// Single source of truth for the soft blue/green palette + semantic status
// tokens declared in `src/app/globals.css`. Kept as plain data + pure
// functions (no DOM) so contrast can be verified in a Node test environment
// without jsdom/RTL — see design doc "Test Infrastructure Decision".

export interface OklchColor {
  l: number;
  c: number;
  h: number;
}

/**
 * Parses a CSS `oklch(L C H)` string into its numeric components.
 * Only accepts the unitless triplet form used across globals.css
 * (no alpha channel, no percentage lightness).
 */
export function parseOklch(value: string): OklchColor {
  const match = value.match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)/);
  if (!match) {
    throw new Error(`Invalid oklch() value: "${value}"`);
  }
  return {
    l: parseFloat(match[1]),
    c: parseFloat(match[2]),
    h: parseFloat(match[3]),
  };
}

function oklchToLinearSrgb({ l, c, h }: OklchColor): { r: number; g: number; b: number } {
  const hRad = (h * Math.PI) / 180;
  const a = c * Math.cos(hRad);
  const b = c * Math.sin(hRad);

  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.2914855480 * b;

  const lCubed = l_ ** 3;
  const mCubed = m_ ** 3;
  const sCubed = s_ ** 3;

  return {
    r: 4.0767416621 * lCubed - 3.3077115913 * mCubed + 0.2309699292 * sCubed,
    g: -1.2684380046 * lCubed + 2.6097574011 * mCubed - 0.3413193965 * sCubed,
    b: -0.0041960863 * lCubed - 0.7034186147 * mCubed + 1.7076147010 * sCubed,
  };
}

/**
 * WCAG relative luminance from linear sRGB channels (clamped to the
 * displayable [0, 1] gamut before weighting).
 */
function relativeLuminance(rgb: { r: number; g: number; b: number }): number {
  const clamp = (channel: number) => Math.min(1, Math.max(0, channel));
  return 0.2126 * clamp(rgb.r) + 0.7152 * clamp(rgb.g) + 0.0722 * clamp(rgb.b);
}

/**
 * WCAG 2.x contrast ratio between two `oklch()` color strings.
 * Returns a value from 1 (no contrast) to 21 (black vs white).
 */
export function contrastRatio(colorA: string, colorB: string): number {
  const luminanceA = relativeLuminance(oklchToLinearSrgb(parseOklch(colorA)));
  const luminanceB = relativeLuminance(oklchToLinearSrgb(parseOklch(colorB)));
  const lighter = Math.max(luminanceA, luminanceB);
  const darker = Math.min(luminanceA, luminanceB);
  return (lighter + 0.05) / (darker + 0.05);
}

// ─── Palette — mirrors :root / .dark in globals.css ────────────────────────
// Primary hues stay within 200-220, accent hues within 150-170 (spec
// requirement). All AA-verified via contrastRatio() in design-tokens.test.ts.

export const lightPalette = {
  background: "oklch(0.985 0.006 95)",
  foreground: "oklch(0.30 0.03 250)",
  card: "oklch(0.995 0.004 95)",
  cardForeground: "oklch(0.30 0.03 250)",
  popover: "oklch(0.995 0.004 95)",
  popoverForeground: "oklch(0.30 0.03 250)",
  primary: "oklch(0.52 0.11 210)",
  primaryForeground: "oklch(0.99 0.005 95)",
  secondary: "oklch(0.94 0.015 220)",
  secondaryForeground: "oklch(0.35 0.04 210)",
  muted: "oklch(0.95 0.012 210)",
  mutedForeground: "oklch(0.48 0.03 210)",
  accent: "oklch(0.93 0.03 165)",
  accentForeground: "oklch(0.38 0.06 165)",
  destructive: "oklch(0.52 0.16 25)",
  destructiveForeground: "oklch(0.99 0.005 95)",
  border: "oklch(0.65 0.02 220)",
  input: "oklch(0.65 0.02 220)",
  ring: "oklch(0.52 0.11 210)",
} as const;

export const darkPalette = {
  background: "oklch(0.20 0.02 250)",
  foreground: "oklch(0.92 0.01 250)",
  card: "oklch(0.24 0.02 250)",
  cardForeground: "oklch(0.92 0.01 250)",
  popover: "oklch(0.24 0.02 250)",
  popoverForeground: "oklch(0.92 0.01 250)",
  primary: "oklch(0.70 0.10 210)",
  primaryForeground: "oklch(0.16 0.02 250)",
  secondary: "oklch(0.28 0.02 220)",
  secondaryForeground: "oklch(0.92 0.01 250)",
  muted: "oklch(0.27 0.02 210)",
  mutedForeground: "oklch(0.72 0.02 210)",
  accent: "oklch(0.30 0.05 165)",
  accentForeground: "oklch(0.90 0.05 165)",
  destructive: "oklch(0.65 0.17 25)",
  destructiveForeground: "oklch(0.16 0.02 250)",
  border: "oklch(0.50 0.02 220)",
  input: "oklch(0.50 0.02 220)",
  ring: "oklch(0.70 0.10 210)",
} as const;

// ─── Semantic status tokens — success/warning/error/info ───────────────────
// `error` mirrors the destructive family; `info` mirrors the primary family.
// Each tone exposes base/foreground/surface for the two rendering variants
// consumed later by `getStatusToneClasses()` (PR2).

export interface StatusTone {
  base: string;
  foreground: string;
  surface: string;
}

export const statusTokens = {
  light: {
    success: {
      base: "oklch(0.52 0.09 165)",
      foreground: "oklch(0.99 0.005 95)",
      surface: "oklch(0.95 0.03 165)",
    },
    warning: {
      base: "oklch(0.50 0.15 65)",
      foreground: "oklch(0.99 0.005 95)",
      surface: "oklch(0.97 0.025 65)",
    },
    error: {
      base: lightPalette.destructive,
      foreground: lightPalette.destructiveForeground,
      surface: "oklch(0.95 0.03 25)",
    },
    info: {
      base: lightPalette.primary,
      foreground: lightPalette.primaryForeground,
      surface: "oklch(0.96 0.03 210)",
    },
  },
  dark: {
    success: {
      base: "oklch(0.68 0.11 165)",
      foreground: "oklch(0.16 0.02 250)",
      surface: "oklch(0.28 0.05 165)",
    },
    warning: {
      base: "oklch(0.72 0.14 65)",
      foreground: "oklch(0.16 0.02 250)",
      surface: "oklch(0.30 0.06 65)",
    },
    error: {
      base: darkPalette.destructive,
      foreground: darkPalette.destructiveForeground,
      surface: "oklch(0.25 0.06 25)",
    },
    info: {
      base: darkPalette.primary,
      foreground: darkPalette.primaryForeground,
      surface: "oklch(0.28 0.05 210)",
    },
  },
} as const satisfies Record<"light" | "dark", Record<"success" | "warning" | "error" | "info", StatusTone>>;
