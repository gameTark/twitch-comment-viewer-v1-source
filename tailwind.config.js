/**
 * @format
 * @type {import('tailwindcss').Config}
 */
const themes = require("./resource/theme.json");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",

    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        "noto-sans": ["Noto Sans JP"],
        "noto-serif": ["Noto Serif JP"],
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out both",
      },
      keyframes: {
        "fade-in": {
          "0%": {
            // scale: "0.9",
            opacity: "0",
          },
          "to": {
            // scale: "1",
            opacity: "1",
          },
        },
      },
    },
  },
  daisyui: {
    themes: themes, // false: only light + dark | true: all themes | array: specific themes like this ["light", "dark", "cupcake"]
    darkTheme: "black", // name of one of the included themes for dark mode
    base: true, // applies background color and foreground color for root element by default
    styled: true, // include daisyUI colors and design decisions for all components
    utils: true, // adds responsive and modifier utility classes
    prefix: "", // prefix for daisyUI classnames (components, modifiers and responsive class names. Not colors)
    logs: true, // Shows info about daisyUI version and used config in the console when building your CSS
    themeRoot: ":root", // The element that receives theme color CSS variables
  },
  plugins: [
    require("daisyui"),
    require("@tailwindcss/container-queries"),
    require("@tailwindcss/typography"),
  ],
};
