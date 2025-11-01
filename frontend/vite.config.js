import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import removeConsole from 'vite-plugin-remove-console'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    removeConsole() // ⬅️ removes console.log, warn, error in production
  ],
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    },
    proxy: {
      '/api': {
        target: 'https://api.whatyouwear.store',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
