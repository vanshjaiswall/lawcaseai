import { NextRequest, NextResponse } from "next/server";
import { generateQueryVariations } from "@/lib/constants";

export async function POST(req: NextRequest) {
  try {
    const { query, page = 0, smart = true } = await req.json();

    if (!query?.trim()) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      );
    }

    if (smart) {
      // Try original query first
      const { results, total } = await searchIndianKanoon(query, page);

      if (results.length >= 3) {
        return NextResponse.json({ results, total, page, searchedQuery: query, corrected: false });
      }

      // Not enough results — try variations
      const variations = generateQueryVariations(query);
      let bestResults = results;
      let bestTotal = total;
      let usedQuery = query;

      for (const variation of variations) {
        if (variation === query) continue; // already tried

        const { results: varResults, total: varTotal } = await searchIndianKanoon(variation, page);
        if (varResults.length > bestResults.length) {
          bestResults = varResults;
          bestTotal = varTotal;
          usedQuery = variation;
        }
        if (bestResults.length >= 5) break;
      }

      return NextResponse.json({
        results: bestResults,
        total: bestTotal,
        page,
        searchedQuery: usedQuery,
        corrected: usedQuery !== query.trim(),
      });
    }

    const { results, total } = await searchIndianKanoon(query, page);
    return NextResponse.json({ results, total, page });
  } catch (err: any) {
    console.error("Search error:", err);
    return NextResponse.json(
      { error: "Search failed. Please try again." },
      { status: 500 }
    );
  }
}

async function searchIndianKanoon(
  query: string,
  page: number
): Promise<{ results: any[]; total: number }> {
  const url = `https://indiankanoon.org/search/?formInput=${encodeURIComponent(query)}&pagenum=${page}`;

  console.log(`[search] fetching: ${url}`);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout

  let response: Response;
  try {
    response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-IN,en;q=0.9,hi;q=0.8",
        "Accept-Encoding": "gzip, deflate, br",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        Referer: "https://indiankanoon.org/",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "same-origin",
        "Upgrade-Insecure-Requests": "1",
      },
      cache: "no-store",
    });
  } catch (fetchErr: any) {
    console.error(`[search] fetch failed:`, fetchErr?.message);
    return { results: [], total: 0 };
  } finally {
    clearTimeout(timeout);
  }

  console.log(`[search] status: ${response.status}`);

  if (!response.ok) {
    console.error(`[search] bad status ${response.status} for query "${query}"`);
    return { results: [], total: 0 };
  }

  const html = await response.text();
  console.log(`[search] html length: ${html.length}, article tags: ${(html.match(/<article/g) || []).length}`);

  return {
    results: parseSearchResults(html),
    total: parseTotalResults(html),
  };
}

function parseSearchResults(html: string): any[] {
  const results: any[] = [];

  // Split HTML by <article class="result" ...> to get each result block
  const articleSections = html.split(/<article\s+class="result"/i);
  articleSections.shift(); // remove content before first result

  for (const section of articleSections.slice(0, 15)) {
    try {
      // Get the doc ID — prefer the "Full Document" link inside hlbottom
      // Format: <a class="cite_tag" href="/doc/50831100/">Full Document</a>
      const fullDocMatch = section.match(/href="\/doc\/(\d+)\/"[^>]*>Full Document/i);
      // Fallback: first /doc/ID/ link anywhere in the block
      const anyDocMatch = section.match(/href="\/doc\/(\d+)\/"/);
      const id = fullDocMatch ? fullDocMatch[1] : anyDocMatch ? anyDocMatch[1] : "";
      if (!id) continue;

      // Extract title from <h4 class="result_title"> ... <a href="...">TITLE</a>
      const titleMatch = section.match(
        /<h4\s+class="result_title"[^>]*>[\s\S]*?<a\s[^>]*>([\s\S]*?)<\/a>/i
      );
      const title = titleMatch ? cleanHtml(titleMatch[1]) : "Untitled";

      // Extract snippet from <div class="headline">
      const headlineMatch = section.match(
        /<div\s+class="headline"[^>]*>([\s\S]*?)<\/div>/i
      );
      const snippet = headlineMatch ? cleanHtml(headlineMatch[1]) : "";

      // Extract court from <span class="docsource">
      const courtMatch = section.match(
        /<span\s+class="docsource"[^>]*>([\s\S]*?)<\/span>/i
      );
      const court = courtMatch ? cleanHtml(courtMatch[1]) : "";

      // Extract date — it often appears in the title like "... on 15 March, 2021"
      const dateMatch = title.match(/on\s+(\d{1,2}\s+\w+,?\s+\d{4})$/i);
      const date = dateMatch ? dateMatch[1] : "";

      results.push({
        id,
        title: title.replace(/\s+on\s+\d{1,2}\s+\w+,?\s+\d{4}$/, "").slice(0, 200),
        headline: snippet.slice(0, 350),
        court,
        date,
        citation: "",
        snippet: snippet.slice(0, 350),
      });
    } catch {
      // Skip malformed entries
    }
  }

  return results;
}

function parseTotalResults(html: string): number {
  // Indian Kanoon shows: <span class="results-count"><b>1 - 10 of 4752</b>
  const match = html.match(/of\s+([\d,]+)\s*<\/b>/i);
  if (match) return parseInt(match[1].replace(/,/g, ""), 10);

  const match2 = html.match(/([\d,]+)\s+result/i);
  if (match2) return parseInt(match2[1].replace(/,/g, ""), 10);

  return 0;
}

function cleanHtml(text: string): string {
  return text
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
