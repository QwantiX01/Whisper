"use client";

import { Bot, Loader2, Send, Trash2, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn, formatDate } from "../../lib/utils";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

type Message = { role: "user" | "assistant"; content: string };

interface Props {
  recordId: string;
  transcript: string;
  initialHistory: Message[];
  createdAt: string;
}

export function ChatView({ recordId, transcript, initialHistory, createdAt }: Props) {
  const [messages, setMessages] = useState<Message[]>(initialHistory);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`/api/records/${recordId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessages((prev) => [...prev, { role: "assistant", content: data.message }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong. Try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = async () => {
    if (!confirm("Clear chat history?")) return;
    await fetch(`/api/records/${recordId}/chat`, { method: "DELETE" });
    setMessages([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Transcript panel */}
      <div className="shrink-0 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Voice Note</p>
          <p className="text-xs text-[var(--muted-foreground)]">{formatDate(createdAt)}</p>
        </div>
        <p className="text-sm leading-relaxed line-clamp-4">{transcript}</p>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4 min-h-[200px]">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center py-8">
            <div className="h-12 w-12 rounded-full bg-[var(--muted)] flex items-center justify-center">
              <Bot className="h-6 w-6 text-[var(--muted-foreground)]" />
            </div>
            <p className="text-sm text-[var(--muted-foreground)]">Ask anything about your voice note</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {["Summarize this", "Key action items", "What are the main ideas?"].map((s) => (
                <button
                  key={s}
                  onClick={() => setInput(s)}
                  className="text-xs px-3 py-1.5 rounded-full border border-[var(--border)] hover:bg-[var(--accent)] transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              className={cn("flex gap-3", msg.role === "user" ? "flex-row-reverse" : "flex-row")}
            >
              <div className={cn(
                "h-7 w-7 shrink-0 rounded-full flex items-center justify-center text-xs",
                msg.role === "user"
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "bg-[var(--muted)] text-[var(--muted-foreground)]"
              )}>
                {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>
              <div className={cn(
                "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                msg.role === "user"
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)] rounded-tr-sm"
                  : "bg-[var(--card)] border border-[var(--border)] rounded-tl-sm"
              )}>
                {msg.content}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex gap-3">
            <div className="h-7 w-7 shrink-0 rounded-full bg-[var(--muted)] flex items-center justify-center">
              <Bot className="h-4 w-4 text-[var(--muted-foreground)]" />
            </div>
            <div className="rounded-2xl rounded-tl-sm bg-[var(--card)] border border-[var(--border)] px-4 py-2.5">
              <Loader2 className="h-4 w-4 animate-spin text-[var(--muted-foreground)]" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 space-y-2">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your note... (Enter to send)"
            rows={2}
            className="flex-1"
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            size="icon"
            className="self-end h-[68px] w-10"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearHistory}
            className="flex items-center gap-1 text-xs text-[var(--muted-foreground)] hover:text-[var(--destructive)] transition-colors"
          >
            <Trash2 className="h-3 w-3" /> Clear history
          </button>
        )}
      </div>
    </div>
  );
}
