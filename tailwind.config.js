/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: '#f9fafb',
        // Cinza claro das caixas sem borda (balões, cartões, botões redondos)
        surface: {
          DEFAULT: '#f6f7f9',
          pressed: '#eceef1',
        },
        // Tons de verde do site (paleta do Tailwind 4)
        green: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#00c950',
          600: '#00a63e',
          700: '#008236',
        },
      },
      // No React Native cada peso é uma família separada
      fontFamily: {
        poppins: ['Poppins_400Regular'],
        'poppins-medium': ['Poppins_500Medium'],
        'poppins-semibold': ['Poppins_600SemiBold'],
        'poppins-bold': ['Poppins_700Bold'],
      },
    },
  },
  plugins: [],
};
