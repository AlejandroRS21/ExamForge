// OpenSloth — Question Type Kicker Labels
// Neuroinclusive UI adoption: real, uppercase human labels for each
// `QuestionType` enum value (see prisma/schema.prisma), used as the
// ExamPractice "PromptKicker" (e.g. "WORD FORMATION").

const QUESTION_TYPE_LABELS: Record<string, string> = {
  MC: "MULTIPLE CHOICE",
  CLOZE: "OPEN CLOZE",
  WF: "WORD FORMATION",
  KT: "KEY WORD TRANSFORMATION",
  GT: "GAPPED TEXT",
  MM: "MULTIPLE MATCHING",
};

/** Returns the raw type code, uppercased, for any type not in the known map. */
export function getQuestionTypeLabel(type: string): string {
  return QUESTION_TYPE_LABELS[type] ?? type;
}
