import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LawCase AI — Indian Legal Research",
  description: "AI-powered Indian case law research. Smart search with typo tolerance, AI summaries, and interactive case chat.",
  themeColor: "#09090e",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap"
          rel="stylesheet"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body>
        {/* Nav */}
        <header
          style={{
            background: "rgba(9,9,14,0.85)",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            position: "sticky",
            top: 0,
            zIndex: 50,
          }}
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2.5 group">
              <div
                style={{
                  width: 34, height: 34,
                  background: "linear-gradient(135deg, #f59e0b, #d97706)",
                  borderRadius: 10,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 800, fontSize: 17, color: "#000",
                  boxShadow: "0 0 16px rgba(245,158,11,0.3)",
                  transition: "box-shadow 0.2s",
                }}
              >
                §
              </div>
              <span style={{ fontFamily: "Playfair Display, serif", fontWeight: 700, fontSize: 18, color: "#eeeef5", letterSpacing: "-0.01em" }}>
                LawCase <span style={{ color: "#f59e0b" }}>AI</span>
              </span>
            </a>

            <div className="flex items-center gap-3">
              <span
                style={{
                  fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.06em",
                  textTransform: "uppercase", color: "#55556a",
                  display: "none",
                }}
                className="sm:block"
              >
                Indian Legal Research
              </span>
              <a
                href="https://indiankanoon.org"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: "0.75rem", color: "#9090a8",
                  padding: "5px 12px",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 8,
                  textDecoration: "none",
                  transition: "all 0.15s",
                }}
              >
                Indian Kanoon ↗
              </a>
            </div>
          </div>
        </header>

        <main>{children}</main>
      </body>
    </html>
  );
}
