// ExamForge — NotebookLM Generation Integration Tests
// Tests the generation service with mocked Prisma and MCP calls

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ─── Mock Prisma ────────────────────────────────────────────────────────────
// Must use vi.hoisted() for hoisted mock factories

const { mockCreate, mockUpdate, mockFindUnique, mockFindMany } = vi.hoisted(() => ({
  mockCreate: vi.fn(),
  mockUpdate: vi.fn(),
  mockFindUnique: vi.fn(),
  mockFindMany: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  default: {
    generatedContent: {
      create: mockCreate,
      update: mockUpdate,
      findUnique: mockFindUnique,
      findMany: mockFindMany,
    },
    audioExercise: {
      create: vi.fn(),
    },
    flashcardDeck: {
      create: vi.fn(),
      update: vi.fn(),
    },
    flashcard: {
      createMany: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

// ─── Import after mock ───────────────────────────────────────────────────────

import { generateContent, getGenerationStatus, reviewContent } from "./generate";

// ─── Setup ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ─── Fixtures ────────────────────────────────────────────────────────────────

const validRequest = {
  sourceType: "URL" as const,
  sourceData: "https://example.com/science-article",
  contentType: "QUIZ" as const,
  createdById: "user-123",
};

const mockCreatedRecord = {
  id: "gen-123",
  sourceType: "URL",
  sourceData: "https://example.com/science-article",
  contentType: "QUIZ",
  status: "PENDING",
  createdById: "user-123",
  createdAt: new Date("2026-07-17"),
};

// ─── generateContent — Happy Path ───────────────────────────────────────────

describe("generateContent", () => {
  it("creates PENDING record, updates to PROCESSING, then COMPLETED on success", async () => {
    // Arrange: prisma calls succeed
    mockCreate.mockResolvedValue(mockCreatedRecord);
    mockUpdate
      .mockResolvedValueOnce({ ...mockCreatedRecord, status: "PROCESSING" })
      .mockResolvedValueOnce({
        ...mockCreatedRecord,
        status: "COMPLETED",
        rawResponse: { type: "quiz", questions: [] },
      });

    // Act
    const result = await generateContent(validRequest);

    // Assert: correct return value
    expect(result).toEqual({
      id: "gen-123",
      status: "COMPLETED",
    });

    // Assert: correct sequence of Prisma calls
    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        sourceType: "URL",
        sourceData: "https://example.com/science-article",
        contentType: "QUIZ",
        status: "PENDING",
        createdById: "user-123",
      },
    });

    // First update: PROCESSING
    expect(mockUpdate).toHaveBeenNthCalledWith(1, {
      where: { id: "gen-123" },
      data: { status: "PROCESSING" },
    });

    // Second update: COMPLETED with data
    const secondUpdateCall = mockUpdate.mock.calls[1];
    expect(secondUpdateCall[0].where.id).toBe("gen-123");
    expect(secondUpdateCall[0].data.status).toBe("COMPLETED");
    expect(secondUpdateCall[0].data.rawResponse).toBeDefined();
    expect(secondUpdateCall[0].data.rawResponse.type).toBe("quiz");
  });

  it("returns COMPLETED for AUDIO content type", async () => {
    mockCreate.mockResolvedValue(mockCreatedRecord);
    mockUpdate.mockResolvedValue({});

    const result = await generateContent({
      ...validRequest,
      contentType: "AUDIO",
    });

    expect(result.status).toBe("COMPLETED");
  });

  it("returns COMPLETED for FLASHCARDS content type", async () => {
    mockCreate.mockResolvedValue(mockCreatedRecord);
    mockUpdate.mockResolvedValue({});

    const result = await generateContent({
      ...validRequest,
      contentType: "FLASHCARDS",
    });

    expect(result.status).toBe("COMPLETED");
  });

  it("throws when initial create fails (outside try/catch)", async () => {
    mockCreate.mockRejectedValue(new Error("Database connection failed"));

    await expect(generateContent(validRequest)).rejects.toThrow("Database connection failed");
    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("stores error message when success update fails", async () => {
    mockCreate.mockResolvedValue(mockCreatedRecord);
    mockUpdate
      .mockResolvedValueOnce({ ...mockCreatedRecord, status: "PROCESSING" })
      .mockRejectedValueOnce(new Error("Failed to store COMPLETED status"));

    const result = await generateContent(validRequest);

    expect(result.status).toBe("FAILED");
  });
});

// ─── getGenerationStatus ─────────────────────────────────────────────────────

describe("getGenerationStatus", () => {
  it("returns status for existing content", async () => {
    mockFindUnique.mockResolvedValue({
      id: "gen-123",
      status: "COMPLETED",
      contentType: "QUIZ",
      errorMessage: null,
      audioExercise: null,
      flashcardDecks: [],
    });

    const result = await getGenerationStatus("gen-123");

    expect(result).not.toBeNull();
    expect(result!.id).toBe("gen-123");
    expect(result!.status).toBe("COMPLETED");
    expect(result!.contentType).toBe("QUIZ");
    expect(result!.errorMessage).toBeNull();
    expect(result!.audioExercise).toBeNull();
    expect(result!.flashcardDeck).toBeNull();
  });

  it("returns null for non-existent content", async () => {
    mockFindUnique.mockResolvedValue(null);

    const result = await getGenerationStatus("non-existent");

    expect(result).toBeNull();
  });

  it("includes audioExercise reference when available", async () => {
    mockFindUnique.mockResolvedValue({
      id: "gen-123",
      status: "COMPLETED",
      contentType: "AUDIO",
      errorMessage: null,
      audioExercise: { id: "ae-1", title: "Test Audio", status: "PUBLISHED" },
      flashcardDecks: [],
    });

    const result = await getGenerationStatus("gen-123");

    expect(result!.audioExercise).toEqual({
      id: "ae-1",
      title: "Test Audio",
      status: "PUBLISHED",
    });
    expect(result!.flashcardDeck).toBeNull();
  });

  it("includes flashcardDeck reference when available", async () => {
    mockFindUnique.mockResolvedValue({
      id: "gen-123",
      status: "COMPLETED",
      contentType: "FLASHCARDS",
      errorMessage: null,
      audioExercise: null,
      flashcardDecks: [
        { id: "deck-1", title: "Test Deck", cardCount: 5 },
      ],
    });

    const result = await getGenerationStatus("gen-123");

    expect(result!.flashcardDeck).toEqual({
      id: "deck-1",
      title: "Test Deck",
      cardCount: 5,
    });
    expect(result!.audioExercise).toBeNull();
  });

  it("includes errorMessage for failed content", async () => {
    mockFindUnique.mockResolvedValue({
      id: "gen-123",
      status: "FAILED",
      contentType: "AUDIO",
      errorMessage: "NotebookLM rate limit exceeded",
      audioExercise: null,
      flashcardDecks: [],
    });

    const result = await getGenerationStatus("gen-123");

    expect(result!.status).toBe("FAILED");
    expect(result!.errorMessage).toBe("NotebookLM rate limit exceeded");
  });
});

// ─── reviewContent ───────────────────────────────────────────────────────────

describe("reviewContent", () => {
  it("returns error when content not found", async () => {
    mockFindUnique.mockResolvedValue(null);

    const result = await reviewContent("non-existent", "APPROVE", "reviewer-1");

    expect(result).toEqual({
      success: false,
      error: "Generated content not found",
    });
  });

  it("returns error when content is not COMPLETED", async () => {
    mockFindUnique.mockResolvedValue({
      id: "gen-123",
      status: "PENDING",
      contentType: "QUIZ",
      rawResponse: null,
    });

    const result = await reviewContent("gen-123", "APPROVE", "reviewer-1");

    expect(result).toEqual({
      success: false,
      error: "Cannot review content in status: PENDING",
    });
  });

  it("rejects content and sets status to FAILED", async () => {
    mockFindUnique.mockResolvedValue({
      id: "gen-123",
      status: "COMPLETED",
      contentType: "QUIZ",
      rawResponse: { type: "quiz", questions: [] },
    });
    mockUpdate.mockResolvedValue({});

    const result = await reviewContent("gen-123", "REJECT", "reviewer-1", "Duplicate content");

    expect(result).toEqual({ success: true });
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: "gen-123" },
      data: {
        status: "FAILED",
        reviewedAt: expect.any(Date),
        reviewedById: "reviewer-1",
        errorMessage: "Duplicate content",
      },
    });
  });

  it("rejects without reason uses default message", async () => {
    mockFindUnique.mockResolvedValue({
      id: "gen-123",
      status: "COMPLETED",
      contentType: "QUIZ",
      rawResponse: { type: "quiz", questions: [] },
    });
    mockUpdate.mockResolvedValue({});

    const result = await reviewContent("gen-123", "REJECT", "reviewer-1");

    expect(result).toEqual({ success: true });
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          errorMessage: "Rejected by reviewer",
        }),
      }),
    );
  });

  it("approves AUDIO content and creates AudioExercise", async () => {
    mockFindUnique.mockResolvedValue({
      id: "gen-123",
      status: "COMPLETED",
      contentType: "AUDIO",
      rawResponse: {
        type: "audio",
        title: "Generated Audio",
        transcript: "Transcript text",
        questions: [{ id: "q1", question: "Test?" }],
        duration: 180,
      },
    });
    mockUpdate.mockResolvedValue({});

    // Access the prisma mock to set up audioExercise.create
    const prismaMock = await import("@/lib/prisma");
    (prismaMock.default.audioExercise.create as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "ae-1" });

    const result = await reviewContent("gen-123", "APPROVE", "reviewer-1");

    expect(result).toEqual({ success: true });
  });

  it("approves FLASHCARDS content and creates deck + cards", async () => {
    mockFindUnique.mockResolvedValue({
      id: "gen-123",
      status: "COMPLETED",
      contentType: "FLASHCARDS",
      rawResponse: {
        type: "flashcards",
        title: "Science Vocabulary",
        cards: [
          { front: "Atom", back: "Basic unit of matter", hint: "Think small" },
          { front: "Molecule", back: "Group of atoms bonded together", hint: null },
        ],
      },
    });

    const prismaMock = await import("@/lib/prisma");
    (prismaMock.default.flashcardDeck.create as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "deck-1",
      generatedContentId: "gen-123",
      title: "Science Vocabulary",
    });
    (prismaMock.default.flashcard.createMany as ReturnType<typeof vi.fn>).mockResolvedValue({ count: 2 });
    (prismaMock.default.flashcardDeck.update as ReturnType<typeof vi.fn>).mockResolvedValue({});
    mockUpdate.mockResolvedValue({});

    const result = await reviewContent("gen-123", "APPROVE", "reviewer-1");

    expect(result).toEqual({ success: true });
  });

  it("returns error when rawResponse is null on approve", async () => {
    mockFindUnique.mockResolvedValue({
      id: "gen-123",
      status: "COMPLETED",
      contentType: "QUIZ",
      rawResponse: null,
    });

    const result = await reviewContent("gen-123", "APPROVE", "reviewer-1");

    expect(result).toEqual({
      success: false,
      error: "No raw response data to process",
    });
  });
});
