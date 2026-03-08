"use client";

interface Props { summary: string; loading: boolean; }

const SECTIONS: Record<string, { bg: string; border: string; color: string; label: string }> = {
  FACTS:     { bg: "#eff6ff", border: "#bfdbfe", color: "#1d4ed8", label: "Facts" },
  JUDGMENT:  { bg: "#f0fdf4", border: "#bbf7d0", color: "#15803d", label: "Judgment" },
  REASONING: { bg: "#faf5ff", border: "#e9d5ff", color: "#7c3aed", label: "Reasoning" },
  KEY:       { bg: "#fffbeb", border: "#fde68a", color: "#92400e", label: "Key Points" },
  RELEVANT:  { bg: "#f8fafc", border: "#e2e8f0", color: "#475569", label: "Statutes" },
};

function getSectionStyle(title: string) {
  const up = title.toUpperCase();
  for (const [k, v] of Object.entries(SECTIONS)) {
    if (up.includes(k)) return v;
  }
  return SECTIONS.RELEVANT;
}

function InlineMd({ text }: { text: string }) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return <>
    {parts.map((p, i) =>
      i % 2 === 1
        ? <strong key={i} style={{ color: "#0f172a", fontWeight: 600 }}>{p}</strong>
        : p
    )}
  </>;
}

function renderMd(text: string) {
  return text.split("\n").map((line, i) => {
    if (line.startsWith("## ")) {
      const content = line.slice(3);
      const s = getSectionStyle(content);
      return (
        <div key={i} style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "6px 12px", borderRadius: 7,
          background: s.bg, border: `1px solid ${s.border}`,
          color: s.color, fontWeight: 600,
          fontSize: "0.72rem", letterSpacing: "0.06em",
          textTransform: "uppercase",
          margin: "18px 0 10px",
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: "50%",
            background: s.color, flexShrink: 0,
          }} />
          {content}
        </div>
      );
    }
    if (line.startsWith("### ")) {
      return (
        <p key={i} style={{ fontWeight: 600, color: "#0f172a", marginTop: 10, marginBottom: 3, fontSize: "0.875rem" }}>
          {line.slice(4)}
        </p>
      );
    }
    if (line.startsWith("- ") || line.startsWith("* ")) {
      return (
        <div key={i} style={{ display: "flex", gap: 9, marginBottom: 6, paddingLeft: 2 }}>
          <span style={{ color: "#1d4ed8", flexShrink: 0, lineHeight: 1.65, fontWeight: 700, fontSize: "0.75rem" }}>•</span>
          <span style={{ color: "#475569", fontSize: "0.875rem", lineHeight: 1.7 }}>
            <InlineMd text={line.slice(2)} />
          </span>
        </div>
      );
    }
    const num = line.match(/^(\d+)\.\s(.+)/);
    if (num) {
      return (
        <div key={i} style={{ display: "flex", gap: 9, marginBottom: 6, paddingLeft: 2 }}>
          <span style={{ color: "#1d4ed8", flexShrink: 0, fontWeight: 700, fontSize: "0.78rem", minWidth: 18, lineHeight: 1.7 }}>
            {num[1]}.
          </span>
          <span style={{ color: "#475569", fontSize: "0.875rem", lineHeight: 1.7 }}>
            <InlineMd text={num[2]} />
          </span>
        </div>
      );
    }
    if (!line.trim()) return <div key={i} style={{ height: 5 }} />;
    return (
      <p key={i} style={{ color: "#475569", fontSize: "0.875rem", lineHeight: 1.7, marginBottom: 3 }}>
        <InlineMd text={line} />
      </p>
    );
  });
}

export default function CaseSummary({ summary, loading }: Props) {
  if (loading) {
    return (
      <div className="card" style={{ padding: "36px 24px" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, textAlign: "center" }}>
          <div className="bar-vis">
            <span style={{ height: 18 }}/>
            <span/>
            <span style={{ height: 14 }}/>
            <span/>
            <span style={{ height: 20 }}/>
          </div>
          <div>
            <p style={{ fontWeight: 600, color: "#0f172a", fontSize: "0.9rem", marginBottom: 4 }}>
              Analyzing judgment…
            </p>
            <p style={{ color: "#94a3b8", fontSize: "0.77rem" }}>
              Extracting facts · judgment · reasoning · key points
            </p>
          </div>
          <div style={{ width: "100%", maxWidth: 360, display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
            {[85, 65, 78, 50, 70].map((w, i) => (
              <div key={i} className="skeleton" style={{ height: 11, width: `${w}%`, borderRadius: 6 }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="card fade-in" style={{ padding: "20px 22px" }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 16, paddingBottom: 14, borderBottom: "1px solid #f1f5f9",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: "#eff6ff", border: "1px solid #bfdbfe",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1.5C4 1.5 1.5 4 1.5 7S4 12.5 7 12.5 12.5 10 12.5 7 10 1.5 7 1.5z" stroke="#1d4ed8" strokeWidth="1.2"/>
              <path d="M7 5v3.5M7 10v.2" stroke="#1d4ed8" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          </div>
          <span style={{ fontWeight: 600, color: "#0f172a", fontSize: "0.9rem" }}>AI Case Summary</span>
        </div>
        <span style={{
          fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.04em",
          textTransform: "uppercase", color: "#15803d",
          background: "#f0fdf4", border: "1px solid #bbf7d0",
          padding: "3px 9px", borderRadius: 99,
        }}>
          Groq · LLaMA 3.3
        </span>
      </div>

      <div>{renderMd(summary)}</div>
    </div>
  );
}
