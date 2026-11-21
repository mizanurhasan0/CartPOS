/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        'c3xl': '0 16px 35px 0px rgba(0, 0, 0, 0.17)',
      },
      colors: {
        primary: '#001E17',
        primary1: '#023535',
        primary2: '#015958',
        primary3: '#008F8C',
        primary4: '#0CABA8',
        primary5: '#0FC2C0',
        light: '#E2E8F0',
        gray: '#88A4AB',
        gray2: '#E7E7E7',
        label: '#88A4AB',
        danger: '#e53e3e',
        border: '#E1E3E5',
        black: '#333',
        black2: '#565656',
        red: '#AF2626',
        yellow: '#FFC96B'
      },
      fontFamily: {
        nunito: ['Nunito Sans', 'sans-serif'],
      },

    },
  },
  plugins: [],
}