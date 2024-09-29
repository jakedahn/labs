const { tailwindTransform } = require("postcss-lit");

module.exports = {
  content: {
    files: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx,css,md,mdx,html,json,scss}",
    ],
    transform: {
      ts: tailwindTransform,
    },
  },
  theme: {
    extend: {},
  },
  plugins: [],
};
