import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Bell, Settings } from 'lucide-react'
import { getImageUrl } from '../utils/imageUtils'
import SearchBar from './SearchBar'
import Logo from './Logo'
import NotificationBell from './NotificationBell'
import SettingsModal from './SettingsModal'

const Header = () => {
  const { user, logout } = useAuth()
  const [showSettings, setShowSettings] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 px-6 py-4 z-40">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <Logo 
              size="lg" 
              variant="primary" 
              className="cursor-pointer"
            />
          </div>
          <SearchBar 
            placeholder="Pesquisar usuários..."
            className="min-w-80"
          />
        </div>
        
        <div className="flex items-center space-x-4">
          <NotificationBell />
          
          <button 
            onClick={() => setShowSettings(true)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
          
          <div className="flex items-center space-x-3">
            <img
              src={getImageUrl(user?.avatar || '/default-avatar.png')}
              alt={user?.name}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">@{user?.username}</p>
            </div>
          </div>
          
          <button
            onClick={logout}
            className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1 rounded-md hover:bg-gray-100"
          >
            Sair
          </button>
        </div>
      </div>

      <SettingsModal 
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </header>
  )
}

export default Header
