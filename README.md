# 🚀 Space Explorer

Aplicación web desarrollada con **React + Vite** que consume la **NASA API** y presenta datos del universo con un elemento 3D interactivo.

## 🌌 Vista previa

> Planeta Tierra 3D con luna en órbita · Galería APOD con búsqueda · Fotos reales de Marte

## ✨ Características

- **Planeta Tierra 3D** con luna en órbita — Three.js + @react-three/fiber
- **APOD Gallery** — Astronomy Picture of the Day con búsqueda en tiempo real
- **Mars Rover** — Fotos reales del rover Curiosity en Marte con paginación
- **Skeleton loaders** y manejo de errores con retry
- **Cache en localStorage** — evita repetir llamadas a la API por 1 hora
- Diseño dark theme espacial, responsive para móvil y escritorio
- Modal de detalle con imagen HD y descripción completa

## 🛠️ Tecnologías

| Tecnología | Uso |
|---|---|
| React 18 + Vite | Framework y bundler |
| Three.js + @react-three/fiber | Elemento 3D interactivo |
| @react-three/drei | Helpers 3D (Stars, OrbitControls) |
| Axios | Peticiones HTTP |
| NASA APOD API | Imágenes astronómicas del día |
| NASA Mars Rover API | Fotos desde la superficie marciana |
| localStorage | Cache de respuestas |

## 📡 API utilizada

**NASA Open APIs** — https://api.nasa.gov/

- `GET /planetary/apod?count=9` — Galería de imágenes astronómicas aleatorias
- `GET /mars-photos/api/v1/rovers/curiosity/photos?sol=1000` — Fotos del rover Curiosity

No requiere tarjeta de crédito. Registra tu API key gratuita en https://api.nasa.gov/

## ▶️ Cómo ejecutar

```bash
# 1. Clonar el repositorio
git clone https://github.com/CrayoloUA/space-explorer.git
cd space-explorer

# 2. Instalar dependencias
npm install

# 3. Correr en desarrollo
npm run dev

# 4. Abrir en el navegador
# http://localhost:5173
```

## 🔑 Configurar API Key

Por defecto usa `DEMO_KEY` (30 req/hora). Para mayor límite:

1. Regístrate gratis en [api.nasa.gov](https://api.nasa.gov/)
2. Abre `src/hooks/useNASA.js`
3. Reemplaza `DEMO_KEY` con tu clave personal

```js
const API_KEY = 'TU_API_KEY_AQUI'
```

## 📦 Build para producción

```bash
npm run build
```

## 📁 Estructura del proyecto

```
src/
├── components/
│   ├── PlanetScene.jsx    # Tierra 3D con Three.js
│   ├── APODCard.jsx       # Tarjeta de imagen astronómica
│   ├── APODModal.jsx      # Modal de detalle
│   └── MarsGallery.jsx    # Galería de fotos de Marte
├── hooks/
│   └── useNASA.js         # Custom hooks para NASA API + cache
├── App.jsx              # Layout principal
└── index.css            # Design tokens y estilos globales
```

---

Desarrollado por **CrayoloUA** — Parcial 2 · Desarrollo Web 🌎
