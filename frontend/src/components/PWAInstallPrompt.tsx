import { useState, useEffect } from 'react'
import { Download, X, Smartphone } from 'lucide-react'
import { usePWA } from '../hooks/usePWA'
import toast from 'react-hot-toast'

const PWAInstallPrompt = () => {
  const { isInstallable, isInstalled, installApp } = usePWA()
  const [showPrompt, setShowPrompt] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Show prompt if installable and not installed and not dismissed
    if (isInstallable && !isInstalled && !dismissed) {
      // Wait a bit before showing the prompt
      const timer = setTimeout(() => {
        setShowPrompt(true)
      }, 3000) // Show after 3 seconds

      return () => clearTimeout(timer)
    }
  }, [isInstallable, isInstalled, dismissed])

  const handleInstall = async () => {
    try {
      await installApp()
      setShowPrompt(false)
      toast.success('Lumio instalado com sucesso!')
    } catch (error) {
      console.error('Error installing app:', error)
      toast.error('Erro ao instalar o app')
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    setDismissed(true)
    // Remember dismissal for 7 days
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString())
  }

  // Check if prompt was dismissed recently
  useEffect(() => {
    const dismissedTime = localStorage.getItem('pwa-prompt-dismissed')
    if (dismissedTime) {
      const daysSinceDismissed = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60 * 24)
      if (daysSinceDismissed < 7) {
        setDismissed(true)
      } else {
        localStorage.removeItem('pwa-prompt-dismissed')
      }
    }
  }, [])

  if (!showPrompt || isInstalled) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 animate-slide-up">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-primary-600" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900">
              Instalar Lumio
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Instale o app para uma experiência melhor. Acesso rápido e notificações!
            </p>
            
            <div className="flex items-center space-x-2 mt-3">
              <button
                onClick={handleInstall}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
              >
                <Download className="w-3 h-3 mr-1" />
                Instalar
              </button>
              
              <button
                onClick={handleDismiss}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
              >
                Agora não
              </button>
            </div>
          </div>
          
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default PWAInstallPrompt
