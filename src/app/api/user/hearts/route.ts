import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateHeartRegen } from "@/lib/gamification/hearts";

export async function GET(_request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { hearts: true, maxHearts: true, lastHeartRegen: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const currentHearts = user.hearts ?? 5;
    const maxHearts = user.maxHearts ?? 5;

    const { hearts, nextRegenInSeconds } = calculateHeartRegen(
      user.lastHeartRegen,
      maxHearts,
      currentHearts
    );

    // If hearts regened passively, persist update
    if (hearts > currentHearts) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { hearts, lastHeartRegen: new Date() },
      });
    }

    return NextResponse.json({
      hearts,
      maxHearts,
      nextRegenInSeconds,
    });
  } catch (error) {
    console.error("[hearts GET] Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

export async function POST(_request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { hearts: true, maxHearts: true, lastHeartRegen: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const currentHearts = user.hearts ?? 5;
    const maxHearts = user.maxHearts ?? 5;

    // Calculate current regened state first
    const { hearts } = calculateHeartRegen(
      user.lastHeartRegen,
      maxHearts,
      currentHearts
    );

    if (hearts <= 0) {
      return NextResponse.json(
        { error: "No hearts remaining" },
        { status: 400 }
      );
    }

    const updatedHearts = hearts - 1;
    // Set lastHeartRegen to now if transitioning from maxHearts or if null
    const newLastHeartRegen =
      hearts === maxHearts || !user.lastHeartRegen
        ? new Date()
        : user.lastHeartRegen;

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        hearts: updatedHearts,
        lastHeartRegen: newLastHeartRegen,
      },
    });

    const { nextRegenInSeconds } = calculateHeartRegen(
      updatedUser.lastHeartRegen,
      maxHearts,
      updatedUser.hearts
    );

    return NextResponse.json({
      hearts: updatedUser.hearts,
      maxHearts,
      nextRegenInSeconds,
    });
  } catch (error) {
    console.error("[hearts POST] Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
