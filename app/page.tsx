import { Navbar } from "@/components/Navbar";
import { VoiceRecorder } from "@/components/recorder/VoiceRecorder";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Check, Cpu, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const stats = [
    { label: "Daily ideas captured", value: "12k+" },
    { label: "Avg. transcription time", value: "4.2s" },
    { label: "Teams building on Whisper", value: "380" },
  ];

  const highlights = [
    {
      title: "Studio-grade capture",
      description: "Lossless WebM recording with automatic gain control for crisp analysis.",
      icon: Sparkles,
    },
    {
      title: "Neural insight",
      description: "GPT-4o combs through every word for action items, tone, and context.",
      icon: Cpu,
    },
    {
      title: "Privacy-first cloud",
      description: "Zero-config encryption plus region-aware storage keeps your voice safe.",
      icon: ShieldCheck,
    },
  ];

  const steps = [
    {
      title: "Capture",
      detail: "Record directly in the browser with macOS-grade haptics and smooth feedback.",
    },
    {
      title: "Transcribe",
      detail: "Whisper shards the audio, streams partial transcripts, and finalizes in seconds.",
    },
    {
      title: "Chat",
      detail: "Ask the built-in GPT workspace to summarize, plan, or coach you forward.",
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_#eef2ff,_#fdfdff_55%,_#f7f7f7_90%)] dark:bg-[radial-gradient(circle_at_top,_#07090f,_#05060a_60%,_#030306)]">
      <div className="pointer-events-none absolute inset-0 opacity-70 blur-3xl">
        <div className="absolute -right-24 top-0 h-72 w-72 rounded-full bg-[#d0dbff] dark:bg-[#1c2440]" />
        <div className="absolute bottom-0 left-10 h-80 w-80 rounded-full bg-[#e4fff2] dark:bg-[#173226]" />
      </div>

      <Navbar />

      <main className="relative z-10 flex-1 px-4 py-16 sm:px-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-16">
          <section className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-1 text-xs font-medium text-black/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] dark:border-white/10 dark:text-white/70">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                macOS 26 inspired · 1 free capture
              </div>
              <div>
                <h1 className="text-4xl font-semibold tracking-tight text-[#0b0b0f] sm:text-5xl lg:text-6xl dark:text-white">
                  Whisper is your voice notebook with a macOS 26 finish.
                </h1>
                <p className="mt-4 text-lg text-black/70 dark:text-white/70">
                  Capture a thought, transcribe it instantly, and keep riffing with GPT-4o. It feels like
                  the native Voice Memo app grew a neural co-pilot.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                <Button size="lg" className="min-w-[160px] shadow-[0_10px_30px_rgba(15,23,42,0.18)]">
                  Start recording now
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="#tour" className="inline-flex items-center gap-2">
                    Take the tour
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <dl className="grid gap-6 sm:grid-cols-3">
                {stats.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/70 bg-white/70 p-4 text-left shadow-[0_15px_45px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5">
                    <dt className="text-xs uppercase tracking-wide text-black/60 dark:text-white/60">{item.label}</dt>
                    <dd className="text-2xl font-semibold text-[#0b0b0f] dark:text-white">{item.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="relative flex items-center justify-center">
              <div className="w-full max-w-md rounded-[32px] border border-white/60 bg-white/80 p-6 shadow-[0_25px_80px_rgba(15,23,42,0.18)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
                <div className="mb-5 flex items-center justify-between text-xs text-black/60 dark:text-white/60">
                  <span>Live capture</span>
                  <span>Adaptive gain</span>
                </div>
                <VoiceRecorder />
              </div>
              <div className="absolute -right-6 top-6 hidden w-52 rounded-2xl border border-white/70 bg-white/90 p-4 text-left shadow-lg backdrop-blur lg:block dark:border-white/10 dark:bg-white/10">
                <p className="text-sm font-semibold text-[#0b0b0f] dark:text-white">Smart summary</p>
                <p className="mt-2 text-xs text-black/70 dark:text-white/70">
                  &ldquo;Clarify roadmap for launch week, mention blockers in standup.&rdquo;
                </p>
              </div>
            </div>
          </section>

          <section id="tour" className="space-y-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-black/50 dark:text-white/50">Why teams switch</p>
                <h2 className="mt-2 text-2xl font-semibold text-[#0b0b0f] dark:text-white">Designed like your favorite desktop OS</h2>
              </div>
              <div className="hidden text-sm text-black/60 dark:text-white/60 sm:block">
                Seamless transitions, tactile feedback, delightful glassmorphism
              </div>
            </div>
            <div className="grid gap-6 rounded-[36px] border border-white/70 bg-white/70 p-8 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:grid-cols-3 dark:border-white/10 dark:bg-white/5">
              {highlights.map(({ title, description, icon: Icon }) => (
                <div key={title} className="flex flex-col gap-3">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-black/5 text-black dark:bg-white/10 dark:text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-[#0b0b0f] dark:text-white">{title}</p>
                    <p className="text-sm text-black/70 dark:text-white/70">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-8 lg:grid-cols-[0.45fr_0.55fr]">
            <div className="rounded-[28px] border border-white/60 bg-white/80 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
              <p className="text-xs uppercase tracking-[0.3em] text-black/50 dark:text-white/50">Flow</p>
              <h3 className="mt-3 text-2xl font-semibold text-[#0b0b0f] dark:text-white">Three steps, infinite clarity</h3>
              <div className="mt-8 space-y-6">
                {steps.map((step, idx) => (
                  <div key={step.title} className="relative pl-8">
                    <span className="absolute left-0 top-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/90 text-xs font-semibold text-white dark:bg-white/90 dark:text-black">
                      {idx + 1}
                    </span>
                    <p className="text-lg font-semibold text-[#0b0b0f] dark:text-white">{step.title}</p>
                    <p className="text-sm text-black/70 dark:text-white/70">{step.detail}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[28px] border border-white/70 bg-gradient-to-br from-white/90 via-white/70 to-white/50 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.18)] backdrop-blur-2xl dark:border-white/10 dark:from-white/10 dark:via-white/5 dark:to-transparent">
              <div className="mb-6 flex items-center justify-between text-sm text-black/60 dark:text-white/70">
                <span>Ambient notebook</span>
                <span>Cloud sync · end-to-end</span>
              </div>
              <div className="space-y-4">
                {["Idea inbox", "Coaching thread", "Focus ritual"].map((label) => (
                  <div key={label} className="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/10">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-2xl bg-black/90 text-white dark:bg-white/90 dark:text-black" />
                      <div>
                        <p className="text-sm font-semibold text-[#0b0b0f] dark:text-white">{label}</p>
                        <p className="text-xs text-black/60 dark:text-white/70">Auto-sorted by GPT according to intent.</p>
                      </div>
                      <Check className="ml-auto h-4 w-4 text-emerald-500" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
