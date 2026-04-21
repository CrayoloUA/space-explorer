import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Stars, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

function Earth() {
  const meshRef = useRef()
  const cloudRef = useRef()

  const earthTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512; canvas.height = 256
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#1a4a8a'
    ctx.fillRect(0, 0, 512, 256)
    ctx.fillStyle = '#2d7a3a'
    const continents = [
      [130, 120, 60, 45, 0.3], [250, 100, 80, 55, -0.2],
      [350, 130, 55, 40, 0.5], [400, 170, 45, 35, 0.1],
      [180, 165, 35, 28, -0.3],
    ]
    continents.forEach(([x, y, rx, ry, rot]) => {
      ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); ctx.fill()
    })
    ctx.fillStyle = '#c8a860'
    ctx.beginPath(); ctx.ellipse(260, 108, 30, 20, 0, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#e8f4ff'
    ctx.fillRect(0, 0, 512, 20)
    ctx.fillRect(0, 236, 512, 20)
    return new THREE.CanvasTexture(canvas)
  }, [])

  const cloudTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512; canvas.height = 256
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = 'transparent'
    ctx.clearRect(0, 0, 512, 256)
    for (let i = 0; i < 80; i++) {
      const x = Math.random() * 512, y = Math.random() * 256
      ctx.fillStyle = `rgba(255,255,255,${0.05 + Math.random() * 0.15})`
      ctx.beginPath()
      ctx.ellipse(x, y, 20 + Math.random() * 40, 8 + Math.random() * 15, Math.random() * Math.PI, 0, Math.PI * 2)
      ctx.fill()
    }
    return new THREE.CanvasTexture(canvas)
  }, [])

  useFrame(({ clock }) => {
    if (meshRef.current) meshRef.current.rotation.y = clock.getElapsedTime() * 0.07
    if (cloudRef.current) cloudRef.current.rotation.y = clock.getElapsedTime() * 0.09
  })

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshPhongMaterial
          map={earthTexture}
          specular={new THREE.Color(0x4488aa)}
          shininess={20}
        />
      </mesh>
      <mesh ref={cloudRef}>
        <sphereGeometry args={[2.05, 32, 32]} />
        <meshPhongMaterial map={cloudTexture} transparent opacity={0.4} depthWrite={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[2.2, 32, 32]} />
        <meshBasicMaterial color={new THREE.Color(0x2244aa)} transparent opacity={0.04} side={THREE.BackSide} />
      </mesh>
    </group>
  )
}

function Moon() {
  const moonRef = useRef()

  const moonTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 256; canvas.height = 128
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#9a9a9a'
    ctx.fillRect(0, 0, 256, 128)
    for (let i = 0; i < 40; i++) {
      const x = Math.random() * 256, y = Math.random() * 128
      ctx.fillStyle = `hsl(0,0%,${30 + Math.random() * 30}%)`
      ctx.beginPath()
      ctx.arc(x, y, 2 + Math.random() * 7, 0, Math.PI * 2)
      ctx.fill()
    }
    return new THREE.CanvasTexture(canvas)
  }, [])

  useFrame(({ clock }) => {
    if (moonRef.current) {
      const t = clock.getElapsedTime() * 0.18
      moonRef.current.position.set(Math.cos(t) * 3.6, Math.sin(t * 0.4) * 0.4, Math.sin(t) * 3.6)
      moonRef.current.rotation.y = t * 0.5
    }
  })

  return (
    <mesh ref={moonRef}>
      <sphereGeometry args={[0.38, 32, 32]} />
      <meshPhongMaterial map={moonTexture} />
    </mesh>
  )
}

export default function PlanetScene() {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas
        camera={{ position: [0, 1.5, 6], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.1} />
        <directionalLight position={[5, 3, 5]} intensity={1.3} color="#fff8e0" />
        <pointLight position={[-8, -2, -8]} intensity={0.08} color="#4466ff" />
        <Stars radius={100} depth={60} count={6000} factor={4} saturation={0.1} fade speed={0.8} />
        <Earth />
        <Moon />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={false}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={(3 * Math.PI) / 4}
        />
      </Canvas>
    </div>
  )
}