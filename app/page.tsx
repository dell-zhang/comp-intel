"use client";

import { useCallback, useRef, useState } from "react";
import { AnalysisPanel } from "@/components/analysis-panel";
import { SearchBar } from "@/components/search-bar";

export default function Home() {
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const handleAnalyze = useCallback(async (brandName: string) => {
    // Abort any in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setText("");
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandName }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? `Request failed (${res.status})`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setText((prev) => prev + chunk);
      }
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleReset = useCallback(() => {
    abortRef.current?.abort();
    setText("");
    setError(null);
    setIsLoading(false);
  }, []);

  return (
    <div className="flex flex-col items-center gap-8 pt-12 pb-20">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          Competitive Intelligence, Instantly
        </h2>
        <p className="mt-3 text-lg text-slate-600">
          Enter a brand name to generate a full competitive analysis — powered
          by AI agents that research, analyze, and report in real time.
        </p>
      </div>

      <SearchBar onAnalyze={handleAnalyze} isLoading={isLoading} />

      {error && (
        <div className="w-full max-w-2xl rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="w-full">
        <AnalysisPanel text={text} isLoading={isLoading} />

        {text && !isLoading && (
          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={handleReset}
              className="rounded-lg border border-slate-200 bg-white px-5 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
            >
              New Analysis
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
