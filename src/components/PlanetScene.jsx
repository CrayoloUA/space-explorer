import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function PlanetScene() {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    const w = mount.clientWidth
    const h = mount.clientHeight

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(w, h)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 1000)
    camera.position.set(0, 1.6, 7.5)

    scene.add(new THREE.AmbientLight(0xffffff, 0.22))
    const sun = new THREE.DirectionalLight(0xfff6df, 1.8)
    sun.position.set(7, 4, 6)
    scene.add(sun)
    const fill = new THREE.PointLight(0x7c5cbf, 0.35)
    fill.position.set(-10, -3, -5)
    scene.add(fill)
    const rim = new THREE.PointLight(0x63b3ed, 0.22)
    rim.position.set(0, 8, -8)
    scene.add(rim)

    const starGeo = new THREE.BufferGeometry()
    const starCount = 7500
    const positions = new Float32Array(starCount * 3)
    for (let i = 0; i < starCount * 3; i++) positions[i] = (Math.random() - 0.5) * 260
    starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.12, sizeAttenuation: true, transparent: true, opacity: 0.9 }))
    scene.add(stars)

    const makeEarthTex = () => {
      const c = document.createElement('canvas')
      c.width = 1024; c.height = 512
      const ctx = c.getContext('2d')
      const ocean = ctx.createLinearGradient(0, 0, 0, 512)
      ocean.addColorStop(0, '#153a75')
      ocean.addColorStop(1, '#091a35')
      ctx.fillStyle = ocean
      ctx.fillRect(0, 0, 1024, 512)

      ctx.fillStyle = '#4db06e'
      const continents = [
        [230, 220, 120, 82, 0.28], [500, 180, 160, 98, -0.22], [710, 240, 110, 70, 0.5],
        [800, 330, 90, 55, 0.15], [365, 330, 60, 42, -0.28]
      ]
      for (const co of continents) {
        ctx.beginPath(); ctx.ellipse(co[0], co[1], co[2], co[3], co[4], 0, Math.PI * 2); ctx.fill()
      }

      ctx.fillStyle = '#d7c47c'
      ctx.beginPath(); ctx.ellipse(520, 195, 60, 34, 0.2, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = '#f3f8ff'
      ctx.fillRect(0, 0, 1024, 34)
      ctx.fillRect(0, 478, 1024, 34)
      return new THREE.CanvasTexture(c)
    }

    const makeCloudTex = () => {
      const c = document.createElement('canvas')
      c.width = 1024; c.height = 512
      const ctx = c.getContext('2d')
      ctx.clearRect(0, 0, 1024, 512)
      for (let i = 0; i < 160; i++) {
        ctx.fillStyle = `rgba(255,255,255,${0.04 + Math.random() * 0.14})`
        ctx.beginPath()
        ctx.ellipse(Math.random() * 1024, Math.random() * 512, 28 + Math.random() * 65, 10 + Math.random() * 24, Math.random() * Math.PI, 0, Math.PI * 2)
        ctx.fill()
      }
      return new THREE.CanvasTexture(c)
    }

    const makeMoonTex = () => {
      const c = document.createElement('canvas')
      c.width = 256; c.height = 128
      const ctx = c.getContext('2d')
      ctx.fillStyle = '#a3a3a3'; ctx.fillRect(0, 0, 256, 128)
      for (let i = 0; i < 44; i++) {
        ctx.fillStyle = `hsl(0,0%,${28 + Math.random() * 35}%)`
        ctx.beginPath(); ctx.arc(Math.random() * 256, Math.random() * 128, 2 + Math.random() * 8, 0, Math.PI * 2); ctx.fill()
      }
      return new THREE.CanvasTexture(c)
    }

    const earthGroup = new THREE.Group()
    scene.add(earthGroup)

    const earth = new THREE.Mesh(
      new THREE.SphereGeometry(2.15, 96, 96),
      new THREE.MeshPhongMaterial({ map: makeEarthTex(), specular: new THREE.Color(0x7ed0ff), shininess: 28 })
    )
    earthGroup.add(earth)

    const clouds = new THREE.Mesh(
      new THREE.SphereGeometry(2.2, 48, 48),
      new THREE.MeshPhongMaterial({ map: makeCloudTex(), transparent: true, opacity: 0.38, depthWrite: false })
    )
    earthGroup.add(clouds)

    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(2.42, 48, 48),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(0x78c8ff), transparent: true, opacity: 0.08, side: THREE.BackSide })
    )
    earthGroup.add(atmosphere)

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(2.85, 0.035, 16, 180),
      new THREE.MeshBasicMaterial({ color: 0x7ed0ff, transparent: true, opacity: 0.35 })
    )
    ring.rotation.x = Math.PI / 2.25
    ring.rotation.y = 0.35
    earthGroup.add(ring)

    const moon = new THREE.Mesh(
      new THREE.SphereGeometry(0.42, 40, 40),
      new THREE.MeshPhongMaterial({ map: makeMoonTex() })
    )
    scene.add(moon)

    const asteroidGroup = new THREE.Group()
    scene.add(asteroidGroup)
    for (let i = 0; i < 26; i++) {
      const asteroid = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.03 + Math.random() * 0.09, 0),
        new THREE.MeshStandardMaterial({ color: i % 3 === 0 ? 0xa88c74 : 0x6d6d82, roughness: 1, metalness: 0.05 })
      )
      asteroid.position.set((Math.random() - 0.5) * 14, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 10)
      asteroid.userData = { speed: 0.08 + Math.random() * 0.12, offset: Math.random() * Math.PI * 2 }
      asteroidGroup.add(asteroid)
    }

    let mouseX = 0, mouseY = 0
    const onMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', onMouseMove)

    const onResize = () => {
      const nw = mount.clientWidth, nh = mount.clientHeight
      camera.aspect = nw / nh
      camera.updateProjectionMatrix()
      renderer.setSize(nw, nh)
    }
    window.addEventListener('resize', onResize)

    const startTime = performance.now()
    let animId

    const animate = () => {
      animId = requestAnimationFrame(animate)
      const t = (performance.now() - startTime) / 1000

      earth.rotation.y = t * 0.08
      clouds.rotation.y = t * 0.11
      atmosphere.rotation.y = -t * 0.03
      ring.rotation.z = Math.sin(t * 0.5) * 0.06
      stars.rotation.y = t * 0.005
      stars.rotation.x = Math.sin(t * 0.08) * 0.04

      earthGroup.rotation.z = Math.sin(t * 0.32) * 0.08
      earthGroup.position.y = Math.sin(t * 0.5) * 0.08

      moon.position.set(Math.cos(t * 0.22) * 4.2, Math.sin(t * 0.14) * 0.45, Math.sin(t * 0.22) * 4.2)
      moon.rotation.y = t * 0.12

      asteroidGroup.children.forEach((asteroid, i) => {
        asteroid.rotation.x += 0.006
        asteroid.rotation.y += 0.008
        asteroid.position.y += Math.sin(t * asteroid.userData.speed + asteroid.userData.offset + i) * 0.002
      })
      asteroidGroup.rotation.y = t * 0.04

      camera.position.x += (mouseX * 0.85 - camera.position.x) * 0.024
      camera.position.y += (-mouseY * 0.5 + 1.6 - camera.position.y) * 0.024
      camera.lookAt(scene.position)
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
}
