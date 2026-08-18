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
        comfy: {
          dark: '#080c16',
          surface: '#0f172a',
          card: '#141e36',
          border: '#1e2d4d',
          accent: '#8b5cf6',
          cyan: '#06b6d4',
          green: '#10b981',
          gold: '#f59e0b'
        }
      }
    },
  },
  plugins: [],
}