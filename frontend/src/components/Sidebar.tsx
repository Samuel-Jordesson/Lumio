import { NavLink } from 'react-router-dom'
import { Home, User, MessageCircle, Compass, Plus } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

interface SidebarProps {
  onNewPost: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ onNewPost }) => {
  const { user } = useAuth()

  const navItems = [
    { path: '/', icon: Home, label: 'Início' },
    { path: '/explore', icon: Compass, label: 'Explorar' },
    { path: '/messages', icon: MessageCircle, label: 'Mensagens' },
    { path: `/profile/${user?.username}`, icon: User, label: 'Perfil' },
  ]

  return (
    <aside className="fixed left-0 top-0 w-64 bg-white border-r border-gray-200 h-screen pt-20 z-30 overflow-y-auto animate-slide-in-left">
      <div className="p-6">
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
        </div>
        
        <nav className="space-y-2 stagger-fade-in">
          {navItems.map((item, index) => (
            <NavLink
              key={item.path}
              to={item.path}
              style={{ animationDelay: `${index * 0.1 + 0.2}s` }}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 hover:scale-105 hover-lift ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <item.icon className="w-5 h-5 transition-transform duration-200" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>
        
        <div className="mt-8 pt-6 border-t border-gray-200 animate-slide-in-up" style={{ animationDelay: '0.6s' }}>
          <button 
            onClick={onNewPost} 
            className="w-full flex items-center justify-center space-x-2 bg-primary-600 text-white px-4 py-3 rounded-lg hover:bg-primary-700 transition-all duration-300 hover:scale-105 hover:shadow-lg hover-glow"
          >
            <Plus className="w-5 h-5 transition-transform duration-200 hover:rotate-90" />
            <span className="font-medium">Novo Post</span>
          </button>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
