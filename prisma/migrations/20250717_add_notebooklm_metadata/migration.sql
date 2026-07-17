-- Migration SQL

-- Add MINDMAP to ContentType enum
ALTER TYPE "ContentType" ADD VALUE 'MINDMAP';

-- Add notebookId, artifactId, elapsed to GeneratedContent
ALTER TABLE "GeneratedContent" ADD COLUMN "notebookId" VARCHAR;
ALTER TABLE "GeneratedContent" ADD COLUMN "artifactId" VARCHAR;
ALTER TABLE "GeneratedContent" ADD COLUMN "elapsed" INTEGER;

-- Add audioUrl to AudioExercise
ALTER TABLE "AudioExercise" ADD COLUMN "downloadUrl" VARCHAR;

-- Add topics to FlashcardDeck
ALTER TABLE "FlashcardDeck" ADD COLUMN "topics" TEXT;
