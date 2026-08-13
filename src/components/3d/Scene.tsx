import { Suspense, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { Float, Points, PointMaterial } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'
import CameraRig from './CameraRig'
import FloatingPanels from './FloatingPanels'
import ProjectCards3D from './ProjectCards3D'
import { createGroundMaterial } from './Shaders'
import { mulberry32 } from '../../lib/random'

/** Core merah berdenyut di tengah scene — titik fokus section Hero. */
function Core() {
  return (
    <Float speed={1.6} rotationIntensity={1.4} floatIntensity={1.8}>
      <mesh position={[0, 1.4, -1.5]}>
        <icosahedronGeometry args={[1.5, 1]} />
        <meshStandardMaterial
          color="#dc143c"
          emissive="#dc143c"
          emissiveIntensity={2.4}
          flatShading
        />
      </mesh>
      <mesh position={[0, 1.4, -1.5]} scale={1.55}>
        <icosahedronGeometry args={[1.5, 0]} />
        <meshBasicMaterial color="#f5f2ee" wireframe transparent opacity={0.5} />
      </mesh>
    </Float>
  )
}

/** Partikel debu merah kecil — memberi kedalaman tanpa biaya besar. */
function Dust() {
  const positions = useMemo(() => {
    const rand = mulberry32(1337)
    const arr = new Float32Array(320 * 3)
    for (let i = 0; i < 320; i++) {
      arr[i * 3] = (rand() - 0.5) * 26
      arr[i * 3 + 1] = rand() * 9
      arr[i * 3 + 2] = (rand() - 0.5) * 18
    }
    return arr
  }, [])

  return (
    <Points positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#dc143c"
        size={0.045}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  )
}

/** Lantai grid merah via custom shader (lihat Shaders.ts). */
function Ground() {
  const material = useMemo(() => createGroundMaterial(), [])
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.4, 0]}>
      <planeGeometry args={[220, 220]} />
      <primitive object={material} attach="material" />
    </mesh>
  )
}

/**
 * Entry point seluruh scene 3D.
 * Komponen ini di-load secara lazy dari App (React.lazy) — bundle three.js
 * terpisah dari main bundle dan baru dimuat saat dibutuhkan.
 */
export default function Scene() {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ fov: 55, near: 0.1, far: 140, position: [0, 0.4, 10] }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      <color attach="background" args={['#0a0a0a']} />
      <fog attach="fog" args={['#0a0a0a', 18, 62]} />

      <ambientLight intensity={0.55} />
      <directionalLight position={[6, 9, 5]} intensity={1.6} />

      <CameraRig />
      <FloatingPanels />
      <Suspense fallback={null}>
        <ProjectCards3D />
      </Suspense>
      <Core />
      <Dust />
      <Ground />

      {/* Bloom membuat bagian terang "menyala" — hati dari look neon */}
      <EffectComposer multisampling={4}>
        <Bloom intensity={1.15} luminanceThreshold={0.18} luminanceSmoothing={0.9} mipmapBlur radius={0.75} />
        <Vignette eskil={false} offset={0.32} darkness={0.82} />
      </EffectComposer>
    </Canvas>
  )
}
