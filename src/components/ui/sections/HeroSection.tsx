import ImpactButton from '../ImpactButton'
import { PROFILE } from '../../../data/content'
import { scrollToSection } from '../../../hooks/useSectionScroll'

/** Teks judul raksasa dengan slash merah — judul di-skew supaya "menyerang". */
function Title() {
  return (
    <h1 className="font-display text-[17vw] leading-[0.9] tracking-tight lg:text-[11rem]">
      <span className="block text-[#f5f2ee]">{PROFILE.firstName}</span>
      <span className="relative block -skew-x-6">
        <span className="absolute -left-3 top-1/2 h-[110%] w-3 -translate-y-1/2 bg-[#dc143c]" />
        <span className="text-stroke pl-4 text-[#f5f2ee]">{PROFILE.lastName}</span>
      </span>
    </h1>
  )
}

export default function HeroSection() {
  return (
    <section id="overlay-hero" className="absolute inset-0 z-10">
      <div data-section-content className="relative flex h-full flex-col justify-center px-6 md:px-12 lg:px-20">
        {/* watermark angka besar */}
        <span className="font-display text-stroke-soft pointer-events-none absolute -right-4 top-4 text-[9rem] opacity-60 md:text-[16rem]">
          01
        </span>

        <p className="mb-4 flex items-center gap-3 font-body text-xs font-black uppercase tracking-[0.4em] text-[#dc143c]">
          <span className="inline-block h-[3px] w-12 -skew-x-12 bg-[#dc143c]" />
          Portfolio — {new Date().getFullYear()}
        </p>

        <div className="pointer-events-none">
          <Title />
        </div>

        <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-end">
          <div className="max-w-md">
            <p className="mb-3 font-body text-sm font-bold uppercase tracking-[0.3em] text-[#f5f2ee]/80">
              {PROFILE.role}
            </p>
            <p className="font-body text-sm leading-relaxed text-[#f5f2ee]/60">
              Membangun pengalaman web yang{' '}
              <span className="font-black text-[#f5f2ee]">terasa hidup</span> — animasi kinetik,
              WebGL, dan interface yang enerjik.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <ImpactButton hoverLabel="GO" onClick={() => scrollToSection(2)}>
              Lihat Proyek
            </ImpactButton>
            <ImpactButton variant="outline" hoverLabel="NEXT" onClick={() => scrollToSection(1)}>
              Tentang Saya
            </ImpactButton>
          </div>
        </div>

        {/* garis impact diagonal dekoratif */}
        <div className="pointer-events-none absolute inset-y-0 right-8 hidden flex-col justify-center gap-4 lg:flex">
          <span className="block h-24 w-[2px] -skew-x-12 bg-[#dc143c]/60" />
          <span className="block h-12 w-[2px] -skew-x-12 bg-[#dc143c]/30" />
        </div>

        {/* marquee strip merah di bawah */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 -skew-x-6 bg-[#dc143c] py-2.5">
          <div className="animate-marquee flex w-max whitespace-nowrap">
            {[0, 1].map((dup) => (
              <span
                key={dup}
                className="font-display pr-2 text-lg uppercase tracking-widest text-[#0a0a0a]"
              >
                {`FRONTEND ENGINEER ✦ CREATIVE CODER ✦ WEBGL EXPERIENCES ✦ REACT ✦ GSAP ✦ ANIMATION ✦ `}
                {`FRONTEND ENGINEER ✦ CREATIVE CODER ✦ WEBGL EXPERIENCES ✦ REACT ✦ GSAP ✦ ANIMATION ✦ `}
              </span>
            ))}
          </div>
        </div>

        {/* indikator scroll */}
        <div className="pointer-events-none absolute bottom-24 right-6 flex items-center gap-2 md:right-12">
          <span className="font-body text-[10px] font-black uppercase tracking-[0.3em] text-[#f5f2ee]/50">
            Scroll
          </span>
          <span className="animate-blink block h-[3px] w-10 -skew-x-12 bg-[#dc143c]" />
        </div>
      </div>
    </section>
  )
}
