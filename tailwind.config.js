/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',   // ← enables dark mode via class on <html>
  theme: {
    extend: {},
  },
  plugins: [],
}
