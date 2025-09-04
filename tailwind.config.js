module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        "primary-purple": "#b595ff",
        "primary-purple-light": "#d0bfff",
        "primary-blue": "#9be9ff",
      },
      fontFamily: {
        questrial: ["Questrial", "sans-serif"],
      },
    },
  },
  plugins: [require("tailwindcss-text-fill-stroke")],
};
