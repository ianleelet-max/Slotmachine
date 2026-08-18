/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        admin: {
          dark: '#070b14',
          surface: '#0d1527',
          card: '#121d36',
          border: '#1e2f52',
          accent: '#06b6d4',
          brand: '#3b82f6',
          green: '#10b981',
          gold: '#f59e0b'
        }
      }
    },
  },
  plugins: [],
}