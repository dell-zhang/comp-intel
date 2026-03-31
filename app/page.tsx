import { SearchBar } from "@/components/search-bar";

export default function Home() {
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

      <SearchBar />
    </div>
  );
}
