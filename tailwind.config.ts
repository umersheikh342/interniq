import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand Color System
        primary: {
          DEFAULT: "#0F172A",
          dark: "#020617",
          light: "#1E293B",
        },
        teal: {
          DEFAULT: "#2563EB",
          light: "#EFF6FF",
          dark: "#1D4ED8",
        },
        emerald: {
          DEFAULT: "#3B82F6",
          light: "#EFF6FF",
          dark: "#1D4ED8",
        },
        mint: {
          DEFAULT: "#93C5FD",
          light: "#EFF6FF",
        },
        purple: {
          ai: "#6F52ED",
          light: "#F0EEFE",
        },
        sidebar: "#020617",
        background: "#F8FAFC",
        card: "#FFFFFF",
        // Typography Colors
        text: {
          primary: "#0F172A",
          secondary: "#64748B",
          muted: "#94A3B8",
        },
        // Status Colors
        success: "#22C55E",
        warning: "#F59E0B",
        danger: "#EF4444",
        info: "#3B82F6",
        border: "#E2E8F0",
      },
      fontFamily: {
        display: ["var(--font-jakarta)", "Plus Jakarta Sans", "sans-serif"],
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
        mono: ["var(--font-jetbrains)", "JetBrains Mono", "monospace"],
      },
      borderRadius: {
        xl: "12px",
        "2xl": "16px",
        "3xl": "16px",
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgba(15, 23, 42, 0.04)",
        card: "0 1px 3px 0 rgba(15, 23, 42, 0.05)",
        hover: "0 4px 12px -4px rgba(15, 23, 42, 0.10)",
        ai: "0 1px 3px 0 rgba(15, 23, 42, 0.05)",
        teal: "0 1px 3px 0 rgba(15, 23, 42, 0.05)",
        emerald: "0 1px 3px 0 rgba(15, 23, 42, 0.05)",
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(135deg, #2563EB 0%, #2563EB 100%)",
        "gradient-radial-ai": "linear-gradient(180deg, #FFFFFF 0%, #FFFFFF 100%)",
        "gradient-card-glow": "linear-gradient(180deg, #FFFFFF 0%, #FFFFFF 100%)",
      },
    },
  },
  plugins: [],
};
export default config;
