import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        ink: {
          DEFAULT: '#0f172a',
          soft:    '#334155',
          muted:   '#64748b',
          faint:   '#94a3b8',
        },
        surface: '#ffffff',
        muted:   '#64748b',
        line:    '#e2e8f0',
        bg:      '#f1f5f9',
        danger:  '#dc2626',
        success: '#059669',
        accent:  '#d97706',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        serif: ['Lora', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', '"Cascadia Code"', 'Menlo', 'monospace'],
      },
      borderRadius: {
        'md': '8px',
        'lg': '10px',
        'xl': '14px',
        '2xl': '18px',
      },
      boxShadow: {
        'card': '0 1px 2px rgba(15,23,42,0.04), 0 1px 3px rgba(15,23,42,0.06)',
        'card-hover': '0 4px 12px rgba(15,23,42,0.08), 0 2px 4px rgba(15,23,42,0.04)',
        'float': '0 8px 30px rgba(15,23,42,0.10)',
        'ring': '0 0 0 4px rgba(37,99,235,0.10)',
      },
      minHeight: {
        'touch': '44px',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.25s ease',
      },
    },
  },
  plugins: [],
} satisfies Config
