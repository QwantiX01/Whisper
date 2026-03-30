"use client";

import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Loader2, Mic, Zap } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react"; // Обов'язково додаємо Suspense

const FEATURES = [
  "Unlimited voice recordings",
  "OpenAI Whisper transcription",
  "GPT-4o chat for every record",
  "Persistent chat history",
  "All records saved to cloud",
  "Cancel anytime",
];

// --- 1. ОСНОВНИЙ КОМПОНЕНТ З ЛОГІКОЮ ---
function SubscribeContent() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const canceled = searchParams.get("canceled");

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        router.push(data.url);
      }
    } catch {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
      <div className="text-center space-y-3 mb-10">
        <div className="inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-medium">
          <Zap className="h-3 w-3" /> Unlock full access
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Simple, transparent pricing</h1>
        <p className="text-[var(--muted-foreground)]">You&rsquo;ve used your free record. Subscribe to continue.</p>
      </div>

      {canceled && (
        <div className="mb-6 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-600 dark:text-yellow-400">
          Checkout was canceled. No charges made.
        </div>
      )}

      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 h-12 w-12 rounded-xl bg-[var(--primary)] flex items-center justify-center">
            <Mic className="h-6 w-6 text-[var(--primary-foreground)]" />
          </div>
          <CardTitle className="text-2xl">Pro Plan</CardTitle>
          <CardDescription>
            <span className="text-3xl font-bold text-[var(--foreground)]">$9</span>
            <span className="text-[var(--muted-foreground)]">/month</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2.5">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2.5 text-sm">
                <div className="h-4 w-4 rounded-full bg-green-500/15 flex items-center justify-center shrink-0">
                  <Check className="h-2.5 w-2.5 text-green-500" />
                </div>
                {f}
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter>
          <Button onClick={handleCheckout} disabled={loading} className="w-full" size="lg">
            {loading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Redirecting...</>
            ) : (
              "Subscribe — $9/mo"
            )}
          </Button>
        </CardFooter>
      </Card>

      <p className="mt-4 text-xs text-[var(--muted-foreground)]">
        Secured by Stripe. Cancel anytime from your account.
      </p>
    </main>
  );
}

// --- 2. ЕКСПОРТ СТОРІНКИ З ОБГОРТКОЮ ---
export default function SubscribePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      {/* Обов'язково огортаємо в Suspense, щоб Next міг пропустити цей блок під час білду */}
      <Suspense fallback={
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--muted-foreground)]" />
        </div>
      }>
        <SubscribeContent />
      </Suspense>
    </div>
  );
}