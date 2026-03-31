# CompIntel — AI-Powered Competitive Intelligence Demo

## Project overview

A Next.js web app that lets users enter a brand name and receive a streamed,
multi-section competitive analysis. The app uses Claude Sonnet with tool use
to autonomously discover competitors, gather financial/news data from multiple
APIs, and produce a structured intelligence report — all streamed in real time.

**Purpose**: Portfolio demo to showcase AI/business skills to investors and employers.
Must look polished and professional — not like a hackathon prototype.

**Starting point**: Cloned from the Vercel AI Chatbot template (github.com/vercel/chatbot).
We are transforming the generic chat UI into a purpose-built CI dashboard.

---

## Tech stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Framework | Next.js 14+ (App Router) | From Vercel chatbot template |
| Language | TypeScript | Strict mode |
| Styling | Tailwind CSS + shadcn/ui | Business/professional aesthetic |
| AI SDK | Vercel AI SDK (`ai` + `@ai-sdk/anthropic`) | For streaming + tool use |
| Runtime model | Claude Sonnet 4.6 (`claude-sonnet-4-6`) | Fast streaming, good tool use |
| Charts | Recharts | For market share visualisations |
| Data: Web search | Tavily API | Competitor discovery + company profiles |
| Data: Financials | Alpha Vantage API | Company overview, market cap, revenue |
| Data: News | NewsAPI.org | Recent headlines with source info |
| Hosting | Vercel | Auto-deploy from GitHub main branch |

---

## Design references — what we're mimicking

### Commercial CI platforms (study for UI patterns)

1. **Crayon** (crayon.co)
   - Intel feed with AI importance scoring and sentiment
   - Competitor cards showing changes over time
   - Polished dashboards with trend visualisations
   - Clean typography, lots of white space, subtle card shadows

2. **Klue** (klue.com)
   - Competitor profiles built from topical "cards" and "boards"
   - Battlecard layouts: side-by-side competitor comparisons
   - Digest/newsletter-style information hierarchy
   - Drag-and-drop visual layouts, friendly UI

### Open-source reference (study for component structure)

3. **Bright Data competitive-intelligence** (github.com/brightdata/competitive-intelligence)
   - React 18 + TypeScript + Vite + Tailwind + shadcn/ui frontend
   - Three-agent architecture: Researcher → Analyst → Writer
   - Real-time streaming with live progress updates and tool call monitoring
   - Agent step visualisation showing which phase is active
   - Analysis results displayed in structured sections
   - DO NOT copy their code. DO study their component layout, streaming UX,
     and visual hierarchy for inspiration. Their backend uses FastAPI + Gemini +
     Bright Data scraping, which is different from our stack.

### Code foundation

4. **Vercel AI Chatbot** (github.com/vercel/chatbot)
   - Our actual starting codebase
   - Provides: streaming, AI SDK wiring, shadcn/ui, auth scaffolding, deploy config
   - We strip out the generic chat and replace with CI-specific UI

---

## UI design specification

### Colour palette and visual identity
- **Header**: Dark navy gradient (`#0f172a` to `#1e293b`), white text
- **App name**: "CompIntel" in the header, clean sans-serif
- **Tagline**: "AI-powered competitive intelligence in seconds"
- **Background**: Light gray (`#f8fafc`) or white
- **Cards**: White with subtle shadow (`shadow-sm`), rounded corners (`rounded-xl`)
- **Accent**: Indigo/blue (`indigo-600`) for primary actions and highlights
- **Typography**: System font stack via Tailwind defaults, clean and readable
- **Overall feel**: Think Stripe dashboard or Linear app — minimal, professional, premium

### Page layout

```
┌─────────────────────────────────────────────────────────┐
│  HEADER: CompIntel logo/name + tagline   (navy bg)   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   ┌─────────────────────────────────────────────────┐   │
│   │  🔍 Enter a brand name...        [Analyze →]    │   │
│   └─────────────────────────────────────────────────┘   │
│   Example: [Coca-Cola] [Tesla] [Nike] [Apple] [Samsung] │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  PROGRESS STEPPER (when analysis is running):           │
│  ● Discovering  ○ Researching  ○ Analysing  ○ Report   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │  COMPETITIVE LANDSCAPE OVERVIEW                   │   │
│  │  (Streaming paragraph of analysis)                │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐          │
│  │ Competitor │ │ Competitor │ │ Competitor │          │
│  │   Card 1   │ │   Card 2   │ │   Card 3   │          │
│  │ Name+desc  │ │ Name+desc  │ │ Name+desc  │          │
│  │ Mkt cap    │ │ Mkt cap    │ │ Mkt cap    │          │
│  └────────────┘ └────────────┘ └────────────┘          │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │  MARKET SHARE CHART  (Recharts bar or pie)        │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  ┌────────────────┐  ┌────────────────┐                 │
│  │  ✅ Strengths   │  │  ⚠️ Weaknesses │                 │
│  │  • Point 1     │  │  • Point 1     │                 │
│  │  • Point 2     │  │  • Point 2     │                 │
│  ├────────────────┤  ├────────────────┤                 │
│  │  🚀 Opportun.  │  │  🔴 Threats    │                 │
│  │  • Point 1     │  │  • Point 1     │                 │
│  │  • Point 2     │  │  • Point 2     │                 │
│  └────────────────┘  └────────────────┘                 │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │  RECENT NEWS                                      │   │
│  │  📰 "Headline..." [Positive] - Source, 2d ago    │   │
│  │  📰 "Headline..." [Negative] - Source, 5d ago    │   │
│  │  📰 "Headline..." [Neutral]  - Source, 1w ago    │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │  STRATEGIC INSIGHTS & RECOMMENDATIONS             │   │
│  │  (Streaming paragraph of synthesised advice)      │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  FOOTER: "Powered by Claude AI · Data from Tavily,      │
│   Alpha Vantage, NewsAPI" + [New Analysis] button        │
└─────────────────────────────────────────────────────────┘
```

