// ExamForge — Writing Evaluation & Rubric Scoring
// SE-03: Writing SHALL use a 4-criterion rubric: Content, CA, Organisation, Language (0-5 each)
// SE-06: Writing rubric MAY use AI to generate criterion-level feedback with scores
//
// Rubric criteria definitions based on Cambridge B2 First assessment guidelines.

export interface WritingRubricScores {
  content: number;        // 0-5: Relevance, task completion, inclusion of required points
  communicativeAchievement: number; // 0-5: Register, tone, effect on target reader
  organisation: number;   // 0-5: Cohesion, paragraphing, linking devices, logical flow
  language: number;       // 0-5: Range and accuracy of vocabulary and grammar
}

export interface WritingRubricFeedback {
  content: string;
  communicativeAchievement: string;
  organisation: string;
  language: string;
  overall: string;
}

export interface WritingEvaluation {
  scores: WritingRubricScores;
  feedback: WritingRubricFeedback;
  totalScore: number;      // Sum of all 4 criteria (0-20)
  averageScore: number;    // Average across criteria (0-5)
}

/**
 * Rubric descriptor labels for each criterion and level.
 * Used for generating human-readable feedback.
 */
const RUBRIC_DESCRIPTORS: Record<keyof WritingRubricScores, string[]> = {
  content: [
    "No content submitted or completely irrelevant.",
    "Minimal relevance; most required points missing or misunderstood.",
    "Some relevant content; several required points addressed but with gaps.",
    "Mostly relevant; all required points addressed with adequate development.",
    "Good content coverage; all points well-addressed with clear development.",
    "Excellent; all points fully addressed with sophisticated development.",
  ],
  communicativeAchievement: [
    "No awareness of communicative purpose or target reader.",
    "Inappropriate register and tone; fails to communicate the message.",
    "Inconsistent register; communicates the basic message but without effect.",
    "Generally appropriate register; communicates effectively with some inconsistencies.",
    "Consistent, appropriate register; communicates clearly and effectively.",
    "Highly effective communication; register perfectly matched to purpose and reader.",
  ],
  organisation: [
    "No discernible organisation; text is incoherent.",
    "Poor organisation; lacks paragraphing and logical sequence.",
    "Some organisation present but inconsistent; linking devices limited.",
    "Generally well-organised; adequate paragraphing and linking devices.",
    "Well-organised with clear paragraphing and effective use of linking devices.",
    "Sophisticated organisation; seamless cohesion with varied linking devices.",
  ],
  language: [
    "Insufficient language to evaluate; predominantly errors.",
    "Limited vocabulary and grammar; frequent errors impede communication.",
    "Adequate range but with noticeable errors; meaning generally clear.",
    "Good range of vocabulary and grammar; errors do not impede communication.",
    "Wide range; minor errors only; natural and precise expression.",
    "Very wide range; virtually error-free; sophisticated expression throughout.",
  ],
};

/**
 * Evaluate a writing submission using heuristic analysis.
 * This provides basic feedback based on word count, structure, and vocabulary indicators.
 * For production use, replace with AI-powered evaluation via LLM.
 *
 * @param content - The writing submission text
 * @param wordCountMin - Minimum expected word count
 * @param wordCountMax - Maximum expected word count
 * @returns WritingEvaluation with scores and feedback
 */
export function evaluateWriting(
  content: string,
  wordCountMin: number,
  wordCountMax: number,
): WritingEvaluation {
  const trimmed = content.trim();
  const wordCount = trimmed ? trimmed.split(/\s+/).length : 0;

  if (!trimmed) {
    return getEmptyEvaluation();
  }

  // Heuristic scoring based on measurable text features
  const scores = computeHeuristicScores(trimmed, wordCount, wordCountMin, wordCountMax);

  const feedback = generateFeedback(scores);

  const totalScore = scores.content + scores.communicativeAchievement + scores.organisation + scores.language;
  const averageScore = totalScore / 4;

  return { scores, feedback, totalScore, averageScore };
}

/**
 * Compute rubric scores based on heuristic text analysis.
 * Used when AI evaluation is not available.
 * SE-06: Writing rubric MAY use AI — this provides a reasonable baseline.
 */
