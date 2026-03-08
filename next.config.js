/** @type {import('next').NextConfig} */
const nextConfig = {
  // Treat these as Node.js-only packages — don't bundle them for the edge
  serverExternalPackages: ["pdf-parse", "mammoth"],
  // Allow fetching from Indian Kanoon
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, POST, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type" },
        ],
      },
    ];
  },
  // Disable strict mode to avoid double-fetching in dev
  reactStrictMode: false,
};

module.exports = nextConfig;
