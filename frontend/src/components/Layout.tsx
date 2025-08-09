import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import MobileHeader from './MobileHeader'
import MobileBottomNav from './MobileBottomNav'
import { useState } from 'react'
import CreatePost from './CreatePost'
import useIsMobile from '../hooks/useIsMobile'

const Layout = () => {
  const [showCreatePost, setShowCreatePost] = useState(false)
  const isMobile = useIsMobile()

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
