import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { createPanelMaterial } from './Shaders'
import { mulberry32 } from '../../lib/random'

interface PanelItem {
  position: [number, number, number]
  size: [number, number]
  spinSpeed: number
  bobAmplitude: number
  bobSpeed: number
  seed: number
  material: THREE.ShaderMaterial
}

const PANEL_COUNT = 14

/**
 * Panel-panel geometris abstrak melayang mengelilingi scene.
 * Rotasi + bob dikerjakan manual di useFrame (bukan React state)
 * supaya nol re-render per frame.
 */
export default function FloatingPanels() {
  const items = useMemo<PanelItem[]>(() => {
    const rand = mulberry32(20260813)
    return Array.from({ length: PANEL_COUNT }, () => {
      const seed = rand() * 100
      return {
        position: [
          (rand() - 0.5) * 26,
          0.7 + rand() * 6.2,
          -8.5 + rand() * 14.5,
        ] as [number, number, number],
        size: [0.6 + rand() * 1.7, 0.6 + rand() * 1.7] as [number, number],
        spinSpeed: 0.05 + rand() * 0.28,
        bobAmplitude: 0.3 + rand() * 0.7,
        bobSpeed: 0.3 + rand() * 0.55,
        seed,
        material: createPanelMaterial(seed),
      }
    })
  }, [])

  const groupRef = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    groupRef.current?.children.forEach((child, i) => {
      const item = items[i]
      if (!item) return
      const mesh = child as THREE.Mesh
      mesh.rotation.x = item.spinSpeed * t * 0.6
      mesh.rotation.y = item.spinSpeed * t * 1.7
      mesh.rotation.z = item.spinSpeed * t * 0.9
      mesh.position.y = item.position[1] + Math.sin(t * item.bobSpeed + item.seed) * item.bobAmplitude
      item.material.uniforms.uTime.value = t
    })
  })

  // Bersihkan GPU memory saat komponen dilepas
  useEffect(() => {
    return () => items.forEach((i) => i.material.dispose())
  }, [items])

  return (
    <group ref={groupRef}>
      {items.map((item, i) => (
        <mesh key={i} position={item.position} renderOrder={2}>
          <planeGeometry args={item.size} />
          <primitive object={item.material} attach="material" />
        </mesh>
      ))}
    </group>
  )
}
