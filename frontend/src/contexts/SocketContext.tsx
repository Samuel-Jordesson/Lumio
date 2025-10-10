import React, { createContext, useContext, useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from './AuthContext'
import { useNotifications } from '../hooks/useNotifications'

interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
}

const SocketContext = createContext<SocketContextType | undefined>(undefined)

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const { user, isAuthenticated } = useAuth()
  const { sendNotification } = useNotifications()

  useEffect(() => {
    if (isAuthenticated && user) {
      // Configuração para desenvolvimento e produção
      const socketURL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
      
      const newSocket = io(socketURL, {
        auth: {
          token: localStorage.getItem('token')
        }
      })

      newSocket.on('connect', () => {
        setIsConnected(true)
        console.log('Connected to socket server')
      })

      newSocket.on('disconnect', () => {
        setIsConnected(false)
        console.log('Disconnected from socket server')
      })

      // Escutar novas mensagens e mostrar notificação
      newSocket.on('new-message', (message) => {
        console.log('New message received:', message)
        
        // Verificar se a mensagem não é do usuário atual
        if (message.senderId !== user?.id) {
          // Enviar notificação
          sendNotification({
            title: 'Nova mensagem',
            body: message.content.length > 50 
              ? message.content.substring(0, 50) + '...' 
              : message.content,
            tag: `message-${message.conversationId || 'unknown'}`,
            data: {
              conversationId: message.conversationId,
              senderId: message.senderId,
              type: 'message'
            }
          })
        }
      })

      setSocket(newSocket)

      return () => {
        newSocket.close()
      }
    }
  }, [isAuthenticated, user, sendNotification])

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  )
}
