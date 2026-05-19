import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-montserrat)", "system-ui", "sans-serif"],
      },
      colors: {
        ink: "#111111",
        muted: "#6b6b6b",
        border: "#ececec",
      },
      boxShadow: {
        soft: "0 6px 20px rgba(17, 17, 17, 0.06)",
        softer: "0 10px 28px rgba(17, 17, 17, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;

