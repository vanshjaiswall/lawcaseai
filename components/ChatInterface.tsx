"use client";

import { useState, useRef, useEffect } from "react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  caseText: string;
  caseTitle: string;
}

const SUGGESTED = [
  "What is the ratio decidendi?",
  "Explain the court's reasoning simply",
  "What precedents were cited?",
  "How is this relevant for exams?",
  "What are the obiter dicta?",
  "Was there a dissenting opinion?",
];

function AiMessage({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {lines.map((line, i) => {
        if (line.startsWith("## ") || line.startsWith("### ")) {
          return (
            <p key={i} style={{ fontWeight: 600, color: "var(--text-1)", marginTop: 8, marginBottom: 2, fontSize: "0.82rem" }}>
              {line.replace(/^#+\s/, "")}
            </p>
          );
        }
        if (line.startsWith("- ") || line.startsWith("* ")) {
          return (
            <div key={i} style={{ display: "flex", gap: 8, paddingLeft: 4 }}>
              <span style={{ color: "var(--accent)", flexShrink: 0 }}>•</span>
              <span>{line.slice(2)}</span>
            </div>
          );
        }
        const num = line.match(/^(\d+)\.\s(.+)/);
        if (num) {
          return (
            <div key={i} style={{ display: "flex", gap: 8, paddingLeft: 4 }}>
              <span style={{ color: "var(--accent)", flexShrink: 0, fontWeight: 700, fontSize: "0.78rem", minWidth: 16 }}>{num[1]}.</span>
              <span>{num[2]}</span>
            </div>
          );
        }
        if (!line.trim()) return <div key={i} style={{ height: 4 }} />;
        return <p key={i}>{line}</p>;
      })}
    </div>
  );
}

export default function ChatInterface({ caseText, caseTitle }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setInput("");

    const updated: ChatMessage[] = [...messages, { role: "user", content: msg }];
    setMessages(updated);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, caseText, title: caseTitle, history: messages }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessages([...updated, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages([...updated, { role: "assistant", content: "⚠️ Something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "clamp(480px, 65vh, 700px)",
        background: "var(--bg-2)",
        border: "1px solid var(--border)",
        borderRadius: 16,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div style={{
        padding: "14px 18px",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: "var(--bg-3)",
        flexShrink: 0,
      }}>
        <div style={{
          width: 32, height: 32,
          background: "var(--accent-dim)",
          border: "1px solid rgba(245,158,11,0.2)",
          borderRadius: 10,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 15,
        }}>💬</div>
        <div>
          <p style={{ fontWeight: 600, color: "var(--text-1)", fontSize: "0.85rem", lineHeight: 1.2 }}>Ask about this Case</p>
          <p style={{ color: "var(--text-3)", fontSize: "0.68rem" }}>Groq · LLaMA 3.3</p>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 6, alignItems: "center" }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399" }} />
          <span style={{ color: "var(--text-3)", fontSize: "0.68rem" }}>Online</span>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: 12 }}>

        {/* Empty state */}
        {messages.length === 0 && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: "24px 0" }}>
            <div style={{
              width: 56, height: 56,
              background: "var(--accent-dim)",
              border: "1px solid rgba(245,158,11,0.2)",
              borderRadius: 16,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 26,
            }}>🎓</div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontWeight: 600, color: "var(--text-1)", fontSize: "0.9rem", marginBottom: 4 }}>Ask anything about this case</p>
              <p style={{ color: "var(--text-3)", fontSize: "0.78rem", maxWidth: 280 }}>
                Ratio decidendi, precedents, reasoning, exam tips — I know it all.
              </p>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", maxWidth: 400 }}>
              {SUGGESTED.map(q => (
                <button
                  key={q}
                  onClick={() => handleSend(q)}
                  style={{
                    background: "var(--bg-4)",
                    border: "1px solid var(--border)",
                    color: "var(--text-2)",
                    borderRadius: 99,
                    fontSize: "0.72rem",
                    padding: "6px 12px",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    fontFamily: "inherit",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = "rgba(245,158,11,0.3)";
                    e.currentTarget.style.color = "#fbbf24";
                    e.currentTarget.style.background = "var(--accent-dim)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = "var(--border)";
                    e.currentTarget.style.color = "var(--text-2)";
                    e.currentTarget.style.background = "var(--bg-4)";
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message bubbles */}
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            {m.role === "assistant" && (
              <div style={{
                width: 26, height: 26, borderRadius: 8, background: "var(--bg-4)",
                border: "1px solid var(--border)", display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 13, flexShrink: 0, marginRight: 8, marginTop: 2,
              }}>⚖️</div>
            )}
            <div
              className={m.role === "user" ? "bubble-user" : "bubble-ai"}
              style={{
                maxWidth: "78%",
                padding: "10px 14px",
                fontSize: "0.83rem",
                lineHeight: 1.65,
              }}
            >
              {m.role === "assistant" ? <AiMessage text={m.content} /> : m.content}
            </div>
          </div>
        ))}

        {/* Loading dots */}
        {loading && (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
            <div style={{
              width: 26, height: 26, borderRadius: 8, background: "var(--bg-4)",
              border: "1px solid var(--border)", display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: 13, flexShrink: 0,
            }}>⚖️</div>
            <div className="bubble-ai" style={{ padding: "12px 16px" }}>
              <div className="dot-typing">
                <span /><span /><span />
              </div>
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: "12px 14px",
        borderTop: "1px solid var(--border)",
        background: "var(--bg-3)",
        flexShrink: 0,
      }}>
        {/* Quick suggestions row when there are messages */}
        {messages.length > 0 && messages.length < 6 && (
          <div style={{ display: "flex", gap: 6, overflowX: "auto", scrollbarWidth: "none", marginBottom: 10, paddingBottom: 2 }}>
            {SUGGESTED.slice(0, 3).map(q => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                style={{
                  background: "var(--bg-4)",
                  border: "1px solid var(--border)",
                  color: "var(--text-3)",
                  borderRadius: 99,
                  fontSize: "0.68rem",
                  padding: "4px 10px",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.15s",
                  fontFamily: "inherit",
                }}
              >
                {q}
              </button>
            ))}
          </div>
        )}

        <form
          onSubmit={e => { e.preventDefault(); handleSend(); }}
          style={{ display: "flex", gap: 8 }}
        >
          <input
            ref={inputRef}
            className="input"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about facts, reasoning, precedents…"
            disabled={loading}
            style={{
              flex: 1,
              padding: "11px 14px",
              borderRadius: 12,
              fontSize: "0.85rem",
            }}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="btn btn-primary"
            style={{ padding: "0 18px", borderRadius: 12, fontSize: "0.85rem" }}
          >
            {loading
              ? <span className="spinner" style={{ width: 15, height: 15 }} />
              : (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M14 8L2 2l3 6-3 6 12-6z" fill="currentColor" />
                </svg>
              )
            }
          </button>
        </form>
      </div>
    </div>
  );
}
