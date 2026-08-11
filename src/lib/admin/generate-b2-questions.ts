// OpenSloth — AI-Powered B2 Question Generation
// Generate realistic Cambridge B2 First questions using Claude

import { generateJSON } from "@/lib/ai/client";
import prisma from "@/lib/prisma";
import type { QuestionType, QuestionDifficulty } from "@/generated/prisma/client";
import { Prisma } from "@/generated/prisma/client";

interface GeneratedQuestion {
  type: QuestionType;
  prompt: string;
  options?: string[];
  correctAnswer: string | { keyword: string; acceptable: string[] };
  difficulty: QuestionDifficulty;
  skillsTested: string[];
  explanation: string;
}

const PART_SPECS: Record<string, { types: QuestionType[]; description: string }> = {
  "ruoe-part-1": {
    types: ["MC"],
    description:
      "Multiple-choice vocabulary/grammar. Single gap in sentence, 4 options A-D. Focus: vocabulary, phrasal verbs, collocations.",
  },
  "ruoe-part-2": {
    types: ["CLOZE"],
    description:
      "Open cloze (no options). Multiple gaps in a passage. Focus: grammar, structure, common words.",
  },
  "ruoe-part-3": {
    types: ["WF"],
    description: "Word formation. Given root word, student forms correct part of speech. Focus: affixes, word families.",
  },
  "ruoe-part-4": {
    types: ["KT"],
    description:
      "Key word transformation. Rewrite sentence keeping key word. Focus: grammar, register, synonymy.",
  },
  "ruoe-part-5": {
    types: ["GT"],
    description:
      "Gapped text (multiple choice). Select correct sentence/phrase to fill gaps. Focus: discourse, cohesion.",
  },
  "ruoe-part-6": {
    types: ["MM"],
    description: "Multiple matching. Match paragraphs to questions. Focus: reading comprehension, inference.",
  },
  "ruoe-part-7": {
    types: ["MM"],
    description: "Multiple matching (second set). Match longer texts to questions. Focus: detail reading.",
  },
  "writing-part-1": {
    types: ["MC"], // Placeholder type; Writing doesn't use MC — we handle this specially
    description:
      "Essay writing. Formal essay (220-260 words). Topics: opinion, advantages/disadvantages, problem/solution.",
  },
  "writing-part-2": {
    types: ["MC"],
    description:
      "Flexible writing (200-220 words). Email, article, report, or review. Real-world scenarios.",
  },
};

/**
 * Generate a single B2 question for a given part.
 */
async function generateSingleQuestion(
  partId: string,
  partSpec: (typeof PART_SPECS)[string],
  difficulty: QuestionDifficulty,
  attemptNum: number,
): Promise<GeneratedQuestion | null> {
  const systemPrompt = `You are a Cambridge B2 First (FCE) exam question writer. Generate realistic, high-quality exam questions that match official Cambridge standards. Always respond with valid JSON only.`;

  const userPrompt = `Generate a B2 First exam question for: ${partId}

Specification: ${partSpec.description}
Difficulty: ${difficulty === "A" ? "Easy (B2 baseline)" : difficulty === "B" ? "Standard (typical B2)" : "Challenge (upper B2)"}

Question type: ${partSpec.types[0]}

IMPORTANT: Respond with ONLY valid JSON matching this exact schema:
{
  "type": "${partSpec.types[0]}",
  "prompt": "Question text (for MC/CLOZE/WF/KT) OR essay topic (for Writing)",
  "options": ["A", "B", "C", "D"] OR null,
  "correctAnswer": ${partSpec.types[0] === "KT" ? '{"keyword": "KEYWORD (UPPERCASE)", "acceptable": ["full acceptable sentence 1", "full acceptable sentence 2"]}' : '"A" OR "the exact word/phrase"'},
  "difficulty": "${difficulty}",
  "skillsTested": ["vocab", "grammar", ...],
  "explanation": "Why this is correct"
}

Make the question realistic, contextual, and aligned with Cambridge B2 standards. For MC, all options must be plausible. For KT (Key Word Transformation), the "prompt" must contain the "leadIn" sentence and the sentence to transform, and "correctAnswer" must be an object {"keyword": "...", "acceptable": ["..."]} where the keyword is the transformed key word and acceptable are the full correct rewritten sentences. For Writing topics, provide clear, engaging prompts.`;

  const result = await generateJSON<GeneratedQuestion>({
    systemPrompt,
    userPrompt,
    maxTokens: 600,
  });

  if (!result) {
    console.warn(`[Gen ${attemptNum}] No AI result for ${partId}, attempt ${attemptNum}`);
    return null;
  }

  // Validate structure (correctAnswer is string for MC/CLOZE/WF, object for KT)
  const validAnswer =
    typeof result.correctAnswer === "string" ||
    (typeof result.correctAnswer === "object" &&
      result.correctAnswer !== null &&
      typeof (result.correctAnswer as { keyword?: unknown }).keyword === "string" &&
      Array.isArray((result.correctAnswer as { acceptable?: unknown }).acceptable));
  if (!result.type || !result.prompt || !validAnswer || !result.difficulty) {
    console.warn(`[Gen ${attemptNum}] Invalid structure for ${partId}`);
    return null;
  }

  return result;
}

