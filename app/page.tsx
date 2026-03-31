"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { ChevronDown, Info } from "lucide-react";
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
  const [howOpen, setHowOpen] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const resultsRef = useRef<HTMLDivElement | null>(null);

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

    // Scroll to the results area after a short delay so the stepper is visible
    requestAnimationFrame(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });

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
    window.scrollTo({ top: 0, behavior: "smooth" });
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

      {/* How it works */}
      <div className="w-full max-w-2xl">
        <button
          type="button"
          onClick={() => setHowOpen((o) => !o)}
          className="mx-auto flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-700"
        >
          <Info className="size-3.5" />
          How it works
          <ChevronDown
            className={`size-3.5 transition-transform ${howOpen ? "rotate-180" : ""}`}
          />
        </button>
        {howOpen && (
          <div className="fade-up mt-3 rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
            <p className="mb-3 font-medium text-slate-900">
              CompIntel uses an AI agent that autonomously researches your brand:
            </p>
            <ol className="space-y-1.5 pl-5 list-decimal marker:text-indigo-500">
              <li>
                <span className="font-medium text-slate-700">Discovers</span>{" "}
                competitors via web search
              </li>
              <li>
                <span className="font-medium text-slate-700">Gathers</span>{" "}
                financial data and company profiles from multiple APIs
              </li>
              <li>
                <span className="font-medium text-slate-700">Analyzes</span>{" "}
                recent news and sentiment
              </li>
              <li>
                <span className="font-medium text-slate-700">Generates</span>{" "}
                a structured intelligence report, streamed in real time
              </li>
            </ol>
            <p className="mt-3 text-xs text-slate-400">
              Powered by Claude AI with tool use — no pre-built templates, every
              analysis is researched from scratch.
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="fade-up w-full max-w-2xl rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p className="font-medium">Analysis failed</p>
          <p className="mt-1">{error}</p>
          <p className="mt-2 text-xs text-red-500">
            Try a well-known brand name, or check your connection and try again.
          </p>
        </div>
      )}

      <div ref={resultsRef}>
        {showStepper && (
          <ProgressStepper
            currentStep={currentStep}
            isComplete={!isLoading && text.length > 0}
          />
        )}
      </div>

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
