/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        doca: {
          navy: '#0b2545',
          dark: '#13315c',
          blue: '#134074',
          accent: '#0077b6',
          light: '#eef4f8',
          saffron: '#f77f00',
          green: '#1b4332',
          success: '#10b981'
        }
      }
    },
  },
  plugins: [],
}
