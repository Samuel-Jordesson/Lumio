import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from 'react-query'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../services/api'
import { Edit, Users, Calendar, MessageCircle } from 'lucide-react'
import { useState } from 'react'
import EditProfileModal from '../components/EditProfileModal'
import ProfilePostCard from '../components/ProfilePostCard'
import toast from 'react-hot-toast'
import ConfirmDialog from '../components/ConfirmDialog'
import useIsMobile from '../hooks/useIsMobile'

interface UserProfile {
  id: string
  name: string
  username: string
  email: string
  avatar?: string
  bio?: string
  followersCount: number
  followingCount: number
  postsCount: number
  createdAt: string
  isFollowing: boolean
}

interface Post {
  id: string
  content: string
  images?: string[]
  likesCount: number
  commentsCount: number
  isLiked: boolean
  createdAt: string
}

const Profile = () => {
  const { username } = useParams<{ username: string }>()
  const { user: currentUser } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showEdit, setShowEdit] = useState(false)
  const [isTogglingFollow, setIsTogglingFollow] = useState(false)
  const [confirmUnfollowOpen, setConfirmUnfollowOpen] = useState(false)
  const isMobile = useIsMobile()

  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = useQuery<UserProfile>(
    ['profile', username],
    async () => {
      const response = await api.get(`/users/${username}`)
      return response.data
    }
  )

  const { data: posts, isLoading: postsLoading, refetch: refetchPosts } = useQuery<Post[]>(
    ['posts', username],
    async () => {
      const response = await api.get(`/users/${username}/posts`)
      return response.data
    }
  )

  const doFollowToggle = async () => {
    if (!profile || !currentUser) return
    if (profile.id === currentUser.id) return

    setIsTogglingFollow(true)
    try {
      if (profile.isFollowing) {
        await api.delete(`/users/${username}/follow`)
        toast.success(`Você parou de seguir ${profile.name}`)
      } else {
        await api.post(`/users/${username}/follow`)
        toast.success(`Agora você está seguindo ${profile.name}`)
      }
      await Promise.all([refetchProfile(), refetchPosts()])
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao seguir usuário'
      toast.error(message)
      console.error('Error following user:', error)
    } finally {
      setIsTogglingFollow(false)
    }
  }

  const handleFollow = async () => {
    if (!profile?.isFollowing) {
      // seguir direto
      await doFollowToggle()
    } else {
      // confirmar deixar de seguir
      setConfirmUnfollowOpen(true)
    }
  }

  const handleMessage = async () => {
    if (!profile || !currentUser) return

    try {
      await api.post('/conversations', {
        userId: profile.id
      })
      
      // Invalidar cache de conversas para forçar reload
      queryClient.invalidateQueries('conversations')
      
      toast.success(`Conversa iniciada com ${profile.name}`)
      navigate('/messages')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao iniciar conversa')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long'
    })
  }

  if (profileLoading) {
    return (
      <div className={`${isMobile ? '' : 'max-w-4xl'} mx-auto`}>
        <div className={`${isMobile ? 'bg-white rounded-lg border border-gray-200 p-4' : 'card'} animate-pulse`}>
          <div className={`flex items-center space-x-4 mb-6 ${isMobile ? 'flex-col text-center space-x-0 space-y-4' : ''}`}>
            <div className={`${isMobile ? 'w-24 h-24' : 'w-20 h-20'} bg-gray-300 rounded-full`}></div>
            <div className="flex-1">
              <div className="h-6 bg-gray-300 rounded w-32 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-24"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Usuário não encontrado</h2>
          <p className="text-gray-600">O usuário que você está procurando não existe.</p>
        </div>
      </div>
    )
  }

  const isOwnProfile = !!currentUser && profile.id === currentUser.id

  return (
    <div className={`${isMobile ? '' : 'max-w-4xl'} mx-auto animate-fade-in`}>
      {/* Header do perfil */}
      <div className={`${isMobile ? 'bg-white rounded-lg border border-gray-200 p-4' : 'card'} mb-6 animate-slide-in-up hover-lift`}>
        <div className={`flex items-start ${isMobile ? 'flex-col text-center space-y-4' : 'space-x-6'}`}>
          <img
            src={profile.avatar || '/default-avatar.png'}
            alt={profile.name}
            className={`${isMobile ? 'w-24 h-24 mx-auto' : 'w-20 h-20'} rounded-full object-cover hover:scale-110 transition-transform duration-300`}
          />
          
          <div className="flex-1">
            <div className={`flex items-center mb-4 ${isMobile ? 'flex-col space-y-3 space-x-0' : 'space-x-4'}`}>
              <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
              <span className="text-gray-500">@{profile.username}</span>
              
              {isOwnProfile ? (
                <button className="btn-secondary animate-slide-in-right" onClick={() => setShowEdit(true)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Editar perfil
                </button>
              ) : currentUser ? (
                <div className={`flex items-center ${isMobile ? 'flex-col space-y-2 space-x-0' : 'space-x-2'} animate-slide-in-right`}>
                  <button
                    onClick={handleFollow}
                    disabled={isTogglingFollow}
                    className={`${isMobile ? 'w-full' : ''} px-4 py-2 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 hover:scale-105 ${
                      profile.isFollowing
                        ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                        : 'bg-primary-600 text-white hover:bg-primary-700 hover-glow'
                    }`}
                  >
                    {profile.isFollowing ? 'Seguindo' : 'Seguir'}
                  </button>
                  <button
                    onClick={handleMessage}
                    className={`${isMobile ? 'w-full' : ''} px-4 py-2 rounded-lg font-medium bg-green-600 text-white hover:bg-green-700 transition-all duration-300 flex items-center justify-center space-x-2 hover:scale-105 hover:shadow-lg`}
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Mensagem</span>
                  </button>
                </div>
              ) : null}
            </div>
            
            {profile.bio && (
              <p className="text-gray-700 mb-4">{profile.bio}</p>
            )}
            
            <div className={`flex items-center text-sm text-gray-600 ${isMobile ? 'flex-wrap justify-center gap-4' : 'space-x-6'}`}>
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>{profile.postsCount} posts</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>{profile.followersCount} seguidores</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>{profile.followingCount} seguindo</span>
              </div>
              {!isMobile && (
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Membro desde {formatDate(profile.createdAt)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Posts do usuário */}
      <div className={`${isMobile ? 'bg-white rounded-lg border border-gray-200 p-4' : 'card'} animate-slide-in-up`} style={{ animationDelay: '0.2s' }}>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Posts</h2>
        
        {postsLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : posts && posts.length > 0 ? (
          <div className="space-y-6 stagger-fade-in">
            {posts.map((post, index) => (
              <div
                key={post.id}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <ProfilePostCard
                  post={post}
                  isOwnProfile={isOwnProfile}
                  onPostUpdate={() => {
                    refetchPosts()
                    refetchProfile()
                  }}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Nenhum post ainda.</p>
          </div>
        )}
      </div>

      {showEdit && (
        <EditProfileModal
          currentName={profile.name}
          currentBio={profile.bio}
          onClose={() => setShowEdit(false)}
          onSuccess={async () => {
            setShowEdit(false)
            await refetchProfile()
          }}
        />
      )}

      <ConfirmDialog
        open={confirmUnfollowOpen}
        title={`Deixar de seguir @${profile.username}?`}
        description={`Você deixará de ver os posts de ${profile.name} no seu feed.`}
        confirmText="Deixar de seguir"
        cancelText="Cancelar"
        onConfirm={doFollowToggle}
        onClose={() => setConfirmUnfollowOpen(false)}
      />
    </div>
  )
}

export default Profile
