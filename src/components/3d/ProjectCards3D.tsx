import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import { PROJECTS } from '../../data/content'
import { createCardMaterial } from './Shaders'
import { usePortfolioStore } from '../../store/useStore'

const CARD_SIZE: [number, number] = [1.15, 1.5]

/** Posisi melayang kartu — diposisikan di area section Projects. */
const CARD_POSITIONS: Array<[number, number, number]> = [
  [-6.6, 1.15, 0.4],
  [-4.7, 2.3, 1.5],
  [-2.9, 1.05, 2.4],
  [-5.6, 0.35, 2.9],
]

interface Card3DProps {
  position: [number, number, number]
  seed: number
  index: number
}

function ProjectCard({ position, seed, index }: Card3DProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const material = useMemo(() => createCardMaterial(seed), [seed])
  const hovered = useRef(false)
  const hoverSmooth = useRef(0)
  const scaleSmooth = useRef(0)

  const active = usePortfolioStore((s) => s.activeSection)
  const isVisible = active === 2

  useEffect(() => () => material.dispose(), [material])

  const project = PROJECTS[index]

  useFrame(({ clock, camera, pointer }) => {
    const t = clock.elapsedTime
    const mesh = meshRef.current
    if (!mesh) return

    // Skala kartu: muncul penuh hanya saat section Projects aktif
    const target = isVisible ? 1 : 0.001
    scaleSmooth.current += (target - scaleSmooth.current) * 0.08
    mesh.scale.setScalar(scaleSmooth.current)

    hoverSmooth.current += ((hovered.current ? 1 : 0) - hoverSmooth.current) * 0.12
    material.uniforms.uHover.value = hoverSmooth.current
    material.uniforms.uTime.value = t

    // Parallax tilt: kartu menghadap kamera + rotasi mengikuti pointer
    mesh.lookAt(camera.position)
    mesh.rotation.y += pointer.x * 0.22
    mesh.rotation.x -= pointer.y * 0.16

    // Hover: dorong kartu maju sedikit
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
      <planeGeometry args={CARD_SIZE} />
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
