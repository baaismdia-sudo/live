/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["selector", '[data-theme="dark"]'],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        heading: ["Manrope", "sans-serif"],
        body: ["Inter", "sans-serif"],
        sans: ["Inter", "sans-serif"],
      },
      spacing: {
        // 8px base spacing system: 1 = 8px, 2 = 16px, 3 = 24px, 4 = 32px...
        // supplements Tailwind's default scale rather than replacing it.
        18: "4.5rem",
      },
      borderRadius: {
        DEFAULT: "18px",
        card: "18px",
      },
      boxShadow: {
        premium: "var(--shadow-md)",
        "premium-lg": "var(--shadow-lg)",
      },
      transitionDuration: {
        DEFAULT: "250ms",
      },
    },
  },
  plugins: [],
};
