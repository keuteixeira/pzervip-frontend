/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app/**/*.{vue,js,ts}',
    './components/**/*.{vue,js,ts}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#e11d48',
          muted: '#be123c',
        },
      },
    },
  },
  plugins: [],
}
