import { useAuth } from '../contexts/AuthContext'
import { Bell, Search, Menu, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { getImageUrl } from '../utils/imageUtils'

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
  const navigate = useNavigate()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const q = searchTerm.trim()
      navigate(q ? `/explore?q=${encodeURIComponent(q)}` : '/explore')
    }
  }

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
          <div className="flex items-center space-x-2">
            <img 
              src="/noBgColor.png" 
              alt="Lumio" 
              className="w-6 h-6 hover:scale-110 transition-transform duration-300"
            />
            <h1 className="text-xl font-bold text-primary-600">
              {title || 'Lumio'}
            </h1>
          </div>
        </div>

        {/* Barra de pesquisa (quando habilitada) */}
        {showSearch && (
          <div className="flex-1 mx-4 max-w-sm">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Pesquisar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Ações do usuário */}
        <div className="flex items-center space-x-2">
          <button className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              3
            </span>
          </button>
          
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
    </header>
  )
}

export default MobileHeader
