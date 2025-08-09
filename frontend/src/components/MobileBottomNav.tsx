import { NavLink } from 'react-router-dom'
import { Home, User, MessageCircle, Compass, Plus } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

interface MobileBottomNavProps {
  onNewPost: () => void
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onNewPost }) => {
  const { user } = useAuth()

  const navItems = [
    { path: '/', icon: Home, label: 'Início' },
    { path: '/explore', icon: Compass, label: 'Explorar' },
    { path: '/messages', icon: MessageCircle, label: 'Mensagens' },
    { path: `/profile/${user?.username}`, icon: User, label: 'Perfil' },
  ]

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 animate-slide-in-up">
      <div className="flex items-center justify-around py-2 stagger-fade-in">
        {navItems.map((item, index) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={{ animationDelay: `${index * 0.1}s` }}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-300 min-w-0 hover:scale-110 ${
                isActive
                  ? 'text-primary-600 scale-110'
                  : 'text-gray-600 hover:text-gray-900'
              }`
            }
          >
            <item.icon className={`w-6 h-6 transition-transform duration-200 ${isActive ? 'animate-bounce-gentle' : ''}`} />
            <span className="text-xs mt-1 font-medium">{item.label}</span>
          </NavLink>
        ))}
        
        {/* Botão de criar post no meio */}
        <button
          onClick={onNewPost}
          style={{ animationDelay: '0.4s' }}
          className="flex flex-col items-center justify-center p-2 text-primary-600 hover:text-primary-700 transition-all duration-300 hover:scale-110"
        >
          <div className="bg-primary-600 text-white rounded-full p-2 hover:bg-primary-700 transition-all duration-300 hover:scale-110 hover:shadow-lg hover-glow">
            <Plus className="w-6 h-6 transition-transform duration-200 hover:rotate-90" />
          </div>
          <span className="text-xs mt-1 font-medium">Post</span>
        </button>
      </div>
    </div>
  )
}

export default MobileBottomNav
