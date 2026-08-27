/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0b3a6a',
          50: '#f2f6fa',
          100: '#dbe4ee',
          300: '#8598ac',
          600: '#3a5170',
          700: '#0b3a6a',
          800: '#082b50',
          900: '#061f3a',
        },
        orange: {
          DEFAULT: '#ff6a00',
          600: '#e66000',
        },
      },
      fontFamily: {
        display: ['var(--font-bebas)', 'sans-serif'],
        sans: ['var(--font-dmsans)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
