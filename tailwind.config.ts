import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
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
      },
      backgroundImage: {
        "aura-radial":
          "radial-gradient(circle at 20% 20%, rgba(112,82,255,0.25), transparent 55%), radial-gradient(circle at 80% 0%, rgba(255,116,224,0.18), transparent 45%), radial-gradient(circle at 50% 100%, rgba(82,180,255,0.18), transparent 50%)",
      },
    },
  },
  plugins: [],
};

export default config;
