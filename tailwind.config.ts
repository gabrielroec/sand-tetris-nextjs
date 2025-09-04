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
        // Cores para SEO e acessibilidade
        primary: "#a78bfa",
        secondary: "#60a5fa",
        success: "#34d399",
        warning: "#fbbf24",
        error: "#f472b6",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      animation: {
        "score-flash": "scoreFlash 0.3s ease-in-out",
        sparkle: "sparkle 30s linear infinite",
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
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
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
      // Otimizações para SEO
      screens: {
        xs: "475px",
        "3xl": "1600px",
        "4xl": "1920px",
      },
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
      },
    },
  },
  plugins: [
    // Plugin para melhorar acessibilidade
    function ({ addUtilities }: any) {
      addUtilities({
        ".sr-only": {
          position: "absolute",
          width: "1px",
          height: "1px",
          padding: "0",
          margin: "-1px",
          overflow: "hidden",
          clip: "rect(0, 0, 0, 0)",
          whiteSpace: "nowrap",
          border: "0",
        },
        ".focus-visible": {
          outline: "2px solid #a78bfa",
          outlineOffset: "2px",
        },
      });
    },
  ],
  // Otimizações de performance
  future: {
    hoverOnlyWhenSupported: true,
  },
  // Configurações para produção
  ...(process.env.NODE_ENV === "production" && {
    purge: {
      enabled: true,
      content: ["./src/**/*.{js,ts,jsx,tsx}", "./public/**/*.html"],
    },
  }),
};

export default config;
