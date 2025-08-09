import { useAuth } from '../contexts/AuthContext'
import { Bell, Search, Settings } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { getImageUrl } from '../utils/imageUtils'

const Header = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [term, setTerm] = useState('')

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const q = term.trim()
      navigate(q ? `/explore?q=${encodeURIComponent(q)}` : '/explore')
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 px-6 py-4 z-40 animate-slide-in-down">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <img 
              src="/noBgColor.png" 
              alt="Lumio" 
              className="w-8 h-8 hover:scale-110 transition-transform duration-300"
            />
            <h1 className="text-2xl font-bold text-primary-600 hover:scale-105 transition-all duration-300 cursor-pointer hover-glow">
              <span className="animate-bounce-gentle">Lumio</span>
            </h1>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 transition-colors duration-200" />
            <input
              type="text"
              placeholder="Pesquisar usuários (@usuario ou nome)"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 focus:scale-105"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-all duration-300 hover:scale-110">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center animate-bounce-gentle">
              3
            </span>
          </button>
          
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-300 hover:scale-110 hover-rotate">
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
          
          <div className="flex items-center space-x-3">
            <img
              src={getImageUrl(user?.avatar || '/default-avatar.png')}
              alt={user?.name}
              className="w-8 h-8 rounded-full object-cover hover:scale-110 transition-transform duration-300"
            />
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">@{user?.username}</p>
            </div>
          </div>
          
          <button
            onClick={logout}
            className="text-sm text-gray-600 hover:text-gray-900 transition-all duration-300 hover:scale-105 px-3 py-1 rounded-md hover:bg-gray-100"
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
