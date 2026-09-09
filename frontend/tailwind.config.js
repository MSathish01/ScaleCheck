/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Outfit', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      },
      colors: {
        doca: {
          navy: '#0b2545',
          dark: '#13315c',
          blue: '#134074',
          accent: '#0077b6',
          light: '#eef4f8',
          saffron: '#f77f00',
          indiaSaffron: '#FF9933',
          indiaGreen: '#138808',
          ashokaBlue: '#000080',
          green: '#1b4332',
          success: '#10b981'
        }
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(11, 37, 69, 0.12)',
        'glow-saffron': '0 0 20px -3px rgba(247, 127, 0, 0.4)',
        'glow-blue': '0 0 25px -3px rgba(0, 119, 182, 0.4)'
      }
    },
  },
  plugins: [],
}
