// OpenSloth — Cambridge English Scale Lookup
// SE-02: Raw marks SHALL map to Cambridge English Scale (120–190) via level-specific lookup table
// SE-04: All scoring results SHALL display a disclaimer
//
// B2 First R&UoE: raw percentage → Cambridge English Scale (120-190)
// These tables are estimated mappings based on official Cambridge Assessment publications.
// Actual scores may vary. This is NOT an official Cambridge Assessment result.

/**
 * Disclaimer text required for all score displays.
 * SE-04: "Estimated score — not an official Cambridge result"
 */
export const SCORE_DISCLAIMER =
  "Esta es una puntuación estimada. No es un resultado oficial de Cambridge Assessment.";

/**
 * B2 First Reading & Use of English scale mapping.
 * Raw percentage → Cambridge English Scale score (120-190).
 *
 * Based on Cambridge Assessment English's published mappings for B2 First.
 * Percentages represent the proportion of correctly answered objective questions.
 */
const B2_RUOE_SCALE: [number, number][] = [
  [0, 120],
  [5, 122],
  [10, 124],
  [15, 126],
  [20, 128],
  [25, 130],
  [30, 133],
  [35, 136],
  [40, 139],
  [45, 142],
  [50, 145],
  [55, 148],
  [60, 152],
  [65, 156],
  [70, 160],
  [75, 164],
  [80, 168],
  [85, 172],
  [90, 177],
  [95, 183],
  [100, 190],
];

/**
 * B2 First Writing scale mapping.
 * Average rubric score (0-5) → Cambridge English Scale (120-190).
 *
 * Each writing task is scored on 4 criteria (Content, CA, Organisation, Language),
 * each 0-5. Average across criteria → scaled score.
 */
const B2_WRITING_SCALE: [number, number][] = [
  [0.0, 120],
  [0.5, 122],
  [1.0, 125],
  [1.5, 128],
  [2.0, 132],
  [2.5, 137],
  [3.0, 142],
  [3.5, 148],
  [4.0, 155],
  [4.5, 163],
  [5.0, 170],
];

/**
 * B2 First overall (R&UoE + Writing average) scale.
 * Average percentage across papers → Cambridge English Scale (120-190).
 */
const B2_OVERALL_SCALE: [number, number][] = [
  [0, 120],
  [10, 124],
  [20, 128],
  [30, 133],
  [40, 140],
  [45, 144],
  [50, 148],
  [55, 152],
  [60, 156],
  [65, 160],
  [70, 164],
  [75, 168],
  [80, 172],
  [85, 176],
  [90, 180],
  [95, 185],
  [100, 190],
];

/**
 * Look up a Cambridge English Scale score from a percentage using the given scale table.
 * Uses linear interpolation between table entries.
 *
 * @param percentage - Raw percentage (0-100)
 * @param scaleTable - Array of [percentage, scaleScore] entries sorted by percentage
 * @returns Estimated Cambridge English Scale score (120-190)
 */
function interpolateScale(percentage: number, scaleTable: [number, number][]): number {
  const clamped = Math.max(0, Math.min(100, percentage));

  // Find the bracketing entries
  for (let i = 0; i < scaleTable.length - 1; i++) {
    const [lowerPct, lowerScore] = scaleTable[i];
    const [upperPct, upperScore] = scaleTable[i + 1];

    if (clamped >= lowerPct && clamped <= upperPct) {
      // Linear interpolation
      const ratio = (clamped - lowerPct) / (upperPct - lowerPct);
      return Math.round(lowerScore + ratio * (upperScore - lowerScore));
    }
  }

  // Edge cases: below minimum or above maximum
  if (clamped <= scaleTable[0][0]) return scaleTable[0][1];
  return scaleTable[scaleTable.length - 1][1];
}

/**
 * Estimate Cambridge English Scale score for R&UoE objective questions.
 *
 * @param rawPercentage - Percentage of correct objective answers (0-100)
 * @returns Estimated Cambridge English Scale score (120-190)
 */
export function estimateCambridgeScale(rawPercentage: number): number {
  return interpolateScale(rawPercentage, B2_RUOE_SCALE);
}

/**
 * Estimate Cambridge English Scale score for Writing tasks based on rubric average.
 *
 * @param averageRubricScore - Average across 4 criteria (0-5)
 * @returns Estimated Cambridge English Scale score (120-190)
 */
export function estimateWritingScale(averageRubricScore: number): number {
  const clamped = Math.max(0, Math.min(5, averageRubricScore));
  return interpolateScale(clamped, B2_WRITING_SCALE);
}

/**
 * Estimate overall Cambridge English Scale score from combined performance.
 *
 * @param ruoePercentage - R&UoE raw percentage (0-100)
 * @param writingAverage - Writing rubric average (0-5, null if not evaluated)
 * @returns Estimated overall scale score (120-190)
 */
export function estimateOverallScale(
  ruoePercentage: number,
  writingAverage: number | null,
): number {
  if (writingAverage === null) {
    return estimateCambridgeScale(ruoePercentage);
  }

  const writingPercentage = (writingAverage / 5) * 100;
  const combined = (ruoePercentage + writingPercentage) / 2;
  return interpolateScale(combined, B2_OVERALL_SCALE);
}

/**
 * Get the Cambridge English Scale grade label.
 */
export function getScaleGrade(scaleScore: number): string {
  if (scaleScore >= 180) return "A";
  if (scaleScore >= 173) return "B";
  if (scaleScore >= 160) return "C";
  if (scaleScore >= 140) return "B1";
  return "Below B1";
}

/**
 * Get the Cambridge English Scale range for B2 First.
 */
export function getScaleRange(): { min: number; max: number } {
  return { min: 120, max: 190 };
}
