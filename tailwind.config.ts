import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          900: "#040a08",
          800: "#0c1812",
          700: "#14261c",
        },
        twilight: {
          DEFAULT: "#1e4d38",
          deep: "#0c2218",
          glow: "#2f8f68",
        },
        ember: {
          DEFAULT: "#f59e0b",
          soft: "#fbbf24",
        },
        moss: {
          DEFAULT: "#3fa37a",
          deep: "#1f5b48",
        },
        rune: {
          DEFAULT: "#5ee8b8",
          deep: "#22c48a",
          gold: "#fbbf24",
        },
        parchment: {
          DEFAULT: "#e6e2d3",
          dark: "#bfb89e",
        },
      },
      fontFamily: {
        display: ["'VT323'", "'Press Start 2P'", "monospace"],
        body: ["'Inter'", "'Space Mono'", "system-ui", "sans-serif"],
        rune: ["'Cinzel'", "serif"],
      },
      boxShadow: {
        rune: "0 0 22px rgba(94, 232, 184, 0.42), inset 0 0 1px 1px rgba(94,232,184,0.45)",
        ember: "0 0 18px rgba(245,158,11,0.38)",
        panel:
          "0 25px 60px -20px rgba(0,0,0,0.72), inset 0 0 0 1px rgba(94,232,184,0.16)",
      },
      keyframes: {
        sway: {
          "0%, 100%": { transform: "skewX(0deg)" },
          "25%, 75%": { transform: "skewX(-1deg)" },
          "50%": { transform: "skewX(1deg)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.55", filter: "blur(14px)" },
          "50%": { opacity: "1", filter: "blur(20px)" },
        },
        scanlines: {
          "0%": { backgroundPosition: "0 0" },
          "100%": { backgroundPosition: "0 100%" },
        },
      },
      animation: {
        sway: "sway 5s ease-in-out infinite",
        float: "float 4s ease-in-out infinite",
        pulseGlow: "pulseGlow 3.2s ease-in-out infinite",
        scanlines: "scanlines 8s linear infinite",
      },
      backgroundImage: {
        "twilight-radial":
          "radial-gradient(ellipse at 50% 30%, #1b5238 0%, #0c2418 50%, #040a06 100%)",
        "rune-grid":
          "linear-gradient(rgba(94,232,184,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(94,232,184,0.07) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};

export default config;
