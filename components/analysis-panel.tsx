"use client";

import { useMemo } from "react";
import { CompetitorCard } from "@/components/competitor-card";
import { MarketChart } from "@/components/market-chart";
import { NewsFeed } from "@/components/news-feed";
import { SwotGrid } from "@/components/swot-grid";
import { Skeleton } from "@/components/ui/skeleton";

interface Section {
  heading: string;
  key: string;
  content: string;
}

const SECTION_ORDER = [
  "landscape",
  "competitors",
  "market",
  "swot",
  "news",
  "insights",
] as const;

type SectionKey = (typeof SECTION_ORDER)[number];

function classifyHeading(heading: string): SectionKey | null {
  const h = heading.toLowerCase();
  if (h.includes("landscape") || h.includes("overview")) return "landscape";
  if (h.includes("competitor") && h.includes("profil")) return "competitors";
  if (h.includes("market share")) return "market";
  if (h.includes("swot")) return "swot";
  if (h.includes("news") || h.includes("development")) return "news";
  if (h.includes("insight") || h.includes("recommend") || h.includes("strateg"))
    return "insights";
  return null;
}

function parseSections(text: string): Section[] {
  const sections: Section[] = [];
  const headingRegex = /^## (.+)$/gm;
  const matches: { heading: string; index: number; endIndex: number }[] = [];

  for (const match of text.matchAll(headingRegex)) {
    matches.push({
      heading: match[1],
      index: match.index,
      endIndex: match.index + match[0].length,
    });
  }

  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].endIndex;
    const end = i + 1 < matches.length ? matches[i + 1].index : text.length;
    const key = classifyHeading(matches[i].heading) ?? matches[i].heading;
    sections.push({
      heading: matches[i].heading.trim(),
      key,
      content: text.slice(start, end).trim(),
    });
  }

  return sections;
}

function extractJson(text: string): unknown | null {
  const match = text.match(/```json\s*\n([\s\S]*?)```/);
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
}

function parseCompetitorBlocks(content: string) {
  // Split by ### headings
  const blocks: { name: string; content: string }[] = [];
  const parts = content.split(/^### /m);

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    const nlIndex = trimmed.indexOf("\n");
    if (nlIndex === -1) {
      blocks.push({ name: trimmed, content: "" });
    } else {
      blocks.push({
        name: trimmed.slice(0, nlIndex).trim(),
        content: trimmed.slice(nlIndex + 1).trim(),
      });
    }
  }

  // If no ### headings found, try splitting by bold **Name** pattern
  if (blocks.length === 0) {
    const boldParts = content.split(/(?=^\*\*[^*]+\*\*)/m);
    for (const part of boldParts) {
      const trimmed = part.trim();
      if (!trimmed) continue;
      const nameMatch = trimmed.match(/^\*\*([^*]+)\*\*/);
      if (nameMatch) {
        blocks.push({
          name: nameMatch[1],
          content: trimmed.slice(nameMatch[0].length).trim(),
        });
      }
    }
  }

  // Fallback: try numbered list (1. **Name** ...)
  if (blocks.length === 0) {
    const numberedParts = content.split(/(?=^\d+\.\s)/m);
    for (const part of numberedParts) {
      const trimmed = part.trim();
      if (!trimmed) continue;
      const nameMatch = trimmed.match(
        /^\d+\.\s+\*?\*?([^*\n]+?)\*?\*?\s*[-–—:]/,
      );
      if (nameMatch) {
        blocks.push({
          name: nameMatch[1].trim(),
          content: trimmed.slice(nameMatch[0].length).trim(),
        });
      }
    }
  }

  return blocks;
}

const SECTION_LABELS: Record<SectionKey, string> = {
  landscape: "Competitive Landscape Overview",
  competitors: "Competitor Profiles",
  market: "Market Share Analysis",
  swot: "SWOT Analysis",
  news: "Recent News & Developments",
  insights: "Strategic Insights & Recommendations",
};

function SectionSkeleton({ label }: { label: string }) {
  return (
    <div className="fade-up rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-slate-400">{label}</h3>
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
    </div>
  );
}

function ProseSection({
  heading,
  content,
}: {
  heading: string;
  content: string;
}) {
  return (
    <div className="fade-up rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="mb-3 text-lg font-semibold text-slate-900">{heading}</h3>
      <div className="text-sm leading-relaxed text-slate-700 whitespace-pre-line">
        {content}
      </div>
    </div>
  );
}

function renderSection(section: Section) {
  switch (section.key) {
    case "landscape":
      return (
        <ProseSection heading={section.heading} content={section.content} />
      );

    case "competitors": {
      const blocks = parseCompetitorBlocks(section.content);
      if (blocks.length === 0) {
        return (
          <ProseSection heading={section.heading} content={section.content} />
        );
      }
      return (
        <div className="fade-up space-y-3">
          <h3 className="text-lg font-semibold text-slate-900">
            {section.heading}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {blocks.map((b) => (
              <CompetitorCard key={b.name} name={b.name} content={b.content} />
            ))}
          </div>
        </div>
      );
    }

    case "market": {
      const json = extractJson(section.content) as {
        data: { name: string; share: number }[];
      } | null;
      if (!json?.data) {
        return (
          <ProseSection heading={section.heading} content={section.content} />
        );
      }
      return (
        <div className="fade-up rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">
            {section.heading}
          </h3>
          <MarketChart data={json.data} />
        </div>
      );
    }

    case "swot": {
      const json = extractJson(section.content) as {
        strengths: string[];
        weaknesses: string[];
        opportunities: string[];
        threats: string[];
      } | null;
      if (!json?.strengths) {
        return (
          <ProseSection heading={section.heading} content={section.content} />
        );
      }
      return (
        <div className="fade-up space-y-3">
          <h3 className="text-lg font-semibold text-slate-900">
            {section.heading}
          </h3>
          <SwotGrid data={json} />
        </div>
      );
    }

    case "news":
      return (
        <div className="fade-up space-y-3">
          <h3 className="text-lg font-semibold text-slate-900">
            {section.heading}
          </h3>
          <NewsFeed content={section.content} />
        </div>
      );

    case "insights":
      return (
        <ProseSection heading={section.heading} content={section.content} />
      );

    default:
      return (
        <ProseSection heading={section.heading} content={section.content} />
      );
  }
}

export function AnalysisPanel({
  text,
  isLoading,
}: {
  text: string;
  isLoading: boolean;
}) {
  const sections = useMemo(() => parseSections(text), [text]);

  const renderedKeys = new Set(sections.map((s) => s.key));

  if (!text && !isLoading) return null;

  return (
    <div className="mt-10 space-y-6">
      {sections.map((section) => (
        <div key={section.key}>{renderSection(section)}</div>
      ))}

      {isLoading &&
        SECTION_ORDER.filter((key) => !renderedKeys.has(key)).map((key) => (
          <SectionSkeleton key={key} label={SECTION_LABELS[key]} />
        ))}
    </div>
  );
}
