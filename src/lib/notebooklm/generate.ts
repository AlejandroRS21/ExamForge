// ExamForge — NotebookLM Generation Service
// Wraps NotebookLM MCP calls to generate interactive learning content.
// MOCK implementation — replace with real MCP calls when NotebookLM MCP is fully operational.

import prisma from "@/lib/prisma";
import type {
  SourceType,
  ContentType,
  GenerationStatus,
  GeneratedContent,
  AudioExercise,
  FlashcardDeck,
  Flashcard,
} from "@/generated/prisma/client";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface GenerateRequest {
  sourceType: SourceType;
  sourceData: string;
  contentType: ContentType;
  createdById: string;
}

export interface GenerateResponse {
  id: string;
  status: GenerationStatus;
}

export interface StatusResponse {
  id: string;
  status: GenerationStatus;
  contentType: ContentType;
  errorMessage: string | null;
  audioExercise: Pick<AudioExercise, "id" | "title" | "status"> | null;
  flashcardDeck: Pick<FlashcardDeck, "id" | "title" | "cardCount"> | null;
}

// ─── NotebookLM MCP Mock ───────────────────────────────────────────────────
// Replace these mock functions with actual NotebookLM MCP API calls.
// The NotebookLM MCP server is available at localhost with auth configured.

interface MockMCPResponse {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Mock call to NotebookLM MCP for content generation.
 * In production, this would call the NotebookLM MCP tools:
 * - notebooklm_source_add to add the source
 * - notebooklm_notebook_query to generate content
 * - notebooklm_studio_create for audio/flashcards
 */
async function callNotebookLM(
  sourceType: SourceType,
  sourceData: string,
  contentType: ContentType,
): Promise<MockMCPResponse> {
  // Simulate processing delay
  await new Promise((r) => setTimeout(r, 1000));

  // Mock response based on content type
  switch (contentType) {
    case "QUIZ":
      return {
        success: true,
        data: {
          type: "quiz",
          title: `Quiz from ${sourceType.toLowerCase()} source`,
          questions: [
            {
              id: "q1",
              question: "What is the main topic of the source?",
              options: ["Option A", "Option B", "Option C", "Option D"],
              correctAnswer: 0,
            },
            {
              id: "q2",
              question: "Which key point is emphasized in the source?",
              options: ["Point 1", "Point 2", "Point 3", "Point 4"],
              correctAnswer: 1,
            },
            {
              id: "q3",
              question: "What conclusion can be drawn from the source?",
              options: ["Conclusion A", "Conclusion B", "Conclusion C", "Conclusion D"],
              correctAnswer: 2,
            },
          ],
        },
      };

    case "AUDIO":
      return {
        success: true,
        data: {
          type: "audio",
          title: "Generated Audio Exercise",
          transcript: "This is a placeholder transcript for the generated audio exercise. In production, NotebookLM would generate an audio overview from the source material.",
          duration: 180,
          questions: [
            { id: "aq1", question: "What is mentioned first?", timestamp: 15 },
            { id: "aq2", question: "What key example is given?", timestamp: 60 },
            { id: "aq3", question: "What is the main conclusion?", timestamp: 120 },
          ],
        },
      };

    case "FLASHCARDS":
      return {
        success: true,
        data: {
          type: "flashcards",
          title: "Flashcard Deck",
          cards: [
            { front: "Key Concept 1", back: "Definition and explanation of concept 1", hint: "Think about the main idea" },
            { front: "Key Concept 2", back: "Definition and explanation of concept 2", hint: "Consider the examples" },
            { front: "Key Concept 3", back: "Definition and explanation of concept 3", hint: "Remember the context" },
            { front: "Key Concept 4", back: "Definition and explanation of concept 4", hint: "Focus on the details" },
            { front: "Key Concept 5", back: "Definition and explanation of concept 5", hint: "Think about applications" },
          ],
        },
      };

    default:
      return { success: false, error: `Unsupported content type: ${contentType}` };
  }
}

// ─── Service Functions ──────────────────────────────────────────────────────

/**
 * Generate content via NotebookLM MCP and store the result in the database.
 * Creates a GeneratedContent record, calls the MCP mock, and updates the record.
 * Returns the generation ID and initial status.
 */
export async function generateContent(request: GenerateRequest): Promise<GenerateResponse> {
  // Create initial PENDING record
  const content = await prisma.generatedContent.create({
    data: {
      sourceType: request.sourceType,
      sourceData: request.sourceData,
      contentType: request.contentType,
      status: "PENDING",
      createdById: request.createdById,
    },
  });

  // Update to PROCESSING
  await prisma.generatedContent.update({
    where: { id: content.id },
    data: { status: "PROCESSING" },
  });

  try {
    // Call NotebookLM (mock)
    const result = await callNotebookLM(request.sourceType, request.sourceData, request.contentType);

    if (!result.success) {
      throw new Error(result.error ?? "NotebookLM generation failed");
    }

    // Store the raw response and mark as COMPLETED
    await prisma.generatedContent.update({
      where: { id: content.id },
      data: {
        status: "COMPLETED",
        rawResponse: result.data,
      },
    });

    return { id: content.id, status: "COMPLETED" };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error during generation";

    await prisma.generatedContent.update({
      where: { id: content.id },
      data: {
        status: "FAILED",
        errorMessage,
      },
    });

    return { id: content.id, status: "FAILED" };
  }
}

/**
 * Get the current status of a generation request.
 * Returns the status along with any generated content references.
 */
export async function getGenerationStatus(id: string): Promise<StatusResponse | null> {
  const content = await prisma.generatedContent.findUnique({
    where: { id },
    include: {
      audioExercise: {
        select: { id: true, title: true, status: true },
      },
      flashcardDecks: {
        select: { id: true, title: true, cardCount: true },
        take: 1,
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!content) return null;

  return {
    id: content.id,
    status: content.status,
    contentType: content.contentType,
    errorMessage: content.errorMessage,
    audioExercise: content.audioExercise,
    flashcardDeck: content.flashcardDecks[0] ?? null,
  };
}

/**
 * Approve or reject generated content.
 * On approve: creates the concrete content (AudioExercise / FlashcardDeck + Flashcards)
 * from the stored raw response.
 * On reject: sets status to FAILED with the rejection reason.
 */
export async function reviewContent(
  id: string,
  action: "APPROVE" | "REJECT",
  reviewerId: string,
  reason?: string,
): Promise<{ success: boolean; error?: string }> {
  const content = await prisma.generatedContent.findUnique({
    where: { id },
  });

  if (!content) {
    return { success: false, error: "Generated content not found" };
  }

  if (content.status !== "COMPLETED") {
    return { success: false, error: `Cannot review content in status: ${content.status}` };
  }

  if (action === "REJECT") {
    await prisma.generatedContent.update({
      where: { id },
      data: {
        status: "FAILED",
        reviewedAt: new Date(),
        reviewedById: reviewerId,
        errorMessage: reason ?? "Rejected by reviewer",
      },
    });
    return { success: true };
  }

  // APPROVE — create concrete content from raw response
  const rawData = content.rawResponse as Record<string, any> | null;
  if (!rawData) {
    return { success: false, error: "No raw response data to process" };
  }

  try {
    switch (content.contentType) {
      case "AUDIO": {
        await prisma.audioExercise.create({
          data: {
            generatedContentId: content.id,
            title: rawData.title ?? "Audio Exercise",
            transcript: rawData.transcript ?? null,
            questions: rawData.questions ?? null,
            duration: rawData.duration ?? null,
            mimeType: "audio/mpeg",
            status: "PUBLISHED",
          },
        });
        break;
      }

      case "FLASHCARDS": {
        const deck = await prisma.flashcardDeck.create({
          data: {
            generatedContentId: content.id,
            title: rawData.title ?? "Flashcard Deck",
            description: rawData.description ?? null,
            createdById: reviewerId,
          },
        });

        const cards = (rawData.cards as Array<{ front: string; back: string; hint?: string }>) ?? [];
        if (cards.length > 0) {
          await prisma.flashcard.createMany({
            data: cards.map((card) => ({
              deckId: deck.id,
              front: card.front,
              back: card.back,
              hint: card.hint ?? null,
            })),
          });

          await prisma.flashcardDeck.update({
            where: { id: deck.id },
            data: { cardCount: cards.length },
          });
        }
        break;
      }

      case "QUIZ": {
        // Quiz content is stored in rawResponse; no additional model yet.
        // Future: create a QuizResult or QuestionSet model.
        break;
      }

      default:
        return { success: false, error: `Unsupported content type: ${content.contentType}` };
    }

    await prisma.generatedContent.update({
      where: { id },
      data: {
        reviewedAt: new Date(),
        reviewedById: reviewerId,
      },
    });

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to process approved content";
    return { success: false, error: errorMessage };
  }
}

/**
 * List pending content for the review queue.
 */
export async function listPendingContent() {
  return prisma.generatedContent.findMany({
    where: { status: "COMPLETED" },
    orderBy: { createdAt: "desc" },
    include: {
      createdBy: {
        select: { id: true, name: true, email: true },
      },
    },
  });
}
