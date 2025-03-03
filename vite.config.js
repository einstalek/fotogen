import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: process.env.PORT ? parseInt(process.env.PORT) : 5173, // Use Railway's PORT or default to 5173
    host: '0.0.0.0' // Ensure it's accessible from Railway
  }
});