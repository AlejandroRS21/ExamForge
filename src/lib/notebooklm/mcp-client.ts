// ExamForge — NotebookLM MCP Client
// Real MCP client for calling NotebookLM CLI tools (`nlm`) with:
//  - shell-injection-safe argument dispatch (`execFile`, `shell: false`)
//  - transparent mock fallback (`NOTEBOOKLM_USE_MOCK=true` or auth/429/500 errors)
//  - async artifact polling with a 5-minute timeout

import { execFile } from "child_process";

const TYPE_TO_CODE: Record<string, number> = {
  rateLimited: 429,
  authExpired: 401,
  notFound: 404,
  unknown: 500,
};

// Error types that justify transparent fallback to the mock implementation.
// 404 (notFound) is a legitimate client error and is never masked.
const FALLBACK_ERROR_TYPES = new Set(["rateLimited", "authExpired", "unknown"]);

export class MCPClientError extends Error {
  code: number;
  constructor(
    message: string,
    public type: "rateLimited" | "authExpired" | "notFound" | "unknown",
    code?: number,
  ) {
    super(message);
    this.name = "MCPClientError";
    this.code = code ?? TYPE_TO_CODE[type] ?? 500;
  }

  get isRateLimited(): boolean {
    return this.type === "rateLimited";
  }

  get isAuthExpired(): boolean {
    return this.type === "authExpired";
  }

  get isNotFound(): boolean {
    return this.type === "notFound";
  }
}

// ─── Argument sanitation ─────────────────────────────────────────────────────
// `execFile` with `shell: false` already guarantees arguments are never
// interpreted by a shell — `; rm -rf /` / `$(whoami)` stay literal strings.
// NUL bytes are the one thing execFile itself rejects, so we fail fast.

export function sanitizeArgs(args: string[]): string[] {
  for (const arg of args) {
    if (arg.includes("\u0000")) {
      throw new MCPClientError(
        `Rejected argument containing NUL byte: ${JSON.stringify(arg)}`,
        "unknown",
        400,
      );
    }
  }
  return args;
}

// Simple rate limit tracking
let dailyUsage = {
  audio: 0,
  quiz: 0,
  flashcards: 0,
};

export function resetDailyUsage(): void {
  dailyUsage = { audio: 0, quiz: 0, flashcards: 0 };
}

// ─── Mock implementation ─────────────────────────────────────────────────────
// Deterministic offline payloads. Every payload carries `fallback: true`.

const withFallback = <T extends object>(payload: T): T & { fallback: true } => ({
  ...payload,
  fallback: true,
});

export class MockMCPClient {
  async checkAuth(): Promise<boolean> {
    return true;
  }

  async listNotebooks() {
    return withFallback([{ id: "mock-notebook", title: "Mock Notebook" }]);
  }

  async listSources(notebookId: string) {
    return withFallback([
      { id: "mock-source", notebookId, type: "URL", url: "https://example.com/mock-source" },
    ]);
  }

  async addSource(notebookId: string, type: string, data: string) {
    return withFallback({ success: true, sourceId: "mock-source-added", notebookId, type, data });
  }

  async createStudioArtifact(notebookId: string, type: string) {
    return withFallback({
      id: `mock-artifact-${type}`,
      notebookId,
      type,
      status: "completed",
    });
  }

  async pollArtifactStatus(notebookId: string, artifactId: string) {
    return withFallback({
      id: artifactId,
      notebookId,
      status: "completed",
      downloadUrl: `https://mock.example.com/artifacts/${artifactId}.mp4`,
    });
  }

  async queryNotebook(notebookId: string, query: string) {
    return withFallback({
      title: "Mock Answer",
      answer: "This is a mock NotebookLM response.",
      notebookId,
      query,
      cards: [],
      questions: [],
      structure: [],
    });
  }
}

// ─── Client configuration ────────────────────────────────────────────────────

