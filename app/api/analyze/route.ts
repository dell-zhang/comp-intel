import { anthropic } from "@ai-sdk/anthropic";
import { stepCountIs, streamText } from "ai";
import {
  getCompanyProfile,
  getFinancialData,
  searchCompetitors,
  searchNews,
} from "@/lib/tools";

const SYSTEM_PROMPT = `You are a competitive intelligence analyst. When given a brand name, you will:

1. DISCOVER: Use searchCompetitors to identify the brand's top 3-5 direct competitors.
2. RESEARCH: For the input brand AND each competitor, use getFinancialData and getCompanyProfile to gather key metrics and background.
3. NEWS: Use searchNews for the input brand and top 2 competitors to find recent developments.
4. ANALYSE AND REPORT: Synthesise all gathered data into a structured report with these exact sections, each marked with a markdown heading:

## Competitive landscape overview
A 2-3 paragraph executive summary of the competitive environment.

## Competitor profiles
For each competitor, provide: name, brief description, market position, estimated market cap/revenue if available, key differentiators.

## Market share analysis
Provide estimated market share data as a JSON code block that can be parsed for charting:
\`\`\`json
{"data": [{"name": "Brand", "share": 35}, {"name": "Competitor1", "share": 25}, ...]}
\`\`\`

## SWOT analysis
Provide as a JSON code block:
\`\`\`json
{"strengths": ["..."], "weaknesses": ["..."], "opportunities": ["..."], "threats": ["..."]}
\`\`\`

## Recent news and developments
For each news item include: headline, source, sentiment (positive/negative/neutral), and a one-line summary.

## Strategic insights and recommendations
3-5 actionable strategic recommendations based on the analysis.

Important: Use ALL available tools before writing your report. Do not hallucinate financial data — if a tool returns no data for a company, say so. Base your analysis on the actual data gathered.`;

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { brandName } = await req.json();

    if (!brandName || typeof brandName !== "string") {
      return new Response(JSON.stringify({ error: "brandName is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const result = streamText({
      model: anthropic("claude-sonnet-4-6"),
      system: SYSTEM_PROMPT,
      stopWhen: stepCountIs(10),
      messages: [
        {
          role: "user",
          content: `Analyse the competitive landscape for: ${brandName}`,
        },
      ],
      tools: {
        searchCompetitors,
        getCompanyProfile,
        getFinancialData,
        searchNews,
      },
      onError({ error }) {
        console.error("Stream error:", error);
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Analyze API error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
