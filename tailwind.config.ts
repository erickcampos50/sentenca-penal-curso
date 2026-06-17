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
          50:  '#e7f5ff',
          100: '#d0ebff',
          200: '#a5d8ff',
          300: '#74c0fc',
          400: '#4dabf7',
          500: '#228be6',
          600: '#1c7ed6',
          700: '#1971c2',
          800: '#1864ab',
          900: '#13599c',
        },
        surface: '#ffffff',
        muted:   '#868e96',
        border:  '#dee2e6',
        bg:      '#f8f9fa',
        danger:  '#e03131',
        success: '#2f9e44',
        accent:  '#fab005',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['ui-monospace', '"Cascadia Code"', '"Source Code Pro"', 'Menlo', 'monospace'],
      },
      borderRadius: {
        'md': '8px',
        'lg': '12px',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.05)',
        'card-hover': '0 2px 8px rgba(0,0,0,0.06)',
      },
      minHeight: {
        'touch': '44px',
      },
    },
  },
  plugins: [],
} satisfies Config
