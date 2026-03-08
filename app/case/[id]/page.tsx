"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import CaseSummary from "@/components/CaseSummary";
import ChatInterface from "@/components/ChatInterface";

interface CaseDoc {
  id: string;
  title: string;
  fullText: string;
  court: string;
  date: string;
  citation: string;
  rawDoc: string;
}

type Tab = "summary" | "chat" | "fulltext";

const TABS = [
  { key: "summary"  as Tab, label: "AI Summary",    icon: "✨" },
  { key: "chat"     as Tab, label: "Chat",           icon: "💬" },
  { key: "fulltext" as Tab, label: "Full Judgment",  icon: "📄" },
];

export default function CasePage() {
  const params = useParams();
  const id = params.id as string;

  const [doc,        setDoc]        = useState<CaseDoc | null>(null);
  const [summary,    setSummary]    = useState("");
  const [loading,    setLoading]    = useState(true);
  const [summarizing,setSummarizing]= useState(false);
  const [error,      setError]      = useState("");
  const [activeTab,  setActiveTab]  = useState<Tab>("summary");

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res  = await fetch(`/api/doc?id=${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load case");
        setDoc(data);
      } catch (err: any) {
        setError(err.message || "Failed to load case.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  useEffect(() => {
    if (!doc?.rawDoc) return;
    (async () => {
      setSummarizing(true);
      try {
        const res  = await fetch("/api/summarize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ caseText: doc.rawDoc, title: doc.title }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setSummary(data.summary);
      } catch {
        setSummary("⚠️ Failed to generate AI summary. Please check your Groq API key.");
      } finally {
        setSummarizing(false);
      }
    })();
  }, [doc]);

  /* ── Loading ── */
  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 16 }}>
        <span className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
        <p style={{ color: "var(--text-3)", fontSize: "0.85rem" }}>Loading case document…</p>
      </div>
    );
  }

  /* ── Error ── */
  if (error || !doc) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 12, padding: "0 24px", textAlign: "center" }}>
        <span style={{ fontSize: 48 }}>⚠️</span>
        <p style={{ color: "#f87171", fontWeight: 600 }}>{error || "Case not found"}</p>
        <a href="/" style={{ color: "var(--accent)", textDecoration: "none", fontSize: "0.85rem" }}>← Back to search</a>
      </div>
    );
  }

  /* ── Full text panel ── */
  const FullText = () => (
    <div className="card" style={{ padding: "20px 22px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, paddingBottom: 14, borderBottom: "1px solid var(--border)" }}>
        <span>📄</span>
        <span style={{ fontWeight: 600, color: "var(--text-1)", fontSize: "0.9rem" }}>Full Judgment Text</span>
        <a
          href={`https://indiankanoon.org/doc/${id}/`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ marginLeft: "auto", color: "var(--text-3)", fontSize: "0.72rem", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}
        >
          View on Indian Kanoon ↗
        </a>
      </div>
      <pre style={{
        color: "var(--text-2)",
        fontSize: "0.8rem",
        lineHeight: 1.8,
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        fontFamily: "inherit",
        margin: 0,
      }}>
        {doc.fullText || "Full text not available."}
      </pre>
    </div>
  );

  return (
    <div className="hero-bg" style={{ minHeight: "calc(100dvh - 56px)", paddingBottom: "max(24px, env(safe-area-inset-bottom))" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 16px 0" }}>

        {/* Back */}
        <a
          href="/"
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            color: "var(--text-3)", fontSize: "0.78rem", textDecoration: "none",
            marginBottom: 16, transition: "color 0.15s",
          }}
          onMouseEnter={e => (e.currentTarget.style.color = "var(--accent)")}
          onMouseLeave={e => (e.currentTarget.style.color = "var(--text-3)")}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M9 11L5 7l4-4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to search
        </a>

        {/* Case header card */}
        <div className="card fade-in" style={{ padding: "18px 20px", marginBottom: 20 }}>
          <h1 style={{
            fontFamily: "Playfair Display, serif",
            fontWeight: 700,
            fontSize: "clamp(1.1rem, 3vw, 1.55rem)",
            color: "var(--text-1)",
            lineHeight: 1.3,
            marginBottom: 12,
          }}>
            {doc.title}
          </h1>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
            {doc.court && (
              <span style={{
                background: "rgba(59,130,246,0.1)", color: "#60a5fa",
                border: "1px solid rgba(59,130,246,0.2)",
                borderRadius: 99, fontSize: "0.72rem", fontWeight: 600,
                padding: "3px 10px", letterSpacing: "0.02em",
              }}>
                {doc.court}
              </span>
            )}
            {doc.citation && (
              <span style={{
                background: "var(--accent-dim)", color: "#fbbf24",
                border: "1px solid rgba(245,158,11,0.2)",
                borderRadius: 99, fontSize: "0.72rem", fontWeight: 600, fontFamily: "monospace",
                padding: "3px 10px",
              }}>
                {doc.citation}
              </span>
            )}
            {doc.date && (
              <span style={{ color: "var(--text-3)", fontSize: "0.72rem" }}>{doc.date}</span>
            )}
          </div>
        </div>

        {/* ── DESKTOP: two-column split ── */}
        <div style={{ display: "none" }} className="lg-split">
          {/* Left: summary (60%) */}
          <div style={{ flex: "0 0 58%" }}>
            <CaseSummary summary={summary} loading={summarizing} />
          </div>
          {/* Right: chat (40%) sticky */}
          <div style={{ flex: 1, position: "sticky", top: 74, height: "calc(100dvh - 100px)" }}>
            <ChatInterface caseText={doc.rawDoc} caseTitle={doc.title} />
          </div>
        </div>

        {/* ── MOBILE / TABLET: tabs ── */}
        <div className="mobile-tabs">
          {/* Tab bar */}
          <div style={{
            display: "flex",
            background: "var(--bg-3)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: 4,
            marginBottom: 16,
            gap: 2,
          }}>
            {TABS.map(t => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                style={{
                  flex: 1,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  padding: "9px 6px",
                  borderRadius: 9,
                  fontSize: "0.75rem", fontWeight: 500,
                  border: "none", cursor: "pointer",
                  transition: "all 0.15s",
                  fontFamily: "inherit",
                  ...(activeTab === t.key
                    ? { background: "var(--bg-4)", color: "var(--text-1)", boxShadow: "0 1px 4px rgba(0,0,0,0.3)" }
                    : { background: "transparent", color: "var(--text-3)" }
                  ),
                }}
              >
                <span style={{ fontSize: "0.95rem" }}>{t.icon}</span>
                <span style={{ display: "none" }} className="tab-label">{t.label}</span>
                <span className="tab-label-short">{t.label.split(" ")[0]}</span>
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="fade-in" key={activeTab}>
            {activeTab === "summary"  && <CaseSummary summary={summary} loading={summarizing} />}
            {activeTab === "chat"     && <ChatInterface caseText={doc.rawDoc} caseTitle={doc.title} />}
            {activeTab === "fulltext" && <FullText />}
          </div>
        </div>

        {/* Full text below on desktop */}
        <div className="lg-fulltext" style={{ marginTop: 20 }}>
          <FullText />
        </div>
      </div>

      {/* Responsive CSS */}
      <style>{`
        .lg-split {
          display: none;
        }
        .mobile-tabs {
          display: block;
        }
        .lg-fulltext {
          display: none;
        }
        @media (min-width: 1024px) {
          .lg-split {
            display: flex !important;
            gap: 20px;
            align-items: flex-start;
          }
          .mobile-tabs {
            display: none !important;
          }
          .lg-fulltext {
            display: block !important;
          }
        }
        @media (min-width: 480px) {
          .tab-label-short { display: none !important; }
          .tab-label { display: inline !important; }
        }
      `}</style>
    </div>
  );
}
