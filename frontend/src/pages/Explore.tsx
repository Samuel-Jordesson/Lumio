import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from 'react-query'
import { api } from '../services/api'
import { Search, Users, TrendingUp, MessageCircle } from 'lucide-react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import ConfirmDialog from '../components/ConfirmDialog'
import PostImageGallery from '../components/PostImageGallery'
import PostComments from '../components/PostComments'
import toast from 'react-hot-toast'
import useIsMobile from '../hooks/useIsMobile'

interface User {
  id: string
  name: string
  username: string
  avatar?: string
  bio?: string
  followersCount: number
  postsCount: number
  isFollowing: boolean
}

interface TrendingPost {
  id: string
  content: string
  images?: string[]
  author: {
    name: string
    username: string
    avatar?: string
  }
  likesCount: number
  commentsCount: number
  createdAt: string
}

const Explore = () => {
  const { user: currentUser } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const initial = searchParams.get('q') || ''
  const [searchTerm, setSearchTerm] = useState(initial)
  const [activeTab, setActiveTab] = useState<'users' | 'recent'>('recent')
  const [confirmUser, setConfirmUser] = useState<User | null>(null)
  const [commentsPostId, setCommentsPostId] = useState<string | null>(null)
  const isMobile = useIsMobile()

  useEffect(() => {
    const q = searchParams.get('q') || ''
    setSearchTerm(q)
  }, [searchParams])

  useEffect(() => {
    const q = searchTerm.trim()
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (q) next.set('q', q); else next.delete('q')
      return next
    })
  }, [searchTerm, setSearchParams])

  const normalized = (searchTerm.startsWith('@') ? searchTerm.slice(1) : searchTerm)

  const { data: users, isLoading: usersLoading, refetch: refetchUsers } = useQuery<User[]>(
    ['users', normalized],
    async () => {
      const response = await api.get(`/users/search?q=${encodeURIComponent(normalized)}`)
      return response.data
    },
    {
      enabled: normalized.length > 0
    }
  )

  const { data: recentPosts, isLoading: postsLoading } = useQuery<TrendingPost[]>(
    'recent-posts',
    async () => {
      const response = await api.get('/posts/recent')
      return response.data
    }
  )

  const handleFollow = async (user: User) => {
    try {
      if (user.isFollowing) {
        setConfirmUser(user)
        return
      } else {
        await api.post(`/users/${user.username}/follow`)
        toast.success(`Agora você está seguindo ${user.name}`)
      }
      await refetchUsers()
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao seguir usuário'
      toast.error(message)
      console.error('Error following user:', error)
    }
  }

  const confirmUnfollow = async () => {
    if (!confirmUser) return
    try {
      await api.delete(`/users/${confirmUser.username}/follow`)
      toast.success(`Você parou de seguir ${confirmUser.name}`)
      setConfirmUser(null)
      await refetchUsers()
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao deixar de seguir usuário'
      toast.error(message)
      console.error('Error unfollowing user:', error)
    }
  }

  const handleMessage = async (user: User) => {
    try {
      await api.post('/conversations', {
        userId: user.id
      })
      
      // Invalidar cache de conversas para forçar reload
      queryClient.invalidateQueries('conversations')
      
      toast.success(`Conversa iniciada com ${user.name}`)
      navigate('/messages')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao iniciar conversa')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Agora mesmo'
    if (diffInHours < 24) return `${diffInHours}h atrás`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d atrás`
    
    return date.toLocaleDateString('pt-BR')
  }

  return (
    <div className={`${isMobile ? '' : 'max-w-4xl'} mx-auto`}>
      {/* Header */}
      <div className={`${isMobile ? 'bg-white rounded-lg border border-gray-200 p-4' : 'card'} mb-6`}>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Explorar</h1>
        
        {/* Barra de pesquisa */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar usuários..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('recent')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md transition-colors ${
              activeTab === 'recent'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Recentes</span>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md transition-colors ${
              activeTab === 'users'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Usuários</span>
          </button>
        </div>
      </div>

      {/* Conteúdo */}
      {activeTab === 'recent' && (
        <div className={`${isMobile ? 'bg-white rounded-lg border border-gray-200 p-4' : 'card'}`}>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Posts Recentes</h2>
          
          {postsLoading ? (
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
                      <div className="h-3 bg-gray-300 rounded w-16"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-300 rounded"></div>
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : recentPosts && recentPosts.length > 0 ? (
            <div className="space-y-6">
              {recentPosts.map((post) => (
                <div key={post.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                  <Link to={`/profile/${post.author.username}`} className="flex items-center space-x-3 mb-4 hover:opacity-90">
                    <img
                      src={post.author.avatar || '/default-avatar.png'}
                      alt={post.author.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{post.author.name}</p>
                      <p className="text-sm text-gray-500">
                        @{post.author.username} • {formatDate(post.createdAt)}
                      </p>
                    </div>
                  </Link>
                  
                  <div className="mb-4">
                    <p className="text-gray-900 mb-3">{post.content}</p>
                    <PostImageGallery images={post.images || []} />
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>{post.likesCount} curtidas</span>
                    <button 
                      onClick={() => setCommentsPostId(post.id)}
                      className="hover:text-blue-500 transition-colors"
                    >
                      {post.commentsCount} comentários
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum post recente
              </h3>
              <p className="text-gray-500">
                Os posts mais recentes aparecerão aqui
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <div className={`${isMobile ? 'bg-white rounded-lg border border-gray-200 p-4' : 'card'}`}>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Usuários</h2>
          
          {normalized.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Pesquise usuários
              </h3>
              <p className="text-gray-500">
                Digite um nome ou username para encontrar usuários
              </p>
            </div>
          ) : usersLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 animate-pulse">
                  <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-24"></div>
                  </div>
                  <div className="w-20 h-8 bg-gray-300 rounded"></div>
                </div>
              ))}
            </div>
          ) : users && users.length > 0 ? (
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <Link to={`/profile/${user.username}`} className="flex items-center space-x-4 hover:opacity-90">
                    <img
                      src={user.avatar || '/default-avatar.png'}
                      alt={user.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-medium text-gray-900">{user.name}</h3>
                      <p className="text-sm text-gray-500">@{user.username}</p>
                      {user.bio && (
                        <p className="text-sm text-gray-600 mt-1">{user.bio}</p>
                      )}
                      <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                        <span>{user.followersCount} seguidores</span>
                        <span>{user.postsCount} posts</span>
                      </div>
                    </div>
                  </Link>
                  
                  {currentUser && currentUser.username !== user.username && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleFollow(user)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          user.isFollowing
                            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            : 'bg-primary-600 text-white hover:bg-primary-700'
                        }`}
                      >
                        {user.isFollowing ? 'Seguindo' : 'Seguir'}
                      </button>
                      <button
                        onClick={() => handleMessage(user)}
                        className="px-3 py-2 rounded-lg font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhum usuário encontrado.</p>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={!!confirmUser}
        title={`Deixar de seguir @${confirmUser?.username}?`}
        description={`Você deixará de ver os posts de ${confirmUser?.name} no seu feed.`}
        confirmText="Deixar de seguir"
        cancelText="Cancelar"
        onConfirm={confirmUnfollow}
        onClose={() => setConfirmUser(null)}
      />

      {commentsPostId && (
        <PostComments
          postId={commentsPostId}
          isOpen={!!commentsPostId}
          onClose={() => setCommentsPostId(null)}
        />
      )}
    </div>
  )
}

export default Explore
