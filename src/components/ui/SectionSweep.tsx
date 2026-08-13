import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { usePortfolioStore } from '../../store/useStore'

const CLIP_ZERO = 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)'
const CLIP_FULL = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)'
const CLIP_EXIT = 'polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)'

/**
 * ==== SECTION SWEEP ====
 * Transisi antar section versi "slice": dua bar (merah lalu hitam)
 * menyapu layar diagonal lewat animasi clip-path, plus garis impact
 * yang menembak. Dipicu setiap kali store.sweepToken bertambah
 * (klik navigasi).
 */
export default function SectionSweep() {
  const sweepToken = usePortfolioStore((s) => s.sweepToken)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root || sweepToken === 0) return

    const red = root.querySelector<HTMLDivElement>('[data-sweep="red"]')
    const black = root.querySelector<HTMLDivElement>('[data-sweep="black"]')
    const lines = root.querySelectorAll<HTMLDivElement>('[data-sweep="line"]')
    if (!red || !black) return

    gsap.set([red, black], { clipPath: CLIP_ZERO })

    const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } })
    tl.to(red, { clipPath: CLIP_FULL, duration: 0.42 }, 0)
      .to(black, { clipPath: CLIP_FULL, duration: 0.42 }, 0.1)
      .fromTo(
        lines,
        { xPercent: -180, scaleY: 0 },
        { xPercent: 180, scaleY: 1.4, duration: 0.4, ease: 'power2.in', stagger: 0.07 },
        0.08,
      )
      .to(red, { clipPath: CLIP_EXIT, duration: 0.32 }, 0.92)
      .to(black, { clipPath: CLIP_EXIT, duration: 0.32 }, 1.02)
      .set([red, black], { clipPath: CLIP_ZERO })

    return () => {
      tl.kill()
    }
  }, [sweepToken])

  return (
    <div ref={rootRef} className="pointer-events-none fixed inset-0 z-[80] overflow-hidden">
      <div
        data-sweep="black"
        className="absolute inset-0 -skew-x-12 scale-[1.6] bg-[#0a0a0a]"
        style={{ clipPath: CLIP_ZERO }}
      />
      <div
        data-sweep="red"
        className="absolute inset-0 -skew-x-12 scale-[1.6] bg-[#dc143c]"
        style={{ clipPath: CLIP_ZERO }}
      />
      {/* garis impact tipis */}
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          data-sweep="line"
          className="absolute left-0 h-[2px] w-[45%] bg-[#dc143c]"
          style={{ top: `${22 + i * 24}%`, transform: 'skewX(-18deg)' }}
        />
      ))}
    </div>
  )
}
