"use client";

import { useState, useRef } from "react";
import { COURTS, CATEGORIES, buildSearchQuery } from "@/lib/constants";

interface Props {
  onSearch: (q: string) => void;
  loading: boolean;
  onUploadResult?: (result: { summary: string; fileName: string }) => void;
}

const TYPES = [
  { value: "smart",    label: "Smart Search", hint: "Typos, abbreviations, partial names" },
  { value: "casename", label: "Case Name",    hint: "Maneka Gandhi v Union of India" },
  { value: "citation", label: "Citation",     hint: "AIR 1973 SC 1461 · (2017) 10 SCC 1" },
  { value: "statute",  label: "Statute",      hint: "Section 302 IPC · Article 21" },
  { value: "judge",    label: "Judge",        hint: "Justice D.Y. Chandrachud" },
];

const SELECT_STYLE: React.CSSProperties = {
  background: "#fff",
  border: "1.5px solid #e2e8f0",
  color: "#0f172a",
  borderRadius: 8,
  padding: "9px 32px 9px 12px",
  fontSize: "0.84rem",
  outline: "none",
  width: "100%",
  fontFamily: "'DM Sans', inherit",
  cursor: "pointer",
  appearance: "none",
  WebkitAppearance: "none",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%2394a3b8' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 12px center",
  transition: "border-color 0.15s, box-shadow 0.15s",
};

const LABEL_STYLE: React.CSSProperties = {
  display: "block",
  fontSize: "0.68rem",
  color: "#94a3b8",
  fontWeight: 600,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  marginBottom: 6,
};

