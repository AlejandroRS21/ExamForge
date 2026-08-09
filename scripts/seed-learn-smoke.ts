// ExamForge — learn-smoke seed (task 6.2 runtime harness)
// Seeds fixed-ID PUBLISHED/COMPLETED content so every /learn/* route can be
// smoke-tested against a live dev server. Idempotent (upserts by fixed id).
// Run: node --import tsx scripts/seed-learn-smoke.ts

import "dotenv/config";
import bcrypt from "bcryptjs";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const databaseUrl = process.env.DATABASE_URL ?? "";
const adapter = new PrismaPg(new Pool({ connectionString: databaseUrl }));
const prisma = new PrismaClient({ adapter });

const SMOKE_EMAIL = "smoke@examforge.com";
const SMOKE_PASSWORD = "Smoke123!";

async function main() {
  const user = await prisma.user.upsert({
    where: { email: SMOKE_EMAIL },
    update: { role: "USER", passwordHash: await bcrypt.hash(SMOKE_PASSWORD, 10) },
    create: {
      email: SMOKE_EMAIL,
      name: "Smoke Tester",
      role: "USER",
      passwordHash: await bcrypt.hash(SMOKE_PASSWORD, 10),
      emailVerified: new Date(),
    },
  });
  console.log(`owner: ${user.email} (${user.role})`);

  // ── Quiz ────────────────────────────────────────────────────────────────
  await prisma.generatedContent.upsert({
    where: { id: "gc-smoke-quiz" },
    update: { status: "COMPLETED", contentType: "QUIZ" },
    create: {
      id: "gc-smoke-quiz",
      sourceType: "TEXT",
      sourceData: "smoke",
      contentType: "QUIZ",
      status: "COMPLETED",
      createdById: user.id,
      topics: ["smoke"],
      rawResponse: {
        title: "Smoke Quiz",
        questions: [
          {
            id: "q1",
            prompt: "Which verb means 'to depart on a journey'?",
            options: ["set off", "get over", "turn down", "look after"],
            correctAnswer: "set off",
          },
          {
            id: "q2",
            prompt: "Choose the correct particle: 'I look forward ___ the trip.'",
            options: ["to", "at", "for", "on"],
            correctAnswer: "to",
          },
        ],
      },
    },
  });
  console.log("quiz: gc-smoke-quiz");

  // ── Mind map ────────────────────────────────────────────────────────────
  await prisma.generatedContent.upsert({
    where: { id: "gc-smoke-mindmap" },
    update: { status: "COMPLETED", contentType: "MINDMAP" },
    create: {
      id: "gc-smoke-mindmap",
      sourceType: "TEXT",
      sourceData: "smoke",
      contentType: "MINDMAP",
      status: "COMPLETED",
      createdById: user.id,
      topics: ["smoke"],
      rawResponse: {
        title: "Travel Mind Map",
        nodes: [
          { id: "root", label: "Travel", children: ["airport", "hotel"] },
          { id: "airport", label: "Airport", children: ["checkin"] },
          { id: "checkin", label: "check-in" },
          { id: "hotel", label: "Hotel", children: [] },
        ],
      },
    },
  });
  console.log("mindmap: gc-smoke-mindmap");

  // ── Audio exercise ──────────────────────────────────────────────────────
  await prisma.generatedContent.upsert({
    where: { id: "gc-smoke-audio" },
    update: { status: "COMPLETED", contentType: "AUDIO" },
    create: {
      id: "gc-smoke-audio",
      sourceType: "TEXT",
      sourceData: "smoke",
      contentType: "AUDIO",
      status: "COMPLETED",
      createdById: user.id,
      topics: ["smoke"],
    },
  });

  await prisma.audioExercise.upsert({
    where: { id: "smoke-audio-1" },
    update: { status: "PUBLISHED", title: "Smoke Audio" },
    create: {
      id: "smoke-audio-1",
      generatedContentId: "gc-smoke-audio",
      title: "Smoke Audio: A Day at the Airport",
      transcript: "Welcome to today's listening practice. First, check in online.",
      questions: [
        { question: "What should you do first at the airport?", options: ["Check in online", "Buy a snack"], answer: "Check in online" },
        { question: "Second listening question" },
      ],
      duration: 96,
      status: "PUBLISHED",
      mimeType: "audio/mpeg",
    },
  });
  console.log("audio: smoke-audio-1");

  // ── Flashcard deck ──────────────────────────────────────────────────────
  await prisma.generatedContent.upsert({
    where: { id: "gc-smoke-flash" },
    update: { status: "COMPLETED", contentType: "FLASHCARDS" },
    create: {
      id: "gc-smoke-flash",
      sourceType: "TEXT",
      sourceData: "smoke",
      contentType: "FLASHCARDS",
      status: "COMPLETED",
      createdById: user.id,
      topics: ["smoke"],
    },
  });

  await prisma.flashcardDeck.upsert({
    where: { id: "smoke-deck-1" },
    update: { title: "Smoke Deck" },
    create: {
      id: "smoke-deck-1",
      generatedContentId: "gc-smoke-flash",
      title: "Smoke Deck: Travel Phrasal Verbs",
      description: "Created by the learn-smoke seed",
      createdById: user.id,
      cardCount: 2,
    },
  });

  await prisma.flashcard.upsert({
    where: { id: "smoke-card-1" },
    update: {},
    create: {
      id: "smoke-card-1",
      deckId: "smoke-deck-1",
      front: "to set off",
      back: "partir / salir de viaje",
      hint: "journey",
      easeFactor: 2.5,
      interval: 0,
      repetitions: 0,
      nextReviewAt: null,
    },
  });

  await prisma.flashcard.upsert({
    where: { id: "smoke-card-2" },
    update: {},
    create: {
      id: "smoke-card-2",
      deckId: "smoke-deck-1",
      front: "to look forward to",
      back: "esperar con ganas",
      hint: null,
      easeFactor: 2.3,
      interval: 3,
      repetitions: 2,
      nextReviewAt: new Date(Date.now() - 86400000), // due yesterday
    },
  });
  console.log("flashcards: smoke-deck-1 (2 cards)");

  console.log("learn-smoke seed done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());