export interface MCPClientConfig {
  useMock: boolean;
  notebookId: string;
  pollIntervalMs: number; // 5000ms
  pollTimeoutMs: number;  // 300000ms (5 min)
}

const DEFAULT_POLL_INTERVAL_MS = 5_000;
const DEFAULT_POLL_TIMEOUT_MS = 300_000;

export class MCPClient {
  private useMock: boolean;
  private pollIntervalMs: number;
  private pollTimeoutMs: number;
  private mock: MockMCPClient;

  constructor(config?: Partial<Omit<MCPClientConfig, "notebookId">>) {
    this.useMock = config?.useMock ?? process.env.NOTEBOOKLM_USE_MOCK === "true";
    this.pollIntervalMs = config?.pollIntervalMs ?? DEFAULT_POLL_INTERVAL_MS;
    this.pollTimeoutMs = config?.pollTimeoutMs ?? DEFAULT_POLL_TIMEOUT_MS;
    this.mock = new MockMCPClient();
  }

  get usingMock(): boolean {
    return this.useMock;
  }

  // Usage tracking methods
  getDailyUsage() {
    return { ...dailyUsage };
  }

  incrementUsage(type: string): void {
    const key = type.toLowerCase() as keyof typeof dailyUsage;
    const daily = this.getDailyUsage();

    if ((daily[key] ?? 0) >= this.getLimitForType(type)) {
      throw new MCPClientError(`Rate limit exceeded for ${type}`, "rateLimited", 429);
    }

    (dailyUsage as any)[key] = (daily[key] ?? 0) + 1;
  }

  private getLimitForType(type: string): number {
    switch (type) {
      case "AUDIO":
        return 3; // Free tier: 3 audio/day
      case "QUIZ":
        return 10; // Free tier: 10 quizzes/day
      case "FLASHCARDS":
        return 50; // Higher limit for flashcards (generates many cards)
      default:
        return 100;
    }
  }

  // Auth check
  async checkAuth(): Promise<boolean> {
    if (this.useMock) {
      return this.mock.checkAuth();
    }
    try {
      const output = await this.execNlm(["server", "info", "--json"]);
      return output.auth_status === "configured";
    } catch (error) {
      if (error instanceof MCPClientError) {
        throw error;
      }
      throw new MCPClientError(String(error), "unknown", 500);
    }
  }

  // Transparent fallback: auth/rate-limit/server errors route to the mock.
  private fallbackOrThrow<T>(error: unknown, mockResult: () => T): T {
    if (error instanceof MCPClientError && FALLBACK_ERROR_TYPES.has(error.type)) {
      console.warn(`[notebooklm] Falling back to mock (${error.type}): ${error.message}`);
      return mockResult();
    }
    throw error;
  }

  // nlm CLI wrapper — direct execFile dispatch, never a shell string
  private execNlm(args: string[]): Promise<any> {
    const nlmPath = "nlm";
    const safeArgs = sanitizeArgs(args);

    return new Promise((resolve, reject) => {
      execFile(
        nlmPath,
        safeArgs,
        { shell: false, maxBuffer: 1024 * 1024 },
        (error, stdout, stderr) => {
          if (error) {
            let errorType: "rateLimited" | "authExpired" | "notFound" | "unknown" = "unknown";
            let errorCode = typeof error.code === "number" ? error.code : 500;

            if (stderr.includes("rate limit") || error.message.includes("429")) {
              errorType = "rateLimited";
              errorCode = 429;
            } else if (stderr.includes("auth") || stderr.includes("401") || error.message.includes("401")) {
              errorType = "authExpired";
              errorCode = 401;
            } else if (stderr.includes("not found") || stderr.includes("404") || error.message.includes("404")) {
              errorType = "notFound";
              errorCode = 404;
            }

            reject(new MCPClientError(
              `${stderr || error.message || "Unknown error"}`,
              errorType,
              errorCode,
            ));
            return;
          }

          try {
            const output = stdout.trim();
            if (!output) {
              resolve({});
              return;
            }

            const jsonOutput = JSON.parse(output);
            resolve(jsonOutput);
          } catch (parseError) {
            reject(new MCPClientError(
              `Failed to parse JSON output: ${parseError}`,
              "unknown",
              500,
            ));
          }
        },
      );
    });
  }

