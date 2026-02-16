/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        patch: {
          bg: '#fcfbf8',
          deep: '#1a2e1a',
          green: '#2d5a3f',
          brown: '#6b5c3e',
          muted: '#8a8577',
          line: '#e5e0d8',
          hover: '#f5f3ee',
        },
        nature: { main: '#2d5a3f', light: '#e8f0eb' },
        ocean: { main: '#1a6b8a', light: '#e4f0f5' },
        safety: { main: '#4a4a52', light: '#f0f0f2' },
        property: { main: '#8a6914', light: '#f5f0e0' },
        flood: { main: '#2563a8', light: '#e8f0fa' },
      },
      fontFamily: {
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'stat': ['2rem', { lineHeight: '1', fontWeight: '600' }],
      },
    },
  },
  plugins: [],
}
