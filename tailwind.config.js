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
        }
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
      }
    },
  },
  plugins: [],
}
