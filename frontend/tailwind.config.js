/** @type {import('tailwindcss').Config} */
export default {
  // Configura Tailwind para escanear todos los archivos JSX y JS en la carpeta 'src'
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}