/**
 * Generate N questions for a part, with retries on failure.
 */
async function generateQuestionsForPart(
  partId: string,
  count: number,
  difficulties: QuestionDifficulty[] = ["A", "B", "C"],
): Promise<GeneratedQuestion[]> {
  const partSpec = PART_SPECS[partId];
  if (!partSpec) {
    console.error(`Unknown part: ${partId}`);
    return [];
  }

  const questions: GeneratedQuestion[] = [];
  let attemptNum = 0;
  let targetIndex = 0;

  // Try to generate `count` questions with retries
  while (questions.length < count && attemptNum < count * 3) {
    attemptNum++;
    const difficulty = difficulties[targetIndex % difficulties.length];
    targetIndex++;

    const q = await generateSingleQuestion(partId, partSpec, difficulty, attemptNum);
    if (q) {
      questions.push(q);
      console.log(`✓ Generated ${partId} #${questions.length} (attempt ${attemptNum})`);
    }

    // Small delay to avoid rate limits
    await new Promise((r) => setTimeout(r, 300));
  }

  return questions;
}

/**
 * Generate all B2 questions across R&UoE + Writing and save to DB.
 * Strategy: 3-4 questions per part, variety of difficulties.
 */
export async function generateAllB2Questions(): Promise<{ created: number; failed: number; error?: string }> {
  console.log("🚀 Starting B2 question generation...");

  const partConfigs = [
    { partId: "ruoe-part-1", count: 4 },
    { partId: "ruoe-part-2", count: 4 },
    { partId: "ruoe-part-3", count: 4 },
    { partId: "ruoe-part-4", count: 4 },
    { partId: "ruoe-part-5", count: 3 },
    { partId: "ruoe-part-6", count: 3 },
    { partId: "ruoe-part-7", count: 3 },
    { partId: "writing-part-1", count: 5 }, // Writing prompts
    { partId: "writing-part-2", count: 5 },
  ];

  let totalCreated = 0;
  let totalFailed = 0;

  for (const config of partConfigs) {
    try {
      const questions = await generateQuestionsForPart(config.partId, config.count);
      console.log(`Inserting ${questions.length} questions for ${config.partId}...`);

      if (questions.length === 0) {
        console.warn(`⚠️ No questions generated for ${config.partId}`);
        totalFailed += config.count;
        continue;
      }

      // Save to DB
      const created = await prisma.question.createMany({
        data: questions.map((q) => ({
          examPartId: config.partId,
          type: q.type,
          prompt: q.prompt,
          options: q.options ? (q.options as Prisma.InputJsonValue) : Prisma.DbNull,
          correctAnswer: q.correctAnswer,
          difficulty: q.difficulty,
          skillsTested: q.skillsTested,
          explanation: q.explanation,
          status: "DRAFT" as const,
          aiGenerated: true,
        })),
      });

      totalCreated += created.count;
      console.log(`✅ ${created.count} questions created for ${config.partId}`);
      totalFailed += questions.length - created.count;

      // Delay between parts
      await new Promise((r) => setTimeout(r, 1000));
    } catch (error) {
      console.error(`❌ Error generating ${config.partId}:`, error);
      totalFailed += config.count;
    }
  }

  console.log(`\n📊 Generation complete: ${totalCreated} created, ${totalFailed} failed`);
  return { created: totalCreated, failed: totalFailed };
}

/**
 * Generate questions for a single part (for testing/on-demand).
 */
export async function generateQuestionsForPartAndSave(
  partId: string,
  count: number = 3,
): Promise<{ created: number; questions: GeneratedQuestion[] }> {
  const questions = await generateQuestionsForPart(partId, count);

  if (questions.length === 0) {
    return { created: 0, questions: [] };
  }

  const created = await prisma.question.createMany({
    data: questions.map((q) => ({
      examPartId: partId,
      type: q.type,
      prompt: q.prompt,
      options: q.options ? (q.options as Prisma.InputJsonValue) : Prisma.DbNull,
      correctAnswer: q.correctAnswer,
      difficulty: q.difficulty,
      skillsTested: q.skillsTested,
      explanation: q.explanation,
      status: "DRAFT" as const,
      aiGenerated: true,
    })),
  });

  return { created: created.count, questions };
}
