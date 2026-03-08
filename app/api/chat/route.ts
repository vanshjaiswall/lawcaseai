import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are an expert Indian legal research assistant for law students.
You have been provided with the text of a court judgment. Answer the student's questions about this case accurately and concisely.

Guidelines:
- Reference specific parts of the judgment in your answers.
- If the student asks about legal principles, explain them in the context of this case.
- If asked to compare with other cases, mention relevant precedents you know.
- Keep answers focused and exam-oriented — like a good law tutor.
- Use simple language. Explain legal jargon when first used.
- If the answer cannot be found in the provided text, say so clearly.
- Format your responses in clean markdown for readability.`;

export async function POST(req: NextRequest) {
  try {
    const { message, caseText, title, history = [] } = await req.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "Groq API key not configured" },
        { status: 500 }
      );
    }

    // Build message history for context
    const messages: any[] = [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Here is the court judgment text for reference:\n\nCase: ${title || "Unknown"}\n\n---\n\n${(caseText || "").slice(0, 10000)}\n\n---\n\nPlease answer my questions about this case.`,
      },
      {
        role: "assistant",
        content:
          "I've reviewed the judgment. Feel free to ask me anything about this case — the facts, legal reasoning, relevant precedents, applicable statutes, or how this case might appear in exams.",
      },
    ];

    // Add conversation history
    for (const msg of history.slice(-10)) {
      messages.push({
        role: msg.role,
        content: msg.content,
      });
    }

    // Add current message
    messages.push({ role: "user", content: message });

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages,
      temperature: 0.4,
      max_tokens: 2000,
    });

    const reply = completion.choices?.[0]?.message?.content || "I couldn't generate a response. Please try again.";

    return NextResponse.json({ reply });
  } catch (err: any) {
    console.error("Chat error:", err);
    return NextResponse.json(
      { error: "Chat failed. Check your Groq API key." },
      { status: 500 }
    );
  }
}
