"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface ChatMessage { role: "user" | "assistant"; content: string; }
interface Props { caseText: string; caseTitle: string; }

const SUGGESTED = [
  "What is the ratio decidendi?",
  "Explain the court's reasoning simply",
  "What precedents were cited?",
  "Any dissenting opinion?",
  "How is this relevant for exams?",
  "What are the obiter dicta?",
];

function AiMessage({ text }: { text: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {text.split("\n").map((line, i) => {
        if (line.startsWith("## ") || line.startsWith("### ")) {
          return <p key={i} style={{ fontWeight: 600, color: "#0f172a", marginTop: 10, marginBottom: 2, fontSize: "0.82rem" }}>
            {line.replace(/^#+\s/, "")}
          </p>;
        }
        if (line.startsWith("- ") || line.startsWith("* ")) {
          return <div key={i} style={{ display: "flex", gap: 7, paddingLeft: 2 }}>
            <span style={{ color: "#1d4ed8", flexShrink: 0, fontWeight: 700, lineHeight: 1.6 }}>·</span>
            <span style={{ lineHeight: 1.6 }}>{line.slice(2)}</span>
          </div>;
        }
        const num = line.match(/^(\d+)\.\s(.+)/);
        if (num) return <div key={i} style={{ display: "flex", gap: 7, paddingLeft: 2 }}>
          <span style={{ color: "#1d4ed8", flexShrink: 0, fontWeight: 600, fontSize: "0.8rem", minWidth: 16, lineHeight: 1.6 }}>{num[1]}.</span>
          <span style={{ lineHeight: 1.6 }}>{num[2]}</span>
        </div>;
        if (!line.trim()) return <div key={i} style={{ height: 5 }} />;
        return <p key={i} style={{ lineHeight: 1.65 }}>{line}</p>;
      })}
    </div>
  );
}

export default function ChatInterface({ caseText, caseTitle }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const endRef   = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef  = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback((instant?: boolean) => {
    endRef.current?.scrollIntoView({ behavior: instant ? "auto" : "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, loading]);

  /* Auto-resize on iOS when keyboard opens */
  useEffect(() => {
    const onResize = () => scrollToBottom(true);
    window.visualViewport?.addEventListener("resize", onResize);
    return () => window.visualViewport?.removeEventListener("resize", onResize);
  }, [scrollToBottom]);

  const handleSend = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setInput("");

    const updated: ChatMessage[] = [...messages, { role: "user", content: msg }];
    setMessages(updated);
    setLoading(true);
    setTimeout(() => scrollToBottom(), 50);

    try {
      const res  = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, caseText, title: caseTitle, history: messages }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessages([...updated, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages([...updated, { role: "assistant", content: "Something went wrong — please try again." }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "clamp(460px, 62vh, 680px)",
      background: "#fff",
      border: "1.5px solid #e2e8f0",
      borderRadius: 14,
      overflow: "hidden",
      boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
    }}>

      {/* ── Header ── */}
      <div style={{
        padding: "13px 16px",
        borderBottom: "1px solid #f1f5f9",
        display: "flex", alignItems: "center", gap: 10,
        background: "#f8fafc",
        flexShrink: 0,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 9,
          background: "#1e3a8a",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path d="M2 3h11M2 6.5h8M2 10h6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 600, color: "#0f172a", fontSize: "0.85rem", lineHeight: 1.3 }}>
            Case Assistant
          </p>
          <p style={{ color: "#94a3b8", fontSize: "0.68rem", lineHeight: 1 }}>
            Powered by Groq · LLaMA 3.3 70B
          </p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => setMessages([])}
            style={{
              background: "none", border: "1px solid #e2e8f0",
              borderRadius: 6, padding: "4px 10px",
              fontSize: "0.7rem", color: "#94a3b8",
              cursor: "pointer", fontFamily: "inherit",
              transition: "all 0.13s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#94a3b8"; e.currentTarget.style.color = "#475569"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#94a3b8"; }}
          >
            Clear
          </button>
        )}
      </div>

      {/* ── Messages ── */}
      <div ref={listRef} style={{
        flex: 1,
        overflowY: "auto",
        padding: "14px 14px 4px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        overscrollBehavior: "contain",
      }}>

        {/* Empty state */}
        {messages.length === 0 && (
          <div style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            gap: 14, padding: "20px 8px", textAlign: "center",
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 13,
              background: "#eff6ff", border: "1px solid #bfdbfe",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M11 2C6.03 2 2 5.86 2 10.6c0 2.24.87 4.28 2.3 5.82L3 20l4.08-1.1A9.3 9.3 0 0011 19.2C15.97 19.2 20 15.34 20 10.6S15.97 2 11 2z" stroke="#1d4ed8" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M8 10.5h5M8 7.5h3" stroke="#1d4ed8" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <p style={{ fontWeight: 600, color: "#0f172a", fontSize: "0.9rem", marginBottom: 4 }}>
                Ask anything about this case
              </p>
              <p style={{ color: "#64748b", fontSize: "0.78rem", maxWidth: 280, lineHeight: 1.5 }}>
                Ratio decidendi, precedents, exam tips — tap a suggestion or type your own.
              </p>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", maxWidth: 380 }}>
              {SUGGESTED.map(q => (
                <button
                  key={q}
                  onClick={() => handleSend(q)}
                  style={{
                    background: "#f8fafc", border: "1.5px solid #e2e8f0",
                    color: "#475569", borderRadius: 99,
                    fontSize: "0.75rem", padding: "7px 13px",
                    cursor: "pointer", transition: "all 0.13s",
                    fontFamily: "inherit", lineHeight: 1,
                    minHeight: 34,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#93c5fd"; e.currentTarget.style.color = "#1d4ed8"; e.currentTarget.style.background = "#eff6ff"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#475569"; e.currentTarget.style.background = "#f8fafc"; }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((m, i) => (
          <div key={i} className="fade-in" style={{
            display: "flex",
            justifyContent: m.role === "user" ? "flex-end" : "flex-start",
            gap: 8,
            alignItems: "flex-end",
          }}>
            {/* AI avatar */}
            {m.role === "assistant" && (
              <div style={{
                width: 26, height: 26, borderRadius: 7,
                background: "#1e3a8a", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 2,
              }}>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path d="M1.5 2h10M1.5 5h7M1.5 8h5" stroke="#fff" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
              </div>
            )}

            <div
              className={m.role === "user" ? "bubble-user" : "bubble-ai"}
              style={{
                maxWidth: "80%",
                padding: "10px 14px",
                fontSize: "0.84rem",
                lineHeight: 1.65,
              }}
            >
              {m.role === "assistant" ? <AiMessage text={m.content} /> : m.content}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="fade-in" style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
            <div style={{
              width: 26, height: 26, borderRadius: 7,
              background: "#1e3a8a", flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 2,
            }}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M1.5 2h10M1.5 5h7M1.5 8h5" stroke="#fff" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="bubble-ai" style={{ padding: "12px 16px" }}>
              <div className="dot-typing"><span/><span/><span/></div>
            </div>
          </div>
        )}

        <div ref={endRef} style={{ height: 4 }} />
      </div>

      {/* ── Quick replies (context-aware) ── */}
      {messages.length > 0 && messages.length <= 4 && !loading && (
        <div style={{
          padding: "0 14px 8px",
          display: "flex", gap: 6, overflowX: "auto",
          scrollbarWidth: "none", flexShrink: 0,
        }}>
          {SUGGESTED.slice(0, 3).map(q => (
            <button key={q} onClick={() => handleSend(q)} style={{
              background: "none", border: "1px solid #e2e8f0",
              color: "#64748b", borderRadius: 99,
              fontSize: "0.72rem", padding: "5px 11px",
              cursor: "pointer", whiteSpace: "nowrap",
              fontFamily: "inherit", transition: "all 0.13s",
              minHeight: 30, flexShrink: 0,
            }}>
              {q}
            </button>
          ))}
        </div>
      )}

      {/* ── Input ── */}
      <div style={{
        padding: "10px 12px",
        borderTop: "1px solid #f1f5f9",
        background: "#f8fafc",
        flexShrink: 0,
        paddingBottom: "max(10px, env(safe-area-inset-bottom))",
      }}>
        <form
          onSubmit={e => { e.preventDefault(); handleSend(); }}
          style={{ display: "flex", gap: 8, alignItems: "center" }}
        >
          <input
            ref={inputRef}
            className="input"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about facts, reasoning, precedents…"
            disabled={loading}
            style={{
              flex: 1, padding: "10px 14px",
              borderRadius: 9, fontSize: "0.875rem",
              border: "1.5px solid #e2e8f0",
            }}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="send"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="btn btn-primary"
            style={{ padding: "0 16px", height: 40, borderRadius: 9, fontSize: "0.85rem" }}
            aria-label="Send message"
          >
            {loading
              ? <span className="spinner" style={{ width: 15, height: 15 }} />
              : <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <path d="M13 7.5L2 2l2.5 5.5L2 13l11-5.5z" fill="currentColor"/>
                </svg>
            }
          </button>
        </form>
      </div>
    </div>
  );
}
