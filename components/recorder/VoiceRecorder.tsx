"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@clerk/nextjs";
import { Check, Loader2, Mic, Square } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";

type State = "idle" | "recording" | "processing" | "done" | "error";

interface Props {
  onTranscript?: (text: string, recordId: string | null) => void;
}

export function VoiceRecorder({ onTranscript }: Props) {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [state, setState] = useState<State>("idle");
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState("");
  const [duration, setDuration] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleUpload = useCallback(async () => {
    const blob = new Blob(chunksRef.current, { type: "audio/webm" });
    const hasFreeRecord = localStorage.getItem("voicenote_free_used") === "true";

    // Guest second record → redirect to auth
    if (!isSignedIn && hasFreeRecord) {
      setState("idle");
      router.push("/sign-up");
      return;
    }

    const formData = new FormData();
    formData.append("audio", blob, "recording.webm");
    formData.append("hasFreeRecord", hasFreeRecord.toString());

    try {
      const res = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === "FREE_LIMIT_REACHED" || data.error === "SUBSCRIPTION_REQUIRED") {
          router.push(isSignedIn ? "/subscribe" : "/sign-up");
          return;
        }
        throw new Error(data.error ?? "Transcription failed");
      }

      setTranscript(data.transcript);
      setState("done");

      // Mark free record used for guests
      if (!isSignedIn) {
        localStorage.setItem("voicenote_free_used", "true");
      }

      onTranscript?.(data.transcript, data.recordId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
      setState("error");
    }
  }, [isSignedIn, onTranscript, router]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      setDuration(0);
      setError("");

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        await handleUpload();
      };

      mediaRecorder.start(100);
      setState("recording");

      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    } catch {
      setError("Microphone access denied");
      setState("error");
    }
  }, [handleUpload]);

  const stopRecording = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    mediaRecorderRef.current?.stop();
    setState("processing");
  }, []);

  const reset = () => {
    setState("idle");
    setTranscript("");
    setError("");
    setDuration(0);
  };

  const formatDuration = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Record Button */}
      <div className="relative flex items-center justify-center">
        {state === "recording" && (
          <div className="recording-pulse absolute inset-0 rounded-full bg-red-500/20" />
        )}
        <button
          onClick={state === "recording" ? stopRecording : state === "idle" || state === "error" ? startRecording : undefined}
          disabled={state === "processing"}
          className={cn(
            "relative z-10 flex h-24 w-24 items-center justify-center rounded-full transition-all duration-200 shadow-lg",
            state === "idle" && "bg-[var(--primary)] text-[var(--primary-foreground)] hover:scale-105",
            state === "recording" && "bg-red-500 text-white hover:bg-red-600 hover:scale-105",
            state === "processing" && "bg-[var(--muted)] text-[var(--muted-foreground)] cursor-not-allowed",
            state === "done" && "bg-green-500 text-white",
            state === "error" && "bg-[var(--destructive)] text-white hover:scale-105"
          )}
        >
          {state === "processing" ? (
            <Loader2 className="h-8 w-8 animate-spin" />
          ) : state === "recording" ? (
            <Square className="h-8 w-8" />
          ) : state === "done" ? (
            <Check className="h-8 w-8" />
          ) : (
            <Mic className="h-8 w-8" />
          )}
        </button>
      </div>

      {/* Status */}
      <div className="text-center">
        {state === "idle" && (
          <p className="text-[var(--muted-foreground)] text-sm">Tap to start recording</p>
        )}
        {state === "recording" && (
          <div className="flex flex-col items-center gap-1">
            <p className="text-red-500 font-semibold text-sm">Recording...</p>
            <p className="text-[var(--muted-foreground)] font-mono text-2xl">{formatDuration(duration)}</p>
          </div>
        )}
        {state === "processing" && (
          <p className="text-[var(--muted-foreground)] text-sm">Transcribing with Whisper...</p>
        )}
        {state === "error" && (
          <p className="text-[var(--destructive)] text-sm">{error}</p>
        )}
      </div>

      {/* Transcript Result */}
      {state === "done" && transcript && (
        <div className="w-full max-w-lg rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Transcript</p>
          <p className="text-sm leading-relaxed">{transcript}</p>
          <Button variant="outline" size="sm" onClick={reset} className="w-full">
            Record Another
          </Button>
        </div>
      )}
    </div>
  );
}
