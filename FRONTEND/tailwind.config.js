/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-purple': '#b595ff',
        'primary-blue': '#9be9ff',
      },
      fontFamily: {
        questrial: ['Questrial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}