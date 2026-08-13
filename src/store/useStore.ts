import { create } from 'zustand'

export interface PortfolioState {
  /** Scroll progress mentah 0..1 dari kontainer scroll 400vh */
  scrollProgress: number
  /** Section aktif 0..3 (Hero, About, Projects, Contact) */
  activeSection: number
  /** Deteksi device kasar — true = render fallback 2D, tanpa Canvas */
  isMobile: boolean
  /** Token untuk memicu animasi sweep clip-path (di-increment saat klik nav) */
  sweepToken: number

  setScrollProgress: (value: number) => void
  setActiveSection: (value: number) => void
  setIsMobile: (value: boolean) => void
  triggerSweep: () => void
}

export const usePortfolioStore = create<PortfolioState>((set) => ({
  scrollProgress: 0,
  activeSection: 0,
  isMobile: false,
  sweepToken: 0,

  setScrollProgress: (value) => set({ scrollProgress: value }),
  setActiveSection: (value) => set({ activeSection: value }),
  setIsMobile: (value) => set({ isMobile: value }),
  triggerSweep: () => set((state) => ({ sweepToken: state.sweepToken + 1 })),
}))
