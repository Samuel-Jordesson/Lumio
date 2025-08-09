import { useState } from 'react'
import { useQuery } from 'react-query'
import { Heart, MessageCircle, Share, MoreHorizontal, Image as ImageIcon } from 'lucide-react'
import { api } from '../services/api'
import CreatePost from '../components/CreatePost'
import PostImageGallery from '../components/PostImageGallery'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import useIsMobile from '../hooks/useIsMobile'
import { getImageUrl } from '../utils/imageUtils'

interface Post {
  id: string
  content: string
  images?: string[]
  author: {
    id: string
    name: string
    username: string
    avatar?: string
  }
  likesCount: number
  commentsCount: number
  isLiked: boolean
  createdAt: string
}

const Feed = () => {
  const [showCreatePost, setShowCreatePost] = useState(false)
  const { user } = useAuth()
  const isMobile = useIsMobile()

  const { data: posts, isLoading, refetch } = useQuery<Post[]>(
    'posts',
    async () => {
      const response = await api.get('/posts')
      return response.data
    }
  )

  const handleLike = async (postId: string) => {
    try {
      await api.post(`/posts/${postId}/like`)
      refetch()
    } catch (error) {
      console.error('Error liking post:', error)
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

  if (isLoading) {
    return (
      <div className={`${isMobile ? '' : 'max-w-2xl'} mx-auto animate-fade-in`}>
        <div className="space-y-3 stagger-fade-in">
          {[...Array(3)].map((_, i) => (
            <div key={i} className={`${isMobile ? 'bg-white rounded-xl border border-gray-100 p-5 shadow-sm' : 'card-elevated'} animate-pulse`} style={{ animationDelay: `${i * 0.1}s` }}>
              {/* Header skeleton */}
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-28 mb-2 animate-pulse"></div>
                  <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-36 animate-pulse"></div>
                </div>
              </div>
              
              {/* Content skeleton */}
              <div className="space-y-3 mb-4">
                <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse"></div>
                <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-4/5 animate-pulse"></div>
                <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-3/5 animate-pulse"></div>
              </div>
              
              {/* Actions skeleton */}
              <div className="flex items-center space-x-8 pt-4 border-t border-gray-100">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="flex items-center space-x-2">
                    <div className="w-9 h-9 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full animate-pulse"></div>
                    <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-8 animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`${isMobile ? '' : 'max-w-2xl'} mx-auto animate-fade-in`}>
      {/* Botão para criar post - apenas desktop */}
      {!isMobile && (
        <div className="mb-6 animate-slide-in-down">
          <button
            onClick={() => setShowCreatePost(true)}
            className="w-full card hover:shadow-md hover-lift transition-all cursor-pointer text-left"
          >
            <div className="flex items-center space-x-3">
              <img
                src={getImageUrl(user?.avatar || '/default-avatar.png')}
                alt={user?.name || 'Avatar'}
                className="w-10 h-10 rounded-full object-cover transition-transform duration-300 hover:scale-110"
              />
              <span className="text-gray-500">O que você está pensando?</span>
            </div>
          </button>
        </div>
      )}

      {/* Feed de posts */}
      <div className={`${isMobile ? 'space-y-3' : 'space-y-6'} stagger-fade-in`}>
        {posts?.map((post, index) => (
          <article 
            key={post.id} 
            className={`${isMobile ? 'bg-white rounded-xl border border-gray-100 p-5 shadow-sm' : 'card-elevated'} hover-lift transition-all duration-300`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* Header do post */}
            <div className="flex items-center justify-between mb-4">
              <Link to={`/profile/${post.author.username}`} className="flex items-center space-x-3 hover:opacity-90 transition-opacity duration-200">
                <img
                  src={getImageUrl(post.author.avatar || '/default-avatar.png')}
                  alt={post.author.name}
                  className="w-10 h-10 rounded-full object-cover transition-transform duration-300 hover:scale-110"
                />
                <div>
                  <p className="text-heading-xs text-gray-900">{post.author.name}</p>
                  <p className="text-caption">
                    @{post.author.username} • {formatDate(post.createdAt)}
                  </p>
                </div>
              </Link>
              <button className="p-1 hover:bg-gray-100 rounded-full transition-all duration-200 hover:scale-110">
                <MoreHorizontal className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Conteúdo do post */}
            <div className="mb-4">
              <p className="text-body-md text-gray-900 whitespace-pre-wrap leading-relaxed">{post.content}</p>
              <PostImageGallery images={post.images || []} />
            </div>

            {/* Ações do post */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center space-x-8">
                <button
                  onClick={() => handleLike(post.id)}
                  className={`group flex items-center space-x-2 transition-all duration-300 hover:scale-105 active:scale-95 ${
                    post.isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                  }`}
                >
                  <div className={`p-2 rounded-full transition-all duration-200 ${
                    post.isLiked ? 'bg-red-50' : 'group-hover:bg-red-50'
                  }`}>
                    <Heart className={`w-5 h-5 transition-all duration-200 ${
                      post.isLiked ? 'fill-current animate-heartbeat' : 'group-hover:scale-110'
                    }`} />
                  </div>
                  <span className="text-body-sm font-medium">{post.likesCount}</span>
                </button>
                
                <button className="group flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-all duration-300 hover:scale-105 active:scale-95">
                  <div className="p-2 rounded-full group-hover:bg-blue-50 transition-all duration-200">
                    <MessageCircle className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
                  </div>
                  <span className="text-body-sm font-medium">{post.commentsCount}</span>
                </button>
                
                <button className="group flex items-center space-x-2 text-gray-500 hover:text-green-500 transition-all duration-300 hover:scale-105 active:scale-95">
                  <div className="p-2 rounded-full group-hover:bg-green-50 transition-all duration-200">
                    <Share className="w-5 h-5 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-12" />
                  </div>
                  <span className="text-body-sm font-medium">Compartilhar</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal para criar post */}
      {showCreatePost && (
        <CreatePost
          onClose={() => setShowCreatePost(false)}
          onSuccess={() => {
            setShowCreatePost(false)
            refetch()
          }}
        />
      )}
    </div>
  )
}

export default Feed
