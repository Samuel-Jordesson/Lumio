import { useState } from 'react'
import { X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import { useQueryClient } from 'react-query'

interface EditProfileModalProps {
  currentName: string
  currentBio?: string
  onClose: () => void
  onSuccess: () => void
}

interface ProfileForm {
  name: string
  bio?: string
  avatar?: FileList
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ currentName, currentBio, onClose, onSuccess }) => {
  const { updateProfile, user } = useAuth()
  const queryClient = useQueryClient()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ProfileForm>({
    defaultValues: {
      name: currentName,
      bio: currentBio || ''
    }
  })
  const [preview, setPreview] = useState<string | null>(null)

  const onSubmit = async (data: ProfileForm) => {
    try {
      const formData = new FormData()
      formData.append('name', data.name)
      formData.append('bio', data.bio || '')
      const file = data.avatar?.[0]
      

      
      if (file) {
        formData.append('avatar', file)
        console.log('File appended to FormData:', file.name, file.size, file.type)
      } else {
        console.log('No file to append')
      }
      
      // Debug FormData
      for (let pair of formData.entries()) {
        console.log('FormData entry:', pair[0], pair[1])
      }

      const updatedUser = await updateProfile(formData as any)
      console.log('Perfil atualizado:', updatedUser) // Debug
      
      // Invalidar caches específicos do React Query
      if (user?.username) {
        queryClient.invalidateQueries(['profile', user.username])
        queryClient.invalidateQueries(['posts', user.username])
        queryClient.invalidateQueries('posts') // Feed global
      }
      
      toast.success('Perfil atualizado com sucesso!')
      onSuccess()
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error) // Debug
      toast.error(error.response?.data?.message || 'Erro ao atualizar perfil')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-lg mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Editar Perfil</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input
                  type="text"
                  {...register('name', { required: 'Nome é obrigatório' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  rows={3}
                  {...register('bio', { maxLength: { value: 500, message: 'Máximo 500 caracteres' } })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                {errors.bio && <p className="text-sm text-red-600 mt-1">{errors.bio.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Foto de perfil</label>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden">
                    {preview ? (
                      <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full" />
                    )}
                  </div>
                  <label className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm cursor-pointer">
                    Selecionar imagem
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      {...register('avatar', {
                        onChange: (e) => {
                          const file = e.target.files?.[0]
                          if (file) setPreview(URL.createObjectURL(file))
                        }
                      })}
                    />
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200">Cancelar</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded-lg text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50">
                  {isSubmitting ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default EditProfileModal


