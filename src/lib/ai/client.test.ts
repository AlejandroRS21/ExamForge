// OpenSloth — Shared AI Client Tests

import { describe, it, expect, vi, beforeEach } from "vitest";

const createMock = vi.fn();

vi.mock("openai", () => ({
  default: class {
    chat = { completions: { create: createMock } };
  },
}));

function mockResponse(content: string) {
  return { choices: [{ message: { content } }] };
}

describe("isAIConfigured", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it("true when both AI_API_KEY and AI_BASE_URL are set", async () => {
    vi.stubEnv("AI_API_KEY", "key-123");
    vi.stubEnv("AI_BASE_URL", "http://127.0.0.1:20128/v1");
    const { isAIConfigured } = await import("./client");
    expect(isAIConfigured()).toBe(true);
  });

  it("false when key is empty", async () => {
    vi.stubEnv("AI_API_KEY", "");
    vi.stubEnv("AI_BASE_URL", "http://127.0.0.1:20128/v1");
    const { isAIConfigured } = await import("./client");
    expect(isAIConfigured()).toBe(false);
  });

  it("false when base URL is empty", async () => {
    vi.stubEnv("AI_API_KEY", "key-123");
    vi.stubEnv("AI_BASE_URL", "");
    const { isAIConfigured } = await import("./client");
    expect(isAIConfigured()).toBe(false);
  });
});

describe("getAIModel", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it("defaults to 9r-apply when unset", async () => {
    vi.stubEnv("AI_MODEL", "");
    const { getAIModel } = await import("./client");
    expect(getAIModel()).toBe("9r-apply");
  });

  it("uses AI_MODEL when set", async () => {
    vi.stubEnv("AI_MODEL", "custom-model");
    const { getAIModel } = await import("./client");
    expect(getAIModel()).toBe("custom-model");
  });
});

describe("generateJSON", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    createMock.mockReset();
    vi.stubEnv("AI_API_KEY", "key-123");
    vi.stubEnv("AI_BASE_URL", "http://127.0.0.1:20128/v1");
    vi.stubEnv("AI_MODEL", "9r-apply");
  });

  it("returns parsed object on valid JSON", async () => {
    createMock.mockResolvedValue(mockResponse('{"score": 5, "ok": true}'));
    const { generateJSON } = await import("./client");
    const result = await generateJSON<{ score: number; ok: boolean }>({
      systemPrompt: "s",
      userPrompt: "u",
    });
    expect(result).toEqual({ score: 5, ok: true });
    expect(createMock).toHaveBeenCalledOnce();
  });

  it("extracts JSON wrapped in prose", async () => {
    createMock.mockResolvedValue(mockResponse('Here you go:\n{"a": 1}\nThanks'));
    const { generateJSON } = await import("./client");
    const result = await generateJSON<{ a: number }>({ systemPrompt: "s", userPrompt: "u" });
    expect(result).toEqual({ a: 1 });
  });

  it("returns null on invalid JSON", async () => {
    createMock.mockResolvedValue(mockResponse("not json at all"));
    const { generateJSON } = await import("./client");
    const result = await generateJSON({ systemPrompt: "s", userPrompt: "u" });
    expect(result).toBeNull();
  });

  it("returns null on empty response", async () => {
    createMock.mockResolvedValue(mockResponse("   "));
    const { generateJSON } = await import("./client");
    const result = await generateJSON({ systemPrompt: "s", userPrompt: "u" });
    expect(result).toBeNull();
  });

  it("returns null on API error without throwing", async () => {
    createMock.mockRejectedValue(new Error("network down"));
    const { generateJSON } = await import("./client");
    const result = await generateJSON({ systemPrompt: "s", userPrompt: "u" });
    expect(result).toBeNull();
  });

  it("returns null and does not call API when unconfigured", async () => {
    vi.stubEnv("AI_API_KEY", "");
    const { generateJSON } = await import("./client");
    const result = await generateJSON({ systemPrompt: "s", userPrompt: "u" });
    expect(result).toBeNull();
    expect(createMock).not.toHaveBeenCalled();
  });
});
