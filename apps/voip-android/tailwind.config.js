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
        android: {
          dark: '#070a12',
          surface: '#101726',
          card: '#162033',
          border: '#202d45',
          accent: '#06b6d4',
          accentGlow: '#22d3ee',
          green: '#10b981',
          red: '#ef4444'
        }
      }
    },
  },
  plugins: [],
}