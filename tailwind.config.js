/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        persona: {
          black: '#0a0a0a',
          coal: '#161616',
          red: '#dc143c',
          redDark: '#8b0f2c',
          off: '#f5f2ee',
          gray: '#9a9a9a',
        },
      },
      fontFamily: {
        display: ['Anton', 'Archivo', 'sans-serif'],
        body: ['Archivo', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
