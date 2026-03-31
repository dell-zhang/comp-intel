#!/bin/bash
# CompIntel — Quick Start Bootstrap
# Run this inside WSL2 Ubuntu after installing Node.js (via nvm) and Claude Code.
# Usage: bash bootstrap.sh

set -e

echo ""
echo "╔═══════════════════════════════════════════════════╗"
echo "║       CompIntel — Bootstrap Setup              ║"
echo "╚═══════════════════════════════════════════════════╝"
echo ""

# ── Check prerequisites ──────────────────────────────────
echo "→ Checking prerequisites..."

command -v node >/dev/null 2>&1 || { echo "✗ Node.js not found. Install via nvm first."; exit 1; }
command -v git >/dev/null 2>&1 || { echo "✗ Git not found."; exit 1; }

NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "✗ Node.js 18+ required. You have $(node -v). Run: nvm install --lts"
  exit 1
fi

# Enable pnpm via corepack (this project uses pnpm, not npm)
if ! command -v pnpm >/dev/null 2>&1; then
  echo "→ Enabling pnpm via corepack..."
  corepack enable pnpm || { echo "✗ Could not enable pnpm. Run: npm install -g pnpm"; exit 1; }
fi

echo "  Node.js $(node -v) ✓"
echo "  pnpm $(pnpm --version) ✓"
echo "  Git $(git --version | cut -d' ' -f3) ✓"
echo ""

# ── Clone Vercel chatbot template ────────────────────────
PROJECT_DIR="$HOME/work/comp-intel"

if [ -d "$PROJECT_DIR" ]; then
  echo "→ Directory $PROJECT_DIR already exists. Skipping clone."
else
  echo "→ Cloning Vercel AI Chatbot template..."
  git clone --depth 1 https://github.com/vercel/chatbot.git "$PROJECT_DIR"
  rm -rf "$PROJECT_DIR/.git"  # Detach from Vercel's history
fi

cd "$PROJECT_DIR"

# ── Install dependencies ─────────────────────────────────
echo ""
echo "→ Installing dependencies..."
pnpm install

echo ""
echo "→ Installing additional packages for CI app..."
pnpm add recharts zod

# Ensure shadcn components we need are available
echo ""
echo "→ Adding shadcn/ui components..."
npx shadcn@latest add badge separator skeleton --yes 2>/dev/null || true

# ── Set up environment file ──────────────────────────────
if [ ! -f .env.local ]; then
  echo ""
  echo "→ Creating .env.local template..."
  cat > .env.local << 'ENVFILE'
# ═══ CompIntel Environment Variables ═══
# Fill in your API keys below, then save.

# Claude API (for the runtime analysis model)
# Get from: https://console.anthropic.com/
ANTHROPIC_API_KEY=

# Tavily (web search for competitor discovery)
# Get from: https://tavily.com/
TAVILY_API_KEY=

# Alpha Vantage (financial data)
# Get from: https://www.alphavantage.co/support/#api-key
ALPHA_VANTAGE_API_KEY=

# NewsAPI (recent headlines)
# Get from: https://newsapi.org/register
NEWS_API_KEY=

# ── Auth (from Vercel chatbot template — set a random string) ──
AUTH_SECRET=your-random-secret-string-here-change-this
ENVFILE
  echo "  Created .env.local — fill in your API keys!"
else
  echo ""
  echo "→ .env.local already exists, skipping."
fi

# ── Place CLAUDE.md ──────────────────────────────────────
echo ""
echo "→ Placing CLAUDE.md for Claude Code context..."
# If the user downloaded CLAUDE.md to their home dir or current dir, copy it
if [ -f "$HOME/CLAUDE.md" ]; then
  cp "$HOME/CLAUDE.md" "$PROJECT_DIR/CLAUDE.md"
  echo "  Copied from ~/CLAUDE.md"
elif [ -f "$HOME/Downloads/CLAUDE.md" ]; then
  cp "$HOME/Downloads/CLAUDE.md" "$PROJECT_DIR/CLAUDE.md"
  echo "  Copied from ~/Downloads/CLAUDE.md"
else
  echo "  ⚠ CLAUDE.md not found. Copy it manually into $PROJECT_DIR/"
  echo "    Download it from the Claude chat, then:"
  echo "    cp /path/to/CLAUDE.md $PROJECT_DIR/CLAUDE.md"
fi

# ── Initialise fresh Git repo ────────────────────────────
echo ""
if [ -d ".git" ]; then
  echo "→ Git repository already exists. Skipping init."
else
  echo "→ Initialising fresh Git repository..."
  git init
  git add .
  git commit -m "Initial scaffold from Vercel chatbot template"
fi

# ── Summary ──────────────────────────────────────────────
echo ""
echo "╔═══════════════════════════════════════════════════╗"
echo "║  ✓ Setup complete!                                ║"
echo "╠═══════════════════════════════════════════════════╣"
echo "║                                                   ║"
echo "║  Next steps:                                      ║"
echo "║                                                   ║"
echo "║  1. Fill in API keys:                             ║"
echo "║     code $PROJECT_DIR/.env.local                  ║"
echo "║                                                   ║"
echo "║  2. Place CLAUDE.md (if not auto-detected):       ║"
echo "║     cp CLAUDE.md $PROJECT_DIR/                    ║"
echo "║                                                   ║"
echo "║  3. Start Claude Code:                            ║"
echo "║     cd $PROJECT_DIR && claude                     ║"
echo "║                                                   ║"
echo "║  4. First prompt to Claude Code:                  ║"
echo "║     \"Read CLAUDE.md, then do Step 1: Strip the    ║"
echo "║      chatbot UI and build the search landing       ║"
echo "║      page as described in the design spec.\"        ║"
echo "║                                                   ║"
echo "║  5. Test locally:                                 ║"
echo "║     npm run dev  →  http://localhost:3000         ║"
echo "║                                                   ║"
echo "║  6. Create GitHub repo and push:                  ║"
echo "║     git remote add origin <your-repo-url>         ║"
echo "║     git push -u origin main                       ║"
echo "║                                                   ║"
echo "║  7. Deploy:                                       ║"
echo "║     npx vercel --prod                             ║"
echo "║                                                   ║"
echo "╚═══════════════════════════════════════════════════╝"
echo ""
