import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#e6f6f3",
          100: "#c0e9e1",
          200: "#96dbcd",
          300: "#6bccb8",
          400: "#4abfa8",
          500: "#0f9d8e", // مستخرج من الشعار
          600: "#0c8477",
          700: "#0a6a60",
          800: "#08514a",
          900: "#053733"
        },
        ink: {
          50: "#f5f6f7",
          900: "#12181b"
        }
      },
      fontFamily: {
        sans: ["var(--font-tajawal)", "Tajawal", "sans-serif"]
      },
      boxShadow: {
        card: "0 1px 2px 0 rgb(0 0 0 / 0.06), 0 1px 3px 0 rgb(0 0 0 / 0.08)"
      }
    }
  },
  plugins: []
};
export default config;
