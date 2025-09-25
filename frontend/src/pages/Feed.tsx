import { useState } from 'react'
import { useQuery } from 'react-query'
import { Heart, MessageCircle, Share, MoreHorizontal, Image as ImageIcon } from 'lucide-react'
import { api } from '../services/api'
import CreatePost from '../components/CreatePost'
import PostImageGallery from '../components/PostImageGallery'
import PostComments from '../components/PostComments'
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
  const [commentsPostId, setCommentsPostId] = useState<string | null>(null)
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
      <div className={`${isMobile ? '' : 'max-w-2xl'} mx-auto`}>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className={`${isMobile ? 'bg-white rounded-xl border border-gray-100 p-5 shadow-sm' : 'card-elevated'}`}>
              {/* Header skeleton */}
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-28 mb-2"></div>
                  <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-36"></div>
                </div>
              </div>
              
              {/* Content skeleton */}
              <div className="space-y-3 mb-4">
                <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg"></div>
                <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-4/5"></div>
                <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-3/5"></div>
              </div>
              
              {/* Actions skeleton */}
              <div className="flex items-center space-x-8 pt-4 border-t border-gray-100">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="flex items-center space-x-2">
                    <div className="w-9 h-9 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full"></div>
                    <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-8"></div>
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
    <div className={`${isMobile ? '' : 'max-w-2xl'} mx-auto`}>
      {/* Botão para criar post - apenas desktop */}
      {!isMobile && (
        <div className="mb-6">
          <button
            onClick={() => setShowCreatePost(true)}
            className="w-full card hover:shadow-md cursor-pointer text-left"
          >
            <div className="flex items-center space-x-3">
              <img
                src={getImageUrl(user?.avatar || '/default-avatar.png')}
                alt={user?.name || 'Avatar'}
                className="w-10 h-10 rounded-full object-cover"
              />
              <span className="text-gray-500">O que você está pensando?</span>
            </div>
          </button>
        </div>
      )}

      {/* Feed de posts */}
      <div className={`${isMobile ? 'space-y-3' : 'space-y-6'}`}>
        {posts?.map((post, index) => (
          <article 
            key={post.id} 
            className={`${isMobile ? 'bg-white rounded-xl border border-gray-100 p-5 shadow-sm' : 'card-elevated'}`}
          >
            {/* Header do post */}
            <div className="flex items-center justify-between mb-4">
              <Link to={`/profile/${post.author.username}`} className="flex items-center space-x-3 hover:opacity-90">
                <img
                  src={getImageUrl(post.author.avatar || '/default-avatar.png')}
                  alt={post.author.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="text-heading-xs text-gray-900">{post.author.name}</p>
                  <p className="text-caption">
                    @{post.author.username} • {formatDate(post.createdAt)}
                  </p>
                </div>
              </Link>
              <button className="p-1 hover:bg-gray-100 rounded-full">
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
                  className={`group flex items-center space-x-2 ${
                    post.isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                  }`}
                >
                  <div className={`p-2 rounded-full ${
                    post.isLiked ? 'bg-red-50' : 'group-hover:bg-red-50'
                  }`}>
                    <Heart className={`w-5 h-5 ${
                      post.isLiked ? 'fill-current' : ''
                    }`} />
                  </div>
                  <span className="text-body-sm font-medium">{post.likesCount}</span>
                </button>
                
                <button 
                  onClick={() => setCommentsPostId(post.id)}
                  className="group flex items-center space-x-2 text-gray-500 hover:text-blue-500"
                >
                  <div className="p-2 rounded-full group-hover:bg-blue-50">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <span className="text-body-sm font-medium">{post.commentsCount}</span>
                </button>
                
                <button className="group flex items-center space-x-2 text-gray-500 hover:text-green-500">
                  <div className="p-2 rounded-full group-hover:bg-green-50">
                    <Share className="w-5 h-5" />
                  </div>
                  <span className="text-body-sm font-medium">Compartilhar</span>
                </button>
              </div>
            </div>
          </article>
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

export default Feed
