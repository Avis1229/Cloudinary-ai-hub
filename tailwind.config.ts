import type { Config } from 'tailwindcss';
import tailwindAnimate from 'tailwindcss-animate';
import daisyui from 'daisyui';
// @ts-ignore
import daisyuiThemes from 'daisyui/src/theming/themes';

const config: Config = {
  // Dark mode removed — keep default Tailwind behavior (no explicit dark mode)
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: '',
  daisyui: {
    // Keep only the light theme to avoid dark-mode variants
    themes: [
      {
        "light": {
          ...daisyuiThemes["light"],
          primary: '#4A1E30',
          secondary: '#556B4E',
          accent: '#C899A6',
          neutral: '#2D1220',
          'base-100': '#FAF7F2',
          '.toaster-con': {
            'background-color': 'white',
            color: 'black',
          },
        },
      },
    ],
  },
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // Luxury Ayurvedic Botanical Palette
        primary: {
          DEFAULT: '#4A1E30',
          foreground: '#ffffff',
          container: '#5E283F',
          light: '#F8EEF2',
        },
        secondary: {
          DEFAULT: '#556B4E',
          foreground: '#ffffff',
          container: '#45593E',
          light: '#EEF4EC',
        },
        accent: {
          DEFAULT: '#C899A6',
          foreground: '#2D1220',
          dark: '#9E6777',
          light: '#FAF2F4',
        },
        surface: {
          DEFAULT: '#FAF7F2',
          foreground: '#2D1220',
          dim: '#EBE5DC',
          bright: '#FFFFFF',
          container: {
            DEFAULT: '#F3EFE8',
            low: '#F8F5EE',
            lowest: '#FFFFFF',
            high: '#EAE4DA',
            highest: '#E2DBCE',
          }
        },
        'on-primary': '#ffffff',
        'on-secondary': '#ffffff',
        'on-secondary-container': '#45593E',
        'on-surface': '#2D1220',
        'on-surface-variant': '#614F57',
        brand: {
          DEFAULT: '#4A1E30',
          secondary: '#556B4E',
          accent: '#C899A6',
          black: '#2D1220',
          cream: '#FAF7F2',
        },
        outline: {
          DEFAULT: '#8A7B81',
          variant: '#D9CCD1',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: '#FAF7F2',
        foreground: '#2D1220',
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: '0.25rem',
        md: '0.125rem',
        sm: '0.125rem',
        xl: '0.5rem',
        full: '0.75rem',
      },
      fontFamily: {
        headline: ['Noto Serif', 'serif'],
        body: ['Manrope', 'sans-serif'],
        label: ['Manrope', 'sans-serif'],
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [tailwindAnimate, daisyui],
};

export default config;
