// OpenSloth — Objective Question Scorer
// SE-01: Objective questions SHALL be auto-scored against stored answer keys
// Per-type comparison: MC exact, Cloze/WF case-insensitive, KT keyword-spotting,
// GT ordered sequence, MM unordered set

/**
 * Score an individual answer based on question type.
 *
 * @param type - Question type (MC, CLOZE, WF, KT, GT, MM)
 * @param givenAnswer - The user's submitted answer
 * @param correctAnswer - The stored correct answer(s) from the question bank
 * @returns true if the answer is correct, false otherwise
 */
export function scoreAnswer(type: string, givenAnswer: unknown, correctAnswer: unknown): boolean {
  try {
    switch (type) {
      case "MC":
        return scoreMC(givenAnswer, correctAnswer);

      case "CLOZE":
      case "WF":
        return scoreClozeOrWF(givenAnswer, correctAnswer);

      case "KT":
        return scoreKT(givenAnswer, correctAnswer);

      case "GT":
        return scoreGT(givenAnswer, correctAnswer);

      case "MM":
        return scoreMM(givenAnswer, correctAnswer);

      default:
        return false;
    }
  } catch {
    return false;
  }
}

/**
 * Multiple Choice: exact string match (case-insensitive, trimmed).
 * correctAnswer format: string (e.g., "A", "preservation")
 */
function scoreMC(givenAnswer: unknown, correctAnswer: unknown): boolean {
  return String(givenAnswer).trim().toLowerCase() === String(correctAnswer).trim().toLowerCase();
}

/**
 * Open cloze / Word formation: case-insensitive, accept array of acceptable answers.
 * correctAnswer format: string | string[]
 */
function scoreClozeOrWF(givenAnswer: unknown, correctAnswer: unknown): boolean {
  const given = String(givenAnswer).trim().toLowerCase();
  const acceptable = Array.isArray(correctAnswer)
    ? correctAnswer.map((a: unknown) => String(a).trim().toLowerCase())
    : [String(correctAnswer).trim().toLowerCase()];
  return acceptable.includes(given);
}

/**
 * Key word transformation: keyword-spotting in the transformed sentence.
 * correctAnswer format: { keyword: string, acceptable: string[] }
 * Must contain the keyword AND match one of the acceptable forms.
 */
function scoreKT(givenAnswer: unknown, correctAnswer: unknown): boolean {
  const ktGiven = String(givenAnswer).trim().toLowerCase();
  const ca = correctAnswer as Record<string, unknown>;
  const keyword = String(ca.keyword ?? "").toLowerCase();
  const acceptableKt = (ca.acceptable as unknown[] ?? []).map((a: unknown) =>
    String(a).trim().toLowerCase(),
  );
  return ktGiven.includes(keyword) && acceptableKt.some((a: string) => ktGiven.includes(a));
}

/**
 * Gapped text: ordered sequence match.
 * correctAnswer format: string[] (ordered sequence of item IDs)
 */
function scoreGT(givenAnswer: unknown, correctAnswer: unknown): boolean {
  const givenOrder = Array.isArray(givenAnswer) ? givenAnswer : [givenAnswer];
  const correctOrder = Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer];
  return (
    givenOrder.length === correctOrder.length &&
    givenOrder.every((g: unknown, i: number) => String(g).trim() === String(correctOrder[i]).trim())
  );
}

/**
 * Generic correctness check used by interactive/practice flows where the
 * expected shape is not known up-front (string, array of acceptable answers,
 * or object). Case-insensitive and trimmed; objects compare by JSON equality.
 * Null/undefined either side is never correct.
 */
export function checkIsCorrect(given: unknown, expected: unknown): boolean {
  if (given === null || given === undefined || expected === null || expected === undefined) {
    return false;
  }
  const normGiven = String(given).trim().toLowerCase();

  if (typeof expected === "string") {
    return normGiven === expected.trim().toLowerCase();
  }
  if (Array.isArray(expected)) {
    return expected.some((exp) => String(exp).trim().toLowerCase() === normGiven);
  }
  if (typeof expected === "object") {
    return JSON.stringify(given) === JSON.stringify(expected);
  }
  return false;
}

/**
 * Multiple matching: unordered set intersection.
 * correctAnswer format: string[] (set of correct options)
 */
function scoreMM(givenAnswer: unknown, correctAnswer: unknown): boolean {
  const givenSet = (Array.isArray(givenAnswer) ? givenAnswer : [givenAnswer]).map((g: unknown) =>
    String(g).trim(),
  );
  const correctSet = (Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer]).map(
    (c: unknown) => String(c).trim(),
  );
  return (
    givenSet.length === correctSet.length &&
    givenSet.every((g: string) => correctSet.includes(g))
  );
}
