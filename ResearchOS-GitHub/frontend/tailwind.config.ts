import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#07080A",
          900: "#0B0D10",
          850: "#10141A",
          800: "#151A22",
          700: "#1C2430",
          600: "#2A3444",
          500: "#3D4B5F",
        },
        mist: {
          100: "#F4F1EA",
          200: "#E8E2D6",
          300: "#C9C2B4",
          400: "#9AA3B2",
          500: "#7B8798",
        },
        evidence: {
          DEFAULT: "#D4A017",
          soft: "#E8C35A",
          dim: "#8A6A12",
          glow: "rgba(212, 160, 23, 0.15)",
        },
        verdict: {
          supported: "#3DDC97",
          weak: "#F0B429",
          contradicted: "#F07178",
          insufficient: "#7B8798",
          pending: "#5B6B7F",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "Segoe UI",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Consolas",
          "monospace",
        ],
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
      },
      boxShadow: {
        panel: "0 0 0 1px rgba(255,255,255,0.04), 0 18px 50px rgba(0,0,0,0.45)",
        glow: "0 0 40px rgba(212, 160, 23, 0.12)",
      },
      backgroundImage: {
        "grid-fade":
          "radial-gradient(ellipse at top, rgba(212,160,23,0.08), transparent 55%), linear-gradient(to bottom, #0B0D10, #07080A)",
      },
    },
  },
  plugins: [],
} satisfies Config;
