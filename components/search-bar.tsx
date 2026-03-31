"use client";

import { useState } from "react";
import { Search, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const examples = ["Coca-Cola", "Tesla", "Nike", "Apple", "Samsung"];

export function SearchBar() {
  const [query, setQuery] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    // TODO: Wire to /api/analyze in Step 3
  }

  return (
    <div className="w-full max-w-2xl">
      <form onSubmit={handleSubmit} className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter a brand name..."
          className="h-14 w-full rounded-xl border border-slate-200 bg-white pr-36 pl-12 text-lg shadow-sm outline-none transition-shadow placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
        />
        <Button
          type="submit"
          disabled={!query.trim()}
          className="absolute top-1/2 right-2 -translate-y-1/2 gap-2 rounded-lg bg-indigo-600 px-5 text-white hover:bg-indigo-700 disabled:opacity-40"
        >
          Analyze
          <ArrowRight className="size-4" />
        </Button>
      </form>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <span className="text-sm text-slate-500">Try:</span>
        {examples.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => setQuery(name)}
            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700 shadow-sm transition-colors hover:border-indigo-300 hover:bg-indigo-50"
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  );
}
