// ExamForge — NotebookLM Generation Integration Tests
// Tests the generation service with mocked Prisma and MCP calls
// generateContent() now returns immediately (fire-and-forget) — full pipeline tested via runGeneration()

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ─── Mock Prisma ────────────────────────────────────────────────────────────

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

// ─── Mock MCP Client ────────────────────────────────────────────────────────

const { MockMCPClient, MockMCPClientError } = vi.hoisted(() => {
  class MockMCPClient {
    createStudioArtifact = vi.fn().mockResolvedValue({ id: "artifact-123" });
    pollArtifactStatus = vi.fn().mockResolvedValue({
      status: "COMPLETED",
      title: "Generated Content",
      transcript: "Test transcript",
      duration: 180,
      questions: [],
      cards: [],
    });
    queryNotebook = vi.fn().mockResolvedValue({
      title: "Query Result",
      questions: [],
      cards: [],
    });
    listNotebooks = vi.fn().mockResolvedValue([]);
    listSources = vi.fn().mockResolvedValue([]);
    addSource = vi.fn().mockResolvedValue({ id: "source-123" });
    checkAuth = vi.fn().mockResolvedValue(true);
  }

  class MockMCPClientError extends Error {
    type: string;
    code: number;
    constructor(message: string, type: string = "unknown", code: number = 500) {
      super(message);
      this.name = "MCPClientError";
      this.type = type;
      this.code = code;
    }
  }

  return { MockMCPClient, MockMCPClientError };
});

vi.mock("./mcp-client", () => ({
  MCPClient: MockMCPClient,
  MCPClientError: MockMCPClientError,
}));

// ─── Import after mock ───────────────────────────────────────────────────────

import { generateContent, getGenerationStatus, reviewContent, runGeneration, mcpClient } from "./generate";

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

// ─── generateContent — Fire-and-Forget ───────────────────────────────────────

describe("generateContent", () => {
  it("creates PENDING record, updates to PROCESSING, returns immediately", async () => {
    mockCreate.mockResolvedValue(mockCreatedRecord);
    mockUpdate.mockResolvedValue({ ...mockCreatedRecord, status: "PROCESSING" });

    const result = await generateContent(validRequest);

    expect(result).toEqual({
      id: "gen-123",
      status: "PROCESSING",
    });

    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: "gen-123" },
      data: { status: "PROCESSING" },
    });
  });

  it("returns PROCESSING for AUDIO content type", async () => {
    mockCreate.mockResolvedValue(mockCreatedRecord);
    mockUpdate.mockResolvedValue({});

    const result = await generateContent({
      ...validRequest,
      contentType: "AUDIO",
    });

    expect(result.status).toBe("PROCESSING");
  });

  it("returns PROCESSING for FLASHCARDS content type", async () => {
    mockCreate.mockResolvedValue(mockCreatedRecord);
    mockUpdate.mockResolvedValue({});

    const result = await generateContent({
      ...validRequest,
      contentType: "FLASHCARDS",
    });

    expect(result.status).toBe("PROCESSING");
  });

  it("throws when initial create fails (outside try/catch)", async () => {
    mockCreate.mockRejectedValue(new Error("Database connection failed"));

    await expect(generateContent(validRequest)).rejects.toThrow("Database connection failed");
    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(mockUpdate).not.toHaveBeenCalled();
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

// ─── runGeneration — async pipeline (TASK 3.1) ───────────────────────────────

describe("runGeneration — full async pipeline", () => {
  it("persists notebookId, artifactId, downloadUrl and topics on COMPLETED", async () => {
    mockFindUnique.mockResolvedValue({
      id: "gen-123",
      status: "PROCESSING",
      notebookId: null,
    });
    mockUpdate.mockResolvedValue({});

    (mcpClient.createStudioArtifact as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "artifact-123",
    });
    (mcpClient.pollArtifactStatus as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      status: "COMPLETED",
      title: "Generated Audio",
      transcript: "Transcript",
      questions: [],
      duration: 180,
      downloadUrl: "https://cdn.example.com/audio.mp4",
      topics: ["Newton's Laws", "Motion"],
    });

    const result = await runGeneration("gen-123", {
      sourceType: "URL",
      sourceData: "https://example.com/physics",
      contentType: "AUDIO",
      createdById: "user-123",
    });

    expect(result).toEqual({ id: "gen-123", status: "COMPLETED" });

    const finalUpdate = mockUpdate.mock.calls.find(
      ([call]) => (call as any)?.data?.status === "COMPLETED",
    );
    expect(finalUpdate).toBeDefined();
    expect((finalUpdate![0] as any).where).toEqual({ id: "gen-123" });
    expect((finalUpdate![0] as any).data).toEqual(
      expect.objectContaining({
        status: "COMPLETED",
        artifactId: "artifact-123",
        notebookId: "fa8414d0-a476-4fad-a6a7-be1167880228", // DEFAULT_NOTEBOOK fallback
        downloadUrl: "https://cdn.example.com/audio.mp4",
        topics: ["Newton's Laws", "Motion"],
      }),
    );
  });

  it("marks record FAILED with errorMessage when MCP creation throws", async () => {
    mockFindUnique.mockResolvedValue({
      id: "gen-123",
      status: "PROCESSING",
      notebookId: "nb-1",
    });
    mockUpdate.mockResolvedValue({});

    (mcpClient.createStudioArtifact as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("nlm auth expired"),
    );

    const result = await runGeneration("gen-123", {
      ...validRequest,
      contentType: "AUDIO",
      notebookId: "nb-1",
    });

    expect(result).toEqual({ id: "gen-123", status: "FAILED" });
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: "gen-123" },
      data: expect.objectContaining({ status: "FAILED", errorMessage: "nlm auth expired" }),
    });
  });
});

// ─── reviewContent — AudioExercise metadata (audioUrl + notebookId) ──────────

describe("reviewContent — AudioExercise metadata", () => {
  it("persists audioUrl and notebookId on approved AUDIO content", async () => {
    mockFindUnique.mockResolvedValue({
      id: "gen-123",
      status: "COMPLETED",
      contentType: "AUDIO",
      notebookId: "nb-live-42",
      rawResponse: {
        type: "audio",
        title: "Wave Basics",
        transcript: "Transcript",
        questions: [{ id: "q1", question: "What is a wave?" }],
        duration: 240,
        audioUrl: "https://cdn.example.com/audio.mp3",
        downloadUrl: "https://cdn.example.com/waves.mp3",
      },
    });
    mockUpdate.mockResolvedValue({});

    const prismaMock = await import("@/lib/prisma");
    const audioCreate = prismaMock.default.audioExercise.create as ReturnType<typeof vi.fn>;
    audioCreate.mockResolvedValue({ id: "ae-1" });

    const result = await reviewContent("gen-123", "APPROVE", "reviewer-1");

    expect(result).toEqual({ success: true });
    expect(audioCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        audioUrl: "https://cdn.example.com/audio.mp3",
        notebookId: "nb-live-42",
        generatedContentId: "gen-123",
      }),
    });
  });
});