function computeHeuristicScores(
  text: string,
  wordCount: number,
  wordCountMin: number,
  wordCountMax: number,
): WritingRubricScores {
  const sentences = text.split(/[.!?]+/).filter(Boolean).length;
  const paragraphs = text.split(/\n\s*\n/).filter(Boolean).length;
  const avgSentenceLength = sentences > 0 ? wordCount / sentences : 0;

  // Content score based on length adequacy and paragraph structure
  let content = 2; // Start at "some relevant content"
  if (wordCount >= wordCountMin) content = 3;
  if (wordCount >= wordCountMin + Math.floor((wordCountMax - wordCountMin) * 0.6)) content = 4;
  if (wordCount >= wordCountMin && paragraphs >= 3) content = Math.min(5, content + 1);
  if (wordCount < wordCountMin * 0.5) content = 1;
  if (wordCount < 10) content = 0;

  // CA score based on appropriate length and sentence variety
  let ca = 2;
  if (wordCount >= wordCountMin && sentences >= 5) ca = 3;
  if (wordCount >= wordCountMin && sentences >= 8) ca = 4;
  if (wordCount >= wordCountMin * 0.8 && avgSentenceLength >= 12 && avgSentenceLength <= 25) ca = Math.min(5, ca + 1);
  if (wordCount < wordCountMin * 0.3) ca = 1;
  if (wordCount < 10) ca = 0;

  // Organisation score based on paragraphs and linking indicators
  let org = 2;
  if (paragraphs >= 2) org = 3;
  if (paragraphs >= 3) org = 4;
  if (paragraphs >= 4) org = 5;
  if (hasLinkingWords(text)) org = Math.min(5, org + 1);
  if (paragraphs === 0) org = Math.max(0, org - 1);

  // Language score based on vocabulary variety and sentence complexity
  let lang = 2;
  const uniqueWords = new Set(text.toLowerCase().split(/\s+/)).size;
  const lexicalVariety = wordCount > 0 ? uniqueWords / wordCount : 0;
  if (lexicalVariety > 0.5 && wordCount >= 50) lang = 3;
  if (lexicalVariety > 0.55 && wordCount >= 80) lang = 4;
  if (lexicalVariety > 0.6 && wordCount >= 120) lang = 5;
  if (wordCount < wordCountMin * 0.3) lang = Math.max(0, lang - 1);
  if (wordCount < 10) lang = 0;

  return {
    content: Math.max(0, Math.min(5, content)),
    communicativeAchievement: Math.max(0, Math.min(5, ca)),
    organisation: Math.max(0, Math.min(5, org)),
    language: Math.max(0, Math.min(5, lang)),
  };
}

/**
 * Check if the text contains linking/cohesive devices.
 */
function hasLinkingWords(text: string): boolean {
  const linkers = [
    "however", "therefore", "moreover", "furthermore", "nevertheless",
    "consequently", "in addition", "on the other hand", "in contrast",
    "as a result", "for example", "for instance", "in conclusion",
    "firstly", "secondly", "finally", "although", "despite",
    "due to", "because of", "in order to", "as well as",
  ];
  const lower = text.toLowerCase();
  return linkers.some((l) => lower.includes(l));
}

/**
 * Generate human-readable feedback based on scores.
 */
function generateFeedback(scores: WritingRubricScores): WritingRubricFeedback {
  return {
    content: RUBRIC_DESCRIPTORS.content[scores.content],
    communicativeAchievement: RUBRIC_DESCRIPTORS.communicativeAchievement[scores.communicativeAchievement],
    organisation: RUBRIC_DESCRIPTORS.organisation[scores.organisation],
    language: RUBRIC_DESCRIPTORS.language[scores.language],
    overall: getOverallFeedback(scores),
  };
}

/**
 * Generate overall summary feedback.
 */
function getOverallFeedback(scores: WritingRubricScores): string {
  const avg = (scores.content + scores.communicativeAchievement + scores.organisation + scores.language) / 4;

  if (avg >= 4.5) {
    return "Excellent writing. Your response demonstrates strong command of all assessment criteria. Continue practising to maintain this level.";
  }
  if (avg >= 3.5) {
    return "Good writing with solid performance across all criteria. Focus on the lower-scoring areas to reach the next level.";
  }
  if (avg >= 2.5) {
    return "Adequate writing that addresses the task but needs development in several areas. Review the feedback per criterion and practise systematically.";
  }
  if (avg >= 1.5) {
    return "Below expected level. The response shows some understanding of the task but requires significant improvement in all criteria. Consider reviewing model B2 answers.";
  }
  return "The response does not meet the minimum requirements for B2 First writing. Review the task requirements and try again with more preparation.";
}

/**
 * Get an empty evaluation for empty submissions.
 * Edge case: Empty writing → score 0 for all criteria, feedback: "No content submitted"
 */
function getEmptyEvaluation(): WritingEvaluation {
  return {
    scores: { content: 0, communicativeAchievement: 0, organisation: 0, language: 0 },
    feedback: {
      content: "No content submitted.",
      communicativeAchievement: "No content submitted.",
      organisation: "No content submitted.",
      language: "No content submitted.",
      overall: "No content submitted. Please write your response to receive feedback.",
    },
    totalScore: 0,
    averageScore: 0,
  };
}

/**
 * Get the Cambridge B2 First writing rubric criteria labels and descriptions.
 */
export function getWritingRubricCriteria(): {
  key: keyof WritingRubricScores;
  label: string;
  description: string;
}[] {
  return [
    {
      key: "content",
      label: "Content",
      description: "How well the task is completed — relevance, coverage of required points.",
    },
    {
      key: "communicativeAchievement",
      label: "Communicative Achievement",
      description: "Appropriacy of register, tone, and overall effect on the reader.",
    },
    {
      key: "organisation",
      label: "Organisation",
      description: "Structure, paragraphing, cohesion, and use of linking devices.",
    },
    {
      key: "language",
      label: "Language",
      description: "Range and accuracy of vocabulary and grammatical structures.",
    },
  ];
}
