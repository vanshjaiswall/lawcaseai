import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

// Force Node.js runtime (required for unpdf / pdfjs-dist)
export const runtime = "nodejs";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const MODELS = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "gemma2-9b-it",
];

const SYSTEM_PROMPT = `You are an expert Indian legal analyst AI assistant for law students.
When given the text of a legal document or court judgment, extract and present the following in structured format:

## FACTS OF THE CASE
Summarize the factual background in 4-6 bullet points. Who are the parties, what happened, what was the dispute, procedural history.

## JUDGMENT
State the final decision clearly. Was the appeal/petition allowed or dismissed? What relief was granted?

## COURT'S REASONING
Explain the legal reasoning in 4-6 bullet points. Which principles were applied, precedents cited, how statutes were interpreted.

## KEY POINTS (CRUX)
3-5 key takeaways a law student must remember. The ratio decidendi. Keep each to 1-2 sentences.

## RELEVANT STATUTES & ARTICLES
List key statutes, sections, and constitutional articles discussed.

If the document is not a legal judgment (e.g. a contract, notice, or article), adapt accordingly and summarize the key legal points.

Be CONCISE. Use simple, clear language. Format using markdown.`;

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "Groq API key not configured." },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Max size is 10MB." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    let text = "";
    const fileName = file.name.toLowerCase();

    // Extract text based on file type
    if (fileName.endsWith(".pdf")) {
      try {
        const { extractText, getDocumentProxy } = await import("unpdf");
        const uint8 = new Uint8Array(buffer);
        const pdf   = await getDocumentProxy(uint8);
        const { text: extracted } = await extractText(pdf, { mergePages: true });
        text = extracted;
        console.log(`[upload] unpdf extracted ${text.length} chars`);
      } catch (pdfErr: any) {
        console.error("[upload] unpdf failed:", pdfErr?.message);
        // Fallback: try pdf-parse directly
        try {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const pdfParse = require("pdf-parse/lib/pdf-parse.js");
          const result = await pdfParse(buffer);
          text = result.text;
          console.log(`[upload] pdf-parse fallback extracted ${text.length} chars`);
        } catch (fallbackErr: any) {
          console.error("[upload] pdf-parse fallback also failed:", fallbackErr?.message);
          return NextResponse.json(
            { error: `PDF extraction failed: ${pdfErr?.message || "Unknown PDF error"}` },
            { status: 400 }
          );
        }
      }
    } else if (fileName.endsWith(".docx") || fileName.endsWith(".doc")) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const mammoth = require("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else if (
      fileName.endsWith(".txt") ||
      fileName.endsWith(".md") ||
      file.type.startsWith("text/")
    ) {
      text = buffer.toString("utf-8");
    } else {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload a PDF, Word doc (.docx), or text file (.txt)." },
        { status: 400 }
      );
    }

    text = text.trim();
    console.log(`[upload] extracted ${text.length} chars from ${file.name}`);

    if (!text || text.length < 50) {
      return NextResponse.json(
        { error: "Could not extract text from the file. Make sure it's not a scanned image-only PDF." },
        { status: 400 }
      );
    }

    const messages = [
      { role: "system" as const, content: SYSTEM_PROMPT },
      {
        role: "user" as const,
        content: `Please analyze the following legal document:\n\nFile: ${file.name}\n\n---\n\n${text.slice(0, 12000)}`,
      },
    ];

    let lastError: any;
    for (const model of MODELS) {
      try {
        console.log(`[upload] trying model ${model}`);
        const completion = await groq.chat.completions.create({
          model,
          messages,
          temperature: 0.3,
          max_tokens: 2500,
        });
        const summary = completion.choices?.[0]?.message?.content || "Unable to generate summary.";
        return NextResponse.json({ summary, fileName: file.name, model });
      } catch (err: any) {
        lastError = err;
        console.error(`[upload] ${model} failed:`, err?.status, err?.message, err?.error?.code);
        const isRateLimit =
          err?.status === 429 ||
          err?.error?.code === "rate_limit_exceeded" ||
          err?.error?.code === "tokens_per_day" ||
          String(err?.message).includes("rate_limit");
        if (!isRateLimit) break;
        console.warn(`[upload] rate limit on ${model}, trying next…`);
      }
    }

    const errMsg: string = lastError?.error?.message || lastError?.message || "";
    const isRateLimit =
      lastError?.status === 429 ||
      lastError?.error?.code === "rate_limit_exceeded" ||
      errMsg.includes("rate_limit") ||
      errMsg.includes("Rate limit");
    const isAuthError = lastError?.status === 401 || errMsg.includes("API key") || errMsg.includes("auth");

    return NextResponse.json(
      { error: isRateLimit
          ? "Daily AI limit reached. Please try again in a few hours."
          : isAuthError
          ? "Invalid Groq API key. Check your GROQ_API_KEY environment variable."
          : `Analysis failed: ${errMsg || "Unknown error"}` },
      { status: 500 }
    );
  } catch (err: any) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: "Failed to process file. Please try again." },
      { status: 500 }
    );
  }
}
