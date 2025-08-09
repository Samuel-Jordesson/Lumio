import { useState, useEffect } from 'react'

export const useIsMobile = (breakpoint: number = 768) => {
  // Inicializar com detecção segura para SSR
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.innerWidth < breakpoint
  })

  useEffect(() => {
    const checkIsMobile = () => {
      if (typeof window === 'undefined') return
      setIsMobile(window.innerWidth < breakpoint)
    }

    // Check on mount
    checkIsMobile()

    // Listen for window resize
    window.addEventListener('resize', checkIsMobile)
    window.addEventListener('orientationchange', checkIsMobile)

    return () => {
      window.removeEventListener('resize', checkIsMobile)
      window.removeEventListener('orientationchange', checkIsMobile)
    }
  }, [breakpoint])

  return isMobile
}

export default useIsMobile
