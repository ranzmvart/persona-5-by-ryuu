import { useEffect } from 'react'
import { usePortfolioStore } from '../store/useStore'

/**
 * Deteksi perangkat ringan (mobile/tablet).
 * Pakai matchMedia pointer:coarse agar menangkap tablet juga,
 * tidak hanya lebar layar.
 */
export function useDeviceDetect(): void {
  useEffect(() => {
    const mq = window.matchMedia('(pointer: coarse), (max-width: 768px)')
    const check = () => usePortfolioStore.getState().setIsMobile(mq.matches)
    check()
    mq.addEventListener('change', check)
    return () => mq.removeEventListener('change', check)
  }, [])
}
