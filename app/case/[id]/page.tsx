"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import CaseSummary from "@/components/CaseSummary";
import ChatInterface from "@/components/ChatInterface";

interface CaseDoc {
  id: string;
  title: string;
  court: string;
  date: string;
  citation: string;
  rawDoc: string;
}

type Tab = "summary" | "chat";

const TABS = [
  { key: "summary" as Tab, label: "AI Summary" },
  { key: "chat"    as Tab, label: "Ask AI"     },
];

export default function CasePage() {
  const params = useParams();
  const id = params.id as string;

  const [doc,         setDoc]         = useState<CaseDoc | null>(null);
  const [summary,     setSummary]     = useState("");
  const [loading,     setLoading]     = useState(true);
  const [summarizing, setSummarizing] = useState(false);
  const [error,       setError]       = useState("");
  const [activeTab,   setActiveTab]   = useState<Tab>("summary");

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
        setSummary("Failed to generate AI summary. Please check your API key.");
      } finally {
        setSummarizing(false);
      }
    })();
  }, [doc]);

  /* ── Loading ── */
  if (loading) {
    return (
      <div style={{
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        minHeight: "60vh", gap: 14,
      }}>
        <span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
        <p style={{ color: "#94a3b8", fontSize: "0.85rem" }}>Loading case…</p>
      </div>
    );
  }

  /* ── Error ── */
  if (error || !doc) {
    return (
      <div style={{
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        minHeight: "60vh", gap: 12,
        padding: "0 24px", textAlign: "center",
      }}>
        <p style={{ color: "#dc2626", fontWeight: 600, fontSize: "0.95rem" }}>
          {error || "Case not found"}
        </p>
        <a href="/" style={{ color: "#1d4ed8", textDecoration: "none", fontSize: "0.85rem" }}>
          ← Back to search
        </a>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "calc(100dvh - 56px)",
      background: "#f8fafc",
      paddingBottom: "max(24px, env(safe-area-inset-bottom))",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 16px 0" }}>

        {/* Back link — uses .back-link for animated chevron */}
        <a href="/" className="back-link fade-in">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none"
            stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 10L4 6.5 8 3"/>
          </svg>
          Back to results
        </a>

        {/* Case header — slides up on entrance */}
        <div className="card slide-up" style={{ padding: "18px 20px", marginBottom: 20, background: "#fff" }}>
          <h1 style={{
            fontFamily: "'DM Sans', system-ui, sans-serif",
            fontWeight: 700,
            fontSize: "clamp(1.05rem, 2.8vw, 1.45rem)",
            color: "#0f172a",
            lineHeight: 1.35,
            marginBottom: 12,
            letterSpacing: "-0.01em",
          }}>
            {doc.title}
          </h1>
          {/* Badges pop in with stagger */}
          <div className="stagger" style={{ display: "flex", flexWrap: "wrap", gap: 7, alignItems: "center" }}>
            {doc.court && (
              <span className="badge-entrance" style={{
                fontSize: "0.7rem", fontWeight: 600,
                color: "#1d4ed8", background: "#eff6ff",
                border: "1px solid #bfdbfe",
                borderRadius: 99, padding: "3px 10px",
              }}>
                {doc.court}
              </span>
            )}
            {doc.citation && (
              <span className="badge-entrance" style={{
                fontSize: "0.68rem", fontFamily: "monospace", fontWeight: 500,
                color: "#475569", background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: 99, padding: "3px 10px",
              }}>
                {doc.citation}
              </span>
            )}
            {doc.date && (
              <span className="badge-entrance" style={{ fontSize: "0.7rem", color: "#94a3b8" }}>{doc.date}</span>
            )}
          </div>
        </div>

        {/* ── DESKTOP: side-by-side ── */}
        <div className="lg-split">
          <div style={{ flex: "0 0 58%" }}>
            <CaseSummary summary={summary} loading={summarizing} />
          </div>
          <div style={{ flex: 1, position: "sticky", top: 74, height: "calc(100dvh - 110px)" }}>
            <ChatInterface caseText={doc.rawDoc} caseTitle={doc.title} />
          </div>
        </div>

        {/* ── MOBILE / TABLET: tabs ── */}
        <div className="mobile-tabs">
          {/* Tab bar */}
          <div style={{
            display: "flex",
            background: "#fff",
            border: "1.5px solid #e2e8f0",
            borderRadius: 10,
            padding: 4,
            marginBottom: 16,
            gap: 4,
          }}>
            {TABS.map(t => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                style={{
                  flex: 1,
                  padding: "10px 8px",
                  borderRadius: 7,
                  fontSize: "0.82rem",
                  fontWeight: activeTab === t.key ? 600 : 500,
                  border: "none", cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all 0.15s",
                  ...(activeTab === t.key
                    ? { background: "#1e3a8a", color: "#fff", boxShadow: "0 1px 4px rgba(30,58,138,0.2)" }
                    : { background: "transparent", color: "#64748b" }
                  ),
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="fade-in" key={activeTab}>
            {activeTab === "summary" && <CaseSummary summary={summary} loading={summarizing} />}
            {activeTab === "chat"    && <ChatInterface caseText={doc.rawDoc} caseTitle={doc.title} />}
          </div>
        </div>
      </div>

      <style>{`
        .lg-split   { display: none; }
        .mobile-tabs{ display: block; }
        @media (min-width: 1024px) {
          .lg-split    { display: flex !important; gap: 20px; align-items: flex-start; }
          .mobile-tabs { display: none !important; }
        }
      `}</style>
    </div>
  );
}
