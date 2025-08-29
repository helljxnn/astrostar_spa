module.exports = {
  content: [
    './src/**/*.{js,jsx}',
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
  plugins: [
    require("tailwindcss-text-fill-stroke"),
  ],
}