# Space Explorer

Aplicacion web desarrollada con React y Vite que consume la NASA Open API para mostrar datos astronomicos reales. Incluye una escena 3D interactiva construida con Three.js, una galeria de imagenes del universo, fotos del rover marciano y seguimiento de asteroides cercanos a la Tierra en tiempo real.

---

## Descripcion general

Space Explorer es una Single Page Application (SPA) organizada en dos vistas principales accesibles desde una barra de navegacion fija: la galeria APOD y la galeria de Marte. La aplicacion maneja tres fuentes de datos distintas de la NASA, las almacena en cache local para no repetir peticiones innecesarias y presenta todo con estados de carga, error y vacio disenados explicitamente.

---

## Tecnologias utilizadas

| Tecnologia | Version | Para que se usa |
|---|---|---|
| React | 18 | Framework de interfaz. Gestiona el estado, los componentes y el ciclo de vida de la aplicacion |
| Vite | 6 | Bundler y servidor de desarrollo. Compila el proyecto y expone un servidor local rapido con HMR |
| Three.js | 0.176 | Libreria de graficos 3D sobre WebGL. Se usa para construir la escena del planeta Tierra visible en el hero |
| Axios | 1.9 | Cliente HTTP. Realiza todas las peticiones a la NASA API con manejo de errores estructurado |
| ESLint | 9 | Linter de codigo. Detecta errores de sintaxis y patrones incorrectos en JavaScript y JSX |

---

## API utilizada

**NASA Open APIs** — https://api.nasa.gov/

La aplicacion consume tres endpoints distintos de la NASA:

### APOD — Astronomy Picture of the Day

```
GET https://api.nasa.gov/planetary/apod?api_key=KEY&count=9
```

Devuelve un arreglo de objetos con imagen o video del dia seleccionados por astronomos de la NASA. Cada objeto incluye `title`, `explanation`, `url`, `hdurl`, `media_type` y `date`. La aplicacion solicita 9 elementos aleatorios cada vez que se refresca la galeria.

### Mars Rover Photos — JPL

```
GET https://mars.nasa.gov/rss/api?feed=raw_images&category=mars2020&feedtype=json&num=25&page=N&sol=N
```

Devuelve fotos tomadas por el rover Perseverance en Marte. El parametro `sol` representa un dia marciano contado desde el aterrizaje del rover. La aplicacion intenta multiples valores de sol en orden (`1000, 500, 1500, 100...`) hasta encontrar uno que tenga fotos disponibles, lo que evita errores silenciosos cuando un sol especifico no tiene datos. Este endpoint se accede a traves de un proxy local de Vite para evitar errores de CORS (ver seccion de configuracion).

### NEO Feed — Near Earth Objects

```
GET https://api.nasa.gov/neo/rest/v1/feed?api_key=KEY&start_date=HOY&end_date=HOY
```

Devuelve los asteroides cercanos a la Tierra reportados por la NASA para la fecha actual. Por cada asteroide se extrae nombre, si es potencialmente peligroso, magnitud absoluta, diametro estimado, velocidad relativa y distancia minima de aproximacion.

### API Key

Por defecto la aplicacion usa una clave personal hardcodeada en `src/hooks/useNASA.js`. Para mayor limite de peticiones (por defecto 1000 req/hora con clave registrada):

1. Registrarse en https://api.nasa.gov/
2. Abrir `src/hooks/useNASA.js`
3. Reemplazar el valor de `API_KEY` al inicio del archivo

```js
const API_KEY = 'TU_API_KEY_AQUI'
```

---

## Estructura del proyecto

```
space-explorer/
├── public/                        # Archivos estaticos servidos directamente
├── src/
│   ├── components/
│   │   ├── PlanetScene.jsx        # Escena 3D completa: Tierra, luna, asteroides y estrellas
│   │   ├── APODCard.jsx           # Tarjeta individual de imagen astronomica con accion de favorito
│   │   ├── APODModal.jsx          # Modal de detalle con imagen HD y descripcion completa
│   │   └── MarsGallery.jsx        # Galeria de fotos del rover con paginacion y filtros
│   ├── hooks/
│   │   └── useNASA.js             # Custom hooks para APOD, Mars Rover y NEO Feed + sistema de cache
│   ├── App.jsx                    # Componente raiz: layout, navegacion, estado global de favoritos
│   ├── App.css                    # Estilos minimos del componente App
│   ├── index.css                  # Design tokens CSS y estilos globales de la aplicacion
│   └── main.jsx                   # Punto de entrada: monta React en el DOM
├── index.html                     # HTML base que carga el bundle de Vite
├── vite.config.js                 # Configuracion de Vite: plugin React y proxy para JPL/NASA
├── package.json                   # Dependencias y scripts del proyecto
└── eslint.config.js               # Reglas de ESLint para el proyecto
```

---

## Como funciona cada parte

### Escena 3D — PlanetScene.jsx

Usa Three.js directamente (sin wrappers) para construir una escena con:

- Un planeta Tierra con textura de oceanos y continentes generada proceduralmente en un `<canvas>` HTML, mapeada sobre una esfera con geometria `SphereGeometry(2.15, 96, 96)` de alta resolucion
- Una capa de nubes semi-transparentes sobre la Tierra con rotacion independiente
- Una atmosfera con efecto de halo usando `MeshBasicMaterial` con `side: THREE.BackSide`
- Una luna que orbita con `Math.cos` y `Math.sin` sobre el tiempo transcurrido
- Un campo de 7500 estrellas generadas con `BufferGeometry` y posiciones aleatorias
- 26 asteroides con geometria icosaedral que flotan y rotan alrededor de la escena
- Interaccion con el mouse: la camara sigue suavemente al cursor usando interpolacion lineal por frame

