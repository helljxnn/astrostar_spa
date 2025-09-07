module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'primary-purple': '#b595ff',
        'primary-blue': '#9be9ff',
        'primary-green': '#95FFA7',
        'primary-red': '#FC6D6D',
        'primary-pink': '#FF95D1',
        'primary-yellow': '#EDEB85'

      },
      fontFamily: {
        montserrat: ['Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [
    require("tailwindcss-text-fill-stroke"),
  ],
}
