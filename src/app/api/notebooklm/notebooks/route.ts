// ExamForge — NotebookLM Notebooks List API
// GET /api/notebooklm/notebooks → List all notebooks from the user's NotebookLM account

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { MCPClient } from "@/lib/notebooklm/mcp-client";

const mcpClient = new MCPClient();

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const role = (session.user as any).role;
    if (role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const notebooks = await mcpClient.listNotebooks();
    return NextResponse.json({ notebooks });
  } catch (error) {
    console.error("[notebooklm/notebooks] GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
