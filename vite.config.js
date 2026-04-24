import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/jpl-proxy': {
        target: 'https://mars.nasa.gov',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/jpl-proxy/, ''),
      },
    },
  },
})
