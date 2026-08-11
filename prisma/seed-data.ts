// OpenSloth — Seed data (pure, testable)
// E-C-1: Writing parts + prompts are seeded so the Writing paper renders.
// E-C-2: R&UoE question counts sum to 56 (8+8+8+6+6+10+10).
// Runtime inserts live in prisma/seed.ts; this module only carries the data so
// integrity tests run without a database.

export interface SeedExamPart {
  id: string;
  label: string;
  paper: string;
  partNumber: number;
  description: string;
  timeMinutes: number;
  questionCount: number;
}

export interface SeedWritingPrompt {
  id: string;
  examPartId: string;
  prompt: string;
  wordCountMin: number;
  wordCountMax: number;
  rubric: Record<string, string>;
}

/** Cambridge B2 First standard rubric (4 criteria, 0-5 each). */
const B2_RUBRIC: Record<string, string> = {
  content: "Content: relevance, development and fulfilment of the task.",
  communicativeAchievement: "Communicative Achievement: register, tone and target reader.",
  organisation: "Organisation: paragraphing, cohesion and linking devices.",
  language: "Language: range, accuracy and control of grammar and vocabulary.",
};

export const examParts: SeedExamPart[] = [
  { id: "ruoe-part-1", label: "Multiple Choice Cloze", paper: "R&UoE", partNumber: 1, description: "Vocabulary & phrasal verbs in context", timeMinutes: 10, questionCount: 8 },
  { id: "ruoe-part-2", label: "Open Cloze", paper: "R&UoE", partNumber: 2, description: "Grammar & prepositions in passage", timeMinutes: 10, questionCount: 8 },
  { id: "ruoe-part-3", label: "Word Formation", paper: "R&UoE", partNumber: 3, description: "Affixes & root word derivation", timeMinutes: 10, questionCount: 8 },
  { id: "ruoe-part-4", label: "Key Word Transformation", paper: "R&UoE", partNumber: 4, description: "Sentence re-writing using key word", timeMinutes: 12, questionCount: 6 },
  { id: "ruoe-part-5", label: "Gapped Text", paper: "R&UoE", partNumber: 5, description: "Paragraph & discourse cohesion", timeMinutes: 15, questionCount: 6 },
  { id: "ruoe-part-6", label: "Multiple Matching", paper: "R&UoE", partNumber: 6, description: "Detail reading & paragraph matching", timeMinutes: 13, questionCount: 10 },
  { id: "ruoe-part-7", label: "Short Texts Matching", paper: "R&UoE", partNumber: 7, description: "Scanning & opinion identification", timeMinutes: 15, questionCount: 10 },
  { id: "writing-part-1", label: "Writing Part 1 — Essay", paper: "Writing", partNumber: 1, description: "Essay: develop an argument with all the notes", timeMinutes: 45, questionCount: 1 },
  { id: "writing-part-2", label: "Writing Part 2 — Choose One", paper: "Writing", partNumber: 2, description: "Article, email or review: choose one option", timeMinutes: 45, questionCount: 3 },
];

export const writingPrompts: SeedWritingPrompt[] = [
  {
    id: "writing-prompt-part-1-essay",
    examPartId: "writing-part-1",
    prompt:
      "In your English class you have been talking about the environment. Now your English teacher has asked you to write an essay.\n\nWrite your essay using all the notes and giving reasons for your point of view.\n\nEssay title: How can we encourage people to recycle more?\n\nNotes:\n1. Write about the importance of recycling.\n2. Suggest ways of encouraging people to recycle.\n3. Give your own idea about how recycling could be improved in your town or city.",
    wordCountMin: 140,
    wordCountMax: 190,
    rubric: B2_RUBRIC,
  },
  {
    id: "writing-prompt-part-2-article",
    examPartId: "writing-part-2",
    prompt:
      "You see this notice in an English-language magazine for teenagers.\n\nArticles wanted: A city I would love to visit\n\nWrite an article telling us which city you would love to visit and why. Explain what you would do there and who you would go with.\n\nThe best articles will be published in the magazine.",
    wordCountMin: 140,
    wordCountMax: 190,
    rubric: B2_RUBRIC,
  },
  {
    id: "writing-prompt-part-2-email",
    examPartId: "writing-part-2",
    prompt:
      "You have received this email from your English-speaking friend, Sam.\n\n'Our school has asked for ideas for a new after-school club. I think a cooking club would be great! What do you think? Would you join it? What other ideas do you have?'\n\nWrite your email to Sam, giving your opinion and suggesting another club.",
    wordCountMin: 140,
    wordCountMax: 190,
    rubric: B2_RUBRIC,
  },
  {
    id: "writing-prompt-part-2-review",
    examPartId: "writing-part-2",
    prompt:
      "You see this announcement in an English-language website for students.\n\nReviews wanted: A film or series I have watched recently\n\nWrite a review of a film or series you have watched recently. Tell us what it is about, why you enjoyed it (or not), and who you would recommend it to.",
    wordCountMin: 140,
    wordCountMax: 190,
    rubric: B2_RUBRIC,
  },
];