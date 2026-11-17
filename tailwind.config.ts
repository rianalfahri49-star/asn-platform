import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: { 50: "#eff6ff", 100: "#dbeafe", 500: "#2563eb", 600: "#1d4ed8", 700: "#1e40af", 900: "#172554" },
      },
      boxShadow: { soft: "0 18px 55px rgba(15, 43, 90, 0.10)" },
    },
  },
  plugins: [],
};

export default config;
