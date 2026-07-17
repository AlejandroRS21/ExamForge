// ExamForge — NotebookLM MCP Client Tests
// TDD: Tests for real MCP client with retry, rate-limit awareness, and auth handling

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ─── Mocks ──────────────────────────────────────────────────────────────────
// Must use vi.hoisted() for hoisted mock factories

const { execMock } = vi.hoisted(() => ({
  execMock: vi.fn(),
}));

vi.mock("child_process", () => ({
  exec: execMock,
}));

vi.mock("util", () => ({
  promisify: (fn: any) => fn,
}));

// ─── Import after mocks ─────────────────────────────────────────────────────

import { MCPClient, MCPClientError, resetDailyUsage } from "./mcp-client";

// ─── Fixtures ───────────────────────────────────────────────────────────────

const mockNotebookId = "fa8414d0-a476-4fad-a6a7-be1167880228";
const mockArtifactId = "artifact-123";

// exec callback pattern helpers
const mockNlmResponse = (jsonData: any) => {
  return (_cmd: string, _opts: any, callback: Function) => {
    callback(null, JSON.stringify(jsonData), "");
  };
};

const mockNlmError = (stderr: string, exitCode: number) => {
  return (_cmd: string, _opts: any, callback: Function) => {
    const error = new Error(stderr);
    (error as any).code = exitCode;
    callback(error, "", stderr);
  };
};

// ─── Setup ───────────────────────────────────────────────────────────────────

let client: MCPClient;

