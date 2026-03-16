/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#080808',
        s1: '#0F0F0F',
        s2: '#161616',
        s3: '#1E1E1E',
        border: '#2A2A2A',
        gold: {
          DEFAULT: '#D4AF37',
          light: '#F0D060',
          dim: '#8A7020',
        },
        t1: '#F0EDE8',
        t2: '#9A9690',
        t3: '#5A5652',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'serif'],
        sans: ['"Outfit"', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
      },
      boxShadow: {
        gold: '0 0 40px rgba(212,175,55,0.08)',
        'gold-md': '0 0 60px rgba(212,175,55,0.14)',
        card: '0 4px 32px rgba(0,0,0,0.6)',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #D4AF37, #F0D060)',
        'dark-gradient': 'linear-gradient(180deg, #0F0F0F 0%, #080808 100%)',
      },
      animation: {
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
      },
      keyframes: {
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(212,175,55,0)' },
          '50%': { boxShadow: '0 0 0 8px rgba(212,175,55,0.1)' },
        },
      },
    },
  },
  plugins: [],
};
