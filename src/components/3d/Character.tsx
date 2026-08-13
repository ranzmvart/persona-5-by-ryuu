import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { createToonMaterial } from './Shaders'

const CHARACTER_URL = '/models/joker_war_of_the_visions_final_fantasy.glb'

/**
 * Preload di level modul (di luar komponen) — begitu Character mount,
 * model sudah ada di cache useGLTF → tanpa lag saat transisi masuk.
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

/** Mesh hasil ekstraksi dari GLB — tanpa hierarki node asli. */
interface ExtractedMesh {
  geometry: THREE.BufferGeometry
  /** Orientasi dunia dari hierarki node asli (mis. rotasi -90° X Sketchfab) */
  quaternion: THREE.Quaternion
  /** Posisi dunia mesh asli */
  position: THREE.Vector3
}

/**
 * Karakter humanoid anime/ethereal.
 *
 * Strategi render (dirombak demi keandalan):
 * - Mesh DI-EKSTRAK dari hierarki GLTF dan dirender sebagai <mesh> r3f
 *   biasa (persis objek lain di scene). Hierarki node asli (Sketchfab root
 *   dengan scale 0.01→100, Armature, dll) DIBUANG — hanya orientasi
 *   dunianya yang dipertahankan. Ini menghilangkan kelas masalah
 *   parenting/primitive yang bisa bikin mesh tidak dirender.
 * - SKINNING nonaktif (model 0 animasi): render bind pose langsung dari
 *   geometry. Skeleton three yang tidak ter-update bikin boneMatrices nol
 *   → mesh kolaps ke satu titik.
 * - SATU toon material untuk semua mesh → draw call minimal.
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
  const { scene } = useGLTF(CHARACTER_URL, true)
  const [meshData, setMeshData] = useState<ExtractedMesh | null>(null)

  // hasil auto-fit: skala + tinggi dasar (basis untuk bob)
  const fitRef = useRef({ scale: 1, baseY: position[1] })

  // satu material toon untuk SEMUA mesh — material asli glb dibuang
  const toonMaterial = useMemo(
    () => createToonMaterial({ rimColor, rimIntensity }),
    [rimColor, rimIntensity],
  )

  // ekstrak mesh pertama (model ini hanya 1 mesh) + orientasi dunianya
  useEffect(() => {
    const holder: { mesh: THREE.Mesh | null } = { mesh: null }
    scene.traverse((object) => {
      if (!holder.mesh && (object as THREE.Mesh).isMesh) holder.mesh = object as THREE.Mesh
    })
    const firstMesh = holder.mesh
    if (!firstMesh) return

    firstMesh.updateWorldMatrix(true, false)
    const quaternion = new THREE.Quaternion().setFromRotationMatrix(firstMesh.matrixWorld)
    const worldPos = new THREE.Vector3().setFromMatrixPosition(firstMesh.matrixWorld)
    const geometry = firstMesh.geometry
    geometry.computeBoundingBox()
    setMeshData({ geometry, quaternion, position: worldPos })
  }, [scene])

  // auto-fit dari bounding box geometry (bind pose)
  useEffect(() => {
    if (!meshData) return
    const box = meshData.geometry.boundingBox
    if (!box) return
    const sizeY = box.max.y - box.min.y
    const centerY = (box.max.y + box.min.y) / 2

    const fit = targetHeight / Math.max(sizeY, 0.001)
    // pindahkan pusat model ke dasar position, lalu naikkan setengah tinggi
    const baseY = position[1] - centerY * fit + targetHeight / 2
    fitRef.current = { scale: fit, baseY }

    const group = groupRef.current
    if (group) group.scale.setScalar(fit * scale)
  }, [meshData, position, targetHeight, scale])

  // cleanup GPU saat karakter dilepas (Suspense unmount)
  useEffect(() => {
    return () => toonMaterial.dispose()
  }, [toonMaterial])

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
      {meshData && (
        <group quaternion={meshData.quaternion} position={meshData.position}>
          <mesh geometry={meshData.geometry} material={toonMaterial} frustumCulled={false} />
        </group>
      )}
    </group>
  )
}
