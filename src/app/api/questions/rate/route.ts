// ExamForge — Question Rating API Route
// Receives in-app user ratings (👍 / 👎) for quality evaluation

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { questionId, rating } = body;

    if (!questionId || !rating) {
      return NextResponse.json(
        { error: "questionId and rating are required" },
        { status: 400 }
      );
    }

    console.log(`[QuestionRating] Question ${questionId} rated: ${rating}`);

    // Feedback logged cleanly for analytics & content filtering
    return NextResponse.json({ success: true, questionId, rating });
  } catch (error) {
    console.error("[QuestionRating] API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
