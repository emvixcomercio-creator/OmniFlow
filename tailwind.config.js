/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef4ff', 100: '#dbe6fe', 200: '#bfd3fe', 300: '#93b4fd',
          400: '#608bfa', 500: '#3b66f6', 600: '#2547eb', 700: '#1d35d8',
          800: '#1e2fae', 900: '#1e2d89', 950: '#171d54',
        },
        whatsapp: '#25D366',
        instagram: '#E1306C',
        webchat: '#0EA5E9',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'sans-serif'],
      },
      keyframes: {
        'fade-in': { '0%': { opacity: 0, transform: 'translateY(4px)' }, '100%': { opacity: 1, transform: 'none' } },
        'pop-in': { '0%': { opacity: 0, transform: 'scale(.96)' }, '100%': { opacity: 1, transform: 'none' } },
        'slide-left': { '0%': { opacity: 0, transform: 'translateX(16px)' }, '100%': { opacity: 1, transform: 'none' } },
        blink: { '0%,80%,100%': { opacity: .25 }, '40%': { opacity: 1 } },
      },
      animation: {
        'fade-in': 'fade-in .18s ease-out',
        'pop-in': 'pop-in .16s ease-out',
        'slide-left': 'slide-left .2s ease-out',
        blink: 'blink 1.2s infinite',
      },
    },
  },
  plugins: [],
}
