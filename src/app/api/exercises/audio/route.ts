// OpenSloth — Audio Exercise List API
// GET /api/exercises/audio → List all published audio exercises (metadata only)

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { listAudioExercises } from "@/lib/exercises/audio";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const exercises = await listAudioExercises();

    return NextResponse.json({ exercises });
  } catch (error) {
    console.error("[exercises/audio] GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
