"use client";

import { CaseResult } from "@/app/page";
import Link from "next/link";

export default function CaseCard({ caseData }: { caseData: CaseResult }) {
  const snippet = caseData.snippet?.replace(/<[^>]*>/g, "").slice(0, 220);

  return (
    <Link href={`/case/${caseData.id}`} style={{ display: "block", textDecoration: "none" }}>
      <div className="card card-hover case-card" style={{ padding: "16px 18px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>

            {/* Title */}
            <h3 style={{
              fontSize: "0.95rem", fontWeight: 600,
              color: "#0f172a", lineHeight: 1.4, marginBottom: 9,
              overflow: "hidden", display: "-webkit-box",
              WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
            }}>
              {caseData.title || "Untitled Case"}
            </h3>

            {/* Meta row */}
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6, marginBottom: snippet ? 10 : 0 }}>
              {caseData.court && (
                <span style={{
                  fontSize: "0.7rem", fontWeight: 600,
                  color: "#7c3aed", background: "#f5f0ff",
                  border: "1px solid #ddd6fe",
                  padding: "2px 9px", borderRadius: 99,
                }}>
                  {caseData.court}
                </span>
              )}
              {caseData.citation && (
                <span style={{
                  fontSize: "0.68rem", fontFamily: "monospace", fontWeight: 500,
                  color: "#475569", background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  padding: "2px 9px", borderRadius: 99,
                }}>
                  {caseData.citation}
                </span>
              )}
              {caseData.date && (
                <span style={{ fontSize: "0.7rem", color: "#94a3b8" }}>{caseData.date}</span>
              )}
            </div>

            {/* Snippet */}
            {snippet && (
              <p style={{
                fontSize: "0.8rem", color: "#64748b",
                lineHeight: 1.65, overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
              }}>
                {snippet}
              </p>
            )}
          </div>

          {/* Arrow — animated via .case-card:hover .card-arrow */}
          <div className="card-arrow">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
              stroke="#94a3b8" strokeWidth="1.6" strokeLinecap="round">
              <path d="M2 6h8M7 3l3 3-3 3"/>
            </svg>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          marginTop: 12, paddingTop: 10,
          borderTop: "1px solid #f1f5f9",
          display: "flex", gap: 10, alignItems: "center",
        }}>
          <span style={{ fontSize: "0.7rem", color: "#94a3b8", fontWeight: 500 }}>
            AI Summary available
          </span>
          <span style={{ fontSize: "0.7rem", color: "#94a3b8" }}>·</span>
          <span style={{ fontSize: "0.7rem", color: "#94a3b8", fontWeight: 500 }}>
            Chat with judgment
          </span>
          <span style={{ marginLeft: "auto", fontSize: "0.68rem", color: "#ddd6fe", fontWeight: 600, letterSpacing: "0.02em" }}>
            OPEN →
          </span>
        </div>
      </div>
    </Link>
  );
}
