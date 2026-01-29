import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class', // ✅ IMPORTANT: Enables switching between light/dark mode manually
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ✅ DYNAMIC COLORS: These link to the variables in globals.css
        primary: "var(--primary)", 
        secondary: "var(--secondary)",
        bg: "var(--bg)",
        card: "var(--card)",
        text: "var(--text)",
      },
    },
  },
  plugins: [],
};
export default config;