import { useEffect, useRef, type MouseEventHandler, type ReactNode } from 'react'
import gsap from 'gsap'
import { cn } from '../../lib/cn'

interface ImpactButtonProps {
  children: ReactNode
  variant?: 'solid' | 'outline' | 'ghost'
  hoverLabel?: string
  className?: string
  onClick?: MouseEventHandler<HTMLElement>
  href?: string
}

/**
 * Tombol dengan micro-interaction "impact":
 * - hover: bar merah menyapu dari kiri ke kanan (clip-path/skew)
 * - scale + shake singkat (rotasi ±1deg bolak-balik)
 * - data-hover dipakai CustomCursor untuk ganti bentuk cursor
 */
export default function ImpactButton({
  children,
  variant = 'solid',
  hoverLabel = 'GO',
  className,
  onClick,
  href,
}: ImpactButtonProps) {
  const ref = useRef<HTMLElement>(null)
  const barRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    const bar = barRef.current
    if (!el || !bar) return

    const enter = () => {
      gsap.fromTo(
        bar,
        { xPercent: -160 },
        { xPercent: 160, duration: 0.45, ease: 'power2.inOut', overwrite: true },
      )
      // shake singkat + scale
      gsap
        .timeline({ overwrite: true })
        .to(el, { scale: 1.05, rotate: 1.1, duration: 0.06, ease: 'power1.in' })
        .to(el, { rotate: -1.1, duration: 0.09, ease: 'power1.inOut' })
        .to(el, { rotate: 0, scale: 1.05, duration: 0.06, ease: 'power1.out' })
    }

    const leave = () => {
      gsap.to(el, { scale: 1, rotate: 0, duration: 0.25, ease: 'power2.out' })
      gsap.set(bar, { xPercent: -160 })
    }

    el.addEventListener('mouseenter', enter)
    el.addEventListener('mouseleave', leave)
    return () => {
      el.removeEventListener('mouseenter', enter)
      el.removeEventListener('mouseleave', leave)
    }
  }, [])

  const base = cn(
    'group relative inline-block select-none overflow-hidden border-2 px-7 py-3.5 font-body text-sm font-black uppercase tracking-[0.2em] transition-colors duration-150 -skew-x-12 will-change-transform',
    variant === 'solid' && 'border-[#dc143c] bg-[#dc143c] text-[#0a0a0a] hover:bg-[#f5f2ee]',
    variant === 'outline' && 'border-[#dc143c] bg-transparent text-[#f5f2ee]',
    variant === 'ghost' && 'border-transparent bg-transparent text-[#f5f2ee]',
    className,
  )

  // Batang putih menyapu di atas solid merah; merah untuk outline
  const barColor = variant === 'solid' ? 'bg-[#0a0a0a]' : 'bg-[#dc143c]'

  const inner = (
    <>
      <span
        ref={barRef}
        className={cn(
          'absolute inset-y-0 left-0 w-full -skew-x-12 opacity-80',
          barColor,
        )}
        style={{ transform: 'translateX(-160%)' }}
      />
      <span className="relative z-10 skew-x-12">{children}</span>
    </>
  )

  if (href) {
    return (
      <a
        ref={ref as React.RefObject<HTMLAnchorElement>}
        href={href}
        target="_blank"
        rel="noreferrer"
        data-hover
        data-hover-label={hoverLabel}
        className={base}
        onClick={onClick}
      >
        {inner}
      </a>
    )
  }

  return (
    <button
      ref={ref as React.RefObject<HTMLButtonElement>}
      data-hover
      data-hover-label={hoverLabel}
      className={base}
      onClick={onClick}
    >
      {inner}
    </button>
  )
}
