import { useLayoutEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'
import { usePortfolioStore } from '../../store/useStore'

/**
 * ==== CAMERA RIG ====
 * Kamera bergerak sepanjang CatmullRomCurve3 yang melewati 4 titik
 * (satu per section). Scroll progress 0..1 dari store dipetakan ke
 * parameter kurva dengan easing per-segment, lalu posisi di-lerp
 * secara frame-rate independent supaya gerakannya sinematik.
 */

const SECTION_COUNT = 4

const CAMERA_POINTS = [
  new THREE.Vector3(0, 0.4, 10), // Hero — menghadap core merah di tengah
  new THREE.Vector3(8.2, 1.3, 7.2), // About
  new THREE.Vector3(-7.6, 1.2, 8.4), // Projects — kartu di kiri scene
  new THREE.Vector3(0, 2.6, 12.5), // Contact — pull-back lebar
]

const LOOK_POINTS = [
  new THREE.Vector3(0, 1.1, -1.2),
  new THREE.Vector3(4.6, 0.9, -0.8),
  new THREE.Vector3(-4.3, 1.5, 1.4),
  new THREE.Vector3(0, 1.2, -1.6),
]

function easeInOutCubic(x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2
}

export default function CameraRig() {
  const { camera } = useThree()

  const path = useRef(
    new THREE.CatmullRomCurve3(CAMERA_POINTS, false, 'catmullrom', 0.6),
  ).current
  const lookPath = useRef(
    new THREE.CatmullRomCurve3(LOOK_POINTS, false, 'catmullrom', 0.6),
  ).current

  const lookTarget = useRef(new THREE.Vector3())
  const swayTime = useRef(0)
  const punch = useRef({ amt: 0 })

  // Settle kamera di titik Hero saat pertama render (hindari flash)
  useLayoutEffect(() => {
    camera.position.copy(CAMERA_POINTS[0])
    camera.lookAt(LOOK_POINTS[0])
    lookTarget.current.copy(LOOK_POINTS[0])
  }, [camera])

  // Micro "impact" kecil saat section berubah (kamera maju-mundur sesaat)
  useLayoutEffect(() => {
    const unsub = usePortfolioStore.subscribe((state, prev) => {
      if (state.activeSection !== prev.activeSection) {
        gsap.fromTo(punch.current, { amt: 1 }, { amt: 0, duration: 0.9, ease: 'power2.out' })
      }
    })
    return unsub
  }, [])

  useFrame((_, delta) => {
    const progress = usePortfolioStore.getState().scrollProgress
    const clamped = Math.min(Math.max(progress, 0), 1)

    // progress 0..1 → segmen section + easing lokal
    const raw = clamped * SECTION_COUNT
    const section = Math.min(SECTION_COUNT - 1, Math.floor(raw))
    const local = Math.min(raw - section, 1)
    const eased = easeInOutCubic(local)
    const t = (section + eased) / (SECTION_COUNT - 1)

    // Posisi + target pandangan di sepanjang kurva
    const pos = path.getPoint(t)
    const look = lookPath.getPoint(t)

    // Lerp frame-rate independent (smooth cinematic)
    const lerpFactor = 1 - Math.pow(0.0001, delta)
    camera.position.lerp(pos, lerpFactor)
    lookTarget.current.lerp(look, lerpFactor)

    // Sway halus biar tidak mati statis
    swayTime.current += delta
    camera.position.y += Math.sin(swayTime.current * 0.55) * 0.05
    camera.position.x += Math.sin(swayTime.current * 0.37) * 0.05

    // Punch dari ganti section
    camera.position.z += punch.current.amt * 0.35

    // Subtle camera shake: komposit sinus multi-frekuensi (≈ noise murah)
    // amplitudo kecil agar tidak mengganggu path CatmullRomCurve3
    const st = swayTime.current
    const amp = 0.014
    camera.position.x += (Math.sin(st * 13.7) * 0.5 + Math.sin(st * 7.3 + 1.7) * 0.3) * amp
    camera.position.y += (Math.sin(st * 11.3 + 0.8) * 0.5 + Math.sin(st * 5.9 + 2.4) * 0.3) * amp

    camera.lookAt(lookTarget.current)
  })

  return null
}
