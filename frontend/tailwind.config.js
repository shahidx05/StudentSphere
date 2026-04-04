export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Indigo/purple palette
        indigo: { 400: '#818cf8', 500: '#6366f1', 600: '#4f46e5' },
        purple: { 400: '#c084fc', 500: '#a855f7', 600: '#9333ea' },
        // Semantic tokens (CSS variable-backed)
        primary: '#6366f1',
        'primary-dark': '#4f46e5',
        'primary-light': '#818cf8',
        accent: '#22c55e',
        danger: '#ef4444',
        warning: '#f59e0b',
        muted: '#64748b',
        surface: 'var(--surface, #1e1e3c)',
        'surface-2': 'var(--surface-2, #12122a)',
        border: 'var(--border, rgba(99,102,241,0.15))',
        'text-primary': 'var(--text-primary, #e2e8f0)',
        'text-secondary': 'var(--text-secondary, #94a3b8)',
        'text-muted': 'var(--text-muted, #64748b)',
        bg: 'var(--bg, #0f0f1a)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
