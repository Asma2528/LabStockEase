import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',   // 👈 This allows access from LAN
    port: 5173,        // 👈 Default Vite port
  },
})
