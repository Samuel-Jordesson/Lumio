import React, { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import toast from 'react-hot-toast'

interface User {
  id: string
  username: string
  email: string
  name: string
  avatar?: string
  bio?: string
  followersCount: number
  followingCount: number
  postsCount: number
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (emailOrToken: string, password?: string, userData?: User) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => void
  updateProfile: (data: any) => Promise<void>
}

interface RegisterData {
  username: string
  email: string
  password: string
  name: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      checkAuth()
    }
  }, [])

  const checkAuth = async () => {
    try {
      console.log('🔍 Verificando autenticação...')
      const response = await api.get('/auth/me')
      console.log('✅ Usuário autenticado:', response.data)
      setUser(response.data)
      setIsAuthenticated(true)
    } catch (error) {
      console.log('❌ Erro na verificação de auth:', error)
      localStorage.removeItem('token')
      delete api.defaults.headers.common['Authorization']
      setUser(null)
      setIsAuthenticated(false)
    }
  }

  const login = async (emailOrToken: string, password?: string, userData?: User) => {
    try {
      console.log('🚀 Iniciando login...', { hasPassword: !!password, hasUserData: !!userData })
      let token: string
      let user: User

      if (password) {
        // Login tradicional com email e senha
        console.log('📧 Login tradicional com email/senha')
        const response = await api.post('/auth/login', { email: emailOrToken, password })
        token = response.data.token
        user = response.data.user
        toast.success('Login realizado com sucesso!')
      } else if (userData) {
        // Login com Google (token já está no emailOrToken, userData já vem pronta)
        console.log('🔑 Login com Google')
        token = emailOrToken
        user = userData
        // Toast já é exibido no GoogleLoginButton
      } else {
        throw new Error('Parâmetros inválidos para login')
      }
      
      console.log('💾 Salvando token e dados do usuário...')
      localStorage.setItem('token', token)
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      setUser(user)
      setIsAuthenticated(true)
      
      console.log('🏠 Redirecionando para home...')
      navigate('/')
    } catch (error: any) {
      console.log('❌ Erro no login:', error)
      if (password) {
        // Só mostra toast de erro para login tradicional
        toast.error(error.response?.data?.message || 'Erro ao fazer login')
      }
      throw error
    }
  }

  const register = async (userData: RegisterData) => {
    try {
      const response = await api.post('/auth/register', userData)
      const { token, user } = response.data
      
      localStorage.setItem('token', token)
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      setUser(user)
      setIsAuthenticated(true)
      toast.success('Conta criada com sucesso!')
      navigate('/')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao criar conta')
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
    setIsAuthenticated(false)
    navigate('/login')
    toast.success('Logout realizado com sucesso!')
  }

  const updateProfile = async (data: any) => {
    try {
      const isFormData = typeof FormData !== 'undefined' && data instanceof FormData
      const response = await api.put('/users/profile', data, isFormData ? {
        headers: { 'Content-Type': 'multipart/form-data' }
      } : undefined)
      
      // Atualiza o estado global do usuário
      setUser(response.data)
      
      return response.data // Retorna os dados atualizados
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao atualizar perfil')
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      login,
      register,
      logout,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  )
}
