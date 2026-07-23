import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#0c0920",
        aura: {
          50: "#f2f1ff",
          100: "#e6e3ff",
          200: "#c9c2ff",
          300: "#a89bff",
          400: "#8b76ff",
          500: "#7052ff",
          600: "#5c34f5",
          700: "#4c27d1",
          800: "#3d20a8",
          900: "#301c80",
          950: "#1c0f52",
        },
        bloom: {
          pink: "#ff74e0",
          blue: "#52b4ff",
          amber: "#ffb454",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-fraunces)", "serif"],
      },
      backgroundImage: {
        "aura-radial":
          "radial-gradient(circle at 15% 10%, rgba(124,92,255,0.45), transparent 55%), radial-gradient(circle at 85% 5%, rgba(255,116,224,0.28), transparent 50%), radial-gradient(circle at 90% 60%, rgba(82,180,255,0.22), transparent 50%), radial-gradient(circle at 10% 90%, rgba(255,140,120,0.16), transparent 45%)",
        "aura-glow":
          "radial-gradient(circle at 50% 0%, rgba(139,118,255,0.35), transparent 60%)",
        grain:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E\")",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        blink: {
          "0%, 80%, 100%": { opacity: "0.2" },
          "40%": { opacity: "1" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "blob-a": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(6%, -8%) scale(1.15)" },
          "66%": { transform: "translate(-8%, 5%) scale(0.9)" },
        },
        "blob-b": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "40%": { transform: "translate(-10%, 6%) scale(0.9)" },
          "75%": { transform: "translate(7%, 8%) scale(1.1)" },
        },
        "blob-c": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "50%": { transform: "translate(5%, -6%) scale(1.2)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) both",
        float: "float 6s ease-in-out infinite",
        blink: "blink 1.4s infinite both",
        marquee: "marquee 32s linear infinite",
        "blob-a": "blob-a 16s ease-in-out infinite",
        "blob-b": "blob-b 20s ease-in-out infinite",
        "blob-c": "blob-c 24s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
