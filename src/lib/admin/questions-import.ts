// OpenSloth — CSV Question Import Parser & Validator
// Parses Cambridge B2 First questions from CSV format and validates against schema

import type { QuestionType, QuestionDifficulty, QuestionStatus } from "@/generated/prisma/client";
import { Prisma } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";

export interface QuestionRow {
  examPartId: string;
  type: QuestionType;
  prompt: string;
  options?: string[]; // JSON array for MC/CLOZE
  correctAnswer: string; // JSON or plain string depending on type
  difficulty: QuestionDifficulty;
  skillsTested?: string[]; // Comma-separated or JSON array
  explanation?: string;
}

export interface ImportResult {
  success: number;
  failed: number;
  errors: { row: number; message: string }[];
  createdQuestions: string[];
}

/**
 * Parse CSV text into question rows.
 * Expected headers: examPartId, type, prompt, options, correctAnswer, difficulty, skillsTested, explanation
 * Options and skillsTested can be JSON arrays or semicolon-separated values.
 */
export function parseQuestionCSV(csvText: string): { rows: QuestionRow[]; parseErrors: string[] } {
  const lines = csvText.trim().split("\n");
  if (lines.length < 2) {
    return { rows: [], parseErrors: ["CSV must have at least header + 1 data row"] };
  }

  const headerLine = lines[0];
  const headers = headerLine.split(",").map((h) => h.trim().toLowerCase());

  const requiredHeaders = ["exampartid", "type", "prompt", "correctanswer", "difficulty"];
  const missing = requiredHeaders.filter((h) => !headers.includes(h));
  if (missing.length > 0) {
    return { rows: [], parseErrors: [`Missing required headers: ${missing.join(", ")}`] };
  }

  const rows: QuestionRow[] = [];
  const parseErrors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Skip empty rows

    try {
      const values = parseCSVLine(line);
      if (values.length < headers.length) {
        parseErrors.push(`Row ${i + 1}: Insufficient columns (expected ${headers.length}, got ${values.length})`);
        continue;
      }

      const row: Record<string, any> = {};
      headers.forEach((header, idx) => {
        row[header] = values[idx];
      });

      // Parse options and skillsTested as JSON or semicolon-separated
      if (row.options) {
        try {
          row.options = JSON.parse(row.options);
        } catch {
          row.options = row.options.split(";").map((s: string) => s.trim());
        }
      }

      if (row.skillstested) {
        try {
          row.skillstested = JSON.parse(row.skillstested);
        } catch {
          row.skillstested = row.skillstested.split(";").map((s: string) => s.trim());
        }
      }

      rows.push({
        examPartId: row.exampartid,
        type: row.type,
        prompt: row.prompt,
        options: row.options,
        correctAnswer: row.correctanswer,
        difficulty: row.difficulty || "B",
        skillsTested: row.skillstested || [],
        explanation: row.explanation || undefined,
      });
    } catch (err) {
      parseErrors.push(`Row ${i + 1}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return { rows, parseErrors };
}

/**
 * Parse a single CSV line, handling quoted fields with commas inside.
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++; // Skip the next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

/**
 * Validate a question row against schema constraints.
 */
async function validateQuestionRow(row: QuestionRow): Promise<string | null> {
  // Check examPartId exists
  const part = await prisma.examPart.findUnique({ where: { id: row.examPartId } });
  if (!part) {
    return `ExamPart not found: ${row.examPartId}`;
  }

  // Validate question type
  const validTypes: QuestionType[] = ["MC", "CLOZE", "WF", "KT", "GT", "MM"];
  if (!validTypes.includes(row.type)) {
    return `Invalid question type: ${row.type}. Must be one of: ${validTypes.join(", ")}`;
  }

  // Validate difficulty
  const validDifficulties: QuestionDifficulty[] = ["A", "B", "C"];
  if (!validDifficulties.includes(row.difficulty)) {
    return `Invalid difficulty: ${row.difficulty}. Must be A, B, or C`;
  }

  // Prompt required
  if (!row.prompt || row.prompt.trim().length === 0) {
    return "Prompt is required and cannot be empty";
  }

  // CorrectAnswer required
  if (!row.correctAnswer || row.correctAnswer.trim().length === 0) {
    return "CorrectAnswer is required and cannot be empty";
  }

  return null;
}

/**
 * Import questions from CSV into the database.
 * Validates each row and performs bulk insert on success.
 */
export async function importQuestionsFromCSV(csvText: string): Promise<ImportResult> {
  const { rows: parsedRows, parseErrors } = parseQuestionCSV(csvText);

  if (parseErrors.length > 0) {
    return {
      success: 0,
      failed: parsedRows.length,
      errors: parseErrors.map((msg, idx) => ({ row: idx + 2, message: msg })),
      createdQuestions: [],
    };
  }

  const errors: { row: number; message: string }[] = [];
  const validRows: QuestionRow[] = [];

  // Validate each row
  for (let i = 0; i < parsedRows.length; i++) {
    const row = parsedRows[i];
    const validationError = await validateQuestionRow(row);
    if (validationError) {
      errors.push({ row: i + 2, message: validationError });
    } else {
      validRows.push(row);
    }
  }

  // If all rows have errors, bail early
  if (validRows.length === 0) {
    return {
      success: 0,
      failed: parsedRows.length,
      errors,
      createdQuestions: [],
    };
  }

  // Bulk insert valid rows
  const createdIds: string[] = [];
  try {
    const created = await prisma.question.createMany({
      data: validRows.map((row) => ({
        examPartId: row.examPartId,
        type: row.type,
        prompt: row.prompt,
        options: row.options ? (row.options as Prisma.InputJsonValue) : Prisma.DbNull,
        correctAnswer: row.correctAnswer,
        difficulty: row.difficulty,
        skillsTested: row.skillsTested || [],
        explanation: row.explanation || null,
        status: "DRAFT" as QuestionStatus, // All imports start as DRAFT pending review
        aiGenerated: false,
      })),
    });

    // Note: Prisma's createMany doesn't return the created records, so we count
    createdIds.length = created.count;
  } catch (error) {
    return {
      success: 0,
      failed: validRows.length,
      errors: [{ row: 0, message: `Bulk insert failed: ${error instanceof Error ? error.message : String(error)}` }],
      createdQuestions: [],
    };
  }

  return {
    success: validRows.length,
    failed: errors.length,
    errors,
    createdQuestions: createdIds,
  };
}
