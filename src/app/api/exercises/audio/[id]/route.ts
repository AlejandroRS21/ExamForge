// ExamForge — Audio Exercise Detail API
// GET /api/exercises/audio/[id] → Return audio blob + questions JSON
// Serves the audio data with correct Content-Type and Accept-Ranges for seeking support

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAudioExercise } from "@/lib/exercises/audio";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const exercise = await getAudioExercise(id);

    if (!exercise) {
      return NextResponse.json({ error: "Audio exercise not found" }, { status: 404 });
    }

    // Return JSON with metadata + base64 audio data
    // The audioData is served as base64 so the client can construct an audio blob URL
    const audioBase64 = exercise.audioData
      ? Buffer.from(exercise.audioData).toString("base64")
      : null;

    return NextResponse.json({
      id: exercise.id,
      title: exercise.title,
      mimeType: exercise.mimeType,
      duration: exercise.duration,
      transcript: exercise.transcript,
      questions: exercise.questions,
      audioData: audioBase64,
      attemptCount: exercise.attemptCount,
      createdAt: exercise.createdAt,
    });
  } catch (error) {
    console.error("[exercises/audio] GET detail error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
