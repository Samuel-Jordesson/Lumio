import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { X, Image as ImageIcon, Smile } from 'lucide-react'
import { api } from '../services/api'
import toast from 'react-hot-toast'
import { useQueryClient } from 'react-query'
import useIsMobile from '../hooks/useIsMobile'

interface CreatePostProps {
  onClose: () => void
  onSuccess: () => void
}

interface PostForm {
  content: string
}

const CreatePost: React.FC<CreatePostProps> = ({ onClose, onSuccess }) => {
  const [images, setImages] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<PostForm>()
  const queryClient = useQueryClient()
  const isMobile = useIsMobile()

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    
    if (images.length + imageFiles.length > 10) {
      toast.error('Máximo de 10 imagens por post')
      return
    }
    
    setImages(prev => [...prev, ...imageFiles])
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const onSubmit = async (data: PostForm) => {
    if (!data.content.trim() && images.length === 0) {
      toast.error('Adicione conteúdo ou uma imagem ao post')
      return
    }

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('content', data.content)
      
      images.forEach((image, index) => {
        formData.append('images', image)
      })

      await api.post('/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      toast.success('Post criado com sucesso!')
      reset()
      setImages([])
      // Atualiza o feed globalmente
      queryClient.invalidateQueries('posts')
      onSuccess()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao criar post')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
      <div className={`bg-white rounded-lg w-full ${isMobile ? 'mx-2 max-h-[95vh]' : 'max-w-2xl mx-4 max-h-[90vh]'} overflow-y-auto animate-fade-in-scale`}>
        <div className={`${isMobile ? 'p-4' : 'p-6'}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Criar Post</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-all duration-300 hover:scale-110 hover-rotate"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-4">
              <textarea
                {...register('content', { maxLength: { value: 500, message: 'Máximo 500 caracteres' } })}
                placeholder="O que você está pensando?"
                className="w-full p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={4}
              />
              {errors.content && (
                <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
              )}
            </div>

            {/* Preview das imagens */}
            {images.length > 0 && (
              <div className="mb-4">
                <div className="grid grid-cols-2 gap-2">
                  {images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ações */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-4">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <div className="flex items-center space-x-2 text-gray-500 hover:text-primary-600 transition-colors">
                    <ImageIcon className="w-5 h-5" />
                    <span className="text-sm">Foto</span>
                  </div>
                </label>
                
                <button type="button" className="flex items-center space-x-2 text-gray-500 hover:text-yellow-500 transition-colors">
                  <Smile className="w-5 h-5" />
                  <span className="text-sm">Emoji</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Criando...' : 'Publicar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreatePost
