/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        blue: {
          electric: '#0000FF',
          bright: '#1a1aff',
          glow: '#3333ff',
          dim: '#0a0a80',
        },
      },
      fontFamily: {
        display: ['"Space Mono"', 'monospace'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"Space Mono"', 'monospace'],
      },
      animation: {
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'ticker': 'ticker 25s linear infinite',
        'fade-up': 'fadeUp 0.5s ease forwards',
        'fade-in': 'fadeIn 0.3s ease forwards',
      },
      keyframes: {
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0,0,255,0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(0,0,255,0.7)' },
        },
        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        fadeUp: {
          from: { opacity: 0, transform: 'translateY(20px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
      },
      backgroundImage: {
        'blue-glow': 'radial-gradient(ellipse at bottom, #0000cc 0%, #000000 70%)',
        'card-glow': 'radial-gradient(ellipse at top left, rgba(0,0,255,0.08) 0%, transparent 60%)',
      },
    },
  },
  plugins: [],
}
