interface SwotData {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

const quadrants = [
  {
    key: "strengths" as const,
    label: "Strengths",
    icon: "✅",
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-700",
    heading: "text-green-800",
  },
  {
    key: "weaknesses" as const,
    label: "Weaknesses",
    icon: "⚠️",
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    heading: "text-amber-800",
  },
  {
    key: "opportunities" as const,
    label: "Opportunities",
    icon: "🚀",
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
    heading: "text-blue-800",
  },
  {
    key: "threats" as const,
    label: "Threats",
    icon: "🔴",
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
    heading: "text-red-800",
  },
] as const;

export function SwotGrid({ data }: { data: SwotData }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {quadrants.map((q) => (
        <div
          key={q.key}
          className={`rounded-xl border ${q.border} ${q.bg} p-5`}
        >
          <h4 className={`mb-3 font-semibold ${q.heading}`}>
            {q.icon} {q.label}
          </h4>
          <ul className={`space-y-1.5 text-sm ${q.text}`}>
            {(data[q.key] ?? []).map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-1 shrink-0">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
