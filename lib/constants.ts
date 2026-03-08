export const COURTS = [
  { value: "", label: "All Courts" },
  { value: "supremecourt", label: "Supreme Court of India" },
  { value: "allahabad", label: "Allahabad High Court" },
  { value: "andhra", label: "Andhra Pradesh High Court" },
  { value: "bombay", label: "Bombay High Court" },
  { value: "calcutta", label: "Calcutta High Court" },
  { value: "chhattisgarh", label: "Chhattisgarh High Court" },
  { value: "delhi", label: "Delhi High Court" },
  { value: "gauhati", label: "Gauhati High Court" },
  { value: "gujarat", label: "Gujarat High Court" },
  { value: "himachal", label: "Himachal Pradesh High Court" },
  { value: "jharkhand", label: "Jharkhand High Court" },
  { value: "jammu", label: "Jammu & Kashmir High Court" },
  { value: "karnataka", label: "Karnataka High Court" },
  { value: "kerala", label: "Kerala High Court" },
  { value: "madhyapradesh", label: "Madhya Pradesh High Court" },
  { value: "madras", label: "Madras High Court" },
  { value: "manipur", label: "Manipur High Court" },
  { value: "meghalaya", label: "Meghalaya High Court" },
  { value: "orissa", label: "Orissa High Court" },
  { value: "patna", label: "Patna High Court" },
  { value: "punjab", label: "Punjab & Haryana High Court" },
  { value: "rajasthan", label: "Rajasthan High Court" },
  { value: "sikkim", label: "Sikkim High Court" },
  { value: "telangana", label: "Telangana High Court" },
  { value: "tripura", label: "Tripura High Court" },
  { value: "uttarakhand", label: "Uttarakhand High Court" },
];

export const CATEGORIES = [
  { value: "", label: "All Categories" },
  { value: "constitutional", label: "Constitutional Law" },
  { value: "criminal", label: "Criminal Law" },
  { value: "civil", label: "Civil Law" },
  { value: "corporate", label: "Corporate / Company Law" },
  { value: "tax", label: "Tax Law" },
  { value: "labour", label: "Labour & Employment" },
  { value: "family", label: "Family Law" },
  { value: "property", label: "Property Law" },
  { value: "ipr", label: "Intellectual Property" },
  { value: "environmental", label: "Environmental Law" },
  { value: "arbitration", label: "Arbitration & ADR" },
  { value: "banking", label: "Banking & Finance" },
  { value: "consumer", label: "Consumer Protection" },
  { value: "cyber", label: "Cyber / IT Law" },
  { value: "human_rights", label: "Human Rights" },
];

export const SEARCH_TYPES = [
  { value: "smart", label: "Smart Search (AI)", icon: "✨" },
  { value: "freetext", label: "Free Text", icon: "🔍" },
  { value: "casename", label: "Case Name / Title", icon: "📋" },
  { value: "citation", label: "Citation (AIR, SCC, etc.)", icon: "📎" },
  { value: "statute", label: "Act / Section", icon: "📜" },
  { value: "judge", label: "Judge Name", icon: "⚖️" },
];

// Common misspellings and abbreviations in Indian legal context
const LEGAL_CORRECTIONS: Record<string, string> = {
  // Case name typos
  kesvananda: "kesavananda",
  keshavananda: "kesavananda",
  keshvananda: "kesavananda",
  bharti: "bharati",
  bharthi: "bharati",
  menka: "maneka",
  vishaka: "vishakha",
  vishakah: "vishakha",
  golaknath: "golak nath",
  golakhnath: "golak nath",
  minerva: "minerva mills",
  navtej: "navtej singh johar",
  puttuswamy: "puttaswamy",

  // Common abbreviations
  sc: "supreme court",
  hc: "high court",
  ipc: "indian penal code",
  crpc: "criminal procedure code",
  cpc: "civil procedure code",
  coa: "court of appeal",
  scc: "supreme court cases",
  air: "all india reporter",
  art: "article",
  sec: "section",
  ndps: "narcotic drugs and psychotropic substances",
  pocso: "protection of children from sexual offences",
  fir: "first information report",
  nia: "national investigation agency",
  nclt: "national company law tribunal",
  nclat: "national company law appellate tribunal",
  rera: "real estate regulatory authority",
  rbi: "reserve bank of india",
  sebi: "securities and exchange board of india",
  gst: "goods and services tax",
  rti: "right to information",
  pil: "public interest litigation",

  // Legal terms people misspell
  judgement: "judgment",
  habeus: "habeas",
  certorari: "certiorari",
  mandamous: "mandamus",
  injuction: "injunction",
  aquital: "acquittal",
  aquitted: "acquitted",
  bailable: "bailable",
  cognizable: "cognizable",
  cognisable: "cognizable",
};

// Normalize and fix common typos in queries
export function normalizeQuery(raw: string): string {
  let q = raw.trim().toLowerCase();

  // Replace known misspellings
  for (const [wrong, right] of Object.entries(LEGAL_CORRECTIONS)) {
    const regex = new RegExp(`\\b${wrong}\\b`, "gi");
    q = q.replace(regex, right);
  }

  return q;
}

// Generate multiple search query variations for fuzzy matching
export function generateQueryVariations(query: string): string[] {
  const normalized = normalizeQuery(query);
  const variations: string[] = [query]; // always include original

  // Add normalized version
  if (normalized !== query.toLowerCase()) {
    variations.push(normalized);
  }

  // If the query has "v" or "vs" or "versus", normalize the separator
  const vsNormalized = normalized
    .replace(/\bvs\.?\b/gi, "v.")
    .replace(/\bversus\b/gi, "v.");
  if (vsNormalized !== normalized) {
    variations.push(vsNormalized);
  }

  // Try removing "v." entirely to just search both party names
  const withoutVs = normalized.replace(/\s*v\.?\s*/gi, " ").replace(/\s+/g, " ").trim();
  if (withoutVs !== normalized) {
    variations.push(withoutVs);
  }

  // Try individual key words (for very misspelled queries, at least get partial matches)
  const words = normalized.split(/\s+/).filter((w) => w.length > 3);
  if (words.length > 1) {
    // Try just the first significant word (usually a party name)
    variations.push(words[0]);
    // Try first two words
    if (words.length > 2) {
      variations.push(words.slice(0, 2).join(" "));
    }
  }

  // Remove duplicates
  return [...new Set(variations)];
}

export function buildSearchQuery(params: {
  query: string;
  searchType: string;
  court: string;
  category: string;
  yearFrom: string;
  yearTo: string;
}): string {
  let q = params.query.trim();

  // For smart search, just pass through — the API route handles the magic
  if (params.searchType === "smart") {
    // Normalize query but don't add structural prefixes
    q = normalizeQuery(q);
  } else {
    // Wrap query based on search type for precision
    switch (params.searchType) {
      case "casename":
        q = `title:(${normalizeQuery(q)})`;
        break;
      case "citation":
        q = `"${q}"`;
        break;
      case "statute":
        q = `act:(${normalizeQuery(q)})`;
        break;
      case "judge":
        q = `author:(${normalizeQuery(q)})`;
        break;
      default:
        q = normalizeQuery(q);
        break;
    }
  }

  // Append court filter
  if (params.court) {
    q += ` doctypes:${params.court}`;
  }

  // Append year range
  if (params.yearFrom) {
    q += ` fromdate:1-1-${params.yearFrom}`;
  }
  if (params.yearTo) {
    q += ` todate:31-12-${params.yearTo}`;
  }

  return q;
}
