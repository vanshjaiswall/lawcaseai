"use client";

interface Props { summary: string; loading: boolean; }

const SECTION_STYLES: Record<string, { cls: string; icon: string }> = {
  FACTS:     { cls: "section-facts",     icon: "📋" },
  JUDGMENT:  { cls: "section-judgment",  icon: "⚖️" },
  REASONING: { cls: "section-reasoning", icon: "🔍" },
  KEY:       { cls: "section-key",       icon: "⭐" },
  RELEVANT:  { cls: "section-statutes",  icon: "📜" },
};

function getSectionStyle(title: string) {
  const up = title.toUpperCase();
  for (const [k, v] of Object.entries(SECTION_STYLES)) {
    if (up.includes(k)) return v;
  }
  return { cls: "section-statutes", icon: "📄" };
}

function InlineMd({ text }: { text: string }) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1
          ? <strong key={i} style={{ color: "var(--text-1)", fontWeight: 600 }}>{p}</strong>
          : p
      )}
    </>
  );
}

function renderMd(text: string) {
  return text.split("\n").map((line, i) => {
    if (line.startsWith("## ")) {
      const content = line.slice(3);
      const { cls, icon } = getSectionStyle(content);
      return (
        <div key={i} className={`section-header ${cls}`}>
          <span>{icon}</span>
          {content}
        </div>
      );
    }
    if (line.startsWith("### ")) {
      return (
        <p key={i} style={{ fontWeight: 600, color: "var(--text-1)", marginTop: 12, marginBottom: 4, fontSize: "0.875rem" }}>
          {line.slice(4)}
        </p>
      );
    }
    if (line.startsWith("- ") || line.startsWith("* ")) {
      return (
        <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6, paddingLeft: 4 }}>
          <span style={{ color: "var(--accent)", flexShrink: 0, lineHeight: 1.6 }}>•</span>
          <span style={{ color: "var(--text-2)", fontSize: "0.875rem", lineHeight: 1.65 }}>
            <InlineMd text={line.slice(2)} />
          </span>
        </div>
      );
    }
    const num = line.match(/^(\d+)\.\s(.+)/);
    if (num) {
      return (
        <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6, paddingLeft: 4 }}>
          <span style={{ color: "var(--accent)", flexShrink: 0, fontWeight: 700, fontSize: "0.8rem", minWidth: 18, lineHeight: 1.65 }}>
            {num[1]}.
          </span>
          <span style={{ color: "var(--text-2)", fontSize: "0.875rem", lineHeight: 1.65 }}>
            <InlineMd text={num[2]} />
          </span>
        </div>
      );
    }
    if (!line.trim()) return <div key={i} style={{ height: 6 }} />;
    return (
      <p key={i} style={{ color: "var(--text-2)", fontSize: "0.875rem", lineHeight: 1.65, marginBottom: 4 }}>
        <InlineMd text={line} />
      </p>
    );
  });
}

export default function CaseSummary({ summary, loading }: Props) {
  if (loading) {
    return (
      <div className="card" style={{ padding: "40px 24px", textAlign: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 32 }}>
            {[20,28,18,24,16].map((h, i) => (
              <div key={i} style={{
                width: 4, borderRadius: 99,
                background: i % 2 === 0 ? "var(--accent)" : "var(--bg-4)",
                animation: `pulse 1s ease-in-out ${i * 0.12}s infinite`,
                height: h,
              }} />
            ))}
          </div>
          <p style={{ color: "var(--text-1)", fontWeight: 600, fontSize: "0.9rem" }}>Analyzing judgment…</p>
          <p style={{ color: "var(--text-3)", fontSize: "0.78rem" }}>
            Extracting Facts · Judgment · Reasoning · Key Points
          </p>
          <div style={{ width: "100%", maxWidth: 380, display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
            {[90,70,80,55,75].map((w, i) => (
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
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 16, paddingBottom: 14, borderBottom: "1px solid var(--border)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span>✨</span>
          <span style={{ fontWeight: 600, color: "var(--text-1)", fontSize: "0.9rem" }}>AI Case Summary</span>
        </div>
        <span style={{
          fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase",
          color: "#34d399", background: "rgba(16,185,129,0.1)",
          border: "1px solid rgba(16,185,129,0.15)",
          padding: "3px 9px", borderRadius: 99,
        }}>
          Groq · LLaMA 3.3
        </span>
      </div>
      <div>{renderMd(summary)}</div>
    </div>
  );
}
