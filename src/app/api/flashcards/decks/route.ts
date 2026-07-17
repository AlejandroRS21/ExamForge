// ExamForge — Flashcard Deck List API
// GET /api/flashcards/decks → List all decks visible to the user

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { listDecks } from "@/lib/flashcards/service";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decks = await listDecks(session.user.id);

    return NextResponse.json({ decks });
  } catch (error) {
    console.error("[flashcards/decks] GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
