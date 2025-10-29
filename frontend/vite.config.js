import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Add headers to fix Google OAuth COOP errors
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    },
    // Proxy configuration for API calls
    proxy: {
      '/api': {
        target: 'https://api.whatyouwear.store',
        changeOrigin: true,
        secure: true,
      }
    }
  }
})