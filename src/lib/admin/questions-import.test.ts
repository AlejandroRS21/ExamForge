import { describe, it, expect } from "vitest";
import { parseQuestionCSV } from "./questions-import";

describe("parseQuestionCSV", () => {
  it("parses valid CSV with all required columns", () => {
    const csv = `examPartId,type,prompt,correctAnswer,difficulty
ruoe-part-1,MC,"Choose the right word",A,B
ruoe-part-2,CLOZE,"Fill in the blank",answer,A`;

    const { rows, parseErrors } = parseQuestionCSV(csv);

    expect(parseErrors).toHaveLength(0);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toEqual({
      examPartId: "ruoe-part-1",
      type: "MC",
      prompt: "Choose the right word",
      correctAnswer: "A",
      difficulty: "B",
      skillsTested: [],
    });
  });

  it("handles semicolon-separated options", () => {
    const csv = `examPartId,type,prompt,options,correctAnswer,difficulty
ruoe-part-1,MC,"Q1","A;B;C;D",A,B`;

    const { rows, parseErrors } = parseQuestionCSV(csv);

    expect(parseErrors).toHaveLength(0);
    expect(rows[0].options).toEqual(["A", "B", "C", "D"]);
  });

  it("handles JSON-formatted options", () => {
    const csv = `examPartId,type,prompt,options,correctAnswer,difficulty
ruoe-part-1,MC,"Q1","[""A"",""B"",""C"",""D""]",A,B`;

    const { rows, parseErrors } = parseQuestionCSV(csv);

    expect(parseErrors).toHaveLength(0);
    expect(rows[0].options).toEqual(["A", "B", "C", "D"]);
  });

  it("handles semicolon-separated skillsTested", () => {
    const csv = `examPartId,type,prompt,correctAnswer,difficulty,skillsTested
ruoe-part-1,MC,"Q1",A,B,"vocabulary;grammar"`;

    const { rows, parseErrors } = parseQuestionCSV(csv);

    expect(parseErrors).toHaveLength(0);
    expect(rows[0].skillsTested).toEqual(["vocabulary", "grammar"]);
  });

  it("handles optional explanation field", () => {
    const csv = `examPartId,type,prompt,correctAnswer,difficulty,explanation
ruoe-part-1,MC,"Q1",A,B,"This is the best answer because..."`;

    const { rows, parseErrors } = parseQuestionCSV(csv);

    expect(parseErrors).toHaveLength(0);
    expect(rows[0].explanation).toBe("This is the best answer because...");
  });

  it("rejects CSV without required headers", () => {
    const csv = `type,prompt
MC,"Some question"`;

    const { rows, parseErrors } = parseQuestionCSV(csv);

    expect(rows).toHaveLength(0);
    expect(parseErrors.length).toBeGreaterThan(0);
    expect(parseErrors[0]).toContain("Missing required headers");
  });

  it("skips empty rows", () => {
    const csv = `examPartId,type,prompt,correctAnswer,difficulty
ruoe-part-1,MC,"Q1",A,B

ruoe-part-1,CLOZE,"Q2",answer,B`;

    const { rows, parseErrors } = parseQuestionCSV(csv);

    expect(parseErrors).toHaveLength(0);
    expect(rows).toHaveLength(2);
  });

  it("handles quoted fields with commas inside", () => {
    const csv = `examPartId,type,prompt,correctAnswer,difficulty
ruoe-part-1,MC,"Choose the one that means: happy, content, joyful",A,B`;

    const { rows, parseErrors } = parseQuestionCSV(csv);

    expect(parseErrors).toHaveLength(0);
    expect(rows[0].prompt).toContain("happy, content, joyful");
  });

  it("uses provided difficulty or defaults to B", () => {
    const csv = `examPartId,type,prompt,correctAnswer,difficulty
ruoe-part-1,MC,"Q1",A,C
ruoe-part-2,MC,"Q2",B,`;

    const { rows, parseErrors } = parseQuestionCSV(csv);

    expect(parseErrors).toHaveLength(0);
    expect(rows[0].difficulty).toBe("C");
    expect(rows[1].difficulty).toBe("B"); // Default when empty
  });

  it("returns empty rows and error if CSV is empty", () => {
    const csv = "";

    const { rows, parseErrors } = parseQuestionCSV(csv);

    expect(rows).toHaveLength(0);
    expect(parseErrors.length).toBeGreaterThan(0);
  });
});
