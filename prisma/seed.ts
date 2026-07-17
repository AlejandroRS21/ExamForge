// ExamForge — Database Seed
// Populates B2 First exam parts and an admin user

import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";

neonConfig.poolQueryViaFetch = true;

const poolConfig = { connectionString: process.env.DATABASE_URL! };
const adapter = new PrismaNeon(poolConfig);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Create admin user
  const adminPassword = await bcrypt.hash("Admin123!", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@examforge.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@examforge.com",
      passwordHash: adminPassword,
      emailVerified: new Date(),
      role: "ADMIN",
    },
  });
  console.log(`  ✓ Admin user: ${admin.email} (password: Admin123!)`);

  // Create B2 First exam parts

  // Reading & Use of English — Parts 1-7
  const ruoeParts = [
    { label: "R&UoE Part 1", partNumber: 1, timeMinutes: 8, questionCount: 8, description: "Multiple-choice cloze" },
    { label: "R&UoE Part 2", partNumber: 2, timeMinutes: 8, questionCount: 8, description: "Open cloze" },
    { label: "R&UoE Part 3", partNumber: 3, timeMinutes: 8, questionCount: 8, description: "Word formation" },
    { label: "R&UoE Part 4", partNumber: 4, timeMinutes: 10, questionCount: 6, description: "Key word transformation" },
    { label: "R&UoE Part 5", partNumber: 5, timeMinutes: 12, questionCount: 6, description: "Gapped text" },
    { label: "R&UoE Part 6", partNumber: 6, timeMinutes: 10, questionCount: 4, description: "Multiple matching (gapped paragraphs)" },
    { label: "R&UoE Part 7", partNumber: 7, timeMinutes: 14, questionCount: 10, description: "Multiple matching (short texts)" },
  ];

  // Writing — Parts 1-2
  const writingParts = [
    { label: "Writing Part 1", partNumber: 1, timeMinutes: 40, questionCount: 1, description: "Essay" },
    { label: "Writing Part 2", partNumber: 2, timeMinutes: 40, questionCount: 1, description: "Article / Email / Report / Review" },
  ];

  let sortOrder = 0;
  for (const part of ruoeParts) {
    sortOrder++;
    await prisma.examPart.upsert({
      where: { id: `ruoe-part-${part.partNumber}` },
      update: {},
      create: {
        id: `ruoe-part-${part.partNumber}`,
        label: part.label,
        paper: "R&UoE",
        partNumber: part.partNumber,
        description: part.description,
        timeMinutes: part.timeMinutes,
        questionCount: part.questionCount,
        sortOrder,
      },
    });
    console.log(`  ✓ R&UoE Part ${part.partNumber}: ${part.description}`);
  }

  for (const part of writingParts) {
    sortOrder++;
    await prisma.examPart.upsert({
      where: { id: `writing-part-${part.partNumber}` },
      update: {},
      create: {
        id: `writing-part-${part.partNumber}`,
        label: part.label,
        paper: "Writing",
        partNumber: part.partNumber,
        description: part.description,
        timeMinutes: part.timeMinutes,
        questionCount: part.questionCount,
        sortOrder,
      },
    });
    console.log(`  ✓ Writing Part ${part.partNumber}: ${part.description}`);
  }

  // Create sample ACTIVE questions for each R&UoE part
  const sampleQuestions: {
    examPartId: string;
    type: string;
    prompt: any;
    options: any;
    correctAnswer: any;
    explanation: string;
    difficulty: "A" | "B" | "C";
    skillsTested: string[];
  }[] = [
    // Part 1: Multiple-choice cloze
    ...Array.from({ length: 3 }, (_, i) => ({
      examPartId: "ruoe-part-1",
      type: "MC" as const,
      prompt: {
        text: `The archaeologist was amazed by the _____ of the ancient artifacts.\n\nA) preservation  B) prevention  C) preparation  D) preference`,
        hint: "Think about keeping something in its original condition.",
      },
      options: ["preservation", "prevention", "preparation", "preference"],
      correctAnswer: "A",
      explanation: "Preservation means keeping something in its original state. The artifacts were well-preserved, so 'preservation' is correct.",
      difficulty: "B" as const,
      skillsTested: ["vocabulary", "collocations"],
    })),
    // Part 2: Open cloze
    ...Array.from({ length: 3 }, (_, i) => ({
      examPartId: "ruoe-part-2",
      type: "CLOZE" as const,
      prompt: {
        text: "The research team has been working _____ the project for over two years now.",
        hint: "Think about a preposition that collocates with 'working' in a project context.",
      },
      options: null,
      correctAnswer: ["on"],
      explanation: "'Working on' is the correct phrasal verb for being engaged in a project.",
      difficulty: "B" as const,
      skillsTested: ["grammar", "prepositions"],
    })),
    // Part 3: Word formation
    ...Array.from({ length: 3 }, (_, i) => ({
      examPartId: "ruoe-part-3",
      type: "WF" as const,
      prompt: {
        text: "The _____ of the new policy was met with widespread approval.",
        stemWord: "INTRODUCE",
        hint: "Add a suffix to form a noun.",
      },
      options: null,
      correctAnswer: ["introduction"],
      explanation: "The noun form of 'introduce' is 'introduction'. The suffix '-tion' is added.",
      difficulty: "B" as const,
      skillsTested: ["word formation", "vocabulary"],
    })),
    // Part 4: Key word transformation
    ...Array.from({ length: 2 }, (_, i) => ({
      examPartId: "ruoe-part-4",
      type: "KT" as const,
      prompt: {
        text: "Rewrite the sentence using the word in bold. Do not change the word in bold.",
        leadIn: "\"I'm sorry I'm late,\" she said. → She _____ late.\n\nComplete the second sentence so it has a similar meaning.",
        keyword: "APOLOGISED",
      },
      options: null,
      correctAnswer: { keyword: "APOLOGISED", acceptable: ["apologised for being", "apologized for being"] },
      explanation: "The transformation requires 'apologised for being' to maintain the meaning while using the keyword.",
      difficulty: "B" as const,
      skillsTested: ["grammar", "key word transformation"],
    })),
    // Part 5: Gapped text
    ...Array.from({ length: 2 }, (_, i) => ({
      examPartId: "ruoe-part-5",
      type: "GT" as const,
      prompt: {
        text: "Put the sentences in the correct order to form a coherent paragraph.",
        items: [
          { id: "a", text: "This led to significant improvements in patient outcomes." },
          { id: "b", text: "The hospital implemented a new electronic records system." },
          { id: "c", text: "Doctors could now access patient histories instantly." },
          { id: "d", text: "The transition took approximately six months to complete." },
        ],
        hint: "Think about chronological order — what happened first?",
      },
      options: null,
      correctAnswer: ["b", "d", "c", "a"],
      explanation: "The logical sequence: implementation → transition took time → result (access) → outcome (improvements).",
      difficulty: "C" as const,
      skillsTested: ["cohesion", "reading comprehension"],
    })),
    // Part 6: Multiple matching (gapped paragraphs)
    ...Array.from({ length: 2 }, (_, i) => ({
      examPartId: "ruoe-part-6",
      type: "MM" as const,
      prompt: {
        text: "Match each paragraph to the correct heading.",
        items: [
          { id: "p1", text: "Studies show that regular exercise improves cognitive function and memory retention in adults over 65." },
          { id: "p2", text: "Participants who exercised three times a week scored 20% higher on memory tests." },
        ],
        options: [
          { id: "A", label: "Research findings" },
          { id: "B", label: "Health recommendations" },
        ],
      },
      options: null,
      correctAnswer: ["A", "B"],
      explanation: "Paragraph 1 presents study claims (A); Paragraph 2 provides specific findings (B).",
      difficulty: "B" as const,
      skillsTested: ["reading comprehension", "matching"],
    })),
    // Part 7: Multiple matching (short texts)
    ...Array.from({ length: 3 }, (_, i) => ({
      examPartId: "ruoe-part-7",
      type: "MM" as const,
      prompt: {
        text: "Which person (A, B) says each statement? Choose the correct letter.",
        items: [
          { id: "s1", text: "\"I prefer studying in the morning when I'm most alert.\"" },
          { id: "s2", text: "\"I find that background music helps me concentrate.\"" },
          { id: "s3", text: "\"Taking short breaks every hour improves my focus.\"" },
        ],
        options: [
          { id: "A", label: "Maria, 24" },
          { id: "B", label: "James, 31" },
        ],
        hint: "Read each statement and think about which person would say it based on context.",
      },
      options: null,
      correctAnswer: ["A", "B", "B"],
      explanation: "Morning studying (A), background music (B), short breaks (B).",
      difficulty: "B" as const,
      skillsTested: ["reading comprehension", "matching"],
    })),
  ];

  // Flatten into one array with unique question IDs per part
  let qIndex = 0;
  for (const q of sampleQuestions) {
    qIndex++;
    const typeLabel = q.type;
    const existing = await prisma.question.findFirst({
      where: {
        examPartId: q.examPartId,
        type: q.type as any,
        status: "ACTIVE",
      },
    });
    if (!existing) {
      await prisma.question.create({
        data: {
          id: `sample-q-${qIndex}`,
          examPartId: q.examPartId,
          type: q.type as any,
          prompt: q.prompt,
          options: q.options ?? undefined,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          difficulty: q.difficulty as any,
          status: "ACTIVE",
          aiGenerated: true,
          skillsTested: q.skillsTested,
        },
      });
      console.log(`  ✓ Sample ${typeLabel} question for ${q.examPartId}`);
    }
  }

  console.log("\nSeed complete!");
  console.log(`  Parts created: ${ruoeParts.length + writingParts.length}`);
  console.log(`  Sample questions created: ${sampleQuestions.length}`);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
