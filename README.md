# Space Explorer

Este proyecto es una aplicacion web construida con React y Vite que consume datos reales de la NASA. La idea era simple: mostrar informacion astronomica de manera visual, y de paso integrar un elemento 3D que no se sintiera pegado con cinta. El resultado fue un explorador espacial con galeria de imagenes, fotos del rover en Marte y un seguimiento de asteroides cercanos a la Tierra, todo con una escena 3D del planeta Tierra al fondo.

Lo desarrollamos para el Parcial 2 de Desarrollo Web.

---

## Que hace la aplicacion

En pocas palabras: conectarse a la API de la NASA, traer datos reales y mostrarlos de forma organizada. Hay tres secciones principales:

- **Galeria APOD** — imagenes astronomicas seleccionadas por la NASA cada dia, con buscador, filtros por tipo (imagen o video) y la opcion de guardar favoritos.
- **Galeria de Marte** — fotos tomadas por el rover Perseverance directamente desde la superficie marciana, con paginacion.
- **Asteroides cercanos** — una seccion que muestra los objetos cerca de la Tierra reportados por la NASA para el dia de hoy, con datos como velocidad, distancia y si son potencialmente peligrosos.

Y al entrar a la pagina lo primero que se ve es una escena 3D: un planeta Tierra que rota, con una luna orbitando, nubes, atmosfera y un campo de estrellas. Todo construido con Three.js, sin librerias adicionales.

---

## Tecnologias

| Tecnologia | Para que la usamos |
|---|---|
| React 18 + Vite | Base del proyecto. React maneja la interfaz y el estado, Vite compila todo rapido y levanta el servidor de desarrollo |
| Three.js | La escena 3D. Usamos la libreria directamente, sin wrappers, para tener control total sobre la animacion |
| Axios | Para hacer las peticiones HTTP a la NASA API. Maneja errores de forma mas limpia que fetch nativo |
| localStorage | Cache de respuestas y persistencia de favoritos entre sesiones |
| ESLint | Para mantener el codigo ordenado durante el desarrollo |

---

## La API: NASA Open APIs

Usamos tres endpoints de https://api.nasa.gov/

### APOD — Astronomy Picture of the Day

```
GET https://api.nasa.gov/planetary/apod?api_key=KEY&count=9
```

Devuelve imagenes o videos del universo seleccionados diariamente por la NASA. Cada respuesta trae titulo, descripcion, URL de la imagen, version en alta resolucion y tipo de media. Pedimos 9 elementos aleatorios por carga.

### Mars Rover Photos

```
GET https://mars.nasa.gov/rss/api?feed=raw_images&category=mars2020&feedtype=json&num=25&page=N&sol=N
```

Fotos reales del rover Perseverance. El parametro `sol` es un dia marciano contado desde que el rover aterrizzo. El problema es que no todos los soles tienen fotos disponibles, entonces si el primero viene vacio la aplicacion prueba automaticamente con otros valores (`500, 1500, 100...`) hasta encontrar uno con datos. Este endpoint ademas requiere un proxy por CORS, que se explica mas abajo.

### NEO Feed — asteroides

```
GET https://api.nasa.gov/neo/rest/v1/feed?api_key=KEY&start_date=HOY&end_date=HOY
```

Lista de asteroides cercanos a la Tierra para la fecha actual. De cada uno extraemos nombre, si es potencialmente peligroso, diametro estimado, velocidad y distancia de aproximacion.

### API Key

El proyecto tiene una clave personal en `src/hooks/useNASA.js`. Si quieres usar la tuya (el limite con clave registrada es 1000 peticiones por hora):

1. Registrarse gratis en https://api.nasa.gov/
2. Abrir `src/hooks/useNASA.js`
3. Cambiar el valor al inicio del archivo:

```js
const API_KEY = 'TU_API_KEY_AQUI'
```

---

## Como esta organizado el codigo

```
space-explorer/
├── public/
├── src/
│   ├── components/
│   │   ├── PlanetScene.jsx     # Toda la escena 3D: Tierra, luna, asteroides, estrellas
│   │   ├── APODCard.jsx        # Tarjeta de cada imagen con boton de favorito
│   │   ├── APODModal.jsx       # Modal que abre la imagen en HD con descripcion completa
│   │   └── MarsGallery.jsx     # Galeria de Marte con paginacion y filtros de camara
│   ├── hooks/
│   │   └── useNASA.js          # Toda la logica de peticiones, cache y manejo de errores
│   ├── App.jsx                 # Layout principal, navegacion, estado de favoritos e idioma
│   ├── index.css               # Variables CSS globales (colores, espaciados, tipografia)
│   └── main.jsx                # Punto de entrada, monta React en el div#root
├── index.html
├── vite.config.js              # Configuracion de Vite y proxy para la API de Marte
└── package.json
```

