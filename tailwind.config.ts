import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
        },
        canvas: "#f5f8f6",
        surface: "#ffffff",
        line: {
          DEFAULT: "#e3e9e5",
          strong: "#cfd8d3",
        },
        text: {
          DEFAULT: "#0f1f17",
          muted: "#4b5b53",
          subtle: "#6b7a72",
        },
        risk: {
          low: "#15803d",
          "low-bg": "#ecfdf3",
          medium: "#b45309",
          "medium-bg": "#fff7ed",
          high: "#b91c1c",
          "high-bg": "#fef2f2",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          "sans-serif",
        ],
        mono: [
          '"JetBrains Mono"',
          '"SF Mono"',
          "SFMono-Regular",
          "Menlo",
          "Consolas",
          '"Liberation Mono"',
          "monospace",
        ],
      },
      boxShadow: {
        card: "0 1px 2px rgba(16, 40, 28, 0.04), 0 4px 16px -6px rgba(16, 40, 28, 0.08)",
        lift: "0 2px 4px rgba(16, 40, 28, 0.05), 0 12px 32px -12px rgba(16, 40, 28, 0.18)",
      },
      keyframes: {
        flash: {
          "0%": { boxShadow: "0 0 0 0 rgba(22, 163, 74, 0.45)" },
          "100%": { boxShadow: "0 0 0 14px rgba(22, 163, 74, 0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
      },
      animation: {
        flash: "flash 0.9s ease-out",
        shimmer: "shimmer 1.4s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
