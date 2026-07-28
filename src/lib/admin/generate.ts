// ExamForge — AI Question Generation Pipeline
// Generates B2 First questions via structured prompts to the shared 9router client.
// Falls back to deterministic mock generators when AI is unconfigured or fails,
// so seeding/dev never hard-fails.

import prisma from "@/lib/prisma";
import { createQuestion } from "@/lib/admin/questions";
import { generateJSON, isAIConfigured } from "@/lib/ai/client";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface GenerationRequest {
  examPartId: string;
  count: number;
  difficulty?: "A" | "B" | "C";
}

export interface GenerationResult {
  generated: number;
  questions: Array<{ id: string; type: string; prompt: any }>;
  errors: string[];
}

// ─── Question Prompts (structured per type) ─────────────────────────────────

interface GeneratedQuestion {
  prompt: any;
  options?: any;
  correctAnswer: any;
  explanation: string;
  difficulty: "A" | "B" | "C";
  skillsTested: string[];
}

// ─── LLM — 9router AI with deterministic mock fallback ──────────────────────

const TYPE_BY_PART: Record<number, string> = {
  1: "MC",
  2: "CLOZE",
  3: "WF",
  4: "KT",
  5: "GT",
  6: "MM",
  7: "MM",
};

/**
 * Generate `count` questions for a part. Attempts the shared 9router client
 * first; on unconfigured/failed/empty AI, falls back to the mock generators so
 * seeding never hard-fails. Produces the same GeneratedQuestion[] shape either way.
 */
async function callLLM(
  examPart: { label: string; partNumber: number; paper: string },
  type: string,
  count: number,
  difficulty: string,
): Promise<GeneratedQuestion[]> {
  const qType = TYPE_BY_PART[examPart.partNumber] ?? type ?? "MC";

  if (isAIConfigured()) {
    const aiQuestions = await generateAIQuestions(examPart, qType, count, difficulty);
    if (aiQuestions.length > 0) {
      return aiQuestions;
    }
  }

  // Fallback: deterministic mock questions.
  const questions: GeneratedQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const q = generateMockQuestion(qType, difficulty, i + 1, examPart.label);
    if (q) questions.push(q);
  }
  return questions;
}

/**
 * Ask the shared 9router client for `count` B2 questions.
 * Returns [] on any failure so callLLM can fall back to mocks.
 */
async function generateAIQuestions(
  examPart: { label: string; partNumber: number; paper: string },
  qType: string,
  count: number,
  difficulty: string,
): Promise<GeneratedQuestion[]> {
  const systemPrompt = `You are a Cambridge B2 First (FCE) exam question writer. Generate realistic, high-quality exam questions that match official Cambridge standards. Always respond with valid JSON only.`;

  const questions: GeneratedQuestion[] = [];
  const diff = (["A", "B", "C"].includes(difficulty) ? difficulty : "B") as "A" | "B" | "C";

  for (let i = 0; i < count; i++) {
    const userPrompt = `Generate ONE Cambridge B2 First "${qType}" question for exam part "${examPart.label}".
Difficulty: ${diff === "A" ? "Easy (B2 baseline)" : diff === "B" ? "Standard (typical B2)" : "Challenge (upper B2)"}

Respond with ONLY valid JSON matching this exact schema:
{
  "prompt": <string or object with the question text/passage>,
  "options": <array of strings OR null>,
  "correctAnswer": <string or array — the correct answer(s)>,
  "explanation": "<why the answer is correct>",
  "difficulty": "${diff}",
  "skillsTested": ["<skill>", ...]
}`;

    const result = await generateJSON<GeneratedQuestion>({
      systemPrompt,
      userPrompt,
      maxTokens: 800,
    });

    // Validate minimal contract; skip invalid so we fall back if none succeed.
    if (result && result.prompt && result.correctAnswer !== undefined) {
      questions.push({
        prompt: result.prompt,
        options: result.options,
        correctAnswer: result.correctAnswer,
        explanation: result.explanation ?? "AI-generated B2 First question.",
        difficulty: (["A", "B", "C"].includes(result.difficulty) ? result.difficulty : diff) as "A" | "B" | "C",
        skillsTested: Array.isArray(result.skillsTested) ? result.skillsTested : ["general comprehension"],
      });
    }
  }

  return questions;
}

