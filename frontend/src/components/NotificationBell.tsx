import { useState, useEffect, useRef } from 'react'
import { Bell, Heart, UserPlus, MessageCircle, X } from 'lucide-react'
import { useQuery, useQueryClient } from 'react-query'
import { api } from '../services/api'
import { Link } from 'react-router-dom'

interface Notification {
  id: string
  type: 'like' | 'follow' | 'comment'
  isRead: boolean
  createdAt: string
  sender: {
    id: string
    name: string
    username: string
    avatar?: string
  }
  postId?: string
}

interface NotificationBellProps {
  className?: string
}

const NotificationBell: React.FC<NotificationBellProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()

  // Buscar notificações
  const { data: notifications = [], isLoading } = useQuery<Notification[]>(
    'notifications',
    async () => {
      const response = await api.get('/notifications')
      return response.data
    },
    {
      refetchInterval: 30000, // Atualizar a cada 30 segundos
    }
  )

  // Buscar contagem de não lidas
  const { data: unreadData } = useQuery<{ count: number }>(
    'notifications-unread-count',
    async () => {
      const response = await api.get('/notifications/unread-count')
      return response.data
    },
    {
      refetchInterval: 10000, // Atualizar a cada 10 segundos
    }
  )

  const unreadCount = unreadData?.count || 0

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const markAsRead = async (notificationId: string) => {
    try {
      await api.put(`/notifications/${notificationId}/read`)
      queryClient.invalidateQueries('notifications')
      queryClient.invalidateQueries('notifications-unread-count')
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all')
      queryClient.invalidateQueries('notifications')
      queryClient.invalidateQueries('notifications-unread-count')
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Agora mesmo'
    if (diffInMinutes < 60) return `${diffInMinutes}m atrás`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h atrás`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d atrás`
    
    return date.toLocaleDateString('pt-BR')
  }

  const getNotificationText = (notification: Notification) => {
    if (notification.type === 'like') {
      return 'curtiu seu post'
    } else if (notification.type === 'follow') {
      return 'começou a seguir você'
    } else if (notification.type === 'comment') {
      return 'comentou no seu post'
    }
    return ''
  }

  const getNotificationIcon = (type: string) => {
    if (type === 'like') {
      return <Heart className="w-4 h-4 text-red-500" />
    } else if (type === 'follow') {
      return <UserPlus className="w-4 h-4 text-blue-500" />
    } else if (type === 'comment') {
      return <MessageCircle className="w-4 h-4 text-green-500" />
    }
    return null
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Botão do sino */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Notificações</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Marcar todas como lidas
              </button>
            )}
          </div>

          {/* Lista de notificações */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">
                Carregando...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                Nenhuma notificação
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 ${
                    !notification.isRead ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {/* Avatar */}
                    <Link
                      to={`/profile/${notification.sender.username}`}
                      className="flex-shrink-0"
                      onClick={() => setIsOpen(false)}
                    >
                      <img
                        src={notification.sender.avatar || '/default-avatar.png'}
                        alt={notification.sender.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    </Link>

                    {/* Conteúdo */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            {getNotificationIcon(notification.type)}
                            <span className="text-sm">
                              <Link
                                to={`/profile/${notification.sender.username}`}
                                className="font-medium text-gray-900 hover:underline"
                                onClick={() => setIsOpen(false)}
                              >
                                {notification.sender.name}
                              </Link>
                              <span className="text-gray-600 ml-1">
                                {getNotificationText(notification)}
                              </span>
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDate(notification.createdAt)}
                          </p>
                        </div>

                        {/* Botão de marcar como lida */}
                        {!notification.isRead && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-4 border-t border-gray-200 text-center">
              <Link
                to="/notifications"
                className="text-sm text-primary-600 hover:text-primary-700"
                onClick={() => setIsOpen(false)}
              >
                Ver todas as notificações
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default NotificationBell