export default function SearchBar({ onSearch, loading, onUploadResult }: Props) {
  const [query,        setQuery]        = useState("");
  const [type,         setType]         = useState("smart");
  const [court,        setCourt]        = useState("");
  const [category,     setCategory]     = useState("");
  const [yearFrom,     setYearFrom]     = useState("");
  const [yearTo,       setYearTo]       = useState("");
  const [showFilter,   setShowFilter]   = useState(false);
  const [uploading,    setUploading]    = useState(false);
  const [uploadError,  setUploadError]  = useState("");
  const inputRef  = useRef<HTMLInputElement>(null);
  const fileRef   = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError("");
    try {
      const form = new FormData();
      form.append("file", file);
      const res  = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      onUploadResult?.({ summary: data.summary, fileName: data.fileName });
    } catch (err: any) {
      setUploadError(err.message || "Failed to analyse file");
    } finally {
      setUploading(false);
      // Reset so same file can be re-uploaded
      if (fileRef.current) fileRef.current.value = "";
    }
  };

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

  return (
    <form onSubmit={submit}>
      {/* Card wrapper */}
      <div style={{
        background: "#fff",
        border: "1.5px solid #e2e8f0",
        borderRadius: 14,
        boxShadow: "0 2px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)",
        overflow: "hidden",
        transition: "box-shadow 0.2s",
      }}>

        {/* Type selector strip */}
        <div style={{
          display: "flex",
          gap: 0,
          borderBottom: "1.5px solid #f1f5f9",
          overflowX: "auto",
          scrollbarWidth: "none",
          padding: "10px 12px 0",
          background: "#f8fafc",
        }}>
          {TYPES.map(t => (
            <button
              key={t.value}
              type="button"
              onClick={() => { setType(t.value); inputRef.current?.focus(); }}
              style={{
                padding: "7px 14px",
                fontSize: "0.8rem",
                fontWeight: type === t.value ? 600 : 500,
                cursor: "pointer",
                border: "none",
                background: "none",
                whiteSpace: "nowrap",
                fontFamily: "'DM Sans', inherit",
                transition: "color 0.15s",
                color: type === t.value ? "#1d4ed8" : "#64748b",
                borderBottom: type === t.value ? "2px solid #1d4ed8" : "2px solid transparent",
                marginBottom: -1.5,
                paddingBottom: 9,
                outline: "none",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Main input area */}
        <div style={{ padding: "12px 14px", display: "flex", gap: 8, alignItems: "center" }}>
          {/* Hidden file input */}
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt,.md"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />

          <div style={{ flex: 1, position: "relative" }}>
            <input
              ref={inputRef}
              className="input"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={activeHint}
              style={{
                width: "100%",
                padding: "11px 14px",
                borderRadius: 9,
                fontSize: "0.95rem",
                border: "1.5px solid #e2e8f0",
              }}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              autoCapitalize="off"
              enterKeyHint="search"
            />
          </div>

          {/* Upload button */}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading || loading}
            title="Upload a PDF or Word doc for AI analysis"
            style={{
              width: 42, height: 42, borderRadius: 9, flexShrink: 0,
              background: "#f8fafc", border: "1.5px solid #e2e8f0",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", transition: "all 0.15s",
              color: "#64748b",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = "#eff6ff";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#93c5fd";
              (e.currentTarget as HTMLButtonElement).style.color = "#1d4ed8";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = "#f8fafc";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#e2e8f0";
              (e.currentTarget as HTMLButtonElement).style.color = "#64748b";
            }}
          >
            {uploading
              ? <span className="spinner" style={{ width: 15, height: 15 }} />
              : (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12h10M8 3v7M5 6l3-3 3 3"/>
                </svg>
              )
            }
          </button>

          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="btn btn-primary"
            style={{ padding: "0 20px", height: 42, fontSize: "0.9rem", borderRadius: 9, minWidth: 80 }}
          >
            {loading
              ? <span className="spinner" style={{ width: 16, height: 16 }} />
              : <>
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <circle cx="6.5" cy="6.5" r="4.5"/><path d="M10 10l3 3"/>
                  </svg>
                  Search
                </>
            }
          </button>
        </div>

        {/* Upload error */}
        {uploadError && (
          <div style={{
            margin: "0 14px 10px",
            padding: "8px 12px",
            background: "rgba(254,242,242,0.9)",
            border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: 8,
            fontSize: "0.78rem",
            color: "#dc2626",
          }}>
            {uploadError}
          </div>
        )}

        {/* Filter bar */}
        <div style={{
          padding: "0 14px 11px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          borderTop: "1px solid #f1f5f9",
          paddingTop: 10,
        }}>
          <button
            type="button"
            onClick={() => setShowFilter(v => !v)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: showFilter ? "#eff6ff" : "none",
              border: showFilter ? "1.5px solid #bfdbfe" : "1.5px solid transparent",
              cursor: "pointer",
              color: showFilter ? "#1d4ed8" : "#64748b",
              fontSize: "0.78rem",
              fontWeight: 500,
              padding: "4px 10px",
              borderRadius: 6,
              transition: "all 0.14s",
              fontFamily: "'DM Sans', inherit",
            }}
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <line x1="1" y1="3.5" x2="12" y2="3.5"/>
              <line x1="3" y1="6.5" x2="10" y2="6.5"/>
              <line x1="5" y1="9.5" x2="8"  y2="9.5"/>
            </svg>
            Filters
            {hasFilters && (
              <span style={{
                background: "#1d4ed8", color: "#fff",
                borderRadius: 99, fontSize: "0.6rem",
                fontWeight: 700, padding: "1px 6px",
              }}>
                {[court,category,yearFrom,yearTo].filter(Boolean).length}
              </span>
            )}
          </button>

          {hasFilters && (
            <button
              type="button"
              onClick={() => { setCourt(""); setCategory(""); setYearFrom(""); setYearTo(""); }}
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: "#94a3b8", fontSize: "0.75rem",
                fontFamily: "'DM Sans', inherit",
                padding: "4px 6px", borderRadius: 6,
                transition: "color 0.14s",
              }}
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Filter panel — slides down */}
      {showFilter && (
        <div className="slide-down card" style={{ padding: 16, marginTop: 8, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={LABEL_STYLE}>Court</label>
            <select value={court} onChange={e => setCourt(e.target.value)} style={SELECT_STYLE}>
              {COURTS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label style={LABEL_STYLE}>Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} style={SELECT_STYLE}>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label style={LABEL_STYLE}>From Year</label>
            <select value={yearFrom} onChange={e => setYearFrom(e.target.value)} style={SELECT_STYLE}>
              <option value="">Any</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label style={LABEL_STYLE}>To Year</label>
            <select value={yearTo} onChange={e => setYearTo(e.target.value)} style={SELECT_STYLE}>
              <option value="">Any</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
      )}
    </form>
  );
}
