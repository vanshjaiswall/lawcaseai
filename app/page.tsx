"use client";

import { useState } from "react";
import SearchBar from "@/components/SearchBar";
import CaseCard from "@/components/CaseCard";

export interface CaseResult {
  id: string;
  title: string;
  headline: string;
  court: string;
  date: string;
  citation: string;
  snippet: string;
}

const EXAMPLES = [
  "Kesavananda Bharati",
  "Maneka Gandhi",
  "Vishakha Guidelines",
  "Right to Privacy",
  "Article 21",
  "Section 302 IPC",
];

export default function Home() {
  const [results, setResults]         = useState<CaseResult[]>([]);
  const [loading, setLoading]         = useState(false);
  const [searched, setSearched]       = useState(false);
  const [error, setError]             = useState("");
  const [totalResults, setTotal]      = useState(0);
  const [correctedQuery, setCorrected] = useState("");

  const handleSearch = async (query: string) => {
    setLoading(true);
    setError("");
    setSearched(true);
    setCorrected("");

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, smart: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Search failed");
      setResults(data.results || []);
      setTotal(data.total || 0);
      if (data.corrected && data.searchedQuery) setCorrected(data.searchedQuery);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hero-bg min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">

        {/* ── Hero ── */}
        {!searched && (
          <div className="pt-16 pb-10 text-center">
            {/* Eyebrow label — floats gently */}
            <div className="fade-up float" style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              background: "#f0f4ff",
              border: "1px solid #c7d7f9",
              borderRadius: 6, padding: "5px 14px",
              fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.05em",
              textTransform: "uppercase", color: "#1e3a8a",
              marginBottom: 24,
            }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="5" stroke="#1e3a8a" strokeWidth="1.2"/>
                <path d="M6 4v3M6 8.5v.2" stroke="#1e3a8a" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              Indian Legal Research · AI Powered
            </div>

            <h1 className="slide-up" style={{
              fontFamily: "'Lora', Georgia, serif",
              fontSize: "clamp(1.9rem, 5.5vw, 3rem)",
              fontWeight: 700,
              lineHeight: 1.18,
              letterSpacing: "-0.01em",
              color: "#0f172a",
              marginBottom: 16,
              animationDelay: "0.06s",
            }}>
              Search Indian Case Law
              <br />
              <span style={{ color: "#1d4ed8", fontStyle: "italic", fontWeight: 600 }}>powered by AI</span>
            </h1>

            <p className="fade-up" style={{
              color: "#475569",
              fontSize: "0.975rem",
              lineHeight: 1.7,
              maxWidth: 460,
              margin: "0 auto 32px",
              fontWeight: 400,
              animationDelay: "0.13s",
            }}>
              Smart search handles typos, abbreviations, and partial case names.
              Get structured AI summaries and chat with any judgment.
            </p>
          </div>
        )}

        {/* ── Search ── */}
        <div className={searched ? "pt-6 pb-4" : "pb-6"}>
          <SearchBar onSearch={handleSearch} loading={loading} />
        </div>

        {/* ── Example pills (only on home) ── */}
        {!searched && !loading && (
          <div className="flex flex-wrap gap-2 justify-center pb-16 stagger" style={{ animationDelay: "0.18s" }}>
            <span className="fade-up" style={{ color: "var(--text-3)", fontSize: "0.75rem", paddingTop: 2 }}>Try:</span>
            {EXAMPLES.map((e) => (
              <button
                key={e}
                onClick={() => handleSearch(e)}
                className="btn btn-ghost fade-up"
                style={{ fontSize: "0.75rem", padding: "5px 12px" }}
              >
                {e}
              </button>
            ))}
          </div>
        )}

        {/* ── Loading skeletons ── */}
        {loading && (
          <div className="space-y-3 pb-8 fade-in">
            {[1,2,3].map(i => (
              <div key={i} className="card p-5" style={{ animationDelay: `${i*80}ms` }}>
                <div className="skeleton" style={{ height: 20, width: "70%", marginBottom: 10 }} />
                <div className="skeleton" style={{ height: 14, width: "40%", marginBottom: 14 }} />
                <div className="skeleton" style={{ height: 14, width: "90%" }} />
                <div className="skeleton" style={{ height: 14, width: "60%", marginTop: 6 }} />
              </div>
            ))}
            <p style={{ textAlign: "center", color: "var(--text-3)", fontSize: "0.8rem", paddingTop: 8 }}>
              Searching Indian legal databases…
            </p>
          </div>
        )}

        {/* ── Error ── */}
        {!loading && error && (
          <div
            className="card fade-in"
            style={{ padding: "20px", textAlign: "center", borderColor: "rgba(239,68,68,0.2)", background: "rgba(254,242,242,0.8)" }}
          >
            <p style={{ color: "#dc2626", fontWeight: 500 }}>{error}</p>
          </div>
        )}

        {/* ── No results ── */}
        {!loading && searched && !error && results.length === 0 && (
          <div className="fade-in" style={{ textAlign: "center", padding: "48px 0", color: "var(--text-2)" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
            <p style={{ fontWeight: 600, color: "var(--text-1)", marginBottom: 6 }}>No cases found</p>
            <p style={{ fontSize: "0.875rem" }}>Try different keywords — Smart Search already tried variations automatically.</p>
          </div>
        )}

        {/* ── Results ── */}
        {!loading && results.length > 0 && (
          <div className="pb-12">
            <div className="flex items-center gap-3 mb-4">
              {correctedQuery && (
                <div
                  className="fade-in"
                  style={{
                    fontSize: "0.75rem", color: "#1d4ed8",
                    background: "rgba(29,78,216,0.05)",
                    border: "1px solid rgba(29,78,216,0.15)",
                    borderRadius: 8, padding: "5px 12px",
                    display: "flex", alignItems: "center", gap: 6,
                  }}
                >
                  <span>✨</span>
                  Smart-searched: <strong>{correctedQuery}</strong>
                </div>
              )}
              <span style={{ marginLeft: "auto", color: "var(--text-3)", fontSize: "0.75rem" }}>
                {totalResults.toLocaleString()} results
              </span>
            </div>

            <div className="space-y-3">
              {results.map((c, i) => (
                <div key={c.id} className="fade-up" style={{ animationDelay: `${i * 55}ms` }}>
                  <CaseCard caseData={c} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
