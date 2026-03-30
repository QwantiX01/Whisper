import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// GET /api/records — list all records for current user
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const records = await prisma.record.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        transcript: true,
        createdAt: true,
        chatHistory: true,
      },
    });

    return NextResponse.json(records);
  } catch (error) {
    console.error("[RECORDS GET]", error);
    return NextResponse.json({ error: "Failed to fetch records" }, { status: 500 });
  }
}

// POST /api/records — create a record manually (fallback)
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { transcript, title } = body;

    if (!transcript) {
      return NextResponse.json({ error: "Transcript required" }, { status: 400 });
    }

    const record = await prisma.record.create({
      data: {
        userId,
        transcript,
        title: title ?? transcript.split(" ").slice(0, 6).join(" ") + "...",
        chatHistory: [],
      },
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error("[RECORDS POST]", error);
    return NextResponse.json({ error: "Failed to create record" }, { status: 500 });
  }
}
