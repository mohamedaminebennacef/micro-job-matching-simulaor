import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        glow: "0 20px 60px rgba(56, 189, 248, 0.18)",
      },
      colors: {
        ink: {
          950: "#050816",
          900: "#0B1020",
          800: "#121A33",
        },
        accent: {
          300: "#7DD3FC",
          400: "#38BDF8",
          500: "#0EA5E9",
        },
      },
    },
  },
  plugins: [],
};

export default config;
