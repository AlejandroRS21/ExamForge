// ExamForge — NotebookLM MCP Client
// Real MCP client for calling NotebookLM CLI tools with retry, rate-limit awareness, and auth handling

import { execFile } from "child_process";

const TYPE_TO_CODE: Record<string, number> = {
  rateLimited: 429,
  authExpired: 401,
  notFound: 404,
  unknown: 500,
};

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

// Simple rate limit tracking
let dailyUsage = {
  audio: 0,
  quiz: 0,
  flashcards: 0,
};

export function resetDailyUsage(): void {
  dailyUsage = { audio: 0, quiz: 0, flashcards: 0 };
}

export class MCPClient {
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

  // nlm CLI wrapper
  private async execNlm(args: string[]): Promise<any> {
    const nlmPath = "nlm";
    
    return new Promise((resolve, reject) => {
      const proc = execFile(nlmPath, args, { maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
        if (error) {
          let errorType: "rateLimited" | "authExpired" | "notFound" | "unknown" = "unknown";
          let errorCode = error.code || 500;
          
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
            errorCode
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
            500
          ));
        }
      });
      
      proc.stdout?.on("data", () => {});
      proc.stderr?.on("data", () => {});
    });
  }

  // Notebook operations
  async listNotebooks() {
    const output = await this.execNlm(["notebook", "list", "--json"]);
    return output.notebooks || [];
  }

  async listSources(notebookId: string) {
    const output = await this.execNlm([
      "source", 
      "list", 
      "--notebook-id", 
      notebookId, 
      "--json"
    ]);
    return output.sources || [];
  }

  async addSource(notebookId: string, type: string, data: string) {
    const args = ["source", "add", "--notebook-id", notebookId, "--type", type, "--url", data, "--json"];
    
    // Update usage based on source type
    this.incrementUsage(type);
    
    const output = await this.execNlm(args);
    return output;
  }

  async createStudioArtifact(notebookId: string, type: string, sourceIds?: string[]) {
    const args = ["studio", "create", "--notebook-id", notebookId, "--artifact-type", type, "--json"];
    
    if (sourceIds && sourceIds.length > 0) {
      args.push("--source-ids", ...sourceIds);
    }
    
    const output = await this.execNlm(args);
    return output;
  }

  async pollArtifactStatus(notebookId: string, artifactId: string) {
    const output = await this.execNlm([
      "studio", 
      "status", 
      "--notebook-id", 
      notebookId, 
      "--artifact-id", 
      artifactId, 
      "--json"
    ]);
    return output;
  }

  async queryNotebook(notebookId: string, query: string) {
    const output = await this.execNlm([
      "notebook", 
      "query", 
      "--notebook-id", 
      notebookId, 
      "--query", 
      query, 
      "--json"
    ]);
    return output;
  }
}