### SWOT grid colours
- Strengths: green-50 bg, green-700 text, green-200 border
- Weaknesses: amber-50 bg, amber-700 text, amber-200 border
- Opportunities: blue-50 bg, blue-700 text, blue-200 border
- Threats: red-50 bg, red-700 text, red-200 border

### Competitor cards
- White card with border, slight shadow on hover
- Company name in bold (text-lg font-semibold)
- One-line positioning description
- Key metric badges: market cap, revenue, employee count
- Use shadcn Badge component for metric pills

### News items
- Each item: headline text + sentiment badge + source + relative time
- Sentiment badges: green "Positive", red "Negative", gray "Neutral"
- Use shadcn Badge with variant="outline" or appropriate colour

---

## Architecture

### File structure (target state)
```
src/
├── app/
│   ├── page.tsx                    # Landing page with search + results
│   ├── layout.tsx                  # Root layout with header/footer
│   ├── globals.css                 # Tailwind base styles
│   └── api/
│       └── analyze/
│           └── route.ts            # Main API: Claude + tools + streaming
├── components/
│   ├── search-bar.tsx              # Brand name input + example chips
│   ├── progress-stepper.tsx        # Shows agent phase (4 steps)
│   ├── analysis-panel.tsx          # Container parsing streamed content
│   ├── competitor-card.tsx         # Individual competitor info card
│   ├── swot-grid.tsx               # 2x2 SWOT analysis display
│   ├── market-chart.tsx            # Recharts market share chart
│   ├── news-feed.tsx               # News timeline with sentiment badges
│   └── ui/                         # shadcn/ui components (auto-generated)
├── lib/
│   ├── tools.ts                    # All tool definitions for Claude
│   └── types.ts                    # TypeScript interfaces
└── ...
```

### API route design (src/app/api/analyze/route.ts)

```typescript
// Pseudocode — Claude Code should implement this fully
import { streamText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';

export async function POST(req: Request) {
  const { brandName } = await req.json();

  const result = streamText({
    model: anthropic('claude-sonnet-4-6'),
    maxSteps: 10,     // Allow multi-step tool chaining
    system: SYSTEM_PROMPT,  // See below
    messages: [{ role: 'user', content: `Analyse the competitive landscape for: ${brandName}` }],
    tools: {
      searchCompetitors,   // Tavily: find main competitors
      getFinancialData,    // Alpha Vantage: company overview
      searchNews,          // NewsAPI: recent headlines
      getCompanyProfile,   // Tavily: company background info
    },
  });

  return result.toDataStreamResponse();
}
```

### System prompt for Claude (critical for output quality)

```
You are a competitive intelligence analyst. When given a brand name, you will:

1. DISCOVER: Use searchCompetitors to identify the brand's top 3-5 direct competitors.
2. RESEARCH: For the input brand AND each competitor, use getFinancialData and
   getCompanyProfile to gather key metrics and background.
3. NEWS: Use searchNews for the input brand and top 2 competitors to find recent
   developments.
4. ANALYSE AND REPORT: Synthesise all gathered data into a structured report with
   these exact sections, each marked with a markdown heading:

## Competitive landscape overview
A 2-3 paragraph executive summary of the competitive environment.

## Competitor profiles
For each competitor, provide: name, brief description, market position,
estimated market cap/revenue if available, key differentiators.

## Market share analysis
Provide estimated market share data as a JSON code block that can be parsed
for charting:
```json
{"data": [{"name": "Brand", "share": 35}, {"name": "Competitor1", "share": 25}, ...]}
```

## SWOT analysis
Provide as a JSON code block:
```json
{"strengths": ["..."], "weaknesses": ["..."], "opportunities": ["..."], "threats": ["..."]}
```

## Recent news and developments
For each news item include: headline, source, sentiment (positive/negative/neutral),
and a one-line summary.

## Strategic insights and recommendations
3-5 actionable strategic recommendations based on the analysis.

Important: Use ALL available tools before writing your report. Do not hallucinate
financial data — if a tool returns no data for a company, say so. Base your analysis
on the actual data gathered.
```

### Tool definitions (src/lib/tools.ts)

Each tool wraps an external API call:

