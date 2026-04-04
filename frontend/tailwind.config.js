/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0F62FE',
        'primary-dark': '#0043CE',
        'primary-light': '#4589FF',
        secondary: '#161616',
        surface: '#1C1C1C',
        'surface-2': '#242424',
        accent: '#42BE65',
        danger: '#FA4D56',
        warning: '#F1C21B',
        muted: '#6F6F6F',
        border: '#2E2E2E',
        'border-light': '#3A3A3A',
        'text-primary': '#F4F4F4',
        'text-secondary': '#A8A8A8',
        'text-muted': '#6F6F6F',
        bg: '#0D0D0D',
        'bg-2': '#111111',
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 20px rgba(15, 98, 254, 0.15)',
        'glow-accent': '0 0 20px rgba(66, 190, 101, 0.15)',
        'glow-danger': '0 0 20px rgba(250, 77, 86, 0.15)',
        'card': '0 4px 24px rgba(0,0,0,0.4)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { transform: 'translateY(16px)', opacity: 0 }, to: { transform: 'translateY(0)', opacity: 1 } },
      },
    },
  },
  plugins: [],
}
