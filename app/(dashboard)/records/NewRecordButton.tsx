"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mic, Square, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NewRecordButton() {
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const router = useRouter();

  const mediaRecorderRef = { current: null as MediaRecorder | null };
  const chunksRef = { current: [] as Blob[] };

  const start = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
    mediaRecorderRef.current = mr;
    chunksRef.current = [];

    mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    mr.onstop = async () => {
      stream.getTracks().forEach((t) => t.stop());
      setProcessing(true);

      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      const formData = new FormData();
      formData.append("audio", blob, "recording.webm");
      formData.append("hasFreeRecord", "false");

      const res = await fetch("/api/transcribe", { method: "POST", body: formData });
      const data = await res.json();
      setProcessing(false);

      if (res.ok && data.recordId) {
        router.push(`/records/${data.recordId}`);
        router.refresh();
      }
    };

    mr.start(100);
    setRecording(true);
  };

  const stop = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  if (processing) {
    return (
      <Button disabled size="sm">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Transcribing...
      </Button>
    );
  }

  return (
    <Button onClick={recording ? stop : start} variant={recording ? "destructive" : "default"} size="sm">
      {recording ? (
        <><Square className="mr-2 h-4 w-4" /> Stop</>
      ) : (
        <><Mic className="mr-2 h-4 w-4" /> New Record</>
      )}
    </Button>
  );
}