function generateMockQuestion(
  type: string,
  difficulty: string,
  index: number,
  partLabel: string,
): GeneratedQuestion {
  const diff = (difficulty as "A" | "B" | "C") ?? "B";

  switch (type) {
    case "MC": {
      const passage = getMCPassage();
      return {
        prompt: {
          text: passage.text,
          blank: passage.blank,
          question: passage.question,
        },
        options: passage.options,
        correctAnswer: passage.correctAnswer,
        explanation: passage.explanation,
        difficulty: diff,
        skillsTested: ["vocabulary", "collocations", "grammar"],
      };
    }

    case "CLOZE": {
      return {
        prompt: {
          text: `Read the text below and think of the word which best fits each gap. Use only one word in each gap.

Many people dream ${index === 1 ? "of" : "about"} starting their own business, but few actually take the step. The main reason ${index === 2 ? "is" : "remains"} that they are afraid ${index === 3 ? "of" : "about"} failure. However, with proper planning and dedication, running your own company can ${index === 4 ? "be" : "become"} one of the most rewarding experiences ${index === 5 ? "in" : "of"} life. It requires not ${index === 6 ? "only" : "just"} financial investment ${index === 7 ? "but" : "and"} also emotional resilience. ${index === 8 ? "Despite" : "Although"} the challenges, many entrepreneurs find ${index === 9 ? "that" : "it"} the freedom ${index === 10 ? "to" : "of"} be your own boss is worth the risk.`,
          gaps: [
            { position: index * 5 - 4, answer: "of" },
            { position: index * 5 - 3, answer: "is" },
            { position: index * 5 - 2, answer: "of" },
            { position: index * 5 - 1, answer: "be" },
            { position: index * 5, answer: "in" },
          ],
        },
        correctAnswer: [
          { position: index * 5 - 4, answer: "of" },
          { position: index * 5 - 3, answer: "is" },
          { position: index * 5 - 2, answer: "of" },
          { position: index * 5 - 1, answer: "be" },
          { position: index * 5, answer: "in" },
        ],
        explanation: "These gaps test common prepositions, verb forms, and grammatical structures typical of B2 First open cloze tasks.",
        difficulty: diff,
        skillsTested: ["grammar", "prepositions", "sentence structure"],
      };
    }

    case "WF": {
      const words = ["popular", "compete", "employ", "economy", "environment"];
      const word = words[index % words.length];
      return {
        prompt: {
          text: `Complete the sentences with the correct form of the word in capitals.

The ${word}ity of online shopping has grown significantly in recent years. (${word.toUpperCase()})
Many companies face intense ${word === "compete" ? "competition" : word + "ition"} in the global market. (${word.toUpperCase()})
The company announced new ${word === "employ" ? "employment" : word + "ment"} opportunities next month. (${word.toUpperCase()})
${word.charAt(0).toUpperCase() + word.slice(1)} indicators suggest a recovery is underway. (${word.toUpperCase()})
We must consider the ${word === "environment" ? "environmental" : word + "al"} impact of our decisions. (${word.toUpperCase()})`,
        },
        correctAnswer: [
          `${word}ity`,
          word === "compete" ? "competition" : word + "ition",
          word === "employ" ? "employment" : word + "ment",
          word.charAt(0).toUpperCase() + word.slice(1),
          word === "environment" ? "environmental" : word + "al",
        ],
        explanation: "Word formation tests knowledge of suffixes and prefixes to transform root words into different parts of speech.",
        difficulty: diff,
        skillsTested: ["word formation", "vocabulary", "affixes"],
      };
    }

    case "KT": {
      return {
        prompt: {
          text: `Complete the second sentence so it has a similar meaning to the first, using the word given. Do not change the word given. Use between two and five words.

1. "I'm sorry I'm late," she said. (APOLOGISED)
   She _______________ being late.

2. The last time I saw her was in 2019. (SEEN)
   I _______________ 2019.

3. It's possible that he forgot about the meeting. (MAY)
   He _______________ about the meeting.`,
        },
        correctAnswer: [
          "apologised for",
          "haven't seen her since",
          "may have forgotten",
        ],
        explanation: "Key word transformations test the ability to paraphrase using specific grammar structures while keeping the original meaning.",
        difficulty: diff,
        skillsTested: ["paraphrasing", "grammar", "sentence transformation"],
      };
    }

    case "GT": {
      return {
        prompt: {
          text: `You are going to read an article about sustainable living. Seven sentences have been removed from the article. Choose from the sentences A-H the one which fits each gap (1-6). There is one extra sentence which you do not need to use.

Sustainable living is becoming increasingly important in today's world. ${"[1]"} Many people are now looking for ways to reduce their carbon footprint.
${"[2]"} Simple changes like using public transport or reducing energy consumption can make a significant difference.
${"[3]"} However, some argue that individual actions are not enough without systemic change.
${"[4]"} Governments and corporations also need to play their part in creating a more sustainable future.
${"[5]"} Despite these challenges, the growing awareness of environmental issues gives reason for optimism.
${"[6]"} Young people, in particular, are leading the charge in demanding action on climate change.`,
          sentences: [
            "This has led to a surge in eco-friendly products and services.",
            "Small daily habits add up to substantial environmental benefits over time.",
            "Critics point out that a handful of corporations produce the majority of emissions.",
            "Policy changes at the national level can accelerate the transition to renewable energy.",
            "Education plays a crucial role in shaping environmentally conscious behaviour.",
            "Their activism has pushed climate issues to the top of the political agenda.",
            "Many traditional industries are struggling to adapt to new environmental regulations.",
          ],
          correctOrder: [0, 1, 2, 3, 4, 5],
        },
        correctAnswer: ["A", "D", "C", "F", "B", "E"],
        explanation: "Gapped text tests understanding of text cohesion and the logical flow of ideas between paragraphs.",
        difficulty: diff,
        skillsTested: ["reading comprehension", "cohesion", "text structure"],
      };
    }

    case "MM": {
      return {
        prompt: {
          text: `You are going to read a magazine article about four people who have taken up unusual hobbies. For questions 1-10, choose from the people (A-D). The people may be chosen more than once.

Which person:
1. started their hobby after a personal loss?
2. spends more than 10 hours per week on their hobby?
3. has turned their hobby into a source of income?
4. says their hobby helps them relax after work?
5. met new friends through their hobby?
6. plans to enter a competition soon?
7. says the hobby was easier to learn than expected?
8. incorporates their cultural background into the hobby?
9. has bought special equipment for their hobby?
10. recommends the hobby to people of all ages?`,
          people: [
            {
              name: "Anna",
              text: "After retiring, I felt I needed something meaningful to fill my time. I now spend about 15 hours a week restoring vintage furniture. I sell pieces online and it's become a nice side income. The skills took time to develop but the results are incredibly satisfying.",
            },
            {
              name: "Marco",
              text: "I took up photography after my father passed away. It started as a way to process my grief but quickly became a passion. I joined a local photography club and made wonderful friends. Next month I'm entering my first exhibition.",
            },
            {
              name: "Sofia",
              text: "My grandmother taught me traditional weaving patterns from our country. I find it very meditative after a long day at the office. It's surprisingly easy to pick up the basics, and I've been teaching my colleagues during lunch breaks.",
            },
            {
              name: "James",
              text: "I never thought I'd enjoy gardening, but building a vegetable patch has been transformative. Anyone can do it regardless of age or fitness level. I've invested in a greenhouse and irrigation system. The fresh produce tastes incomparable.",
            },
          ],
        },
        correctAnswer: {
          1: "B",
          2: "A",
          3: "A",
          4: "C",
          5: "B",
          6: "B",
          7: "C",
          8: "C",
          9: "D",
          10: "D",
        },
        explanation: "Multiple matching tests the ability to scan texts for specific information and match details to the correct person.",
        difficulty: diff,
        skillsTested: ["scanning", "reading for detail", "matching information"],
      };
    }

    default: {
      return {
        prompt: { text: `Sample ${type} question ${index} for ${partLabel}.` },
        correctAnswer: "sample_answer",
        explanation: "Standard B2 First question type.",
        difficulty: diff,
        skillsTested: ["general comprehension"],
      };
    }
  }
}

