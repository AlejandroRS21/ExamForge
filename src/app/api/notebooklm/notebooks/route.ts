// OpenSloth — NotebookLM Notebooks List API
// GET /api/notebooklm/notebooks → List all notebooks from the user's
// NotebookLM account plus current auth health status (spec: admin-content-manager
// "View notebook list and status").

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
    const role = session.user.role;
    if (role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const notebooks = await mcpClient.listNotebooks();

    // Auth health is advisory — a missing/broken `nlm` login must not take the
    // whole notebooks list down (mock fallback keeps the admin UI usable).
    let authHealth = { configured: false, fallback: mcpClient.usingMock };
    try {
      authHealth = {
        configured: await mcpClient.checkAuth(),
        fallback: mcpClient.usingMock,
      };
    } catch (error) {
      console.warn("[notebooklm/notebooks] auth health check failed:", error);
    }

    return NextResponse.json({ notebooks, authHealth });
  } catch (error) {
    console.error("[notebooklm/notebooks] GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}