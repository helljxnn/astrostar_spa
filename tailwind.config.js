/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "primary-purple": "#b595ff",
        "primary-purple-light": "#d0bfff",
        "primary-blue": "#9be9ff",
        "primary-green": "#95FFA7",
        "primary-red": "#FC6D6D",
        "primary-pink": "#FF95D1",
        "primary-yellow": "#EDEB85",
      },
      fontFamily: {
        montserrat: ["Montserrat", "sans-serif"],
      },
      backdropBlur: {
        xs: "4px",
        xxl: "60px",
      },
    },
  },
  plugins: [require("tailwindcss-text-fill-stroke")],
};