function getMCPassage(): {
  text: string;
  blank: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
} {
  const passages = [
    {
      text: "The Great Barrier Reef is one of the most impressive natural wonders in the world. It is home to an extraordinary variety of marine life, and millions of people visit it every year. However, climate change poses a serious ________ to the reef's survival.",
      blank: "________",
      question: "Choose the correct word to fill the blank.",
      options: ["risk", "threat", "danger", "hazard"],
      correctAnswer: "threat",
      explanation: "'Threat' is the most natural collocation here — 'pose a threat to' is a fixed expression meaning to be a danger to something.",
    },
    {
      text: "Many students find that studying abroad is a life-changing experience. It not only improves their language skills but also helps them develop a greater sense of independence and cultural ________.",
      blank: "________",
      question: "Choose the correct word to fill the blank.",
      options: ["knowledge", "awareness", "understanding", "appreciation"],
      correctAnswer: "awareness",
      explanation: "'Cultural awareness' is the standard collocation for understanding and being sensitive to different cultures.",
    },
    {
      text: "The company's decision to invest in renewable energy was widely ________ by environmental groups. They praised the move as a significant step towards sustainability.",
      blank: "________",
      question: "Choose the correct word to fill the blank.",
      options: ["accepted", "welcomed", "received", "approved"],
      correctAnswer: "welcomed",
      explanation: "'Welcomed' implies enthusiastic approval, which fits the context of environmental groups praising the decision.",
    },
  ];

  return passages[Math.floor(Math.random() * passages.length)];
}

