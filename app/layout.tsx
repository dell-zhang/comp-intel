import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

export const metadata: Metadata = {
  title: "CompIntel — AI-Powered Competitive Intelligence",
  description:
    "Enter a brand name and receive a streamed, multi-section competitive analysis powered by Claude AI.",
};

const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={geist.variable} lang="en">
      <body className="min-h-screen bg-[#f8fafc] font-sans antialiased">
        <header className="bg-gradient-to-r from-[#0f172a] to-[#1e293b] text-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
            <div>
              <h1 className="text-xl font-bold tracking-tight">CompIntel</h1>
              <p className="text-sm text-slate-400">
                AI-powered competitive intelligence in seconds
              </p>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>

        <footer className="border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-5xl px-6 py-6 text-center text-sm text-slate-500">
            Powered by Claude AI &middot; Data from Tavily, Alpha Vantage,
            NewsAPI
          </div>
        </footer>
      </body>
    </html>
  );
}
