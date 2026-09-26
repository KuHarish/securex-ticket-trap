/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0f',
        surface: '#13131a',
        primary: '#4f46e5',
        'primary-hover': '#4338ca',
        secondary: '#1e1e2d',
        text: '#f8fafc',
        'text-muted': '#94a3b8',
        danger: '#ef4444',
        success: '#10b981',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
