import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/pages/**/*.{js,ts,jsx,tsx,mdx}", "./src/components/**/*.{js,ts,jsx,tsx,mdx}", "./src/app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg1: "#0b1020",
        bg2: "#070a16",
        fg: "#f8fbff",
        muted: "#b6c0d9",
        accent: "#a78bfa",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      animation: {
        "score-flash": "scoreFlash 0.3s ease-in-out",
        sparkle: "sparkle 30s linear infinite",
      },
      keyframes: {
        scoreFlash: {
          "0%": {
            color: "#ffffff",
            textShadow: "0 0 10px rgba(255, 255, 255, 0.5)",
            transform: "scale(1)",
          },
          "50%": {
            color: "#ffffff",
            textShadow: "0 0 30px rgba(255, 255, 255, 1), 0 0 60px rgba(255, 255, 255, 0.8)",
            transform: "scale(1.15)",
          },
          "100%": {
            color: "#ffffff",
            textShadow: "0 0 20px rgba(255, 255, 255, 1)",
            transform: "scale(1.1)",
          },
        },
        sparkle: {
          "0%": { transform: "translateY(0px)" },
          "100%": { transform: "translateY(-100px)" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
  // Otimizações de performance
  future: {
    hoverOnlyWhenSupported: true,
  },
};

export default config;
