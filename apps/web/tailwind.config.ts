import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        soft: "0 24px 60px rgba(72, 58, 42, 0.08)",
      },
      colors: {
        paper: {
          50: "#fdfbf8",
          100: "#f7f3ea",
          200: "#ede3d2",
        },
        moss: {
          300: "#9bc7b5",
          400: "#5f9b86",
          500: "#2f6f5f",
        },
      },
    },
  },
  plugins: [],
};

export default config;
