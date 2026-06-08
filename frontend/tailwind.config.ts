import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        inverse: {
          DEFAULT: 'var(--inverse)',
          foreground: 'var(--inverse-foreground)',
        },
        muted: {
          foreground: 'var(--muted-foreground)',
        },
        subtle: {
          foreground: 'var(--subtle-foreground)',
        },
        card: {
          muted: 'var(--card-muted)',
        },
        border: 'var(--border)',
        breaking: 'var(--breaking)',
        bias: {
          left: 'var(--bias-left)',
          'lean-left': 'var(--bias-lean-left)',
          center: 'var(--bias-center)',
          'lean-right': 'var(--bias-lean-right)',
          right: 'var(--bias-right)',
        },
        fact: {
          high: 'var(--fact-high)',
          mixed: 'var(--fact-mixed)',
          low: 'var(--fact-low)',
        },
        cat: {
          politica: 'var(--cat-politica)',
          economia: 'var(--cat-economia)',
          mundo: 'var(--cat-mundo)',
          tecnologia: 'var(--cat-tecnologia)',
          clima: 'var(--cat-clima)',
          cultura: 'var(--cat-cultura)',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Playfair Display', 'serif'],
        sans: ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'IBM Plex Mono', 'monospace'],
      },
      borderRadius: {
        sm: '2px',
        md: '6px',
        pill: '9999px',
      },
    },
  },
  plugins: [],
};

export default config;
