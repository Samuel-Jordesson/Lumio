import { useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../services/api'
import toast from 'react-hot-toast'

interface GoogleLoginButtonProps {
  onSuccess?: () => void
}

declare global {
  interface Window {
    google: any
  }
}

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({ onSuccess }) => {
  const { login } = useAuth()
  const googleButtonRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.google) {
      initializeGoogleSignIn()
    } else {
      // Se o script ainda não carregou, aguardar
      const checkGoogle = setInterval(() => {
        if (window.google) {
          clearInterval(checkGoogle)
          initializeGoogleSignIn()
        }
      }, 100)

      return () => clearInterval(checkGoogle)
    }
  }, [])

  const initializeGoogleSignIn = () => {
    if (googleButtonRef.current) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      })

      window.google.accounts.id.renderButton(
        googleButtonRef.current,
        {
          theme: 'outline',
          size: 'large',
          width: 400,
          text: 'signin_with',
          locale: 'pt-BR'
        }
      )
    }
  }

  const handleCredentialResponse = async (response: any) => {
    try {
      const result = await api.post('/auth/google', {
        token: response.credential
      })

      // Usar o contexto de autenticação para fazer login
      login(result.data.token, undefined, result.data.user)
      
      toast.success(`Bem-vindo, ${result.data.user.name}!`)
      
      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      console.error('Erro no login com Google:', error)
      toast.error(error.response?.data?.message || 'Erro no login com Google')
    }
  }

  return (
    <div className="w-full">
      <div ref={googleButtonRef} className="w-full flex justify-center"></div>
    </div>
  )
}

export default GoogleLoginButton
