import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: process.env.PORT ? parseInt(process.env.PORT) : 5173, // Use Railway's PORT
    host: '0.0.0.0', // Ensure it binds to all network interfaces
    strictPort: true, // Ensures it fails if the port is unavailable
    allowedHosts: ['fotogen-production.up.railway.app'], // Allow Railway deployment
    proxy: {
      '/api': {
        target: process.env.VITE_BACKEND_URI || 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  }
});