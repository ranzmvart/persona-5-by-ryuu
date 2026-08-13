import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import { PROJECTS } from '../../data/content'
import { createCardMaterial } from './Shaders'
import { usePortfolioStore } from '../../store/useStore'

const CARD_SIZE: [number, number] = [1.15, 1.5]

// Segmen tinggi supaya vertex distortion (ripple hover) terlihat halus
const CARD_SEGMENTS: [number, number] = [22, 26]

/** Posisi melayang kartu — diposisikan di area section Projects. */
const CARD_POSITIONS: Array<[number, number, number]> = [
  [-6.6, 1.15, 0.4],
  [-4.7, 2.3, 1.5],
  [-2.9, 1.05, 2.4],
  [-5.6, 0.35, 2.9],
]

// arah default planeGeometry (menghadap +Z)
const FWD = new THREE.Vector3(0, 0, 1)

interface Card3DProps {
  position: [number, number, number]
  seed: number
  index: number
}

function ProjectCard({ position, seed, index }: Card3DProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const material = useMemo(() => createCardMaterial(seed, { dashSpeed: 1.4 }), [seed])
  const hovered = useRef(false)
  const hoverSmooth = useRef(0)
  const scaleSmooth = useRef(0)

  // --- damping state rotasi (bukan snap): arah pandang + tilt pointer ---
  const smoothDir = useRef(new THREE.Vector3())
  const tiltPtr = useRef(new THREE.Vector2())
  const desiredQ = useRef(new THREE.Quaternion())
  const tmpV = useRef(new THREE.Vector3())
  const tmpQ = useRef(new THREE.Quaternion())
  const tmpQEuler = useRef(new THREE.Quaternion())
  const tmpEuler = useRef(new THREE.Euler())

  const active = usePortfolioStore((s) => s.activeSection)
  const isVisible = active === 2

  useEffect(() => () => material.dispose(), [material])

  const project = PROJECTS[index]

  useFrame(({ clock, camera, pointer }, delta) => {
    const t = clock.elapsedTime
    const mesh = meshRef.current
    if (!mesh) return

    // Skala kartu: muncul penuh hanya saat section Projects aktif
    const target = isVisible ? 1 : 0.001
    scaleSmooth.current += (target - scaleSmooth.current) * 0.08
    mesh.scale.setScalar(scaleSmooth.current)

    // Hover smoothing (uHover dipakai shader: ripple + dash + brighten)
    hoverSmooth.current += ((hovered.current ? 1 : 0) - hoverSmooth.current) * 0.12
    material.uniforms.uHover.value = hoverSmooth.current
    material.uniforms.uTime.value = t

    // faktor lerp frame-rate independent (halus di semua refresh rate)
    const k = 1 - Math.exp(-8 * delta)

    // 1) arah menghadap kamera — di-damp pelan
    const targetDir = tmpV.current.set(0, 0, 0).subVectors(camera.position, mesh.position).normalize()
    smoothDir.current.lerp(targetDir, k).normalize()

    // 2) quaternion dasar = menghadap arah itu
    tmpQ.current.setFromUnitVectors(FWD, smoothDir.current)

    // 3) tilt pointer juga di-damp (bukan snap langsung)
    tiltPtr.current.x += (pointer.x - tiltPtr.current.x) * k
    tiltPtr.current.y += (pointer.y - tiltPtr.current.y) * k
    tmpEuler.current.set(tiltPtr.current.y * 0.16, -tiltPtr.current.x * 0.22, 0)
    tmpQEuler.current.setFromEuler(tmpEuler.current)

    // 4) kombinasi: menghadap kamera lalu ditambah tilt
    desiredQ.current.copy(tmpQ.current).multiply(tmpQEuler.current)
    mesh.quaternion.slerp(desiredQ.current, k)

    // Hover: dorong kartu maju sedikit + ripple vertex via uHover
    const forward = hoverSmooth.current * 0.12
    mesh.position.z = position[2] + forward

    // Bob melayang halus
    mesh.position.y = position[1] + Math.sin(t * 0.6 + seed) * 0.18
  })

  return (
    <mesh
      ref={meshRef}
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation()
        hovered.current = true
        window.dispatchEvent(new CustomEvent('cursor:label', { detail: project.title }))
      }}
      onPointerOut={() => {
        hovered.current = false
        window.dispatchEvent(new CustomEvent('cursor:label', { detail: '' }))
      }}
    >
      {/* segmen tinggi → vertex shader bisa membuat ripple saat hover */}
      <planeGeometry args={[CARD_SIZE[0], CARD_SIZE[1], CARD_SEGMENTS[0], CARD_SEGMENTS[1]]} />
      <primitive object={material} attach="material" />
      {/* Label 3D di atas kartu (font default troika, tanpa aset) */}
      <Text
        position={[-0.5, 0.42, 0.02]}
        fontSize={0.11}
        color="#f5f2ee"
        anchorX="left"
        anchorY="middle"
        letterSpacing={0.04}
        maxWidth={0.95}
      >
        {project.title}
      </Text>
      <Text
        position={[-0.5, -0.34, 0.02]}
        fontSize={0.09}
        color="#dc143c"
        anchorX="left"
        anchorY="middle"
      >
        {project.year}
      </Text>
      <Text
        position={[0.48, 0.5, 0.02]}
        fontSize={0.16}
        color="#dc143c"
        anchorX="right"
        anchorY="middle"
      >
        {project.index}
      </Text>
    </mesh>
  )
}

export default function ProjectCards3D() {
  const seedRef = useMemo(() => new Float32Array(CARD_POSITIONS.length).map((_, i) => i * 7.3 + 1), [])
  return (
    <group>
      {CARD_POSITIONS.map((pos, i) => (
        <ProjectCard key={i} position={pos} seed={seedRef[i]} index={i} />
      ))}
    </group>
  )
}
