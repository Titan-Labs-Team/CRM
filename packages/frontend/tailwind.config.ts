import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0c0f15',
          darker: '#04080f',
          surface: '#111827',
          border: '#1f2937',
        },
        accent: {
          green: '#72d296',
          'green-dim': '#4a9b6f',
        },
        'text-primary': '#ffffff',
        'text-secondary': '#9ca3af',
        'text-muted': '#4b5563',
        status: {
          won: '#72d296',
          lost: '#ef4444',
          open: '#3b82f6',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'sans-serif',
        ],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '0.375rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.15s ease-out',
        'slide-in-right': 'slideInRight 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideInRight: {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
