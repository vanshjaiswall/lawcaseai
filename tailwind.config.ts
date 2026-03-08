import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          1: "#09090e",
          2: "#0f0f17",
          3: "#16161f",
          4: "#1c1c28",
        },
        border: "rgba(255,255,255,0.07)",
        accent: "#f59e0b",
        t1: "#eeeef5",
        t2: "#9090a8",
        t3: "#55556a",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Playfair Display", "serif"],
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "20px",
      },
      animation: {
        "fade-up": "fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both",
        "fade-in": "fadeIn 0.25s ease both",
        "spin-fast": "spin 0.7s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
