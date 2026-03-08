import { NextRequest, NextResponse } from "next/server";

// Scrapes Indian Kanoon case page — FREE, no API key needed
export async function GET(req: NextRequest) {
  try {
    const docId = req.nextUrl.searchParams.get("id");

    if (!docId) {
      return NextResponse.json(
        { error: "Document ID is required" },
        { status: 400 }
      );
    }

    const docUrl = `https://indiankanoon.org/doc/${docId}/`;

    const response = await fetch(docUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch document (${response.status})` },
        { status: response.status }
      );
    }

    const html = await response.text();
    const { title, fullText, court, date, citation } = parseDocPage(html);

    return NextResponse.json({
      id: docId,
      title,
      fullText,
      court,
      date,
      citation,
      rawDoc: fullText.slice(0, 15000),
    });
  } catch (err: any) {
    console.error("Doc fetch error:", err);
    return NextResponse.json(
      { error: "Failed to fetch document. Please try again." },
      { status: 500 }
    );
  }
}

function parseDocPage(html: string) {
  // Title — <h2 class="doc_title">
  const titleMatch = html.match(/<h2\s+class="doc_title"[^>]*>([\s\S]*?)<\/h2>/i);
  let title = titleMatch ? cleanHtml(titleMatch[1]) : "";

  // Fallback to <title> tag
  if (!title) {
    const pageTitleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
    title = pageTitleMatch
      ? cleanHtml(pageTitleMatch[1]).replace(/\s*[-|]\s*Indian Kanoon\s*$/i, "")
      : "Unknown Case";
  }

  // Court — <h3 class="docsource_main">
  const courtMatch = html.match(/<h3\s+class="docsource_main"[^>]*>([\s\S]*?)<\/h3>/i);
  const court = courtMatch ? cleanHtml(courtMatch[1]) : "";

  // Date — usually in the title "... on 25 January, 1978"
  const dateMatch = title.match(/on\s+(\d{1,2}\s+\w+,?\s+\d{4})$/i);
  const date = dateMatch ? dateMatch[1] : "";

  // Clean date from title
  let cleanTitle = title.replace(/\s+on\s+\d{1,2}\s+\w+,?\s+\d{4}$/i, "").trim();

  // Indian Kanoon sometimes truncates long party names with " ... " — remove it for clean display
  cleanTitle = cleanTitle.replace(/\s+\.\.\.\s+/g, " ");

  // Citation — <span class="doc_cite"> or look for AIR/SCC patterns
  const citeMatch = html.match(/<span\s+class="doc_cite"[^>]*>([\s\S]*?)<\/span>/i);
  const citation = citeMatch ? cleanHtml(citeMatch[1]) : "";

  // Judgment text — Indian Kanoon puts it in <pre id="pre_1">, <pre id="pre_2"> etc.
  // Collect all <pre id="pre_N"> blocks
  let fullText = "";
  const prePattern = /<pre\s+id="pre_\d+"[^>]*>([\s\S]*?)<\/pre>/gi;
  let preMatch;
  const parts: string[] = [];

  while ((preMatch = prePattern.exec(html)) !== null) {
    const text = cleanHtml(preMatch[1]);
    if (text.length > 20) parts.push(text);
  }

  if (parts.length > 0) {
    fullText = parts.join("\n\n");
  }

  // Fallback: grab all <p> tags from main content
  if (!fullText || fullText.length < 100) {
    const pPattern = /<p[^>]*>([\s\S]*?)<\/p>/gi;
    let pMatch;
    const pParts: string[] = [];
    while ((pMatch = pPattern.exec(html)) !== null) {
      const text = cleanHtml(pMatch[1]);
      if (text.length > 40) pParts.push(text);
    }
    fullText = pParts.join("\n\n");
  }

  return { title: cleanTitle, fullText, court, date, citation };
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