beforeEach(() => {
  vi.clearAllMocks();
  resetDailyUsage();
  client = new MCPClient();
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ─── MCPClientError Tests ───────────────────────────────────────────────────

describe("MCPClientError", () => {
  it("should be instantiable with rateLimited type", () => {
    const error = new MCPClientError("Rate limit exceeded", "rateLimited");
    expect(error.message).toBe("Rate limit exceeded");
    expect(error.type).toBe("rateLimited");
    expect(error.code).toBe(429);
    expect(error.isRateLimited).toBe(true);
  });

  it("should be instantiable with authExpired type", () => {
    const error = new MCPClientError("Authentication expired", "authExpired");
    expect(error.message).toBe("Authentication expired");
    expect(error.type).toBe("authExpired");
    expect(error.code).toBe(401);
    expect(error.isAuthExpired).toBe(true);
  });

  it("should be instantiable with notFound type", () => {
    const error = new MCPClientError("Notebook not found", "notFound");
    expect(error.message).toBe("Notebook not found");
    expect(error.type).toBe("notFound");
    expect(error.code).toBe(404);
    expect(error.isNotFound).toBe(true);
  });

  it("should be instantiable with generic error type", () => {
    const error = new MCPClientError("Unknown error", "unknown");
    expect(error.message).toBe("Unknown error");
    expect(error.type).toBe("unknown");
    expect(error.code).toBe(500);
    expect(error.isRateLimited).toBe(false);
    expect(error.isAuthExpired).toBe(false);
    expect(error.isNotFound).toBe(false);
  });
});

// ─── Rate Limit Tests ───────────────────────────────────────────────────────

describe("MCPClient — Rate Limit Tracking", () => {
  it("should track daily usage", () => {
    expect(client.getDailyUsage()).toEqual({ audio: 0, quiz: 0, flashcards: 0 });

    client.incrementUsage("AUDIO");
    expect(client.getDailyUsage().audio).toBe(1);
  });

  it("should increment usage for audio, quiz, and flashcards", () => {
    client.incrementUsage("AUDIO");
    client.incrementUsage("QUIZ");
    client.incrementUsage("FLASHCARDS");

    expect(client.getDailyUsage()).toEqual({ audio: 1, quiz: 1, flashcards: 1 });
  });

  it("should throw MCPClientError when rate limit exceeded for audio", () => {
    // Set audio to limit (3) by calling incrementUsage 3 times
    client.incrementUsage("AUDIO");
    client.incrementUsage("AUDIO");
    client.incrementUsage("AUDIO");

    // 4th call should throw
    expect(() => client.incrementUsage("AUDIO")).toThrow(MCPClientError);
    expect(() => client.incrementUsage("AUDIO")).toThrow("Rate limit exceeded");
  });
});

// ─── Auth Check Tests ───────────────────────────────────────────────────────

describe("MCPClient — Auth Check", () => {
  it("should return true when auth is configured", async () => {
    execMock.mockImplementation(mockNlmResponse({
      auth_status: "configured",
      version: "0.8.4",
    }));

    const result = await client.checkAuth();
    expect(result).toBe(true);
    expect(execMock).toHaveBeenCalledWith(
      expect.stringContaining("server"),
      expect.any(Object),
      expect.any(Function),
    );
  });

  it("should return false when auth is not configured", async () => {
    execMock.mockImplementation(mockNlmResponse({
      auth_status: "not_configured",
      version: "0.8.4",
    }));

    const result = await client.checkAuth();
    expect(result).toBe(false);
  });

  it("should throw MCPClientError when nlm command fails", async () => {
    execMock.mockImplementation(mockNlmError("Authentication failed", 1));

    await expect(client.checkAuth()).rejects.toThrow(MCPClientError);
  });
});

// ─── Notebook Operations Tests ──────────────────────────────────────────────

describe("MCPClient — Notebook Operations", () => {
  describe("listNotebooks()", () => {
    it("should call nlm notebook list --json and return parsed result", async () => {
      const mockNotebooks = [
        { id: "notebook-1", title: "ExamForge" },
        { id: "notebook-2", title: "Test Notebook" },
      ];

      execMock.mockImplementation(mockNlmResponse({ notebooks: mockNotebooks }));

      const result = await client.listNotebooks();
      expect(result).toEqual(mockNotebooks);
      expect(execMock).toHaveBeenCalledWith(
        expect.stringContaining("notebook"),
        expect.any(Object),
        expect.any(Function),
      );
    });
  });

  describe("listSources(notebookId)", () => {
    it("should call nlm source list with notebook-id and return sources", async () => {
      const mockSources = [
        { id: "source-1", type: "URL", url: "https://example.com" },
        { id: "source-2", type: "TEXT", content: "Sample text" },
      ];

      execMock.mockImplementation(mockNlmResponse({ sources: mockSources }));

      const result = await client.listSources(mockNotebookId);
      expect(result).toEqual(mockSources);
      expect(execMock).toHaveBeenCalledWith(
        expect.stringContaining("source"),
        expect.any(Object),
        expect.any(Function),
      );
    });
  });

  describe("addSource(notebookId, type, data)", () => {
    it("should call nlm source add with type and data", async () => {
      const mockResult = { success: true, sourceId: "new-source-123" };
      execMock.mockImplementation(mockNlmResponse(mockResult));

      const result = await client.addSource(mockNotebookId, "URL", "https://example.com");
      expect(result).toEqual(mockResult);
      expect(execMock).toHaveBeenCalledWith(
        expect.stringContaining("source"),
        expect.any(Object),
        expect.any(Function),
      );
    });
  });
});

// ─── Studio Operations Tests ────────────────────────────────────────────────

describe("MCPClient — Studio Operations", () => {
  describe("createStudioArtifact(notebookId, type, sourceIds?)", () => {
    it("should create audio artifact with source IDs", async () => {
      const mockArtifact = {
        id: mockArtifactId,
        notebookId: mockNotebookId,
        type: "audio",
        status: "processing",
        sourceIds: ["source-1"],
      };

      execMock.mockImplementation(mockNlmResponse(mockArtifact));

      const result = await client.createStudioArtifact(mockNotebookId, "audio", ["source-1"]);
      expect(result).toEqual(mockArtifact);
      expect(execMock).toHaveBeenCalledWith(
        expect.stringContaining("studio"),
        expect.any(Object),
        expect.any(Function),
      );
    });

    it("should create artifact without source IDs", async () => {
      const mockArtifact = {
        id: mockArtifactId,
        notebookId: mockNotebookId,
        type: "flashcards",
        status: "pending",
      };

      execMock.mockImplementation(mockNlmResponse(mockArtifact));

      const result = await client.createStudioArtifact(mockNotebookId, "flashcards");
      expect(result).toEqual(mockArtifact);
      expect(execMock).toHaveBeenCalledWith(
        expect.stringContaining("studio"),
        expect.any(Object),
        expect.any(Function),
      );
    });
  });

  describe("pollArtifactStatus(notebookId, artifactId)", () => {
    it("should poll artifact status and return status", async () => {
      const mockStatus = {
        id: mockArtifactId,
        notebookId: mockNotebookId,
        type: "audio",
        status: "completed",
        sourceIds: ["source-1"],
        downloadUrl: "https://example.com/audio.mp4",
      };

      execMock.mockImplementation(mockNlmResponse(mockStatus));

      const result = await client.pollArtifactStatus(mockNotebookId, mockArtifactId);
      expect(result).toEqual(mockStatus);
      expect(execMock).toHaveBeenCalledWith(
        expect.stringContaining("studio"),
        expect.any(Object),
        expect.any(Function),
      );
    });
  });
});

// ─── Query Operations Tests ──────────────────────────────────────────────────

describe("MCPClient — Query Operations", () => {
  describe("queryNotebook(notebookId, query)", () => {
    it("should query notebook and return parsed result", async () => {
      const mockQueryResult = {
        answer: "The main topic is artificial intelligence",
        sources: ["source-1"],
        confidence: 0.95,
      };

      execMock.mockImplementation(mockNlmResponse(mockQueryResult));

      const result = await client.queryNotebook(mockNotebookId, "What is the main topic?");
      expect(result).toEqual(mockQueryResult);
      expect(execMock).toHaveBeenCalledWith(
        expect.stringContaining("notebook"),
        expect.any(Object),
        expect.any(Function),
      );
    });
  });
});

// ─── Error Handling Tests ───────────────────────────────────────────────────

describe("MCPClient — Error Handling", () => {
  describe("execNlm() error handling", () => {
    it("should throw MCPClientError with rate limited type on 429", async () => {
      execMock.mockImplementation(mockNlmError("rate limit exceeded", 429));

      await expect(client["execNlm"](["notebook", "list", "--json"]))
        .rejects
        .toThrow(MCPClientError);

      const error = await client["execNlm"](["notebook", "list", "--json"]).catch((e) => e);
      expect(error.type).toBe("rateLimited");
    });

    it("should throw MCPClientError with auth expired type on 401", async () => {
      execMock.mockImplementation(mockNlmError("auth required 401", 401));

      await expect(client["execNlm"](["notebook", "list", "--json"]))
        .rejects
        .toThrow(MCPClientError);

      const error = await client["execNlm"](["notebook", "list", "--json"]).catch((e) => e);
      expect(error.type).toBe("authExpired");
    });

    it("should throw MCPClientError with not found type on 404", async () => {
      execMock.mockImplementation(mockNlmError("not found 404", 404));

      await expect(client["execNlm"](["notebook", "list", "--json"]))
        .rejects
        .toThrow(MCPClientError);

      const error = await client["execNlm"](["notebook", "list", "--json"]).catch((e) => e);
      expect(error.type).toBe("notFound");
    });

    it("should throw MCPClientError with generic type on other error codes", async () => {
      execMock.mockImplementation(mockNlmError("Server error", 500));

      await expect(client["execNlm"](["notebook", "list", "--json"]))
        .rejects
        .toThrow(MCPClientError);

      const error = await client["execNlm"](["notebook", "list", "--json"]).catch((e) => e);
      expect(error.type).toBe("unknown");
    });
  });
});
