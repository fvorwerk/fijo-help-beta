/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // ✅ Ensures Tailwind scans your components
  ],
  darkMode: "false", // Enables dark mode support (or use "class" if you prefer manual toggling)
  theme: {
    extend: {},
  },
  plugins: [],
};
