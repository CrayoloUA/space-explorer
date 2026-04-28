import { useEffect, useRef } from 'react'  // useRef apunta al div del canvas; useEffect crea la escena al montar
import * as THREE from 'three'              // librería de gráficos 3D WebGL

// componente que renderiza la escena 3D del hero: Tierra, Luna, estrellas y asteroides
export default function PlanetScene() {
  const mountRef = useRef(null)  // referencia al div contenedor donde se insertará el canvas WebGL

  useEffect(() => {
    const mount = mountRef.current       // div contenedor real del DOM
    const w = mount.clientWidth          // ancho del contenedor en píxeles
    const h = mount.clientHeight         // alto del contenedor en píxeles

    // crea el renderer WebGL con antialiasing y fondo transparente
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(w, h)                                          // ajusta el tamaño del canvas
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))   // limita a 2x para no sobrecargar pantallas retina
    mount.appendChild(renderer.domElement)                          // inserta el canvas en el div

    const scene = new THREE.Scene()                            // escena vacía donde se agregan todos los objetos 3D
    const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 1000)  // cámara con FOV 50°, relación de aspecto actual
    camera.position.set(0, 1.6, 7.5)                           // posiciona la cámara un poco arriba y alejada

    // luz ambiental suave para iluminar todo uniformemente
    scene.add(new THREE.AmbientLight(0xffffff, 0.22))
    const sun = new THREE.DirectionalLight(0xfff6df, 1.8)  // luz principal tipo sol, color cálido
    sun.position.set(7, 4, 6)                               // viene desde arriba a la derecha
    scene.add(sun)
    const fill = new THREE.PointLight(0x7c5cbf, 0.35)      // luz de relleno violeta para sombras más suaves
    fill.position.set(-10, -3, -5)
    scene.add(fill)
    const rim = new THREE.PointLight(0x63b3ed, 0.22)       // luz de borde azul para separar la Tierra del fondo
    rim.position.set(0, 8, -8)
    scene.add(rim)

    // crea la geometría de 7500 estrellas aleatorias dispersas en una esfera de radio 130
    const starGeo = new THREE.BufferGeometry()
    const starCount = 7500
    const positions = new Float32Array(starCount * 3)                             // array de coordenadas x,y,z por cada estrella
    for (let i = 0; i < starCount * 3; i++) positions[i] = (Math.random() - 0.5) * 260  // distribuye aleatoriamente
    starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))    // asigna las posiciones a la geometría
    const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.12, sizeAttenuation: true, transparent: true, opacity: 0.9 }))
    scene.add(stars)  // agrega el campo de estrellas a la escena

    // genera la textura de la Tierra dibujada en un canvas 2D
    const makeEarthTex = () => {
      const c = document.createElement('canvas')
      c.width = 1024; c.height = 512  // resolución de la textura
      const ctx = c.getContext('2d')
      const ocean = ctx.createLinearGradient(0, 0, 0, 512)  // degradado vertical para el océano
      ocean.addColorStop(0, '#153a75')  // azul oscuro en el polo norte
      ocean.addColorStop(1, '#091a35')  // azul muy oscuro en el polo sur
      ctx.fillStyle = ocean
      ctx.fillRect(0, 0, 1024, 512)    // rellena todo el canvas con el océano

      ctx.fillStyle = '#4db06e'  // color verde para los continentes
      const continents = [
        [230, 220, 120, 82, 0.28], [500, 180, 160, 98, -0.22], [710, 240, 110, 70, 0.5],
        [800, 330, 90, 55, 0.15], [365, 330, 60, 42, -0.28]
      ]
      for (const co of continents) {
        ctx.beginPath(); ctx.ellipse(co[0], co[1], co[2], co[3], co[4], 0, Math.PI * 2); ctx.fill()  // dibuja cada continente como una elipse rotada
      }

      ctx.fillStyle = '#d7c47c'  // color arena para el desierto del Sahara
      ctx.beginPath(); ctx.ellipse(520, 195, 60, 34, 0.2, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = '#f3f8ff'  // color blanco para los casquetes polares
      ctx.fillRect(0, 0, 1024, 34)    // casquete polar norte
      ctx.fillRect(0, 478, 1024, 34)  // casquete polar sur
      return new THREE.CanvasTexture(c)  // convierte el canvas en textura Three.js
    }

    // genera la textura de nubes aleatorias semitransparentes
    const makeCloudTex = () => {
      const c = document.createElement('canvas')
      c.width = 1024; c.height = 512
      const ctx = c.getContext('2d')
      ctx.clearRect(0, 0, 1024, 512)  // canvas transparente de base
      for (let i = 0; i < 160; i++) {  // dibuja 160 nubes con forma de elipse
        ctx.fillStyle = `rgba(255,255,255,${0.04 + Math.random() * 0.14})`  // blanco con opacidad aleatoria
        ctx.beginPath()
        ctx.ellipse(Math.random() * 1024, Math.random() * 512, 28 + Math.random() * 65, 10 + Math.random() * 24, Math.random() * Math.PI, 0, Math.PI * 2)
        ctx.fill()
      }
      return new THREE.CanvasTexture(c)
    }

    // genera la textura de la Luna con cráteres grises
    const makeMoonTex = () => {
      const c = document.createElement('canvas')
      c.width = 256; c.height = 128
      const ctx = c.getContext('2d')
      ctx.fillStyle = '#a3a3a3'; ctx.fillRect(0, 0, 256, 128)  // base gris uniforme
      for (let i = 0; i < 44; i++) {  // dibuja 44 cráteres con tonos grises variados
        ctx.fillStyle = `hsl(0,0%,${28 + Math.random() * 35}%)`
        ctx.beginPath(); ctx.arc(Math.random() * 256, Math.random() * 128, 2 + Math.random() * 8, 0, Math.PI * 2); ctx.fill()
      }
      return new THREE.CanvasTexture(c)
    }

    const earthGroup = new THREE.Group()  // grupo que contiene Tierra + nubes + atmósfera + anillo
    scene.add(earthGroup)

    // esfera principal de la Tierra con textura generada
    const earth = new THREE.Mesh(
      new THREE.SphereGeometry(2.15, 96, 96),  // radio 2.15, alta resolución para suavidad
      new THREE.MeshPhongMaterial({ map: makeEarthTex(), specular: new THREE.Color(0x7ed0ff), shininess: 28 })  // brillo azul en el océano
    )
    earthGroup.add(earth)

    // capa de nubes ligeramente más grande que la Tierra para dar efecto de atmósfera
    const clouds = new THREE.Mesh(
      new THREE.SphereGeometry(2.2, 48, 48),
      new THREE.MeshPhongMaterial({ map: makeCloudTex(), transparent: true, opacity: 0.38, depthWrite: false })  // semitransparente
    )
    earthGroup.add(clouds)

    // esfera de atmósfera azul tenue visible solo desde afuera (BackSide)
    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(2.42, 48, 48),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(0x78c8ff), transparent: true, opacity: 0.08, side: THREE.BackSide })
    )
    earthGroup.add(atmosphere)

    // anillo decorativo inclinado alrededor de la Tierra
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(2.85, 0.035, 16, 180),  // radio 2.85, tubo muy delgado
      new THREE.MeshBasicMaterial({ color: 0x7ed0ff, transparent: true, opacity: 0.35 })
    )
    ring.rotation.x = Math.PI / 2.25  // inclina el anillo para que no sea perfectamente horizontal
    ring.rotation.y = 0.35
    earthGroup.add(ring)

    // esfera de la Luna con su textura de cráteres
    const moon = new THREE.Mesh(
      new THREE.SphereGeometry(0.42, 40, 40),
      new THREE.MeshPhongMaterial({ map: makeMoonTex() })
    )
    scene.add(moon)

    // grupo de 26 asteroides pequeños con forma icosaédrica
    const asteroidGroup = new THREE.Group()
    scene.add(asteroidGroup)
    for (let i = 0; i < 26; i++) {
      const asteroid = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.03 + Math.random() * 0.09, 0),  // tamaño aleatorio entre 0.03 y 0.12
        new THREE.MeshStandardMaterial({ color: i % 3 === 0 ? 0xa88c74 : 0x6d6d82, roughness: 1, metalness: 0.05 })  // alterna entre marrón y gris
      )
      asteroid.position.set((Math.random() - 0.5) * 14, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 10)  // posición aleatoria
      asteroid.userData = { speed: 0.08 + Math.random() * 0.12, offset: Math.random() * Math.PI * 2 }  // datos para animación individual
      asteroidGroup.add(asteroid)
    }

    let mouseX = 0, mouseY = 0  // posición normalizada del mouse (-1 a 1)
    const onMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2   // convierte posición a rango -1..1
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', onMouseMove)  // actualiza la posición del mouse en cada movimiento

    // actualiza la cámara y el canvas al cambiar el tamaño de la ventana
    const onResize = () => {
      const nw = mount.clientWidth, nh = mount.clientHeight
      camera.aspect = nw / nh           // recalcula la relación de aspecto
      camera.updateProjectionMatrix()   // aplica el cambio a la proyección
      renderer.setSize(nw, nh)          // redimensiona el canvas
    }
    window.addEventListener('resize', onResize)

    const startTime = performance.now()  // tiempo de inicio para calcular el tiempo transcurrido en la animación
    let animId                           // ID del frame de animación para poder cancelarlo

    const animate = () => {
      animId = requestAnimationFrame(animate)              // solicita el siguiente frame
      const t = (performance.now() - startTime) / 1000    // tiempo en segundos desde el inicio

      earth.rotation.y = t * 0.08       // rota la Tierra lentamente
      clouds.rotation.y = t * 0.11      // las nubes rotan un poco más rápido que la Tierra
      atmosphere.rotation.y = -t * 0.03 // la atmósfera rota al revés, muy lento
      ring.rotation.z = Math.sin(t * 0.5) * 0.06  // el anillo oscila suavemente
      stars.rotation.y = t * 0.005      // el campo de estrellas gira muy lento
      stars.rotation.x = Math.sin(t * 0.08) * 0.04  // leve balanceo vertical de las estrellas

      earthGroup.rotation.z = Math.sin(t * 0.32) * 0.08  // el grupo de la Tierra oscila lateralmente
      earthGroup.position.y = Math.sin(t * 0.5) * 0.08   // sube y baja suavemente (efecto flotante)

      // la Luna orbita alrededor de la Tierra en una elipse
      moon.position.set(Math.cos(t * 0.22) * 4.2, Math.sin(t * 0.14) * 0.45, Math.sin(t * 0.22) * 4.2)
      moon.rotation.y = t * 0.12  // la Luna gira sobre sí misma

      // cada asteroide rota sobre sus propios ejes y flota con un seno diferente
      asteroidGroup.children.forEach((asteroid, i) => {
        asteroid.rotation.x += 0.006  // rotación constante en X
        asteroid.rotation.y += 0.008  // rotación constante en Y
        asteroid.position.y += Math.sin(t * asteroid.userData.speed + asteroid.userData.offset + i) * 0.002  // flotación vertical individual
      })
      asteroidGroup.rotation.y = t * 0.04  // todo el cinturón de asteroides orbita lentamente

      // la cámara sigue el mouse con suavizado (lerp)
      camera.position.x += (mouseX * 0.85 - camera.position.x) * 0.024
      camera.position.y += (-mouseY * 0.5 + 1.6 - camera.position.y) * 0.024
      camera.lookAt(scene.position)   // la cámara siempre apunta al centro de la escena
      renderer.render(scene, camera)  // dibuja el frame actual
    }
    animate()  // arranca el loop de animación

    // cleanup: cancela la animación y libera recursos al desmontar el componente
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', onResize)
      renderer.dispose()  // libera la memoria WebGL
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)  // quita el canvas del DOM
    }
  }, [])  // solo corre una vez al montar

  return <div ref={mountRef} style={{ width: '100%', height: '100%' }} />  // div contenedor que ocupa todo el espacio del padre
}
