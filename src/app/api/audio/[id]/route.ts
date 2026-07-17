// ExamForge — Audio API Route
// Serves audio bytes from AudioExercise as a proper audio response

import { NextResponse, type NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const exercise = await prisma.audioExercise.findUnique({
    where: { id },
    select: { audioData: true, mimeType: true },
  });

  if (!exercise || !exercise.audioData) {
    return NextResponse.json({ error: "Audio not found" }, { status: 404 });
  }

  return new NextResponse(Buffer.from(exercise.audioData), {
    headers: {
      "Content-Type": exercise.mimeType,
      "Cache-Control": "public, max-age=86400",
    },
  });
}
