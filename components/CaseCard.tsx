"use client";

import { CaseResult } from "@/app/page";
import Link from "next/link";

export default function CaseCard({ caseData }: { caseData: CaseResult }) {
  const snippet = caseData.snippet?.replace(/<[^>]*>/g, "").slice(0, 200);

  return (
    <Link href={`/case/${caseData.id}`} style={{ display: "block", textDecoration: "none" }}>
      <div className="card card-hover" style={{ padding: "16px 18px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Title */}
            <h3 style={{
              fontSize: "0.95rem", fontWeight: 600, color: "var(--text-1)",
              lineHeight: 1.4, marginBottom: 8,
              overflow: "hidden", display: "-webkit-box",
              WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
            }}>
              {caseData.title || "Untitled Case"}
            </h3>

            {/* Meta chips */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: snippet ? 10 : 0 }}>
              {caseData.court && (
                <span style={{
                  fontSize: "0.7rem", fontWeight: 500, color: "#60a5fa",
                  background: "rgba(59,130,246,0.1)",
                  border: "1px solid rgba(59,130,246,0.15)",
                  padding: "2px 8px", borderRadius: 99,
                }}>
                  {caseData.court}
                </span>
              )}
              {caseData.date && (
                <span style={{ fontSize: "0.7rem", color: "var(--text-3)", padding: "2px 0" }}>
                  {caseData.date}
                </span>
              )}
              {caseData.citation && (
                <span style={{
                  fontSize: "0.7rem", fontFamily: "monospace", fontWeight: 500,
                  color: "#fbbf24", background: "var(--accent-dim)",
                  border: "1px solid rgba(245,158,11,0.15)",
                  padding: "2px 8px", borderRadius: 99,
                }}>
                  {caseData.citation}
                </span>
              )}
            </div>

            {/* Snippet */}
            {snippet && (
              <p style={{
                fontSize: "0.8rem", color: "var(--text-2)", lineHeight: 1.6,
                overflow: "hidden", display: "-webkit-box",
                WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
              }}>
                {snippet}…
              </p>
            )}
          </div>

          {/* Arrow icon */}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
            stroke="var(--text-3)" strokeWidth="1.5" style={{ flexShrink: 0, marginTop: 3 }}>
            <path d="M3 8h10M9 4l4 4-4 4"/>
          </svg>
        </div>

        {/* Footer badges */}
        <div style={{
          marginTop: 12, paddingTop: 10,
          borderTop: "1px solid var(--border)",
          display: "flex", gap: 6, flexWrap: "wrap",
        }}>
          {[
            { icon: "✨", label: "AI Summary", color: "#34d399", bg: "rgba(16,185,129,0.08)" },
            { icon: "💬", label: "Chat",       color: "#60a5fa", bg: "rgba(59,130,246,0.08)" },
            { icon: "📄", label: "Full Text",  color: "var(--text-3)", bg: "transparent" },
          ].map(b => (
            <span key={b.label} style={{
              fontSize: "0.68rem", fontWeight: 600, color: b.color,
              background: b.bg, padding: "3px 8px", borderRadius: 99,
              display: "flex", alignItems: "center", gap: 3,
            }}>
              {b.icon} {b.label}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