---

## Como funciona por dentro

### La escena 3D (PlanetScene.jsx)

Usamos Three.js puro, sin ningun wrapper. La textura de la Tierra no es una imagen descargada sino que se genera con un `<canvas>` HTML cada vez que carga: se dibuja el oceano con un gradiente, encima los continentes como elipses, las capas de hielo polar y las nubes. Sobre eso se montan tres capas: el planeta, las nubes semi-transparentes y la atmosfera como un halo azul claro.

La luna orbita usando `Math.cos` y `Math.sin` sobre el tiempo transcurrido, que es la forma mas directa de hacer una orbita circular. Los 26 asteroides flotan con movimiento ondulatorio. Y la camara sigue al mouse suavemente usando interpolacion: cada frame se mueve un 2.4% de la distancia que le falta para llegar al puntero, lo que da ese efecto de seguimiento con inercia.

Todo el loop de animacion se limpia cuando el componente se desmonta. Eso es importante porque si no, el `requestAnimationFrame` sigue corriendo en memoria aunque la pagina haya cambiado.

### Los hooks de datos (useNASA.js)

Los tres hooks (`useAPODGallery`, `useMarsRover`, `useNeoFeed`) siguen el mismo esquema: antes de hacer cualquier peticion HTTP revisan si ya hay datos guardados en `localStorage` que tengan menos de una hora. Si los hay, los usan directamente. Si no, hacen la peticion, guardan el resultado y lo muestran.

Esto significa que si recargas la pagina dentro de la misma hora, la aplicacion no hace ninguna llamada a la API. Util para no gastar el limite de peticiones durante el desarrollo.

El acceso a `localStorage` esta envuelto en un `try/catch` porque hay navegadores, especialmente en modo privado, que lanzan una excepcion cuando intentas usarlo. Si eso pasa la aplicacion simplemente no usa cache, pero tampoco se rompe.

### Estado global (App.jsx)

`App.jsx` maneja tres cosas a nivel global: el tab activo (APOD o Marte), el idioma (espanol o ingles) y los favoritos. Los favoritos se inicializan leyendo `localStorage` una sola vez al montar el componente, y cada vez que el usuario agrega o quita uno se guarda inmediatamente.

El idioma funciona pasando una prop `language` a cada componente. Adentro de cada uno hay un objeto `t` con los textos en ambos idiomas, y se elige segun el valor recibido. Sencillo y sin libreria de i18n.

### El proxy de Vite (vite.config.js)

La API de fotos de Marte vive en `mars.nasa.gov`. El navegador bloquea peticiones a dominios distintos al de la aplicacion (esto se llama politica CORS) a menos que el servidor lo permita explicitamente, y ese dominio no lo hace.

La solucion fue configurar un proxy en Vite: cuando el codigo hace una peticion a `/jpl-proxy/rss/api/...`, Vite la intercepta desde su servidor de desarrollo y la redirige a `https://mars.nasa.gov/rss/api/...`. Para el navegador la peticion nunca salio de `localhost`, entonces no hay bloqueo.

Ojo: este proxy solo funciona con `npm run dev`. En produccion hay que configurar algo equivalente en la plataforma de despliegue.

---

## Como ejecutarlo

```bash
# Clonar
git clone https://github.com/CrayoloUA/space-explorer.git
cd space-explorer

# Instalar dependencias
npm install

# Correr en desarrollo
npm run dev
# Abrir http://localhost:5173
```

Una aclaracion: no se puede abrir el `index.html` directamente en el navegador. El archivo solo tiene un `<div id="root">` vacio y un script que apunta a JSX sin compilar. Vite es el que transforma todo eso a JavaScript que el navegador entiende. Sin el servidor de Vite corriendo, no funciona nada.

```bash
# Para generar el build de produccion
npm run build
# Los archivos listos para subir quedan en dist/
```

---

## Despliegue

> Esta seccion se completara proximamente.

<!-- DEPLOYMENT_START -->

<!-- DEPLOYMENT_END -->

---

## Autores

Desarrollado por **CrayoloUA** — Parcial 2, Desarrollo Web
