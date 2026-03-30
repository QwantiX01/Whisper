import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { MessageSquare, Mic, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NewRecordButton } from "./NewRecordButton";

export default async function RecordsPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const { userId } = await auth();
  const params = await searchParams;

  const records = await prisma.record.findMany({
    where: { userId: userId! },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      transcript: true,
      createdAt: true,
      chatHistory: true,
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Records</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-0.5">
            {records.length} {records.length === 1 ? "recording" : "recordings"}
          </p>
        </div>
        <NewRecordButton />
      </div>

      {params.success && (
        <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-600 dark:text-green-400">
          🎉 Subscription active! You now have unlimited recordings.
        </div>
      )}

      {/* Records list */}
      {records.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="h-16 w-16 rounded-2xl bg-[var(--muted)] flex items-center justify-center">
            <Mic className="h-8 w-8 text-[var(--muted-foreground)]" />
          </div>
          <div>
            <p className="font-semibold">No recordings yet</p>
            <p className="text-sm text-[var(--muted-foreground)]">Make your first recording to get started</p>
          </div>
          <NewRecordButton />
        </div>
      ) : (
        <div className="grid gap-3">
          {records.map((r) => {
            const chatCount = Array.isArray(r.chatHistory) ? r.chatHistory.length / 2 : 0;
            return (
              <Link
                key={r.id}
                href={`/records/${r.id}`}
                className="group flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 hover:border-[var(--primary)] transition-colors"
              >
                <div className="flex items-start gap-4 min-w-0">
                  <div className="h-10 w-10 shrink-0 rounded-lg bg-[var(--muted)] flex items-center justify-center">
                    <Mic className="h-5 w-5 text-[var(--muted-foreground)]" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{r.title}</p>
                    <p className="text-sm text-[var(--muted-foreground)] truncate mt-0.5">
                      {r.transcript.slice(0, 100)}...
                    </p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-xs text-[var(--muted-foreground)]">{formatDate(r.createdAt)}</span>
                      {chatCount > 0 && (
                        <span className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
                          <MessageSquare className="h-3 w-3" />
                          {chatCount} {chatCount === 1 ? "message" : "messages"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-[var(--muted-foreground)] shrink-0 group-hover:text-[var(--foreground)] transition-colors" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
