"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { AnalysisPanel } from "@/components/analysis-panel";
import { ProgressStepper } from "@/components/progress-stepper";
import { SearchBar } from "@/components/search-bar";

function computeStep(
  toolsCalled: Set<string>,
  hasText: boolean,
  isLoading: boolean,
): number {
  if (hasText) return 4;
  if (toolsCalled.has("searchNews")) return 3;
  if (
    toolsCalled.has("getFinancialData") ||
    toolsCalled.has("getCompanyProfile")
  )
    return 2;
  if (toolsCalled.has("searchCompetitors")) return 1;
  if (isLoading) return 1;
  return 0;
}

export default function Home() {
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toolsCalled, setToolsCalled] = useState<Set<string>>(new Set());
  const abortRef = useRef<AbortController | null>(null);

  const currentStep = useMemo(
    () => computeStep(toolsCalled, text.length > 0, isLoading),
    [toolsCalled, text, isLoading],
  );

  const handleAnalyze = useCallback(async (brandName: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setText("");
    setError(null);
    setIsLoading(true);
    setToolsCalled(new Set());

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
      let buffer = "";

      // Parse SSE stream from toUIMessageStreamResponse()
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // SSE events are separated by double newlines
        let boundary = buffer.indexOf("\n\n");
        while (boundary !== -1) {
          const event = buffer.slice(0, boundary);
          buffer = buffer.slice(boundary + 2);

          // Extract JSON from "data: {...}" lines
          for (const line of event.split("\n")) {
            if (!line.startsWith("data: ")) continue;
            const payload = line.slice(6);
            if (payload === "[DONE]") break;

            try {
              const chunk = JSON.parse(payload) as {
                type: string;
                delta?: string;
                toolName?: string;
              };

              if (chunk.type === "text-delta" && chunk.delta) {
                setText((prev) => prev + chunk.delta);
              } else if (
                (chunk.type === "tool-input-start" ||
                  chunk.type === "tool-input-available") &&
                chunk.toolName
              ) {
                const toolName = chunk.toolName;
                setToolsCalled((prev) => {
                  const next = new Set(prev);
                  next.add(toolName);
                  return next;
                });
              }
            } catch {}
          }

          boundary = buffer.indexOf("\n\n");
        }
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
    setToolsCalled(new Set());
  }, []);

  const showStepper = isLoading || toolsCalled.size > 0;

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
          <p className="font-medium">Analysis failed</p>
          <p className="mt-1">{error}</p>
        </div>
      )}

      {showStepper && (
        <ProgressStepper
          currentStep={currentStep}
          isComplete={!isLoading && text.length > 0}
        />
      )}

      <div className="w-full">
        <AnalysisPanel text={text} isLoading={isLoading} />

        {text && !isLoading && (
          <div className="fade-up mt-8 text-center">
            <button
              type="button"
              onClick={handleReset}
              className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50"
            >
              New Analysis
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
