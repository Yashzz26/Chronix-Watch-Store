/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        obsidian: {
          700: '#1A1A24',
          800: '#111118',
          900: '#0A0A0F',
        },
        amber: {
          DEFAULT: '#F5A623',
          dark: '#E59512',
          light: '#FFB74D',
        },
        platinum: '#8B8FA8',
        white: '#E8EAF0',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        sans: ['"DM Sans"', 'sans-serif'],
      },
      boxShadow: {
        card: '0 8px 32px rgba(0, 0, 0, 0.4)',
        glass: '0 8px 32px 0 rgba(10, 10, 15, 0.37)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
