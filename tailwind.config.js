/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        dark1: "rgb(var(--color-dark-1) / <alpha-value>)",
        dark2: "rgb(var(--color-dark-2) / <alpha-value>)",
        dark3: "rgb(var(--color-dark-3) / <alpha-value>)",
        light1: "rgb(var(--color-light-1) / <alpha-value>)",
        orange1: "rgb(var(--color-orange-1) / <alpha-value>)",
        orange2: "rgb(var(--color-orange-2) / <alpha-value>)",
      },
      fontFamily: {
        mono: ['"B612 Mono"', "monospace"],
        inter: ["Inter", "sans-serif"],
      },
      // Fluid type scale driven by --s (1px of a 640/1440 wide design)
      fontSize: {
        xsm: "calc(var(--s) * 11)",
        sm: "calc(var(--s) * 12)",
        body: "calc(var(--s) * 13)",
        md: "calc(var(--s) * 14)",
      },
    },
  },
  plugins: [],
};
