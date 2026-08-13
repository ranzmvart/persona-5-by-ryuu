import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useAnimations, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { createToonMaterial } from './Shaders'

const CHARACTER_URL = '/models/joker_war_of_the_visions_final_fantasy.glb'

/**
 * Preload di level modul (di luar komponen) — begitu Character mount,
 * model sudah ada di cache useGLTF → tanpa lag saat transisi masuk.
 * Proses-nya async sehingga TIDAK memblokir render scene lain.
 * Argumen `true` = aktifkan Draco compression decoder.
 */
useGLTF.preload(CHARACTER_URL, true)

export interface CharacterProps {
  /** Posisi dasar karakter di scene (bobot melayang dihitung dari sini) */
  position?: [number, number, number]
  /** Skala manual tambahan setelah auto-fit (default 1) */
  scale?: number
  /**
   * Tinggi target karakter setelah auto-fit bounding box.
   * Model dari sumber berbeda (Sketchfab/FBX/Unity) punya skala beda —
   * auto-fit memastikan ukuran selalu konsisten di scene.
   */
  targetHeight?: number
  /** Amplitudo bob naik-turun sinusoidal */
  floatAmplitude?: number
  /** Kecepatan bob */
  floatSpeed?: number
  /** Kecepatan rotasi sangat pelan (rad/s) */
  rotationSpeed?: number
  /** Warna rim light — bisa diatur tanpa rebuild */
  rimColor?: string
  /** Kekuatan rim light */
  rimIntensity?: number
}

/**
 * Karakter humanoid anime/ethereal.
 *
 * Perfoma:
 * - SATU toon ShaderMaterial dipakai semua mesh → draw call =
 *   jumlah mesh di .glb (umumnya 1–3). Material asli glb tidak dipakai.
 * - Semua animasi per-frame di useFrame + ref — tanpa React state.
 * - Animasi clip (idle) via useAnimations, fade in/out halus.
 */
export default function Character({
  position = [0, 1.4, -1.5],
  scale = 1,
  targetHeight = 2.6,
  floatAmplitude = 0.18,
  floatSpeed = 1.1,
  rotationSpeed = 0.25,
  rimColor = '#ff2d55',
  rimIntensity = 1.4,
}: CharacterProps) {
  const groupRef = useRef<THREE.Group>(null)
  const { scene, animations } = useGLTF(CHARACTER_URL, true)
  const { actions } = useAnimations(animations, scene)

  // hasil auto-fit: skala + tinggi dasar (basis untuk bob)
  const fitRef = useRef({ scale: 1, baseY: position[1] })

  // satu material toon untuk SEMUA mesh — material asli glb dibuang
  const toonMaterial = useMemo(
    () => createToonMaterial({ rimColor, rimIntensity }),
    [rimColor, rimIntensity],
  )

  // ganti material semua mesh dengan toon shader (sekali jalan)
  useEffect(() => {
    scene.traverse((object) => {
      const mesh = object as THREE.Mesh
      if (mesh.isMesh) {
        mesh.material = toonMaterial
        // culling bounding-box skinned mesh sering salah → matikan
        mesh.frustumCulled = false
      }
    })
  }, [scene, toonMaterial])

  // auto-fit: ukur bounding box model lalu skala+posisikan ulang ke
  // ukuran target — menetralkan perbedaan skala/offset antar format export
  useEffect(() => {
    const box = new THREE.Box3().setFromObject(scene)
    const size = new THREE.Vector3()
    const center = new THREE.Vector3()
    box.getSize(size)
    box.getCenter(center)

    const fit = targetHeight / Math.max(size.y, 0.001)
    // pindahkan pusat model ke dasar position, lalu naikkan setengah tinggi
    const baseY = position[1] - center.y * fit + targetHeight / 2
    fitRef.current = { scale: fit, baseY }

    const group = groupRef.current
    if (group) group.scale.setScalar(fit * scale)
  }, [scene, position, targetHeight, scale])

  // cleanup GPU saat karakter dilepas (Suspense unmount)
  useEffect(() => {
    return () => toonMaterial.dispose()
  }, [toonMaterial])

  // mainkan clip idle otomatis — fade in/out halus saat mount/unmount
  useEffect(() => {
    const names = Object.keys(actions)
    if (names.length === 0) return
    // cari clip bernama idle; kalau tidak ada, ambil clip pertama
    const clipName = names.find((n) => n.toLowerCase().includes('idle')) ?? names[0]
    const action = actions[clipName]
    if (!action) return
    action.reset().fadeIn(0.5).play()
    return () => {
      action.fadeOut(0.5)
    }
  }, [actions])

  useFrame((state, delta) => {
    const group = groupRef.current
    if (!group) return

    const t = state.clock.elapsedTime

    // floating sinusoidal + damping (frame-rate independent),
    // bukan snap dan bukan React state
    const k = 1 - Math.exp(-4 * delta)
    const targetY = fitRef.current.baseY + Math.sin(t * floatSpeed) * floatAmplitude
    group.position.y += (targetY - group.position.y) * k

    // rotasi sangat pelan
    group.rotation.y += rotationSpeed * delta

    // pulse rim light berbasis uTime (uniform — tanpa re-render)
    toonMaterial.uniforms.uTime.value = t
  })

  return (
    <group ref={groupRef} position={position}>
      <primitive object={scene} />
    </group>
  )
}
