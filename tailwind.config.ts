import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        sahay: {
          navy: {
            50: "#f0f4f9",
            100: "#dbe5f2",
            200: "#bad0e6",
            300: "#8eb3d6",
            400: "#5d90c1",
            500: "#3d73ab",
            600: "#2d598f",
            700: "#254874",
            800: "#1e3b5e",
            900: "#0f253e",
            950: "#091728",
          },
          green: {
            50: "#f0fdf4",
            100: "#dcfce7",
            200: "#bbf7d0",
            300: "#86efac",
            400: "#4ade80",
            500: "#22c55e",
            600: "#16a34a",
            700: "#15803d",
            800: "#166534",
            900: "#14532d",
          },
          warm: {
            50: "#fbfaf8",
            100: "#f6f3ee",
            200: "#ece6dd",
            300: "#ded4c5",
            400: "#c7b8a1",
            500: "#b39f84",
            600: "#9e866c",
            700: "#836d57",
            800: "#6c5949",
            900: "#594a3e",
          },
          saffron: {
            50: "#fffbeb",
            100: "#fef3c7",
            200: "#fde68a",
            300: "#fcd34d",
            400: "#fbbf24",
            500: "#f59e0b",
            600: "#d97706",
            700: "#b45309",
            800: "#92400e",
            900: "#78350f",
          },
        },
      },
      fontFamily: {
        sans: [
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Noto Sans",
          "Noto Sans Devanagari",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 2px 8px -2px rgba(15, 37, 62, 0.08), 0 1px 4px -1px rgba(15, 37, 62, 0.04)",
        "card-hover": "0 8px 24px -4px rgba(15, 37, 62, 0.12), 0 3px 8px -2px rgba(15, 37, 62, 0.06)",
        voice: "0 0 0 6px rgba(22, 163, 74, 0.2)",
      },
      minHeight: {
        touch: "48px",
      },
      minWidth: {
        touch: "48px",
      },
    },
  },
  plugins: [],
};

export default config;
