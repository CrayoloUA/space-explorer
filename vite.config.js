import { defineConfig } from 'vite'      // importa la función para configurar Vite
import react from '@vitejs/plugin-react'  // importa el plugin oficial de React para Vite

export default defineConfig({
  plugins: [react()],  // activa soporte para JSX y React Fast Refresh
  server: {
    proxy: {
      '/api/jpl-proxy': {                       // intercepta peticiones al proxy local (misma ruta que la función Vercel)
        target: 'https://mars.nasa.gov',        // redirige al servidor real de la NASA
        changeOrigin: true,                     // cambia el header Origin para evitar bloqueos CORS
        rewrite: path => path.replace(/^\/api\/jpl-proxy/, '/rss/api'),  // reescribe al endpoint correcto
      },
    },
  },
})
