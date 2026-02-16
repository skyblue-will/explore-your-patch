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
          'deep-green': '#1a4d2e',
          'forest': '#2d6a4f',
          'brown': '#8b6914',
          'cream': '#faf3e0',
          'lichen': '#a8b5a2',
          'cornflower': '#6495ed',
          'bark': '#5c4033',
          'moss': '#4a7c59',
        },
        // Category colours
        nature: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#2d6a4f',
          600: '#1a4d2e',
          700: '#153d23',
          accent: '#2d6a4f',
          bg: '#f0fdf4',
          border: '#bbf7d0',
        },
        ocean: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0284c7',
          600: '#0369a1',
          700: '#075985',
          accent: '#0284c7',
          bg: '#f0f9ff',
          border: '#bae6fd',
        },
        safety: {
          50: '#f8fafc',
          100: '#f1f5f9',
          500: '#475569',
          600: '#334155',
          700: '#1e293b',
          accent: '#475569',
          bg: '#f8fafc',
          border: '#e2e8f0',
        },
        property: {
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#b45309',
          600: '#92400e',
          700: '#78350f',
          accent: '#b45309',
          bg: '#fffbeb',
          border: '#fde68a',
        },
        flood: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          accent: '#3b82f6',
          bg: '#eff6ff',
          border: '#bfdbfe',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
      }
    },
  },
  plugins: [],
}
