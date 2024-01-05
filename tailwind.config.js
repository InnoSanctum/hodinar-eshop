import formsPlugin from '@tailwindcss/forms';
import typographyPlugin from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./app/**/*.{js,ts,jsx,tsx}'], theme: {
    extend: {
      fontFamily: {
        // sans: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
        sans: "'Montserrat', sans-serif",
        // title: "'Montserrat', sans-serif",
        title: ["Abril Fatface", "serif"],
        normal: "Times New Roman",
      },
      colors: {
        primary: "#010506",
        secondary: "#ffff",
        tertiary: "#FFD700",
      },
    },
  },
  plugins: [formsPlugin, typographyPlugin],
};
