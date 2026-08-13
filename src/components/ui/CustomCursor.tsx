import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

/**
 * Custom cursor ala "penunjuk impact":
 * - dot merah kecil + ring yang mengikuti dengan lag berbeda (trail effect)
 * - ring membesar saat hover elemen [data-hover]
 * - teks label (mis. nama proyek) muncul via event 'cursor:label'
 * Nonaktif otomatis di layar sentuh (tidak ada pointer fine).
 */
export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const [label, setLabel] = useState('')

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return
    const dot = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    gsap.set([dot, ring], { xPercent: -50, yPercent: -50, x: -100, y: -100 })

    const dotX = gsap.quickTo(dot, 'x', { duration: 0.09, ease: 'power3' })
    const dotY = gsap.quickTo(dot, 'y', { duration: 0.09, ease: 'power3' })
    const ringX = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3' })
    const ringY = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3' })

    const onMove = (e: MouseEvent) => {
      dotX(e.clientX)
      dotY(e.clientY)
      ringX(e.clientX)
      ringY(e.clientY)
    }

    // Hover elemen interaktif → ring membesar + mode "attack"
    const onOver = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('[data-hover]')
      if (target) {
        const l = (target as HTMLElement).dataset.hoverLabel ?? ''
        setLabel(l)
        gsap.to(ring, { scale: 2.2, duration: 0.25, ease: 'power3.out' })
        gsap.to(dot, { scale: 0.4, duration: 0.25 })
      } else {
        setLabel('')
        gsap.to(ring, { scale: 1, duration: 0.3, ease: 'power3.out' })
        gsap.to(dot, { scale: 1, duration: 0.3 })
      }
    }

    const onClick = () => {
      gsap.fromTo(ring, { scale: 0.75 }, { scale: 1, duration: 0.3, ease: 'power2.out' })
    }

    // Label khusus (kartu 3D, tombol) lewat custom event
    const onLabel = (e: Event) => setLabel((e as CustomEvent<string>).detail)

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseover', onOver)
    window.addEventListener('click', onClick)
    window.addEventListener('cursor:label', onLabel)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseover', onOver)
      window.removeEventListener('click', onClick)
      window.removeEventListener('cursor:label', onLabel)
    }
  }, [])

  return (
    <>
      <div
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 z-[100] flex items-center justify-center mix-blend-difference"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#f5f2ee]">
          {label && (
            <span className="font-display -skew-x-12 text-[9px] tracking-widest text-[#f5f2ee]">
              {label}
            </span>
          )}
        </div>
      </div>
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[101] h-2 w-2 rounded-full bg-[#dc143c]"
      />
    </>
  )
}
