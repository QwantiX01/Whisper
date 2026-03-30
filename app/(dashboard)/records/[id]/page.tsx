import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ChatView } from "@/components/chat/ChatView";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type Message = { role: "user" | "assistant"; content: string };

export default async function RecordPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  const { id } = await params;

  const record = await prisma.record.findFirst({
    where: { id, userId: userId! },
  });

  if (!record) notFound();

  const chatHistory = (record.chatHistory as Message[]) ?? [];

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 shrink-0">
        <Button variant="ghost" size="icon" asChild className="h-8 w-8">
          <Link href="/records">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="font-semibold truncate">{record.title}</h1>
      </div>

      {/* Chat */}
      <div className="flex-1 min-h-0">
        <ChatView
          recordId={record.id}
          transcript={record.transcript}
          initialHistory={chatHistory}
          createdAt={record.createdAt.toISOString()}
        />
      </div>
    </div>
  );
}
