/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: "#080C14",
          card: "rgba(15, 23, 42, 0.75)",
          cardHover: "rgba(30, 41, 59, 0.85)",
          border: "rgba(255, 255, 255, 0.12)",
          borderHover: "rgba(99, 102, 241, 0.35)",
        },
        glow: {
          indigo: "#6366F1",
          purple: "#A855F7",
          cyan: "#06B6D4",
          emerald: "#10B981",
          pink: "#EC4899",
        }
      },
      fontFamily: {
        sans: ['"Inter"', '"Plus Jakarta Sans"', 'sans-serif'],
        display: ['"Outfit"', '"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'fade-in': 'fadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'scale(0.98)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        glowPulse: {
          from: { boxShadow: '0 0 20px rgba(99, 102, 241, 0.2)' },
          to: { boxShadow: '0 0 40px rgba(168, 85, 247, 0.4)' },
        }
      },
      boxShadow: {
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
        'glass-glow': '0 0 30px rgba(99, 102, 241, 0.25), 0 10px 40px rgba(0, 0, 0, 0.5)',
        'neon-indigo': '0 0 25px rgba(99, 102, 241, 0.45)',
        'neon-cyan': '0 0 25px rgba(6, 182, 212, 0.45)',
      },
    },
  },
  plugins: [],
}