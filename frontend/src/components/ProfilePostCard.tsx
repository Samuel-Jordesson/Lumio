import { useState } from 'react'
import { Heart, MessageCircle, MoreHorizontal, Edit, Trash2 } from 'lucide-react'
import { api } from '../services/api'
import PostImageGallery from './PostImageGallery'
import EditPostModal from './EditPostModal'
import ConfirmDialog from './ConfirmDialog'
import toast from 'react-hot-toast'
import { useQueryClient } from 'react-query'

interface Post {
  id: string
  content: string
  images?: string[]
  likesCount: number
  commentsCount: number
  isLiked: boolean
  createdAt: string
}

interface ProfilePostCardProps {
  post: Post
  isOwnProfile: boolean
  onPostUpdate?: () => void
}

const ProfilePostCard: React.FC<ProfilePostCardProps> = ({ 
  post, 
  isOwnProfile, 
  onPostUpdate 
}) => {
  const [showMenu, setShowMenu] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const queryClient = useQueryClient()

  const handleLike = async () => {
    try {
      await api.post(`/posts/${post.id}/like`)
      if (onPostUpdate) onPostUpdate()
    } catch (error) {
      console.error('Error liking post:', error)
      toast.error('Erro ao curtir post')
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await api.delete(`/posts/${post.id}`)
      toast.success('Post excluído com sucesso!')
      
      // Invalida caches para atualizar a UI
      queryClient.invalidateQueries('posts')
      queryClient.invalidateQueries(['posts', undefined])
      
      if (onPostUpdate) onPostUpdate()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao excluir post')
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
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
    <>
      <div className="border-b border-gray-200 pb-6 last:border-b-0">
        {/* Header do post */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-500">{formatDate(post.createdAt)}</span>
          
          {isOwnProfile && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <MoreHorizontal className="w-4 h-4 text-gray-500" />
              </button>
              
              {showMenu && (
                <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-[120px] z-10">
                  <button
                    onClick={() => {
                      setShowEditModal(true)
                      setShowMenu(false)
                    }}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-left hover:bg-gray-50 transition-colors"
                  >
                    <Edit className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">Editar</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(true)
                      setShowMenu(false)
                    }}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-left hover:bg-gray-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-red-600">Excluir</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Conteúdo do post */}
        <div className="mb-4">
          <p className="text-gray-900 whitespace-pre-wrap mb-3">{post.content}</p>
          <PostImageGallery images={post.images || []} />
        </div>

        {/* Ações do post */}
        <div className="flex items-center space-x-6">
          <button
            onClick={handleLike}
            className={`flex items-center space-x-2 transition-colors ${
              post.isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
            }`}
          >
            <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
            <span className="text-sm">{post.likesCount}</span>
          </button>
          
          <div className="flex items-center space-x-2 text-gray-500">
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm">{post.commentsCount}</span>
          </div>
        </div>
      </div>

      {/* Modal de edição */}
      {showEditModal && (
        <EditPostModal
          post={post}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            setShowEditModal(false)
            if (onPostUpdate) onPostUpdate()
          }}
        />
      )}

      {/* Confirmação de exclusão */}
      <ConfirmDialog
        open={showDeleteConfirm}
        title="Excluir post?"
        description="Esta ação não pode ser desfeita. O post será permanentemente removido."
        confirmText={isDeleting ? "Excluindo..." : "Excluir"}
        cancelText="Cancelar"
        onConfirm={handleDelete}
        onClose={() => setShowDeleteConfirm(false)}
        confirmDisabled={isDeleting}
      />

      {/* Overlay para fechar menu quando clicar fora */}
      {showMenu && (
        <div 
          className="fixed inset-0 z-5" 
          onClick={() => setShowMenu(false)}
        />
      )}
    </>
  )
}

export default ProfilePostCard
