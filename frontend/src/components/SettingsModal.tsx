import { useState } from 'react'
import { useMutation, useQueryClient } from 'react-query'
import { api } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { X, Lock, Mail, User, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

interface PasswordForm {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

interface EmailForm {
  newEmail: string
  password: string
}

interface UsernameForm {
  newUsername: string
  password: string
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState<'password' | 'email' | 'username'>('password')
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
    email: false,
    username: false
  })

  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [emailForm, setEmailForm] = useState<EmailForm>({
    newEmail: '',
    password: ''
  })

  const [usernameForm, setUsernameForm] = useState<UsernameForm>({
    newUsername: '',
    password: ''
  })

  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Mutations
  const changePasswordMutation = useMutation(
    async (data: { currentPassword: string; newPassword: string }) => {
      const response = await api.put('/users/change-password', data)
      return response.data
    },
    {
      onSuccess: () => {
        toast.success('Senha alterada com sucesso!')
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Erro ao alterar senha')
      }
    }
  )

  const changeEmailMutation = useMutation(
    async (data: { newEmail: string; password: string }) => {
      const response = await api.put('/users/change-email', data)
      return response.data
    },
    {
      onSuccess: () => {
        toast.success('Email alterado com sucesso!')
        setEmailForm({ newEmail: '', password: '' })
        queryClient.invalidateQueries('user')
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Erro ao alterar email')
      }
    }
  )

  const changeUsernameMutation = useMutation(
    async (data: { newUsername: string; password: string }) => {
      const response = await api.put('/users/change-username', data)
      return response.data
    },
    {
      onSuccess: () => {
        toast.success('Username alterado com sucesso!')
        setUsernameForm({ newUsername: '', password: '' })
        queryClient.invalidateQueries('user')
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Erro ao alterar username')
      }
    }
  )

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('As senhas não coincidem')
      return
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('A nova senha deve ter pelo menos 6 caracteres')
      return
    }
    changePasswordMutation.mutate({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    })
  }

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(emailForm.newEmail)) {
      toast.error('Email inválido')
      return
    }
    changeEmailMutation.mutate(emailForm)
  }

  const handleUsernameSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (usernameForm.newUsername.length < 3) {
      toast.error('Username deve ter pelo menos 3 caracteres')
      return
    }
    if (!/^[a-zA-Z0-9_]+$/.test(usernameForm.newUsername)) {
      toast.error('Username deve conter apenas letras, números e underscore')
      return
    }
    changeUsernameMutation.mutate(usernameForm)
  }

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4 h-[600px] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-900">Configurações</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 bg-gray-50 border-r border-gray-200 p-4 flex-shrink-0">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveSection('password')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left ${
                  activeSection === 'password'
                    ? 'bg-primary-50 text-primary-700 border border-primary-200'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Lock className="w-5 h-5" />
                <span className="font-medium">Alterar Senha</span>
              </button>
              
              <button
                onClick={() => setActiveSection('email')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left ${
                  activeSection === 'email'
                    ? 'bg-primary-50 text-primary-700 border border-primary-200'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Mail className="w-5 h-5" />
                <span className="font-medium">Alterar Email</span>
              </button>
              
              <button
                onClick={() => setActiveSection('username')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left ${
                  activeSection === 'username'
                    ? 'bg-primary-50 text-primary-700 border border-primary-200'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <User className="w-5 h-5" />
                <span className="font-medium">Alterar @</span>
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto min-h-0">
            {/* Alterar Senha */}
            {activeSection === 'password' && (
              <div className="h-full flex flex-col">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Alterar Senha</h3>
                <form onSubmit={handlePasswordSubmit} className="flex-1 flex flex-col space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Senha Atual
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? 'text' : 'password'}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('current')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nova Senha
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? 'text' : 'password'}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('new')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirmar Nova Senha
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('confirm')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex-1"></div>

                  <button
                    type="submit"
                    disabled={changePasswordMutation.isLoading}
                    className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {changePasswordMutation.isLoading ? 'Alterando...' : 'Alterar Senha'}
                  </button>
                </form>
              </div>
            )}

            {/* Alterar Email */}
            {activeSection === 'email' && (
              <div className="h-full flex flex-col">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Alterar Email</h3>
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Email atual:</p>
                  <p className="font-medium text-gray-900">{user?.email}</p>
                </div>
                
                <form onSubmit={handleEmailSubmit} className="flex-1 flex flex-col space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Novo Email
                    </label>
                    <input
                      type="email"
                      value={emailForm.newEmail}
                      onChange={(e) => setEmailForm(prev => ({ ...prev, newEmail: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Senha Atual (para confirmar)
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.email ? 'text' : 'password'}
                        value={emailForm.password}
                        onChange={(e) => setEmailForm(prev => ({ ...prev, password: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('email')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.email ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex-1"></div>

                  <button
                    type="submit"
                    disabled={changeEmailMutation.isLoading}
                    className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {changeEmailMutation.isLoading ? 'Alterando...' : 'Alterar Email'}
                  </button>
                </form>
              </div>
            )}

            {/* Alterar Username */}
            {activeSection === 'username' && (
              <div className="h-full flex flex-col">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Alterar @</h3>
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Username atual:</p>
                  <p className="font-medium text-gray-900">@{user?.username}</p>
                </div>
                
                <form onSubmit={handleUsernameSubmit} className="flex-1 flex flex-col space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Novo Username
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">@</span>
                      <input
                        type="text"
                        value={usernameForm.newUsername}
                        onChange={(e) => setUsernameForm(prev => ({ ...prev, newUsername: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') }))}
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="novo_username"
                        required
                        minLength={3}
                        maxLength={20}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Apenas letras, números e underscore. 3-20 caracteres.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Senha Atual (para confirmar)
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.username ? 'text' : 'password'}
                        value={usernameForm.password}
                        onChange={(e) => setUsernameForm(prev => ({ ...prev, password: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('username')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.username ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex-1"></div>

                  <button
                    type="submit"
                    disabled={changeUsernameMutation.isLoading}
                    className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {changeUsernameMutation.isLoading ? 'Alterando...' : 'Alterar Username'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsModal
