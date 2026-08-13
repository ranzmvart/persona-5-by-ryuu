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
  parallax: number
  seed: number
  material: THREE.ShaderMaterial
}

const PANEL_COUNT = 14

interface FloatingPanelsProps {
  /** Jumlah panel — turunkan di mobile (mode light) demi GPU */
  count?: number
}

/**
 * Panel-panel geometris abstrak melayang mengelilingi scene.
 * Semua animasi per-frame dikerjakan manual di useFrame (bukan React state)
 * → nol re-render per frame.
 *
 * Upgrade: tiap panel punya parameter uniform sendiri (scanline/glow/noise
 * bervariasi) dan sedikit parallax mengikuti posisi mouse.
 */
export default function FloatingPanels({ count = PANEL_COUNT }: FloatingPanelsProps) {
  const items = useMemo<PanelItem[]>(() => {
    const rand = mulberry32(20260813)
    return Array.from({ length: count }, () => {
      const seed = rand() * 100
      const parallax = 0.1 + rand() * 0.35
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
        parallax,
        seed,
        // parameter shader bervariasi per panel → scene tidak monoton
        material: createPanelMaterial(seed, {
          scanSpeed: 0.5 + rand() * 0.9,
          glowIntensity: 0.9 + rand() * 0.7,
          noiseScale: 2.5 + rand() * 3.5,
          noiseStrength: 0.3 + rand() * 0.45,
          fresnelPower: 2.0 + rand() * 1.5,
        }),
      }
    })
  }, [count])

  const groupRef = useRef<THREE.Group>(null)

  useFrame(({ clock, pointer }) => {
    const t = clock.elapsedTime
    groupRef.current?.children.forEach((child, i) => {
      const item = items[i]
      if (!item) return
      const mesh = child as THREE.Mesh
      mesh.rotation.x = item.spinSpeed * t * 0.6
      mesh.rotation.y = item.spinSpeed * t * 1.7
      mesh.rotation.z = item.spinSpeed * t * 0.9
      // bob melayang + parallax halus mengikuti mouse
      mesh.position.y = item.position[1] + Math.sin(t * item.bobSpeed + item.seed) * item.bobAmplitude + pointer.y * item.parallax
      mesh.position.x = item.position[0] + pointer.x * item.parallax * 0.8
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
