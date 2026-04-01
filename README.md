# CompIntel

AI-powered competitive intelligence in seconds. Enter a brand name and receive a streamed, multi-section competitive analysis — powered by an AI agent that autonomously researches, analyzes, and reports in real time.

**Live demo:** Deployed on [Vercel](https://vercel.com)

## How it works

CompIntel uses Claude (via the Vercel AI SDK) as an autonomous agent with tool use. When you enter a brand name, the agent:

1. **Discovers** competitors via web search (Tavily)
2. **Gathers** financial data (Alpha Vantage) and company profiles (Tavily)
3. **Analyzes** recent news and sentiment (NewsAPI)
4. **Generates** a structured intelligence report, streamed in real time

The report includes a competitive landscape overview, competitor profile cards, a market share chart, SWOT analysis grid, news feed with sentiment badges, and strategic recommendations.

## Tech stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| AI | Vercel AI SDK + Claude Sonnet |
| Charts | Recharts |
| Data: Web search | Tavily API |
| Data: Financials | Alpha Vantage API |
| Data: News | NewsAPI.org |
| Hosting | Vercel |

## Running locally

1. Clone the repository:

```bash
git clone https://github.com/dell-zhang/comp-intel.git
cd comp-intel
```

2. Install dependencies:

```bash
pnpm install
```

3. Create a `.env.local` file with your API keys:

```
ANTHROPIC_API_KEY=sk-ant-...
TAVILY_API_KEY=tvly-...
ALPHA_VANTAGE_API_KEY=...
NEWS_API_KEY=...
```

4. Start the development server:

```bash
pnpm dev
```

The app will be running at [localhost:3000](http://localhost:3000).

## Acknowledgements

Built by **Dell Zhang** with the help of [Claude Code](https://claude.ai/claude-code). Bootstrapped from the [Vercel AI Chatbot](https://github.com/vercel/chatbot) template.
