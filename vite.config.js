import { defineConfig } from 'vite'      // importa la función para configurar Vite
import react from '@vitejs/plugin-react'  // importa el plugin oficial de React para Vite

export default defineConfig({
  plugins: [react()],  // activa soporte para JSX y React Fast Refresh
  server: {
    proxy: {
      '/jpl-proxy': {                           // intercepta cualquier petición que empiece con /jpl-proxy
        target: 'https://mars.nasa.gov',        // redirige esas peticiones al servidor real de la NASA
        changeOrigin: true,                     // cambia el header Origin para evitar bloqueos CORS
        rewrite: path => path.replace(/^\/jpl-proxy/, ''),  // elimina el prefijo /jpl-proxy de la URL antes de enviarla
      },
    },
  },
})
