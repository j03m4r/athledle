/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "black": "#3B3636",
        "red": "#802F2E",
        "yellow": "#E0E068",
        "green": "#89AA5A",
      }
    },
  },
  plugins: [],
}

