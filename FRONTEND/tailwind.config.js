/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Newsreader', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      colors: {
        // Ink & Paper — the case-file palette
        ink: {
          DEFAULT: '#1A1814',
          soft: '#2C2A26',
          muted: '#7A7469',
          fog: '#A8A39A',
        },
        paper: {
          DEFAULT: '#F5F0E8',
          warm: '#EDE8DD',
          rule: '#D4CFC4',
          border: '#C8C3B8',
        },
        amber: {
          DEFAULT: '#C8821A',
          hover: '#A86B12',
          light: '#F9EDD5',
          dark: '#7A4F0D',
        },
        // Semantic aliases (keep old names working for untouched pages)
        background: '#F5F0E8',
        surface: '#EDE8DD',
        primary: {
          DEFAULT: '#1A1814',
          hover: '#2C2A26',
        },
        secondary: {
          DEFAULT: '#EDE8DD',
          hover: '#D4CFC4',
        },
        border: {
          DEFAULT: '#D4CFC4',
          hover: '#C8C3B8',
        },
        text: {
          primary: '#1A1814',
          secondary: '#7A7469',
          muted: '#A8A39A',
        },
        success: {
          DEFAULT: '#2D7D52',
          bg: '#E8F5EE',
        },
        warning: {
          DEFAULT: '#C8821A',
          bg: '#F9EDD5',
        },
        error: {
          DEFAULT: '#B83A2A',
          bg: '#FAEAE8',
        },
      },
      fontSize: {
        'display-2xl': ['96px', { lineHeight: '1.0', letterSpacing: '-0.04em' }],
        'display-xl': ['72px', { lineHeight: '1.05', letterSpacing: '-0.03em' }],
        'display-lg': ['56px', { lineHeight: '1.1', letterSpacing: '-0.025em' }],
        'display-md': ['40px', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        'heading': ['28px', { lineHeight: '1.25', letterSpacing: '-0.015em' }],
        'label-xs': ['10px', { lineHeight: '1.4', letterSpacing: '0.1em' }],
        'label-sm': ['11px', { lineHeight: '1.4', letterSpacing: '0.08em' }],
      },
      boxShadow: {
        'stamp': '0 1px 2px rgba(26,24,20,0.06), 0 0 0 1px rgba(26,24,20,0.04)',
        'card': '0 2px 8px rgba(26,24,20,0.08), 0 1px 2px rgba(26,24,20,0.04)',
        'lifted': '0 8px 24px rgba(26,24,20,0.10), 0 2px 6px rgba(26,24,20,0.06)',
        'modal': '0 24px 48px rgba(26,24,20,0.14), 0 8px 16px rgba(26,24,20,0.08)',
      },
      borderRadius: {
        'stamp': '2px',
        'card': '4px',
        'button': '3px',
        'input': '3px',
        'modal': '6px',
        'xl': '8px',
        '2xl': '10px',
        '3xl': '12px',
        'full': '9999px',
      },
      animation: {
        'stamp-in': 'stampIn 200ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'cursor-pulse': 'cursorPulse 900ms ease-in-out infinite',
        'fade-up': 'fadeUp 300ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-in': 'slideIn 200ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        stampIn: {
          '0%': { opacity: '0', transform: 'translateY(6px) scale(0.99)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        cursorPulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-8px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
