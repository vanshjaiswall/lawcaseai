import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are an expert Indian legal analyst AI assistant built for law students.
When given the text of a court judgment, you MUST extract and present the following sections in a structured format:

## FACTS OF THE CASE
Summarize the factual background concisely in 4-6 bullet points. Focus on: who are the parties, what happened, what was the dispute about, and the procedural history (which courts heard it before).

## JUDGMENT
State the final decision/order of the court clearly. Include: whether the appeal/petition was allowed or dismissed, what relief was granted, any directions given, and the final disposition.

## COURT'S REASONING
Explain the legal reasoning of the court in 4-6 bullet points. Include: which legal principles were applied, which precedents were cited and how, how the court interpreted the relevant statutes/articles, and the logical chain from facts to conclusion.

## KEY POINTS (CRUX)
List 3-5 key takeaways in short, crisp bullet points. These should be the most important legal principles or ratio decidendi that a law student should remember for exams and practice. Keep each point to 1-2 sentences maximum.

## RELEVANT STATUTES & ARTICLES
List the key statutes, sections, and constitutional articles discussed in the case.

IMPORTANT RULES:
- Be CONCISE. This is for quick revision, not detailed reading.
- Use simple, clear language a law student can understand.
- If the text is too short or doesn't contain enough information to extract all sections, say so and provide what you can.
- Always mention the case name and court at the top.
- Format using markdown.`;

export async function POST(req: NextRequest) {
  try {
    const { caseText, title } = await req.json();

    if (!caseText?.trim()) {
      return NextResponse.json(
        { error: "Case text is required" },
        { status: 400 }
      );
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "Groq API key not configured. Add GROQ_API_KEY to your .env file." },
        { status: 500 }
      );
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Please analyze the following Indian court judgment and provide the structured summary:\n\nCase: ${title || "Unknown"}\n\n---\n\n${caseText.slice(0, 12000)}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 3000,
    });

    const summary = completion.choices?.[0]?.message?.content || "Unable to generate summary.";

    return NextResponse.json({ summary });
  } catch (err: any) {
    console.error("Summarize error:", err);
    return NextResponse.json(
      { error: "Failed to generate AI summary. Check your Groq API key." },
      { status: 500 }
    );
  }
}
