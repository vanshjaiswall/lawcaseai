import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LawCase AI — Indian Legal Research",
  description: "AI-powered Indian case law research. Smart search with typo tolerance, AI summaries, and interactive case chat.",
  themeColor: "#ffffff",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap"
          rel="stylesheet"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body>
        {/* Nav */}
        <header style={{
          background: "rgba(255,255,255,0.94)",
          borderBottom: "1px solid #e8dff8",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}>
          <div style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "0 20px",
            height: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}>

            {/* Logo — clean wordmark */}
            <a href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
              {/* Icon mark — scales on nav hover via .logo-mark */}
              <div className="logo-mark" style={{
                width: 30, height: 30,
                background: "linear-gradient(135deg, #7c3aed 0%, #db2777 100%)",
                borderRadius: 6,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <path d="M2 3h11M2 7h8M2 11h6" stroke="#fff" strokeWidth="1.7" strokeLinecap="round"/>
                </svg>
              </div>
              {/* Wordmark */}
              <span style={{
                fontFamily: "'Times New Roman', Times, serif",
                fontWeight: 700,
                fontSize: 17,
                color: "#1a0a2e",
                letterSpacing: "-0.01em",
              }}>
                LawCase<span style={{
                  background: "linear-gradient(135deg, #7c3aed, #db2777)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  fontWeight: 600,
                }}> AI</span>
              </span>
            </a>

            {/* Right side */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{
                fontSize: "0.7rem",
                fontWeight: 500,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: "#a896c8",
              }} className="hidden sm:block">
                Indian Courts · AI Powered
              </span>
            </div>
          </div>
        </header>

        <main>{children}</main>
      </body>
    </html>
  );
}
