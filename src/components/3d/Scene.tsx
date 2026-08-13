import { Suspense, useEffect, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import {
  EffectComposer,
  Bloom,
  Vignette,
  ChromaticAberration,
  Noise,
  DepthOfField,
} from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'
import CameraRig from './CameraRig'
import Character from './Character'
import FloatingPanels from './FloatingPanels'
import ProjectCards3D from './ProjectCards3D'
import { createGroundMaterial, createDustMaterial } from './Shaders'
import { mulberry32 } from '../../lib/random'

/**
 * Placeholder saat model karakter masih loading:
 * wireframe icosahedron merah yang dulu jadi "core" di tengah scene.
 * Otomatis diganti Character begitu .glb selesai di-decode.
 */
function CorePlaceholder() {
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

const DUST_COUNT = 2200

/**
 * Ribuan partikel debu dalam SATU draw call:
 * THREE.Points + BufferGeometry, animasi sepenuhnya di vertex shader
 * (drift + twinkle) → GPU-driven, nol update JS per frame.
 */
function Dust() {
  const geometry = useMemo(() => {
    const rand = mulberry32(1337)
    const positions = new Float32Array(DUST_COUNT * 3)
    const seeds = new Float32Array(DUST_COUNT)
    for (let i = 0; i < DUST_COUNT; i++) {
      positions[i * 3] = (rand() - 0.5) * 30
      positions[i * 3 + 1] = rand() * 10 - 0.5
      positions[i * 3 + 2] = (rand() - 0.5) * 20
      seeds[i] = rand() * 100
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))
    return g
  }, [])

  const material = useMemo(() => createDustMaterial(), [])

  useFrame(({ clock, gl }) => {
    material.uniforms.uTime.value = clock.elapsedTime
    material.uniforms.uDpr.value = gl.getPixelRatio()
  })

  useEffect(() => {
    return () => {
      geometry.dispose()
      material.dispose()
    }
  }, [geometry, material])

  return <points geometry={geometry} material={material} frustumCulled={false} />
}

/**
 * Lantai grid merah via custom shader (lihat Shaders.ts).
 * uCamPos di-update tiap frame → grid fade mengikuti jarak kamera.
 */
function Ground() {
  const material = useMemo(() => createGroundMaterial(), [])

  useFrame(({ clock, camera }) => {
    material.uniforms.uCamPos.value.copy(camera.position)
    material.uniforms.uTime.value = clock.elapsedTime
  })

  useEffect(() => () => material.dispose(), [material])

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
      {/* fog gelap senada tema merah-hitam — mengaburkan objek jauh */}
      <fog attach="fog" args={['#0a0a0a', 18, 62]} />

      <ambientLight intensity={0.55} />
      <directionalLight position={[6, 9, 5]} intensity={1.6} />

      <CameraRig />
      <FloatingPanels />
      {/* Karakter 3D — placeholder tampil selama .glb belum load;
          model di-preload async sehingga tidak memblokir scene lain */}
      <Suspense fallback={<CorePlaceholder />}>
        <Character />
      </Suspense>
      <Suspense fallback={null}>
        <ProjectCards3D />
      </Suspense>
      <Dust />
      <Ground />

      {/*
        ==== POST-PROCESSING STACK (urutan penting) ====
        1. ChromaticAberration — energi warna di tepi layar (sangat ringan)
        2. Noise — film grain halus biar tidak terlihat "plastik CG"
        3. DepthOfField — objek jauh sedikit blur, memberi kedalaman
        4. Bloom — mipmapBlur menghasilkan glow halus, bukan kotak kasar
        5. Vignette — sudut layar menggelap
      */}
      <EffectComposer multisampling={4}>
        <ChromaticAberration
          offset={new THREE.Vector2(0.0016, 0.0012)}
          radialModulation={false}
          modulationOffset={0}
        />
        <Noise opacity={0.035} premultiply blendFunction={BlendFunction.OVERLAY} />
        <DepthOfField
          focusDistance={0.02}
          focalLength={0.045}
          bokehScale={2.2}
          target={new THREE.Vector3(0, 1.4, -1.5)}
        />
        <Bloom intensity={1.6} luminanceThreshold={0.15} luminanceSmoothing={0.85} mipmapBlur radius={0.85} />
        <Vignette eskil={false} offset={0.32} darkness={0.82} />
      </EffectComposer>
    </Canvas>
  )
}
