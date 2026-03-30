import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
      },
      colors: {
        brand: {
          bg: '#0f0f14',
          surface: '#1a1a24',
          card: '#22222f',
          border: '#2e2e3e',
          accent: '#7c3aed',
          accentLight: '#a78bfa',
        },
        macro: {
          calories: '#f97316',
          protein: '#3b82f6',
          carbs: '#22c55e',
          fat: '#eab308',
        },
      },
    },
  },
  plugins: [],
}

export default config
