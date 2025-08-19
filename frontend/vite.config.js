import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react()],

    server: {
    allowedHosts: [
      '3eae84532949.ngrok-free.app'  // <-- add this line
    ]}
})
