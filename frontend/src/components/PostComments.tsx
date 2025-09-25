import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { api } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { Send } from 'lucide-react'
import { getImageUrl } from '../utils/imageUtils'

interface Comment {
  id: string
  content: string
  createdAt: string
  user: {
    id: string
    name: string
    username: string
    avatar?: string
  }
}

interface PostCommentsProps {
  postId: string
  isOpen: boolean
  onClose: () => void
}

const PostComments: React.FC<PostCommentsProps> = ({ postId, isOpen, onClose }) => {
  const [newComment, setNewComment] = useState('')
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Buscar comentários
  const { data: comments = [], isLoading } = useQuery<Comment[]>(
    ['comments', postId],
    async () => {
      const response = await api.get(`/posts/${postId}/comments`)
      return response.data
    },
    {
      enabled: isOpen
    }
  )

  // Criar comentário
  const createCommentMutation = useMutation(
    async (content: string) => {
      const response = await api.post(`/posts/${postId}/comments`, { content })
      return response.data
    },
    {
      onSuccess: () => {
        setNewComment('')
        queryClient.invalidateQueries(['comments', postId])
        queryClient.invalidateQueries('posts') // Atualizar contador de comentários
        queryClient.invalidateQueries('notifications') // Atualizar notificações
      }
    }
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newComment.trim()) {
      createCommentMutation.mutate(newComment.trim())
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-900">
            Comentários ({comments.length})
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Lista de comentários */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0">
          {isLoading ? (
            <div className="text-center text-gray-500 py-8">
              Carregando comentários...
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              Seja o primeiro a comentar!
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex items-start space-x-3">
                <img
                  src={getImageUrl(comment.user.avatar || '/default-avatar.png')}
                  alt={comment.user.name}
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1">
                  <div className="bg-gray-100 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-900 text-sm">
                        {comment.user.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-gray-800 text-sm">{comment.content}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Formulário de novo comentário */}
        <div className="p-6 border-t border-gray-200 flex-shrink-0">
          <form onSubmit={handleSubmit} className="flex items-center space-x-2">
            <img
              src={getImageUrl(user?.avatar || '/default-avatar.png')}
              alt={user?.name}
              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
            />
            <div className="flex-1 flex items-center space-x-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Adicionar um comentário..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                maxLength={500}
              />
              <button
                type="submit"
                disabled={!newComment.trim() || createCommentMutation.isLoading}
                className="p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default PostComments

