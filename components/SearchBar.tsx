"use client";

import { useState, useRef } from "react";
import { COURTS, CATEGORIES, buildSearchQuery } from "@/lib/constants";

interface Props { onSearch: (q: string) => void; loading: boolean; }

const TYPES = [
  { value: "smart",    label: "Smart",    icon: "✨", hint: "Typos, abbrevs, partial names — just type" },
  { value: "casename", label: "Case Name",icon: "📋", hint: "Exact or partial case title" },
  { value: "citation", label: "Citation", icon: "📎", hint: "AIR 1973 SC 1461 or (2017) 10 SCC 1" },
  { value: "statute",  label: "Statute",  icon: "📜", hint: "Section 302 IPC, Article 21" },
  { value: "judge",    label: "Judge",    icon: "⚖️", hint: "Justice D.Y. Chandrachud" },
];

export default function SearchBar({ onSearch, loading }: Props) {
  const [query,      setQuery]      = useState("");
  const [type,       setType]       = useState("smart");
  const [court,      setCourt]      = useState("");
  const [category,   setCategory]   = useState("");
  const [yearFrom,   setYearFrom]   = useState("");
  const [yearTo,     setYearTo]     = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = (e?: React.FormEvent, overrideQuery?: string) => {
    e?.preventDefault();
    const q = (overrideQuery ?? query).trim();
    if (!q) return;
    onSearch(buildSearchQuery({ query: q, searchType: type, court, category, yearFrom, yearTo }));
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 75 }, (_, i) => currentYear - i);
  const activeHint = TYPES.find(t => t.value === type)?.hint ?? "";
  const hasFilters = !!(court || category || yearFrom || yearTo);

  const selectStyle: React.CSSProperties = {
    background: "var(--bg-4)",
    border: "1px solid var(--border)",
    color: "var(--text-1)",
    borderRadius: 8,
    padding: "8px 10px",
    fontSize: "0.82rem",
    outline: "none",
    width: "100%",
    fontFamily: "inherit",
    cursor: "pointer",
    appearance: "none",
    WebkitAppearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%2355556a' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 10px center",
    paddingRight: 28,
  };

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>

      {/* Type chip row */}
      <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2, scrollbarWidth: "none" }}>
        {TYPES.map(t => (
          <button
            key={t.value}
            type="button"
            onClick={() => { setType(t.value); inputRef.current?.focus(); }}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "6px 13px",
              borderRadius: 99,
              fontSize: "0.78rem", fontWeight: 500,
              whiteSpace: "nowrap", cursor: "pointer",
              border: "1px solid",
              transition: "all 0.15s",
              ...(type === t.value
                ? { background: "var(--accent-dim)", borderColor: "rgba(245,158,11,0.3)", color: "#fbbf24" }
                : { background: "transparent", borderColor: "var(--border)", color: "var(--text-2)" }
              ),
            }}
          >
            <span style={{ fontSize: "0.85rem" }}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Main input row */}
      <div style={{ display: "flex", gap: 8, alignItems: "stretch" }}>
        <div style={{ flex: 1, position: "relative" }}>
          <input
            ref={inputRef}
            className="input"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={activeHint}
            style={{
              width: "100%",
              padding: "13px 16px",
              borderRadius: 12,
              fontSize: "0.95rem",
            }}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
        </div>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="btn btn-primary"
          style={{ padding: "0 22px", fontSize: "0.9rem", borderRadius: 12, minWidth: 88 }}
        >
          {loading
            ? <span className="spinner" style={{ width: 16, height: 16 }} />
            : "Search"
          }
        </button>
      </div>

      {/* Filter toggle */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button
          type="button"
          onClick={() => setShowFilter(v => !v)}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "none", border: "none", cursor: "pointer",
            color: "var(--text-3)", fontSize: "0.78rem", padding: 0,
            transition: "color 0.15s",
          }}
          onMouseEnter={e => (e.currentTarget.style.color = "var(--text-2)")}
          onMouseLeave={e => (e.currentTarget.style.color = "var(--text-3)")}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="2" y1="4" x2="12" y2="4"/><line x1="4" y1="7" x2="10" y2="7"/><line x1="6" y1="10" x2="8" y2="10"/>
          </svg>
          Filters
          {hasFilters && (
            <span style={{
              background: "var(--accent)", color: "#000", borderRadius: 99,
              fontSize: "0.65rem", fontWeight: 700, padding: "1px 6px",
            }}>ON</span>
          )}
        </button>

        {hasFilters && (
          <button
            type="button"
            onClick={() => { setCourt(""); setCategory(""); setYearFrom(""); setYearTo(""); }}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", fontSize: "0.72rem" }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Filter panel */}
      {showFilter && (
        <div
          className="card fade-in"
          style={{ padding: "16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
        >
          <div>
            <label style={{ display: "block", fontSize: "0.7rem", color: "var(--text-3)", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 6 }}>Court</label>
            <select value={court} onChange={e => setCourt(e.target.value)} style={selectStyle}>
              {COURTS.map(c => <option key={c.value} value={c.value} style={{ background: "#16161f" }}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.7rem", color: "var(--text-3)", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 6 }}>Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} style={selectStyle}>
              {CATEGORIES.map(c => <option key={c.value} value={c.value} style={{ background: "#16161f" }}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.7rem", color: "var(--text-3)", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 6 }}>From Year</label>
            <select value={yearFrom} onChange={e => setYearFrom(e.target.value)} style={selectStyle}>
              <option value="" style={{ background: "#16161f" }}>Any</option>
              {years.map(y => <option key={y} value={y} style={{ background: "#16161f" }}>{y}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.7rem", color: "var(--text-3)", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 6 }}>To Year</label>
            <select value={yearTo} onChange={e => setYearTo(e.target.value)} style={selectStyle}>
              <option value="" style={{ background: "#16161f" }}>Any</option>
              {years.map(y => <option key={y} value={y} style={{ background: "#16161f" }}>{y}</option>)}
            </select>
          </div>
        </div>
      )}
    </form>
  );
}
