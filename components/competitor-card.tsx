import { Badge } from "@/components/ui/badge";

interface CompetitorCardProps {
  name: string;
  content: string;
}

function extractMetrics(text: string) {
  const metrics: { label: string; value: string }[] = [];

  const mcMatch = text.match(
    /market\s*cap[^:]*:\s*\$?([\d.,]+\s*(?:billion|trillion|million|[BMT]))/i,
  );
  if (mcMatch) metrics.push({ label: "Market Cap", value: `$${mcMatch[1]}` });

  const revMatch = text.match(
    /revenue[^:]*:\s*\$?([\d.,]+\s*(?:billion|trillion|million|[BMT]))/i,
  );
  if (revMatch) metrics.push({ label: "Revenue", value: `$${revMatch[1]}` });

  const empMatch = text.match(/employees?[^:]*:\s*~?([\d,]+(?:\+)?)/i);
  if (empMatch) metrics.push({ label: "Employees", value: empMatch[1] });

  return metrics;
}

export function CompetitorCard({ name, content }: CompetitorCardProps) {
  const metrics = extractMetrics(content);

  // Remove the name line from content if it starts with it
  const description = content.replace(/^\*\*[^*]+\*\*[:\s-]*/m, "").trim();

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <h4 className="text-lg font-semibold text-slate-900">{name}</h4>
      {metrics.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {metrics.map((m) => (
            <Badge
              key={m.label}
              variant="outline"
              className="text-xs text-slate-600"
            >
              {m.label}: {m.value}
            </Badge>
          ))}
        </div>
      )}
      <p className="mt-3 text-sm leading-relaxed text-slate-600 whitespace-pre-line">
        {description}
      </p>
    </div>
  );
}
