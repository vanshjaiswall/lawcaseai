# LawCase AI — Indian Legal Research Platform

AI-powered legal case research tool built for Indian law students. Search Supreme Court and High Court judgments with precise filters and get AI-generated summaries.

## Features

- **Precise Case Search** — Search by case name, citation (AIR, SCC), act/section, judge name, or free text
- **Advanced Filters** — Filter by court (Supreme Court + all High Courts), year range, and legal category
- **AI Case Summary** — Auto-generated structured summaries with:
  - Facts of the Case
  - Judgment
  - Court's Reasoning
  - Key Points (Crux)
  - Relevant Statutes & Articles
- **AI Chat** — Ask follow-up questions about any case (precedents, reasoning, exam relevance)
- **Full Judgment** — Read the complete judgment text

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + Tailwind CSS
- **Case Database**: Indian Kanoon API
- **AI Engine**: Groq API (LLaMA 3.3 70B)
- **Deployment**: Replit

## Setup

### 1. Get API Keys

**Groq API Key:**
1. Go to [console.groq.com](https://console.groq.com)
2. Sign up / sign in
3. Create an API key

**Indian Kanoon API Token:**
1. Go to [api.indiankanoon.org](https://api.indiankanoon.org)
2. Apply for API access
3. You'll receive a token via email

### 2. Configure Environment

Create a `.env` file (or add to Replit Secrets):

```
GROQ_API_KEY=your_groq_api_key_here
INDIAN_KANOON_TOKEN=your_indian_kanoon_token_here
```

### 3. Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Deploy on Replit

1. Create a new Replit → Import from GitHub or upload files
2. Add your API keys in **Secrets** (Tools → Secrets)
3. Click **Run** — it auto-installs and starts

## Search Tips

| Search Type | Example | What it does |
|---|---|---|
| Free Text | `fundamental rights privacy` | Broad keyword search |
| Case Name | `Kesavananda Bharati v State of Kerala` | Matches case titles |
| Citation | `AIR 1973 SC 1461` | Exact citation lookup |
| Act/Section | `Section 302 IPC` | Searches by statute |
| Judge | `Justice D.Y. Chandrachud` | Finds cases by judge |

Combine with filters (court, year range) for precise results.

## Project Structure

```
lawcase-ai/
├── app/
│   ├── layout.tsx          # Root layout + nav
│   ├── page.tsx            # Home / search page
│   ├── globals.css         # Tailwind + custom styles
│   ├── api/
│   │   ├── search/route.ts # Indian Kanoon search
│   │   ├── doc/route.ts    # Fetch full judgment
│   │   ├── summarize/route.ts # Groq AI summary
│   │   └── chat/route.ts   # Groq AI chat
│   └── case/[id]/page.tsx  # Case detail page
├── components/
│   ├── SearchBar.tsx       # Search with filters
│   ├── CaseCard.tsx        # Search result card
│   ├── CaseSummary.tsx     # AI summary renderer
│   └── ChatInterface.tsx   # AI chat UI
├── lib/
│   └── constants.ts        # Courts, categories, query builder
├── .replit                 # Replit config
└── replit.nix              # Replit Nix packages
```
