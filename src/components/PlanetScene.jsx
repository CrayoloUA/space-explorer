import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function PlanetScene() {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    const w = mount.clientWidth
    const h = mount.clientHeight

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(w, h)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    mount.appendChild(renderer.domElement)

    // Scene & Camera
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 1000)
    camera.position.set(0, 1.5, 6)

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.15))
    const sun = new THREE.DirectionalLight(0xfff8e0, 1.4)
    sun.position.set(5, 3, 5)
    scene.add(sun)
    const fill = new THREE.PointLight(0x4466ff, 0.1)
    fill.position.set(-8, -2, -8)
    scene.add(fill)

    // Stars
    const starGeo = new THREE.BufferGeometry()
    const starCount = 6000
    const positions = new Float32Array(starCount * 3)
    for (let i = 0; i < starCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 200
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.15, sizeAttenuation: true })
    scene.add(new THREE.Points(starGeo, starMat))

    // Earth texture via canvas
    const makeEarthTex = () => {
      const c = document.createElement('canvas')
      c.width = 512; c.height = 256
      const ctx = c.getContext('2d')
      ctx.fillStyle = '#1a4a8a'
      ctx.fillRect(0, 0, 512, 256)
      ctx.fillStyle = '#2d7a3a'
      [
        [130, 120, 60, 45, 0.3], [250, 100, 80, 55, -0.2],
        [350, 130, 55, 40, 0.5], [400, 170, 45, 35, 0.1],
        [180, 165, 35, 28, -0.3],
      ].forEach(([x, y, rx, ry, rot]) => {
        ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); ctx.fill()
      })
      ctx.fillStyle = '#c8a860'
      ctx.beginPath(); ctx.ellipse(260, 108, 30, 20, 0, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = '#e8f4ff'
      ctx.fillRect(0, 0, 512, 20); ctx.fillRect(0, 236, 512, 20)
      return new THREE.CanvasTexture(c)
    }

    const makeCloudTex = () => {
      const c = document.createElement('canvas')
      c.width = 512; c.height = 256
      const ctx = c.getContext('2d')
      ctx.clearRect(0, 0, 512, 256)
      for (let i = 0; i < 80; i++) {
        ctx.fillStyle = `rgba(255,255,255,${0.05 + Math.random() * 0.15})`
        ctx.beginPath()
        ctx.ellipse(Math.random() * 512, Math.random() * 256, 20 + Math.random() * 40, 8 + Math.random() * 15, Math.random() * Math.PI, 0, Math.PI * 2)
        ctx.fill()
      }
      return new THREE.CanvasTexture(c)
    }

    const makeMoonTex = () => {
      const c = document.createElement('canvas')
      c.width = 256; c.height = 128
      const ctx = c.getContext('2d')
      ctx.fillStyle = '#9a9a9a'
      ctx.fillRect(0, 0, 256, 128)
      for (let i = 0; i < 40; i++) {
        ctx.fillStyle = `hsl(0,0%,${30 + Math.random() * 30}%)`
        ctx.beginPath()
        ctx.arc(Math.random() * 256, Math.random() * 128, 2 + Math.random() * 7, 0, Math.PI * 2)
        ctx.fill()
      }
      return new THREE.CanvasTexture(c)
    }

    // Earth group
    const earthGroup = new THREE.Group()
    scene.add(earthGroup)

    const earth = new THREE.Mesh(
      new THREE.SphereGeometry(2, 64, 64),
      new THREE.MeshPhongMaterial({ map: makeEarthTex(), specular: new THREE.Color(0x4488aa), shininess: 20 })
    )
    earthGroup.add(earth)

    const clouds = new THREE.Mesh(
      new THREE.SphereGeometry(2.05, 32, 32),
      new THREE.MeshPhongMaterial({ map: makeCloudTex(), transparent: true, opacity: 0.4, depthWrite: false })
    )
    earthGroup.add(clouds)

    const atmo = new THREE.Mesh(
      new THREE.SphereGeometry(2.2, 32, 32),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(0x2244aa), transparent: true, opacity: 0.04, side: THREE.BackSide })
    )
    earthGroup.add(atmo)

    // Moon
    const moon = new THREE.Mesh(
      new THREE.SphereGeometry(0.38, 32, 32),
      new THREE.MeshPhongMaterial({ map: makeMoonTex() })
    )
    scene.add(moon)

    // Mouse parallax
    let mouseX = 0, mouseY = 0
    const onMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', onMouseMove)

    // Resize
    const onResize = () => {
      const nw = mount.clientWidth, nh = mount.clientHeight
      camera.aspect = nw / nh
      camera.updateProjectionMatrix()
      renderer.setSize(nw, nh)
    }
    window.addEventListener('resize', onResize)

    // Animation loop
    let animId
    const clock = new THREE.Clock()
    const animate = () => {
      animId = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()

      earth.rotation.y = t * 0.07
      clouds.rotation.y = t * 0.09

      moon.position.set(
        Math.cos(t * 0.18) * 3.6,
        Math.sin(t * 0.072) * 0.4,
        Math.sin(t * 0.18) * 3.6
      )
      moon.rotation.y = t * 0.09

      // Suave parallax con el mouse
      camera.position.x += (mouseX * 0.6 - camera.position.x) * 0.03
      camera.position.y += (-mouseY * 0.4 + 1.5 - camera.position.y) * 0.03
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
