/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        obsidian: {
          900: '#0A0A0F',
          800: '#111118',
          700: '#1A1A24',
          600: '#22222E',
          500: '#2E2E3E',
        },
        amber: {
          DEFAULT: '#F5A623',
          dark: '#D48A0E',
          light: '#FFD07A',
          glow: 'rgba(245, 166, 35, 0.15)',
        },
        platinum: {
          DEFAULT: '#8B8FA8',
          light: '#C4C8D8',
          dark: '#5A5E72',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        sans: ['"DM Sans"', 'sans-serif'],
      },
      boxShadow: {
        'amber-glow': '0 0 30px rgba(245, 166, 35, 0.15)',
        'amber-glow-lg': '0 0 60px rgba(245, 166, 35, 0.25)',
        card: '0 4px 24px rgba(0,0,0,0.4)',
        'card-hover': '0 8px 40px rgba(0,0,0,0.6)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};
