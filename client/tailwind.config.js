/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#ff94c2',
          DEFAULT: '#ff4d94',
          dark: '#cc005c',
        },
        secondary: {
          light: '#ffb199',
          DEFAULT: '#ff7c5c',
          dark: '#cc4929',
        },
      },
      fontFamily: {
        'sans': ['Montserrat', 'system-ui', 'sans-serif'],
        'serif': ['Playfair Display', 'serif'],
        'arabic': ['Tajawal', 'sans-serif'],
      },
      spacing: {
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
  ],
}