/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        // ── Brand Navy ──────────────────────────────────
        ink: {
          950: '#060a12',
          900: '#0f172a',
          800: '#1e293b',
          700: '#334155',
          600: '#475569',
          500: '#64748b',
          400: '#94a3b8',
          300: '#cbd5e1',
          200: '#e2e8f0',
          100: '#f1f5f9',
          50:  '#f8fafc',
        },
        // ── Warm Cream / Parchment ───────────────────────
        cream: {
          950: '#1c1814',
          900: '#2d2520',
          800: '#4a3f38',
          700: '#6b5d54',
          600: '#8c7b72',
          500: '#a89990',
          400: '#c4b5ae',
          300: '#ddd1cc',
          200: '#ede8e4',
          100: '#f5f1ee',
          50:  '#faf8f6',
        },
        // ── Amber Accent ─────────────────────────────────
        amber: {
          950: '#451a03',
          900: '#78350f',
          800: '#92400e',
          700: '#b45309',
          600: '#d97706',
          500: '#f59e0b',
          400: '#fbbf24',
          300: '#fcd34d',
          200: '#fde68a',
          100: '#fef3c7',
          50:  '#fffbeb',
        },
        // ── Semantic tokens ──────────────────────────────
        primary: {
          DEFAULT: '#0f172a',
          hover:   '#1e293b',
          fore:    '#ffffff',
        },
        accent: {
          DEFAULT: '#d97706',
          hover:   '#b45309',
          fore:    '#ffffff',
        },
        success:     '#059669',
        warning:     '#d97706',
        danger:      '#dc2626',
        surface:     '#ffffff',
        'surface-2': '#faf8f6',
        'surface-3': '#f5f1ee',
        border:      '#e5e0db',
        'border-2':  '#d1cbc5',
        muted:       '#6b7280',
      },
      boxShadow: {
        'card':   '0 1px 3px 0 rgba(15,23,42,0.06), 0 1px 2px -1px rgba(15,23,42,0.04)',
        'card-md':'0 4px 12px 0 rgba(15,23,42,0.08), 0 2px 4px -2px rgba(15,23,42,0.04)',
        'card-lg':'0 10px 30px 0 rgba(15,23,42,0.10), 0 4px 8px -4px rgba(15,23,42,0.06)',
        'inner-sm':'inset 0 1px 2px rgba(15,23,42,0.06)',
      },
      letterSpacing: {
        'widest2': '0.2em',
        'widest3': '0.3em',
      },
      borderRadius: {
        'none': '0',
        'sm':   '4px',
        DEFAULT:'6px',
        'md':   '8px',
        'lg':   '12px',
        'xl':   '16px',
        '2xl':  '24px',
        'full': '9999px',
      },
      transitionDuration: {
        '250': '250ms',
      },
    },
  },
  plugins: [],
}
