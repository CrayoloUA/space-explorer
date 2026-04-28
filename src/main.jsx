import { StrictMode } from 'react'          // importa StrictMode para detectar problemas en desarrollo
import { createRoot } from 'react-dom/client' // importa la función que monta React en el DOM
import './index.css'                           // carga los estilos globales
import App from './App.jsx'                   // importa el componente raíz de la app

// crea la raíz de React en el div#root del HTML y renderiza la app envuelta en StrictMode
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
