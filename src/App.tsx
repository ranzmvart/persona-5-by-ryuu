import { lazy, Suspense, useRef } from 'react'
import { usePortfolioStore } from './store/useStore'
import { useDeviceDetect } from './hooks/useDeviceDetect'
import { useSectionScroll } from './hooks/useSectionScroll'
import { SECTIONS } from './data/content'
import NavBar from './components/ui/NavBar'
import CustomCursor from './components/ui/CustomCursor'
import SectionSweep from './components/ui/SectionSweep'
import HeroSection from './components/ui/sections/HeroSection'
import AboutSection from './components/ui/sections/AboutSection'
import ProjectsSection from './components/ui/sections/ProjectsSection'
import ContactSection from './components/ui/sections/ContactSection'
import MobileFallback from './components/3d/MobileFallback'

// Scene 3D dimuat lazy — bundle three.js terpisah dari bundle utama.
// Saat isMobile true, scene 3D tidak dimuat sama sekali (fallback CSS).
const Scene3D = lazy(() => import('./components/3d/Scene'))

/** Loader tampil singkat saat bundle 3D baru selesai dimuat. */
function SceneLoader() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <p className="font-display animate-blink -skew-x-12 text-2xl tracking-widest text-[#dc143c]">
        LOADING SCENE_
      </p>
    </div>
  )
}

/** Sudut-sudut frame merah di tepi viewport — gaya "UI frame" khas. */
function CornerFrames() {
  const base = 'absolute h-8 w-8 border-[#dc143c]/50'
  return (
    <div className="pointer-events-none fixed inset-5 z-20 md:inset-8">
      <span className={`${base} left-0 top-0 border-l-2 border-t-2`} />
      <span className={`${base} right-0 top-0 border-r-2 border-t-2`} />
      <span className={`${base} bottom-0 left-0 border-b-2 border-l-2`} />
      <span className={`${base} bottom-0 right-0 border-b-2 border-r-2`} />
    </div>
  )
}

export default function App() {
  useDeviceDetect()
  const wrapRef = useRef<HTMLDivElement>(null)
  useSectionScroll(wrapRef)
  const isMobile = usePortfolioStore((s) => s.isMobile)

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f5f2ee] antialiased">
      {/* kontainer scroll: tinggi 100vh × jumlah section */}
      <div ref={wrapRef} className="relative h-[400vh]">
        {/* spacer tiap section — jadi trigger ScrollTrigger presisi */}
        {SECTIONS.map((_, i) => (
          <div
            key={i}
            data-section-space={i}
            className="absolute left-0 top-0 h-screen w-full"
            style={{ top: `${i * 100}vh` }}
          />
        ))}

        {/* viewport sticky: 3D + overlay section tinggal di sini */}
        <div className="sticky top-0 h-screen overflow-hidden">
          <div className="absolute inset-0 z-0">
            {isMobile ? (
              <MobileFallback />
            ) : (
              <Suspense fallback={<SceneLoader />}>
                <Scene3D />
              </Suspense>
            )}
          </div>

          {/* overlay 2D per section */}
          <HeroSection />
          <AboutSection />
          <ProjectsSection />
          <ContactSection />

          {/* efek scanline + frame */}
          <div className="scanlines pointer-events-none fixed inset-0 z-30" />
        </div>
      </div>

      <CornerFrames />
      <NavBar />
      <SectionSweep />
      <CustomCursor />
    </div>
  )
}
