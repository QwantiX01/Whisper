import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { openai } from "@/lib/openai";
import { prisma } from "@/lib/prisma";
import { getRecordCount } from "@/lib/subscription";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    // Check file size (max 25MB — OpenAI limit)
    if (audioFile.size > 25 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Max 25MB." }, { status: 400 });
    }

    const { userId } = await auth();

    // Guest check: only 1 free record allowed
    if (!userId) {
      // We track free usage via a flag in the request header set by client
      const hasFreeRecord = formData.get("hasFreeRecord") === "true";
      if (hasFreeRecord) {
        return NextResponse.json(
          { error: "FREE_LIMIT_REACHED", message: "Sign in to record more" },
          { status: 403 }
        );
      }
    }

    // Auth user check: must have active subscription after 1st record
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { subscriptionStatus: true },
      });

      const recordCount = await getRecordCount(userId);

      if (recordCount >= 1 && user?.subscriptionStatus !== "active") {
        return NextResponse.json(
          { error: "SUBSCRIPTION_REQUIRED", message: "Subscribe to continue" },
          { status: 403 }
        );
      }
    }

    // Transcribe with Whisper
    const transcript = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      language: "uk", // Ukrainian by default, Whisper auto-detects anyway
    });

    // Generate a title from first few words
    const title = transcript.text.split(" ").slice(0, 6).join(" ") + "...";

    // Save to DB if authenticated
    let record = null;
    if (userId) {
      // Ensure user exists in DB (first time sign in)
      await prisma.user.upsert({
        where: { id: userId },
        create: { id: userId, email: "" }, // email gets updated via webhook
        update: {},
      });

      record = await prisma.record.create({
        data: {
          userId,
          transcript: transcript.text,
          title,
          chatHistory: [],
        },
      });
    }

    return NextResponse.json({
      transcript: transcript.text,
      title,
      recordId: record?.id ?? null,
    });
  } catch (error) {
    console.error("[TRANSCRIBE]", error);
    return NextResponse.json({ error: "Transcription failed" }, { status: 500 });
  }
}
