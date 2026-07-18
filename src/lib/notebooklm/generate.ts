// ExamForge — NotebookLM Generation Service
// Wraps NotebookLM MCP calls to generate interactive learning content.

import prisma from "@/lib/prisma";
import { MCPClient, MCPClientError } from "./mcp-client";
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
  notebookId?: string;
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
  notebookId?: string;
  artifactId?: string;
  elapsed?: number;
}

// ─── NotebookLM MCP Integration ──────────────────────────────────────────────

const mcpClient = new MCPClient();

// Fire-and-forget wrapper for async generation
async function runGeneration(contentId: string, request: GenerateRequest) {
  const content = await prisma.generatedContent.findUnique({
    where: { id: contentId },
  });
  
  if (!content || content.status !== "PROCESSING") {
    throw new Error("Content not found or not in PROCESSING status");
  }
  
  try {
    // Handle different content types through MCP
    let result;
    switch (request.contentType) {
      case "AUDIO": {
        // Create audio artifact through MCP
        const artifact = await mcpClient.createStudioArtifact(
          content.notebookId || "fa8414d0-a476-4fad-a6a7-be1167880228",
          "audio"
        );
        
        // Poll for completion
        const pollStart = Date.now();
        let pollResult = await mcpClient.pollArtifactStatus(
          content.notebookId || "fa8414d0-a476-4fad-a6a7-be1167880228",
          artifact.id
        );
        
        let elapsed = Date.now() - pollStart;
        
        while (pollResult.status === "PROCESSING" && elapsed < 300000) { // 5 minute timeout
          await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5 seconds
          pollResult = await mcpClient.pollArtifactStatus(
            content.notebookId || "fa8414d0-a476-4fad-a6a7-be1167880228",
            artifact.id
          );
          elapsed = Date.now() - pollStart;
        }
        
        if (pollResult.status !== "COMPLETED") {
          throw new MCPClientError("Audio generation failed or timed out", "unknown", 500);
        }

        result = {
          type: "audio",
          title: pollResult.title || "Generated Audio Exercise",
          transcript: pollResult.transcript || null,
          duration: pollResult.duration || null,
          questions: pollResult.questions || [],
          artifactId: artifact.id,
          elapsed,
        };
        break;
      }

      case "FLASHCARDS": {
        // Create flashcards artifact through MCP
        const artifact = await mcpClient.createStudioArtifact(
          content.notebookId || "fa8414d0-a476-4fad-a6a7-be1167880228",
          "flashcards"
        );

        // Poll for completion
        const pollStart = Date.now();
        let pollResult = await mcpClient.pollArtifactStatus(
          content.notebookId || "fa8414d0-a476-4fad-a6a7-be1167880228",
          artifact.id
        );
        
        let elapsed = Date.now() - pollStart;
        
        while (pollResult.status === "PROCESSING" && elapsed < 300000) {
          await new Promise(resolve => setTimeout(resolve, 5000));
          pollResult = await mcpClient.pollArtifactStatus(
            content.notebookId || "fa8414d0-a476-4fad-a6a7-be1167880228",
            artifact.id
          );
          elapsed = Date.now() - pollStart;
        }

        if (pollResult.status !== "COMPLETED") {
          throw new MCPClientError("Flashcards generation failed or timed out", "unknown", 500);
        }

        // Query for flashcards content
        const queryResult = await mcpClient.queryNotebook(
          content.notebookId || "fa8414d0-a476-4fad-a6a7-be1167880228",
          "generate flashcards about the source material"
        );

        result = {
          type: "flashcards",
          title: queryResult.title || "Flashcard Deck",
          cards: queryResult.cards || [],
          artifactId: artifact.id,
          elapsed,
        };
        break;
      }

      case "QUIZ": {
        // Create quiz artifact through MCP
        const artifact = await mcpClient.createStudioArtifact(
          content.notebookId || "fa8414d0-a476-4fad-a6a7-be1167880228",
          "quiz"
        );

        // Poll for completion
        const pollStart = Date.now();
        let pollResult = await mcpClient.pollArtifactStatus(
          content.notebookId || "fa8414d0-a476-4fad-a6a7-be1167880228",
          artifact.id
        );
        
        let elapsed = Date.now() - pollStart;
        
        while (pollResult.status === "PROCESSING" && elapsed < 300000) {
          await new Promise(resolve => setTimeout(resolve, 5000));
          pollResult = await mcpClient.pollArtifactStatus(
            content.notebookId || "fa8414d0-a476-4fad-a6a7-be1167880228",
            artifact.id
          );
          elapsed = Date.now() - pollStart;
        }

        if (pollResult.status !== "COMPLETED") {
          throw new MCPClientError("Quiz generation failed or timed out", "unknown", 500);
        }

        // Query for quiz content
        const queryResult = await mcpClient.queryNotebook(
          content.notebookId || "fa8414d0-a476-4fad-a6a7-be1167880228",
          "generate quiz questions about the source material"
        );

        result = {
          type: "quiz",
          title: queryResult.title || "Generated Quiz",
          questions: queryResult.questions || [],
          artifactId: artifact.id,
          elapsed,
        };
        break;
      }

      case "MINDMAP": {
        // Create mindmap artifact through MCP
        const artifact = await mcpClient.createStudioArtifact(
          content.notebookId || "fa8414d0-a476-4fad-a6a7-be1167880228",
          "mindmap"
        );

        // Poll for completion
        const pollStart = Date.now();
        let pollResult = await mcpClient.pollArtifactStatus(
          content.notebookId || "fa8414d0-a476-4fad-a6a7-be1167880228",
          artifact.id
        );
        
        let elapsed = Date.now() - pollStart;
        
        while (pollResult.status === "PROCESSING" && elapsed < 300000) {
          await new Promise(resolve => setTimeout(resolve, 5000));
          pollResult = await mcpClient.pollArtifactStatus(
            content.notebookId || "fa8414d0-a476-4fad-a6a7-be1167880228",
            artifact.id
          );
          elapsed = Date.now() - pollStart;
        }

        if (pollResult.status !== "COMPLETED") {
          throw new MCPClientError("Mindmap generation failed or timed out", "unknown", 500);
        }

        // Query for mindmap content
        const queryResult = await mcpClient.queryNotebook(
          content.notebookId || "fa8414d0-a476-4fad-a6a7-be1167880228",
          "generate mind map about the source material"
        );

        result = {
          type: "mindmap",
          title: queryResult.title || "Generated Mind Map",
          structure: queryResult.structure || [],
          artifactId: artifact.id,
          elapsed,
        };
        break;
      }

      default:
        throw new MCPClientError(`Unsupported content type: ${request.contentType}`, "unknown", 400);
    }

    // Update the generation record with results including artifactId and elapsed
    await prisma.generatedContent.update({
      where: { id: content.id },
      data: {
        status: "COMPLETED",
        rawResponse: result,
        artifactId: result.artifactId || null,
        elapsed: result.elapsed || null,
      },
    });

    return { id: content.id, status: "COMPLETED" };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error during generation";
    let status: GenerationStatus = "FAILED";
    let errorCode = 500;

    // Handle MCPClientError specifically
    if (error instanceof MCPClientError) {
      if (error.type === "rateLimited") status = "FAILED";
      else if (error.type === "authExpired") status = "FAILED";
      else if (error.type === "notFound") status = "FAILED";
      else status = "FAILED";
      errorCode = error.code || 500;
    }

    // Update the generation record with error
    await prisma.generatedContent.update({
      where: { id: content.id },
      data: {
        status,
        errorMessage: errorMessage,
      },
    });

    return { id: content.id, status };
  }
}

/**
 * Generate content via NotebookLM MCP and store the result in the database.
 * Creates a GeneratedContent record, calls the MCP client, and updates the record.
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
      notebookId: request.notebookId,
    },
  });

  // Update to PROCESSING
  await prisma.generatedContent.update({
    where: { id: content.id },
    data: { status: "PROCESSING" },
  });

  // Fire-and-forget: start async generation
  runGeneration(content.id, request).catch(console.error);
  
  // Return immediately with processing status
  return { id: content.id, status: "PROCESSING" };
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
    notebookId: content.notebookId,
    artifactId: content.artifactId,
    elapsed: content.elapsed,
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

      case "MINDMAP": {
        // Create MindMap record or handle mindmap-specific storage
        await prisma.generatedContent.update({
          where: { id },
          data: {
            // Store mindmap-specific data
          },
        });
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