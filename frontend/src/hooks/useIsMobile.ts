import { useState, useEffect } from 'react'

export const useIsMobile = (breakpoint: number = 768) => {
  // Inicializar sempre como false para evitar hidration mismatch
  const [isMobile, setIsMobile] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    // Marcar que estamos no cliente
    setIsClient(true)
    
    const checkIsMobile = () => {
      try {
        if (typeof window === 'undefined') return
        const width = window.innerWidth || document.documentElement.clientWidth
        setIsMobile(width < breakpoint)
      } catch (error) {
        console.error('Erro ao detectar mobile:', error)
        setIsMobile(false)
      }
    }

    // Check inicial
    checkIsMobile()

    // Listeners
    const handleResize = () => {
      setTimeout(checkIsMobile, 100) // Debounce
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
    }
  }, [breakpoint])

  // Retornar false até que o cliente seja detectado
  return isClient ? isMobile : false
}

export default useIsMobile