  // Notebook operations
  async listNotebooks() {
    if (this.useMock) {
      return this.mock.listNotebooks();
    }
    try {
      const output = await this.execNlm(["notebook", "list", "--json"]);
      return output.notebooks || [];
    } catch (error) {
      return this.fallbackOrThrow(error, () => this.mock.listNotebooks());
    }
  }

  async listSources(notebookId: string) {
    if (this.useMock) {
      return this.mock.listSources(notebookId);
    }
    try {
      const output = await this.execNlm([
        "source",
        "list",
        "--notebook-id",
        notebookId,
        "--json",
      ]);
      return output.sources || [];
    } catch (error) {
      return this.fallbackOrThrow(error, () => this.mock.listSources(notebookId));
    }
  }

  async addSource(notebookId: string, type: string, data: string) {
    this.incrementUsage(type);
    if (this.useMock) {
      return this.mock.addSource(notebookId, type, data);
    }
    try {
      const args = ["source", "add", "--notebook-id", notebookId, "--type", type, "--url", data, "--json"];
      return await this.execNlm(args);
    } catch (error) {
      return this.fallbackOrThrow(error, () => this.mock.addSource(notebookId, type, data));
    }
  }

  async createStudioArtifact(notebookId: string, type: string, sourceIds?: string[]) {
    if (this.useMock) {
      return this.mock.createStudioArtifact(notebookId, type);
    }
    try {
      const args = ["studio", "create", "--notebook-id", notebookId, "--artifact-type", type, "--json"];

      if (sourceIds && sourceIds.length > 0) {
        args.push("--source-ids", ...sourceIds);
      }

      return await this.execNlm(args);
    } catch (error) {
      return this.fallbackOrThrow(error, () => this.mock.createStudioArtifact(notebookId, type));
    }
  }

  // Polls studio status until the artifact reaches `completed`/`failed`
  // or `pollTimeoutMs` elapses (default 5 minutes).
  async pollArtifactStatus(notebookId: string, artifactId: string) {
    if (this.useMock) {
      return this.mock.pollArtifactStatus(notebookId, artifactId);
    }

    const start = Date.now();
    let output = await this.execNlm([
      "studio",
      "status",
      "--notebook-id",
      notebookId,
      "--artifact-id",
      artifactId,
      "--json",
    ]);

    while (!isTerminalStatus(output) && Date.now() - start < this.pollTimeoutMs) {
      await new Promise((r) => setTimeout(r, this.pollIntervalMs));
      output = await this.execNlm([
        "studio",
        "status",
        "--notebook-id",
        notebookId,
        "--artifact-id",
        artifactId,
        "--json",
      ]);
    }

    if (!isTerminalStatus(output)) {
      throw new MCPClientError(
        `Artifact ${artifactId} timed out after ${this.pollTimeoutMs}ms`,
        "unknown",
        500,
      );
    }

    return output;
  }

  async queryNotebook(notebookId: string, query: string) {
    if (this.useMock) {
      return this.mock.queryNotebook(notebookId, query);
    }
    try {
      return await this.execNlm([
        "notebook",
        "query",
        "--notebook-id",
        notebookId,
        "--query",
        query,
        "--json",
      ]);
    } catch (error) {
      return this.fallbackOrThrow(error, () => this.mock.queryNotebook(notebookId, query));
    }
  }
}

function isTerminalStatus(output: any): boolean {
  const state = String(output?.status ?? "").toLowerCase();
  return state === "completed" || state === "failed";
}