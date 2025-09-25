import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import MobileHeader from './MobileHeader'
import MobileBottomNav from './MobileBottomNav'
import { useState, useEffect } from 'react'
import CreatePost from './CreatePost'
import useIsMobile from '../hooks/useIsMobile'

const Layout = () => {
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const isMobile = useIsMobile()

  // Aguardar detecção de mobile para evitar flash
  useEffect(() => {
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <img 
            src="/noBgColor.png" 
            alt="Lumio" 
            className="w-12 h-12"
          />
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Layout */}
      {!isMobile && (
        <>
          <Header />
          <div className="flex">
            <Sidebar onNewPost={() => setShowCreatePost(true)} />
            <main className="flex-1 ml-64 pt-20 p-6">
              <Outlet />
            </main>
          </div>
        </>
      )}

      {/* Mobile Layout */}
      {isMobile && (
        <>
          <MobileHeader />
          <main className="pt-16 pb-20 px-4">
            <Outlet />
          </main>
          <MobileBottomNav onNewPost={() => setShowCreatePost(true)} />
        </>
      )}

      {/* Modal de criar post (ambos layouts) */}
      {showCreatePost && (
        <CreatePost
          onClose={() => setShowCreatePost(false)}
          onSuccess={() => setShowCreatePost(false)}
        />
      )}
    </div>
  )
}

export default Layout
