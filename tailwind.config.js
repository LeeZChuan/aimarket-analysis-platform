/** @type {import('tailwindcss').Config} */
import animate from 'tailwindcss-animate';

const token = (varName) => `var(--${varName})`;

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary:     token('bg-primary'),
          secondary:   token('bg-secondary'),
          tertiary:    token('bg-tertiary'),
          hover:       token('bg-hover'),
          active:      token('bg-active'),
          transparent: token('bg-transparent'),
        },
        border: {
          primary:   token('border-primary'),
          secondary: token('border-secondary'),
          hover:     token('border-hover'),
          active:    token('border-active'),
        },
        text: {
          primary:   token('text-primary'),
          secondary: token('text-secondary'),
          tertiary:  token('text-tertiary'),
          muted:     token('text-muted'),
          disabled:  token('text-disabled'),
        },
        accent: {
          DEFAULT: token('accent-primary'),
          hover:   token('accent-hover'),
          active:  token('accent-active'),
        },
        success: token('success'),
        error:   token('error'),
        warning: token('warning'),
      },
      fontFamily: {
        sans: [token('font-family-base')],
        mono: [token('font-family-mono')],
      },
      borderRadius: {
        sm: token('radius-sm'),
        md: token('radius-md'),
        lg: token('radius-lg'),
        xl: token('radius-xl'),
      },
      boxShadow: {
        sm: token('shadow-sm'),
        md: token('shadow-md'),
        lg: token('shadow-lg'),
      },
      transitionDuration: {
        fast:   token('duration-fast'),
        normal: token('duration-normal'),
        slow:   token('duration-slow'),
      },
    },
  },
  plugins: [animate],
};
