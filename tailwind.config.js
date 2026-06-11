/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'ui-sans-serif', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        // Brand palette (carried over from the original concept)
        // navy is the deep "primary" tone — now token-driven so the active
        // color theme recolors solid CTAs / active nav without code changes.
        navy: {
          DEFAULT: 'rgb(var(--c-navy) / <alpha-value>)',
          600: 'rgb(var(--c-navy-600) / <alpha-value>)',
          700: 'rgb(var(--c-navy-700) / <alpha-value>)',
        },
        teal: { DEFAULT: '#2f7f8f', soft: '#5aa6b3' },
        wine: { DEFAULT: '#7e3041', soft: '#94394e' },
        amber: { DEFAULT: '#f2b95e', soft: '#ffd98a' },
        // Semantic tokens — resolved from CSS vars so light/dark just swaps the vars
        canvas: 'rgb(var(--c-canvas) / <alpha-value>)',
        surface: 'rgb(var(--c-surface) / <alpha-value>)',
        'surface-2': 'rgb(var(--c-surface-2) / <alpha-value>)',
        line: 'rgb(var(--c-line) / <alpha-value>)',
        ink: 'rgb(var(--c-ink) / <alpha-value>)',
        'ink-soft': 'rgb(var(--c-ink-soft) / <alpha-value>)',
        'ink-mute': 'rgb(var(--c-ink-mute) / <alpha-value>)',
        brand: 'rgb(var(--c-brand) / <alpha-value>)',
        accent: 'rgb(var(--c-accent) / <alpha-value>)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        glow: '0 24px 80px rgba(21, 54, 97, 0.24)',
        glass: '0 24px 90px rgba(24, 33, 52, 0.18)',
        soft: '0 8px 30px rgba(24, 33, 52, 0.08)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.9)', opacity: '0.7' },
          '70%': { transform: 'scale(1.6)', opacity: '0' },
          '100%': { opacity: '0' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'dash-flow': {
          to: { strokeDashoffset: '-24' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.7s cubic-bezier(0.16,1,0.3,1) both',
        shimmer: 'shimmer 1.6s infinite',
        'pulse-ring': 'pulse-ring 2.4s cubic-bezier(0.16,1,0.3,1) infinite',
        float: 'float 6s ease-in-out infinite',
        'dash-flow': 'dash-flow 1s linear infinite',
      },
    },
  },
  plugins: [],
};
