// ExamForge — Question Import API
// POST /api/admin/questions/import
// Uploads and processes CSV file of questions

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { importQuestionsFromCSV } from "@/lib/admin/questions-import";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = session.user.role;
    if (role !== "ADMIN" && role !== "EDITOR") {
      return NextResponse.json({ error: "Forbidden: only admins/editors can import questions" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!file.name.endsWith(".csv")) {
      return NextResponse.json({ error: "Only CSV files are supported" }, { status: 400 });
    }

    const csvText = await file.text();
    const result = await importQuestionsFromCSV(csvText);

    return NextResponse.json({
      success: result.success,
      failed: result.failed,
      errors: result.errors,
      message: `Imported ${result.success} questions. ${result.failed} failed.`,
    });
  } catch (error) {
    console.error("Question import error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
