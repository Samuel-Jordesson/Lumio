import { useAuth } from '../contexts/AuthContext'
import { Bell, Menu, X, Settings } from 'lucide-react'
import { useState } from 'react'
import { getImageUrl } from '../utils/imageUtils'
import SearchBar from './SearchBar'
import Logo from './Logo'
import NotificationBell from './NotificationBell'
import SettingsModal from './SettingsModal'

interface MobileHeaderProps {
  showSearch?: boolean
  title?: string
  onMenuClick?: () => void
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ 
  showSearch = true, 
  title,
  onMenuClick 
}) => {
  const { user, logout } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  return (
    <header className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 px-4 py-3 z-40 mobile-header">
      <div className="flex items-center justify-between">
        {/* Logo ou título */}
        <div className="flex items-center space-x-3">
          {onMenuClick && (
            <button onClick={onMenuClick} className="p-1">
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
          )}
          <div className="flex items-center">
            <Logo 
              size="md" 
              variant="primary" 
              className="hover:scale-110 transition-transform duration-300 cursor-pointer"
            />
          </div>
        </div>

        {/* Barra de pesquisa (quando habilitada) */}
        {showSearch && (
          <div className="flex-1 mx-4 max-w-sm">
            <SearchBar 
              placeholder="Pesquisar..."
              className="w-full"
            />
          </div>
        )}

        {/* Ações do usuário */}
        <div className="flex items-center space-x-2">
          <NotificationBell />
          
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2"
            >
              <img
                src={getImageUrl(user?.avatar || '/default-avatar.png')}
                alt={user?.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            </button>
            
            {showUserMenu && (
              <>
                <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-[160px] z-50">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500">@{user?.username}</p>
                  </div>
                  <button
                    onClick={() => {
                      navigate(`/profile/${user?.username}`)
                      setShowUserMenu(false)
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Ver perfil
                  </button>
                  <button
                    onClick={() => {
                      setShowSettings(true)
                      setShowUserMenu(false)
                    }}
                    className="w-full flex items-center space-x-2 text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Configurações</span>
                  </button>
                  <button
                    onClick={() => {
                      logout()
                      setShowUserMenu(false)
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                  >
                    Sair
                  </button>
                </div>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowUserMenu(false)}
                />
              </>
            )}
          </div>
        </div>
      </div>

      <SettingsModal 
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </header>
  )
}

export default MobileHeader
