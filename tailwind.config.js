/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        glow: '0 0 0 1px rgba(34,211,238,0.2), 0 25px 80px rgba(14,116,144,0.2)',
      },
    },
  },
  plugins: [],
}