La animacion corre en un loop con `requestAnimationFrame` y se limpia correctamente cuando el componente se desmonta (cleanup del `useEffect`), lo que evita fugas de memoria.

### Custom Hooks — useNASA.js

Contiene tres hooks que siguen el mismo patron:

**`useAPODGallery(count)`** — Pide imagenes a APOD, verifica primero el cache local con la clave `apod_gallery_N`. Si el cache existe y no ha expirado (1 hora), lo usa directamente sin hacer ninguna peticion HTTP. Si no, hace la peticion con Axios, ordena los resultados por fecha descendente y guarda en cache. Expone `{ data, loading, error, refetch }`. El metodo `refetch` incrementa un contador interno `tick` que el `useEffect` tiene como dependencia, forzando una nueva carga.

**`useMarsRover(page, sol)`** — Intenta cargar fotos del rover para un sol marciano especifico. Si ese sol no tiene fotos (la respuesta viene vacia), prueba automaticamente con valores de fallback definidos en `MARS_FALLBACK_SOLS`. Esto es necesario porque no todos los dias marcianos tienen imagenes disponibles publicamente. Cada combinacion de sol y pagina tiene su propia clave de cache.

**`useNeoFeed()`** — Pide asteroides para la fecha actual del sistema. La clave de cache es fija (`neo_feed_today`) lo que significa que la cache se invalida al dia siguiente porque la fecha de la peticion cambia.

El sistema de cache usa una funcion `safeStorage()` que intenta acceder a `localStorage` dentro de un bloque `try/catch`. Esto es importante porque algunos navegadores en modo privado o en iframes con restricciones pueden lanzar una excepcion al intentar acceder a `localStorage`, y manejarlo asi evita que toda la aplicacion falle por esa razon.

### Estado global — App.jsx

`App.jsx` maneja tres piezas de estado que afectan a multiples componentes:

- `activeTab` — controla que vista se muestra (APOD Gallery o Mars)
- `language` — alterna entre espanol e ingles. Cada componente recibe el idioma como prop y contiene sus propios textos en un objeto `t` con ambas claves
- `favorites` — arreglo de objetos APOD guardados por el usuario. Se inicializa leyendo `localStorage` directamente en el estado inicial con una funcion de inicializacion lazy (`useState(() => ...)`), lo que garantiza que la lectura solo ocurre una vez al montar. Cada cambio en los favoritos se persiste inmediatamente en `localStorage`

### Sistema de design tokens — index.css

Todos los valores visuales de la aplicacion (colores, espaciados, radios, sombras, fuentes) estan definidos como variables CSS en `:root`. Esto significa que ningun componente tiene valores magicos hardcodeados: usar `var(--space-4)` en lugar de `1rem` directamente hace que el sistema sea coherente y modificable desde un solo lugar.

---

## Como ejecutar el proyecto

```bash
# 1. Clonar el repositorio
git clone https://github.com/CrayoloUA/space-explorer.git
cd space-explorer

# 2. Instalar dependencias
npm install

# 3. Iniciar el servidor de desarrollo
npm run dev

# 4. Abrir en el navegador
# http://localhost:5173
```

### Por que es necesario npm run dev y no abrir el HTML directamente

La aplicacion usa JSX (sintaxis de React que no entienden los navegadores) y modulos ES que se resuelven por nombre (`import React from 'react'`). Vite se encarga de transpilar JSX a JavaScript valido y de resolver esas importaciones desde `node_modules`. Abrir el `index.html` directamente en el navegador no funciona porque el archivo solo contiene un `<div id="root">` y un script que apunta al codigo fuente sin transpilar.

Adicionalmente, el proxy configurado en `vite.config.js` para el endpoint de Marte solo funciona cuando el servidor de Vite esta corriendo. Sin ese proxy, las peticiones al dominio `mars.nasa.gov` fallarian por politica de CORS del navegador.

```bash
# Compilar para produccion
npm run build

# El resultado queda en la carpeta dist/
# dist/ contiene HTML, CSS y JS ya minificados, listos para subir a un servidor estatico
```

---

## Configuracion del proxy (vite.config.js)

```js
server: {
  proxy: {
    '/jpl-proxy': {
      target: 'https://mars.nasa.gov',
      changeOrigin: true,
      rewrite: path => path.replace(/^\/jpl-proxy/, ''),
    },
  },
}
```

La API de imagenes del rover de Marte vive en `mars.nasa.gov`, un dominio distinto al de la aplicacion (`localhost:5173`). Los navegadores bloquean peticiones entre dominios distintos por la politica de Same-Origin (CORS) a menos que el servidor destino lo permita explicitamente, y `mars.nasa.gov` no incluye los headers necesarios para permitirlo desde `localhost`.

El proxy de Vite soluciona esto: cuando la aplicacion hace una peticion a `/jpl-proxy/rss/api/...`, Vite la intercepta desde el servidor de desarrollo (que si tiene permiso para hablar con cualquier dominio), la redirige a `https://mars.nasa.gov/rss/api/...` y devuelve la respuesta al navegador. Para el navegador, la peticion nunca salio del mismo origen.

Este proxy solo existe en desarrollo. En produccion es necesario configurar un proxy equivalente en el servidor o plataforma de despliegue (ver seccion de despliegue).

---

## Despliegue

> Esta seccion se completara proximamente.

<!-- DEPLOYMENT_START -->

<!-- DEPLOYMENT_END -->

---

## Autor

Desarrollado por **CrayoloUA** — Parcial 2, Desarrollo Web
