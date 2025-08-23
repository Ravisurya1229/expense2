/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: { sans: ["Inter", "ui-sans-serif", "system-ui", "Arial"] },
      colors: {
        brand: {
          50:"#f6f4ff",100:"#ebe8ff",200:"#d8d1ff",300:"#b8aaff",
          400:"#9b86ff",500:"#7c5cff",600:"#6b46ff",700:"#5a39e6",
          800:"#4a2fbf",900:"#3d2599"
        }
      },
      boxShadow: {
        soft: "0 10px 30px rgba(0,0,0,0.15)",
      },
      borderRadius: { xl:"1rem", "2xl":"1.25rem" },
    },
  },
  plugins: [],
};