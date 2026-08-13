import { usePortfolioStore } from '../../store/useStore'
import { SECTIONS } from '../../data/content'
import { scrollToSection } from '../../hooks/useSectionScroll'
import { cn } from '../../lib/cn'

/**
 * Navigasi atas — item dipisah slash merah, item aktif punya bar
 * miring di bawah. Klik memicu sweep + scroll ke section.
 */
export default function NavBar() {
  const active = usePortfolioStore((s) => s.activeSection)

  const go = (index: number) => {
    usePortfolioStore.getState().triggerSweep()
    usePortfolioStore.getState().setActiveSection(index)
    scrollToSection(index)
  }

  return (
    <header className="fixed inset-x-0 top-0 z-[70]">
      <div className="flex items-center justify-between px-6 py-4 md:px-12">
        {/* Logo */}
        <button
          data-hover
          data-hover-label="TOP"
          onClick={() => go(0)}
          className="flex items-center gap-3"
        >
          <span className="font-display -skew-x-12 bg-[#dc143c] px-2.5 py-1 text-xl text-[#0a0a0a]">
            RZP
          </span>
          <span className="hidden font-body text-[11px] font-bold uppercase tracking-[0.35em] text-[#f5f2ee]/70 sm:block">
            Portfolio<span className="text-[#dc143c]">_</span>2026
          </span>
        </button>

        {/* Menu */}
        <nav className="flex items-center gap-1 md:gap-2">
          {SECTIONS.map((section, i) => (
            <button
              key={section.id}
              data-hover
              data-hover-label={section.short}
              onClick={() => go(i)}
              className={cn(
                'relative px-2.5 py-2 font-body text-[11px] font-black uppercase tracking-[0.25em] transition-colors duration-150 md:text-xs',
                active === i ? 'text-[#f5f2ee]' : 'text-[#f5f2ee]/45 hover:text-[#f5f2ee]/80',
              )}
            >
              <span className="relative z-10">{section.label}</span>
              {/* garis merah di bawah item aktif */}
              <span
                className={cn(
                  'absolute bottom-0 left-1/2 h-[3px] w-6 -translate-x-1/2 -skew-x-12 bg-[#dc143c] transition-all duration-200',
                  active === i ? 'opacity-100' : 'opacity-0',
                )}
              />
              {/* slash pemisah */}
              {i < SECTIONS.length - 1 && (
                <span className="ml-2 text-[#dc143c]/70 md:ml-3">/</span>
              )}
            </button>
          ))}
        </nav>
      </div>
    </header>
  )
}
