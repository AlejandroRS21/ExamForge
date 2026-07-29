// ExamForge — Audio API Route
// Serves audio bytes from AudioExercise as a proper audio response

import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const exercise = await prisma.audioExercise.findUnique({
    where: { id },
    select: { audioData: true, mimeType: true, downloadUrl: true },
  });

  if (!exercise) {
    return NextResponse.json({ error: "Audio not found" }, { status: 404 });
  }

  // Prefer downloadUrl over audioData if available, otherwise fall back to stored audio data
  if (exercise.downloadUrl) {
    return NextResponse.redirect(exercise.downloadUrl);
  } else if (exercise.audioData) {
    return new NextResponse(Buffer.from(exercise.audioData), {
      headers: {
        "Content-Type": exercise.mimeType,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } else {
    return NextResponse.json({ error: "Audio not found" }, { status: 404 });
  }
}
