// OpenSloth — Scoring Library Barrel Export

export { scoreAnswer } from "./objective";

export {
  estimateCambridgeScale,
  estimateWritingScale,
  estimateOverallScale,
  getScaleGrade,
  getScaleRange,
  SCORE_DISCLAIMER,
} from "./cambridge-scale";

export {
  evaluateWriting,
  getWritingRubricCriteria,
} from "./writing";
export type {
  WritingRubricScores,
  WritingRubricFeedback,
  WritingEvaluation,
} from "./writing";
