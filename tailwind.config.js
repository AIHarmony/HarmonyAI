/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#7857FF', // 主题紫色
          light: '#9E85FF',
          dark: '#5A3FD6',
        },
        secondary: {
          DEFAULT: '#00BCD4', // 辅助色调
          light: '#62EFFF',
          dark: '#008BA3',
        },
        solana: {
          DEFAULT: '#14F195', // Solana 绿色
        },
        dark: {
          DEFAULT: '#1E1E2E',
          lighter: '#2D2D3F',
        },
      },
    },
  },
  plugins: [],
}; 