**searchCompetitors**
- Input: `{ query: string }` — e.g. "Coca-Cola main competitors market share"
- Calls: Tavily Search API (`api.tavily.com/search`)
- Returns: Array of search results with titles, URLs, and content snippets

**getFinancialData**
- Input: `{ symbol: string }` — e.g. "KO" for Coca-Cola
- Calls: Alpha Vantage `OVERVIEW` function
- Returns: Company name, market cap, revenue, PE ratio, sector, description
- Note: If the user enters a brand name, Claude should infer or search for the
  stock symbol. If not publicly traded, this tool returns empty and Claude should
  note that in the report.

**searchNews**
- Input: `{ query: string, pageSize?: number }` — e.g. "Coca-Cola"
- Calls: NewsAPI `/v2/everything` endpoint, sorted by publishedAt, last 30 days
- Returns: Array of articles with title, source, description, publishedAt, url

**getCompanyProfile**
- Input: `{ query: string }` — e.g. "PepsiCo company overview revenue employees"
- Calls: Tavily Search API
- Returns: Search results about the company background

---

## Streaming UX and section parsing

The frontend needs to parse Claude's streamed markdown response and render
each section into the appropriate component:

1. As text streams in, scan for `## ` markdown headings.
2. Map each heading to a component:
   - "Competitive landscape overview" → rendered as a prose Card
   - "Competitor profiles" → parsed into CompetitorCard components
   - "Market share analysis" → extract JSON block, render MarketChart
   - "SWOT analysis" → extract JSON block, render SwotGrid
   - "Recent news" → parsed into NewsFeed component
   - "Strategic insights" → rendered as a prose Card
3. Sections appear progressively as they stream in.
4. While waiting for content, show Skeleton placeholders.

The progress stepper updates based on which tools have been called:
- "Discovering competitors" — active when searchCompetitors is called
- "Gathering data" — active when getFinancialData/getCompanyProfile are called
- "Analysing news" — active when searchNews is called
- "Generating report" — active when final text is streaming

---

## Environment variables

```
ANTHROPIC_API_KEY=sk-ant-...
TAVILY_API_KEY=tvly-...
ALPHA_VANTAGE_API_KEY=...
NEWS_API_KEY=...
```

These must be set in both `.env.local` (for local dev) and Vercel project settings
(for production).

---

## Build sequence (for Claude Code sessions)

Follow this order. Each step should be a separate Claude Code session.
Test and commit after each one.

### Step 1: Strip chatbot, add search UI
- Remove the chat interface from the Vercel chatbot template
- Keep the AI SDK wiring, shadcn/ui setup, and Vercel config
- Build the landing page: header, search bar, example chips
- No API calls yet — just the static UI

### Step 2: Build the API route with tools
- Create `/api/analyze/route.ts` with all 4 tool definitions
- Wire up Tavily, Alpha Vantage, and NewsAPI fetch calls
- Add the system prompt
- Test with `curl` or a simple form submission

### Step 3: Build the streaming analysis display
- Create AnalysisPanel component that parses streamed markdown
- Create CompetitorCard, SwotGrid, MarketChart, NewsFeed components
- Wire the search bar to the API route with useChat or a custom stream handler
- Sections should appear progressively as they stream

### Step 4: Add progress stepper and polish
- Build the ProgressStepper component tracking tool call phases
- Add loading skeletons, error states, "New Analysis" reset button
- Animate section reveals (fade-in as they appear)
- Add footer with data source attributions
- Ensure responsive layout (mobile + desktop)

### Step 5: Final polish and deploy
- Test with multiple brands: Coca-Cola, Tesla, Nike, Apple, Samsung
- Fix any edge cases (unknown brands, API failures, missing data)
- Add a brief "How it works" section or tooltip explaining the AI agent
- Push to main, verify Vercel deployment
- Test the production URL end-to-end

---

## Error handling guidelines

- If Tavily returns no results, Claude should note limited data and proceed
- If Alpha Vantage returns an error (rate limit or unknown symbol), skip
  financial data and note it
- If NewsAPI fails, omit the news section gracefully
- The frontend should show a friendly error message if the API route itself fails
- Add a 60-second timeout on the API route for long-running analyses

---

## Performance notes

- Use Claude Sonnet (not Opus) as the runtime model — faster streaming, cheaper
- Tavily is the most reliable data source; use it for both competitor discovery
  and company profiles
- Alpha Vantage free tier: 25 calls/day. During development, cache responses
  or use a mock when iterating on UI
- NewsAPI free tier: server-side only. It blocks requests from browser origins,
  but works fine from Next.js API routes
- Set reasonable maxSteps (8-10). Higher values mean more tool calls but slower response.

---

## What NOT to do

- Do NOT use LangChain or LangGraph — the Vercel AI SDK handles everything needed
- Do NOT add a database — this is a stateless demo
- Do NOT add authentication — anyone with the link should be able to use it
- Do NOT over-engineer — if something takes more than 20 minutes, simplify
- Do NOT use Opus as the runtime model — Sonnet is fast enough and much cheaper
- Do NOT use the generic chat interface — this should feel like a purpose-built
  business tool, not a chatbot
