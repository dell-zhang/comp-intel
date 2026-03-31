import { z } from "zod";

export const searchCompetitors = {
  description:
    "Search the web to discover a brand's main competitors, market positioning, and competitive landscape. Use a detailed query for best results.",
  inputSchema: z.object({
    query: z
      .string()
      .describe(
        'Search query, e.g. "Coca-Cola main competitors market share"',
      ),
  }),
  execute: async ({ query }: { query: string }) => {
    const apiKey = process.env.TAVILY_API_KEY;
    if (!apiKey) return { error: "TAVILY_API_KEY not configured" };

    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        max_results: 8,
        include_answer: true,
      }),
    });

    if (!res.ok) {
      return { error: `Tavily API error: ${res.status}` };
    }

    const data = await res.json();
    return {
      answer: data.answer ?? null,
      results: (data.results ?? []).map(
        (r: { title: string; url: string; content: string }) => ({
          title: r.title,
          url: r.url,
          content: r.content,
        }),
      ),
    };
  },
};

export const getCompanyProfile = {
  description:
    "Search the web for a company's background information including history, products, employees, revenue, and market position.",
  inputSchema: z.object({
    query: z
      .string()
      .describe(
        'Search query, e.g. "PepsiCo company overview revenue employees"',
      ),
  }),
  execute: async ({ query }: { query: string }) => {
    const apiKey = process.env.TAVILY_API_KEY;
    if (!apiKey) return { error: "TAVILY_API_KEY not configured" };

    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        max_results: 5,
        include_answer: true,
      }),
    });

    if (!res.ok) {
      return { error: `Tavily API error: ${res.status}` };
    }

    const data = await res.json();
    return {
      answer: data.answer ?? null,
      results: (data.results ?? []).map(
        (r: { title: string; url: string; content: string }) => ({
          title: r.title,
          url: r.url,
          content: r.content,
        }),
      ),
    };
  },
};

export const getFinancialData = {
  description:
    "Get financial overview data for a publicly traded company including market cap, revenue, PE ratio, sector, and description. Requires a stock ticker symbol.",
  inputSchema: z.object({
    symbol: z
      .string()
      .describe('Stock ticker symbol, e.g. "KO" for Coca-Cola, "TSLA" for Tesla'),
  }),
  execute: async ({ symbol }: { symbol: string }) => {
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
    if (!apiKey) return { error: "ALPHA_VANTAGE_API_KEY not configured" };

    const url = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${encodeURIComponent(symbol)}&apikey=${apiKey}`;
    const res = await fetch(url);

    if (!res.ok) {
      return { error: `Alpha Vantage API error: ${res.status}` };
    }

    const data = await res.json();

    if (data.Note) {
      return { error: "Alpha Vantage rate limit reached. Financial data unavailable." };
    }

    if (!data.Symbol) {
      return { error: `No financial data found for symbol "${symbol}".` };
    }

    return {
      symbol: data.Symbol,
      name: data.Name,
      description: data.Description,
      sector: data.Sector,
      industry: data.Industry,
      marketCap: data.MarketCapitalization,
      peRatio: data.PERatio,
      revenue: data.RevenueTTM,
      profitMargin: data.ProfitMargin,
      quarterlyRevenueGrowth: data.QuarterlyRevenueGrowthYOY,
      fiftyTwoWeekHigh: data["52WeekHigh"],
      fiftyTwoWeekLow: data["52WeekLow"],
      dividendYield: data.DividendYield,
      country: data.Country,
      fullTimeEmployees: data.FullTimeEmployees,
    };
  },
};

export const searchNews = {
  description:
    "Search for recent news articles about a company or brand from the past 30 days. Returns headlines, sources, and publication dates.",
  inputSchema: z.object({
    query: z.string().describe('News search query, e.g. "Coca-Cola"'),
    pageSize: z
      .number()
      .optional()
      .default(5)
      .describe("Number of articles to return (default 5, max 10)"),
  }),
  execute: async ({
    query,
    pageSize = 5,
  }: { query: string; pageSize?: number }) => {
    const apiKey = process.env.NEWS_API_KEY;
    if (!apiKey) return { error: "NEWS_API_KEY not configured" };

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const from = thirtyDaysAgo.toISOString().split("T")[0];

    const params = new URLSearchParams({
      q: query,
      from,
      sortBy: "publishedAt",
      pageSize: String(Math.min(pageSize, 10)),
      apiKey,
    });

    const res = await fetch(
      `https://newsapi.org/v2/everything?${params.toString()}`,
    );

    if (!res.ok) {
      return { error: `NewsAPI error: ${res.status}` };
    }

    const data = await res.json();

    if (data.status !== "ok") {
      return { error: data.message ?? "NewsAPI returned an error." };
    }

    return {
      totalResults: data.totalResults,
      articles: (data.articles ?? []).map(
        (a: {
          title: string;
          source: { name: string };
          description: string;
          url: string;
          publishedAt: string;
        }) => ({
          title: a.title,
          source: a.source?.name,
          description: a.description,
          url: a.url,
          publishedAt: a.publishedAt,
        }),
      ),
    };
  },
};