// ─── Generation Pipeline ────────────────────────────────────────────────────

/**
 * Generate questions for a given exam part using the LLM.
 * Generated questions are saved as DRAFT status.
 * Retries up to 2x on invalid response. Returns generated count + any errors.
 */
export async function generateQuestions(request: GenerationRequest): Promise<GenerationResult> {
  const { examPartId, count, difficulty } = request;
  const errors: string[] = [];
  const created: Array<{ id: string; type: string; prompt: any }> = [];

  // Validate exam part
  const examPart = await prisma.examPart.findUnique({
    where: { id: examPartId },
  });

  if (!examPart) {
    return { generated: 0, questions: [], errors: ["ExamPart not found"] };
  }

  // Determine question type from part number
  const typeMap: Record<number, string> = {
    1: "MC",
    2: "CLOZE",
    3: "WF",
    4: "KT",
    5: "GT",
    6: "MM",
    7: "MM",
  };

  const questionType = typeMap[examPart.partNumber];
  if (!questionType) {
    return { generated: 0, questions: [], errors: [`Unsupported part number: ${examPart.partNumber}`] };
  }

  // Call LLM with retry logic (2 retries)
  let generatedQuestions: GeneratedQuestion[] = [];
  let lastError: string | null = null;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      generatedQuestions = await callLLM(examPart, questionType, count, difficulty ?? "B");
      if (generatedQuestions.length > 0) {
        lastError = null;
        break;
      }
    } catch (err) {
      lastError = `Attempt ${attempt + 1}: ${err instanceof Error ? err.message : "Unknown error"}`;
      continue;
    }
  }

  if (lastError) {
    errors.push(`Generation failed after 3 attempts: ${lastError}`);
    return { generated: 0, questions: [], errors };
  }

  // Save each generated question as DRAFT
  for (const q of generatedQuestions) {
    try {
      const question = await createQuestion({
        examPartId,
        type: questionType as any,
        prompt: q.prompt,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        difficulty: q.difficulty,
        skillsTested: q.skillsTested,
        aiGenerated: true,
        status: "DRAFT",
      });
      created.push({ id: question.id, type: question.type, prompt: question.prompt });
    } catch (err) {
      errors.push(`Failed to save generated question: ${err instanceof Error ? err.message : "Unknown"}`);
    }
  }

  return {
    generated: created.length,
    questions: created,
    errors,
  };
}
