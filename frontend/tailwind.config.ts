import type { Config } from "tailwindcss";

// Palette extraite de docs/design.md — à ajuster si des hex exacts arrivent plus tard
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#0A0A0F",
        card: "#12131A",
        "header-start": "#3D4FA8",
        "header-end": "#1B2454",
        accent: {
          DEFAULT: "#4C6FFF",
          light: "#6C8CFF",
        },
        success: "#34D399",
        danger: "#F87171",
        muted: "#9AA3B8",
      },
      fontFamily: {
        sans: ["var(--font-onest)", "sans-serif"],
      },
      borderRadius: {
        pill: "999px",
      },
    },
  },
  plugins: [],
};

export default config;
