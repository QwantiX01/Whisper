import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { openai } from "@/lib/openai";
import { prisma } from "@/lib/prisma";

export const maxDuration = 60;

type Message = { role: "user" | "assistant" | "system"; content: string };

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { message } = await req.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    // Fetch record and verify ownership
    const record = await prisma.record.findFirst({
      where: { id, userId },
    });

    if (!record) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    const existingHistory = (record.chatHistory as Message[]) ?? [];

    const systemPrompt = `You are a helpful assistant. The user recorded the following voice note:

---
${record.transcript}
---

Help them think through, summarize, expand, or answer questions about this content. Be concise and helpful.`;

    const messages: Message[] = [
      { role: "system", content: systemPrompt },
      ...existingHistory,
      { role: "user", content: message },
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      max_tokens: 1000,
    });

    const assistantMessage = completion.choices[0].message.content ?? "";

    // Update chat history in DB
    const updatedHistory: Message[] = [
      ...existingHistory,
      { role: "user", content: message },
      { role: "assistant", content: assistantMessage },
    ];

    await prisma.record.update({
      where: { id },
      data: { chatHistory: updatedHistory },
    });

    return NextResponse.json({ message: assistantMessage });
  } catch (error) {
    console.error("[CHAT]", error);
    return NextResponse.json({ error: "Chat failed" }, { status: 500 });
  }
}

// DELETE — clear chat history
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    await prisma.record.updateMany({
      where: { id, userId },
      data: { chatHistory: [] },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[CHAT DELETE]", error);
    return NextResponse.json({ error: "Failed to clear history" }, { status: 500 });
  }
}
