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
        heritage: { main: '#92400e', light: '#fdf4ee' },
        air: { main: '#059669', light: '#e6f7f2' },
        trees: { main: '#65a30d', light: '#f0f7e6' },
        conservation: { main: '#047857', light: '#ecfdf5' },
        sewage: { main: '#7c2d12', light: '#fef2e8' },
        broadband: { main: '#6366f1', light: '#eef0ff' },
        climate: { main: '#c2410c', light: '#fff7ed' },
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
