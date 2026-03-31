import { Badge } from "@/components/ui/badge";

interface NewsItem {
  headline: string;
  source: string;
  sentiment: "positive" | "negative" | "neutral";
  summary: string;
}

const sentimentStyles = {
  positive: "border-green-300 bg-green-50 text-green-700",
  negative: "border-red-300 bg-red-50 text-red-700",
  neutral: "border-slate-300 bg-slate-50 text-slate-600",
};

function parseNewsItems(content: string): NewsItem[] {
  const items: NewsItem[] = [];

  // Match lines that look like news items — various formats the AI may produce
  // Pattern: headline in quotes or bold, sentiment in brackets, source, summary
  const lines = content.split("\n").filter((l) => l.trim());

  let current: Partial<NewsItem> | null = null;

  for (const line of lines) {
    const trimmed = line.trim();

    // Try to match a headline line: starts with emoji, bullet, number, or bold
    const headlineMatch = trimmed.match(
      /^(?:[📰•\-*\d.]+\s*)?(?:\*\*)?[""]?(.+?)[""]?(?:\*\*)?\s*\[(\w+)\]\s*[-–—]\s*(.+)/u,
    );

    if (headlineMatch) {
      if (current?.headline) items.push(current as NewsItem);
      const sentiment = headlineMatch[2].toLowerCase();
      current = {
        headline: headlineMatch[1].trim(),
        sentiment:
          sentiment === "positive" || sentiment === "negative"
            ? sentiment
            : "neutral",
        source: headlineMatch[3].trim(),
        summary: "",
      };
      continue;
    }

    // Also try: **"Headline"** — Source \n Sentiment: Positive \n Summary
    const altHeadlineMatch = trimmed.match(
      /^(?:[📰•\-*\d.]+\s*)?(?:\*\*)?[""](.+?)[""](?:\*\*)?\s*[-–—]\s*(.+)/u,
    );
    if (altHeadlineMatch) {
      if (current?.headline) items.push(current as NewsItem);
      current = {
        headline: altHeadlineMatch[1].trim(),
        source: altHeadlineMatch[2].trim(),
        sentiment: "neutral",
        summary: "",
      };
      continue;
    }

    // Check for sentiment on its own line
    if (
      current &&
      /sentiment[:\s]*(positive|negative|neutral)/i.test(trimmed)
    ) {
      const m = trimmed.match(/sentiment[:\s]*(positive|negative|neutral)/i);
      if (m) {
        const s = m[1].toLowerCase();
        current.sentiment =
          s === "positive" || s === "negative" ? s : "neutral";
      }
      continue;
    }

    // Otherwise treat as summary text for the current item
    if (current && trimmed && !trimmed.startsWith("#")) {
      current.summary = current.summary
        ? `${current.summary} ${trimmed}`
        : trimmed;
    }
  }

  if (current?.headline) items.push(current as NewsItem);
  return items;
}

export function NewsFeed({ content }: { content: string }) {
  const items = parseNewsItems(content);

  if (items.length === 0) {
    // Fallback: render as plain text
    return (
      <div className="space-y-2 text-sm leading-relaxed text-slate-700 whitespace-pre-line">
        {content}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.headline}
          className="flex flex-col gap-1 rounded-lg border border-slate-100 bg-white p-4"
        >
          <div className="flex items-start gap-3">
            <span className="mt-0.5 shrink-0 text-base">📰</span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-slate-900">
                  {item.headline}
                </span>
                <Badge
                  className={`text-[10px] font-medium ${sentimentStyles[item.sentiment]}`}
                >
                  {item.sentiment.charAt(0).toUpperCase() +
                    item.sentiment.slice(1)}
                </Badge>
              </div>
              <p className="mt-0.5 text-xs text-slate-500">{item.source}</p>
              {item.summary && (
                <p className="mt-1 text-sm text-slate-600">{item.summary}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
