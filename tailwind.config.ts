import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0b0e13",
          surface: "#12161d",
          raised: "#171d27",
          border: "#262c37",
        },
        paper: {
          DEFAULT: "#e8ecf2",
          muted: "#8a95a6",
          dim: "#5c6674",
        },
        brass: {
          DEFAULT: "#c68a3e",
          bright: "#e0a75c",
          dim: "#8f652f",
        },
        risk: {
          low: "#3f9d6e",
          medium: "#d1a13a",
          high: "#c1443c",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          "sans-serif",
        ],
        mono: [
          '"IBM Plex Mono"',
          '"SF Mono"',
          "SFMono-Regular",
          "Menlo",
          "Consolas",
          '"Liberation Mono"',
          "monospace",
        ],
      },
      boxShadow: {
        panel: "0 1px 0 0 rgba(255,255,255,0.03) inset, 0 8px 24px -12px rgba(0,0,0,0.6)",
      },
    },
  },
  plugins: [],
};

export default config;
