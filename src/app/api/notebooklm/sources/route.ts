// OpenSloth — NotebookLM Sources List API
// GET /api/notebooklm/sources?notebookId=X → Sources + count for a notebook.
// notebookId is OPTIONAL: without it the route returns an empty list with
// count 0 so the admin UI can mount before a notebook is selected.

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { MCPClient } from "@/lib/notebooklm/mcp-client";

const mcpClient = new MCPClient();

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const role = session.user.role;
    if (role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const notebookId = searchParams.get("notebookId");

    if (!notebookId) {
      return NextResponse.json({ sources: [], count: 0 });
    }

    const sources = await mcpClient.listSources(notebookId);
    return NextResponse.json({ sources, count: sources.length });
  } catch (error) {
    console.error("[notebooklm/sources] GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}