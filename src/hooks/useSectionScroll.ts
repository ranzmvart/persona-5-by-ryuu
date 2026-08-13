import { useEffect, type RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import { usePortfolioStore } from '../store/useStore'
import { SECTIONS } from '../data/content'

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)

/**
 * Menghubungkan scroll 400vh ke:
 *  1. store.scrollProgress (dikonsumsi CameraRig di dalam useFrame — tanpa re-render)
 *  2. store.activeSection (dipicu spacer tiap section: top↔bottom)
 *  3. animasi tiap overlay section: geser + skew masuk/keluar (scrubbed)
 *
 * Setiap section punya spacer absolut 100vh di dalam wrapper,
 * jadi trigger ScrollTrigger-nya presisi 1:1 dengan posisi kamera.
 */
export function useSectionScroll(wrapRef: RefObject<HTMLDivElement | null>): void {
  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return

    const setScrollProgress = usePortfolioStore.getState().setScrollProgress
    const setActiveSection = usePortfolioStore.getState().setActiveSection

    // Progress global 0..1 → kamera di CameraRig
    const progressTrigger = ScrollTrigger.create({
      trigger: wrap,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => setScrollProgress(self.progress),
    })

    // Spacer + animasi konten tiap section
    const triggers: ScrollTrigger[] = []
    const timelines: gsap.core.Timeline[] = []

    SECTIONS.forEach((section, i) => {
      const spacer = wrap.querySelector<HTMLDivElement>(`[data-section-space="${i}"]`)
      const overlay = wrap.querySelector<HTMLDivElement>(`#overlay-${section.id}`)
      const content = overlay?.querySelector<HTMLDivElement>('[data-section-content]')

      const trigger = ScrollTrigger.create({
        trigger: spacer,
        start: 'top top',
        end: 'bottom bottom',
        onEnter: () => setActiveSection(i),
        onEnterBack: () => setActiveSection(i),
      })
      triggers.push(trigger)

      if (content) {
        // Slide diagonal + skew saat section masuk/keluar viewport
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: spacer,
            start: 'top top',
            end: 'bottom bottom',
            scrub: true,
          },
        })
        tl.fromTo(
          content,
          { xPercent: 110, skewX: -12, opacity: 0 },
          { xPercent: 0, skewX: 0, opacity: 1, duration: 0.5, ease: 'power2.out' },
        ).to(content, { xPercent: -110, skewX: 12, opacity: 0, duration: 0.5, ease: 'power2.in' }, 0.5)
        timelines.push(tl)
      }
    })

    return () => {
      progressTrigger.kill()
      triggers.forEach((t) => t.kill())
      timelines.forEach((t) => t.kill())
    }
  }, [wrapRef])
}

/**
 * Scroll halus ke section ke-i (dipakai NavBar).
 * Klik nav juga memicu sweep clip-path (SectionSweep via store).
 */
export function scrollToSection(index: number): void {
  gsap.to(window, {
    scrollTo: { y: index * window.innerHeight, autoKill: true },
    duration: 1.0,
    ease: 'power3.inOut',
    overwrite: 'auto',
  })
}
