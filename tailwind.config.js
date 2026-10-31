
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    colors: {
      ink: '#131412',
      black: '#000000',
      white: '#ffffff',
      stone: '#8e8b83',
      blue: '#3356A6',
    },
    fontFamily: {
      sans: ['Fira Sans', 'Arial', 'Helvetica', 'sans-serif'],
    },
  },
  plugins: [],
};
