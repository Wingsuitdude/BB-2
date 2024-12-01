/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0eeff',
          100: '#e4ddff',
          200: '#cabbff',
          300: '#aa8eff',
          400: '#8b5cff',
          500: '#6c2aff',
          600: '#5a0dff',
          700: '#4c00e6',
          800: '#4000bf',
          900: '#36009c',
        },
        dark: {
          100: '#1a1a2e',
          200: '#16162b',
          300: '#0f0f1a',
          400: '#0a0a12',
        },
        accent: {
          blue: '#2a9fff',
          purple: '#9f2aff',
        }
      },
    },
  },
  plugins: [],
};