import { useState, useEffect, useRef } from 'react'
import { useQuery } from 'react-query'
import { useSocket } from '../contexts/SocketContext'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../services/api'
import { Send, Search, MoreVertical, ArrowLeft } from 'lucide-react'
import useIsMobile from '../hooks/useIsMobile'
import { getImageUrl } from '../utils/imageUtils'

interface Conversation {
  id: string
  user: {
    id: string
    name: string
    username: string
    avatar?: string
  }
  lastMessage: {
    content: string
    createdAt: string
    isFromMe: boolean
  }
  unreadCount: number
}

interface Message {
  id: string
  content: string
  createdAt: string
  isFromMe: boolean
  senderId?: string
}

const Messages = () => {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [newlyAddedMessages, setNewlyAddedMessages] = useState<Set<string>>(new Set())
  const [isTyping, setIsTyping] = useState(false)
  const { socket } = useSocket()
  const { user } = useAuth()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile()

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      const messagesContainer = messagesEndRef.current.parentElement;
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    }
  }

  const { data: conversations, isLoading } = useQuery<Conversation[]>(
    'conversations',
    async () => {
      const response = await api.get('/conversations')
      return response.data
    },
    {
      onSuccess: (data) => {
        // Auto-selecionar primeira conversa se não há nenhuma selecionada
        if (data && data.length > 0 && !selectedConversation) {
          setSelectedConversation(data[0].id)
        }
      }
    }
  )

  useQuery<Message[]>(
    ['messages', selectedConversation],
    async () => {
      if (!selectedConversation) return []
      const response = await api.get(`/conversations/${selectedConversation}/messages`)
      return response.data
    },
    {
      enabled: !!selectedConversation,
      onSuccess: (data) => {
        setMessages(data)
      }
    }
  )

  // Rola para baixo sempre que as mensagens mudarem
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (socket && selectedConversation) {
      socket.emit('join-conversation', selectedConversation)
      
      socket.on('new-message', (message: Message) => {
        console.log('Socket message received:', message);
        // Só adiciona mensagens de OUTROS usuários via socket
        if (message.senderId && message.senderId !== user?.id) {
          const messageWithCorrectFlag = {
            ...message,
            isFromMe: false  // Sempre false para mensagens recebidas via socket
          };
          setMessages(prev => [...prev, messageWithCorrectFlag]);
          // Marca como mensagem recém-recebida para animação
          setNewlyAddedMessages(prev => new Set([...prev, message.id]));
          console.log('Message added via socket:', messageWithCorrectFlag);
          
          // Remove da lista de mensagens novas após a animação
          setTimeout(() => {
            setNewlyAddedMessages(prev => {
              const newSet = new Set(prev);
              newSet.delete(message.id);
              return newSet;
            });
          }, 500);
        } else {
          console.log('Message ignored (from current user):', message.senderId, user?.id);
        }
      })

      return () => {
        socket.emit('leave-conversation', selectedConversation)
        socket.off('new-message')
      }
    }
  }, [socket, selectedConversation])

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    const messageContent = newMessage
    setNewMessage('')
    setIsTyping(false)

    try {
      const response = await api.post(`/conversations/${selectedConversation}/messages`, {
        content: messageContent
      })

      // Só adiciona a mensagem localmente, não via socket (evita duplicação)
      setMessages(prev => [...prev, response.data])
      // Marca como mensagem recém-enviada para animação
      setNewlyAddedMessages(prev => new Set([...prev, response.data.id]));
      
      // Remove da lista de mensagens novas após a animação
      setTimeout(() => {
        setNewlyAddedMessages(prev => {
          const newSet = new Set(prev);
          newSet.delete(response.data.id);
          return newSet;
        });
      }, 500);
    } catch (error) {
      console.error('Error sending message:', error)
      // Em caso de erro, restaura a mensagem
      setNewMessage(messageContent)
    }
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) return 'Hoje'
    if (diffInDays === 1) return 'Ontem'
    if (diffInDays < 7) return `${diffInDays} dias atrás`
    
    return date.toLocaleDateString('pt-BR')
  }

  // Adicionar classe CSS para esconder barra de navegação no mobile quando em conversa
  useEffect(() => {
    if (isMobile && selectedConversation) {
      document.body.classList.add('hide-mobile-nav')
    } else {
      document.body.classList.remove('hide-mobile-nav')
    }
    
    // Cleanup ao desmontar componente
    return () => {
      document.body.classList.remove('hide-mobile-nav')
    }
  }, [isMobile, selectedConversation])

  return (
    <div className={`${isMobile ? (selectedConversation ? 'h-screen' : 'h-[calc(100vh-128px)]') : 'max-w-6xl mx-auto h-[calc(100vh-200px)]'}`}>
      <div className={`${isMobile ? 'h-full' : 'bg-white rounded-lg shadow-sm border border-gray-200 h-full'} flex`}>
        {/* Lista de conversas */}
        <div className={`${
          isMobile 
            ? selectedConversation 
              ? 'hidden' 
              : 'w-full bg-white animate-slide-in-left' 
            : 'w-1/3 border-r border-gray-200 animate-slide-in-left'
        }`}>
          <div className="p-4 border-b border-gray-200 animate-slide-in-down">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 animate-fade-in">Mensagens</h2>
            <div className="relative animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 transition-colors duration-200" />
              <input
                type="text"
                placeholder="Pesquisar conversas..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 focus:scale-105 focus:shadow-lg"
              />
            </div>
          </div>
          
          <div className="overflow-y-auto h-[calc(100%-80px)]">
            {isLoading ? (
              <div className="p-4 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-3 animate-pulse">
                    <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-300 rounded w-24 mb-1"></div>
                      <div className="h-3 bg-gray-300 rounded w-32"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="divide-y divide-gray-200 stagger-fade-in">
                {conversations?.map((conversation, index) => (
                  <div
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation.id)}
                    style={{ animationDelay: `${index * 0.1}s` }}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-all duration-300 hover-lift ${
                      selectedConversation === conversation.id ? 'bg-primary-50 shadow-sm' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <img
                          src={getImageUrl(conversation.user.avatar) || '/default-avatar.png'}
                          alt={conversation.user.name}
                          className="w-10 h-10 rounded-full object-cover transition-transform duration-300 hover:scale-110"
                        />
                        {conversation.unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-bounce-gentle">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-900 truncate">
                            {conversation.user.name}
                          </p>
                          {conversation.lastMessage && (
                            <span className="text-xs text-gray-500">
                              {formatDate(conversation.lastMessage.createdAt)}
                            </span>
                          )}
                        </div>
                        <p className={`text-sm truncate ${
                          conversation.lastMessage?.isFromMe ? 'text-gray-500' : 'text-gray-900'
                        }`}>
                          {conversation.lastMessage ? (
                            <>
                              {conversation.lastMessage.isFromMe ? 'Você: ' : ''}
                              {conversation.lastMessage.content}
                            </>
                          ) : (
                            <span className="text-gray-400 italic">Nenhuma mensagem ainda</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Área de mensagens */}
        <div className={`${
          isMobile 
            ? selectedConversation 
              ? 'w-full h-screen bg-white flex flex-col' 
              : 'hidden' 
            : 'flex-1'
        } ${!isMobile ? 'flex flex-col' : ''}`}>
          {selectedConversation ? (
            <>
              {/* Header da conversa */}
              <div className={`${isMobile ? 'fixed top-0 left-0 right-0 z-50 bg-white shadow-md' : ''} p-4 border-b border-gray-200 flex items-center justify-between animate-slide-in-down`}>
                {isMobile && (
                  <button
                    onClick={() => setSelectedConversation(null)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-all duration-300 mr-2 hover:scale-110"
                  >
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                  </button>
                )}
                <div className="flex items-center space-x-3 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                  <img
                    src={getImageUrl(conversations?.find(c => c.id === selectedConversation)?.user.avatar) || '/default-avatar.png'}
                    alt="Avatar"
                    className={`${isMobile ? 'w-10 h-10' : 'w-8 h-8'} rounded-full object-cover transition-transform duration-300 hover:scale-110`}
                  />
                  <div>
                    <p className={`${isMobile ? 'text-heading-xs' : 'font-medium'} text-gray-900`}>
                      {conversations?.find(c => c.id === selectedConversation)?.user.name}
                    </p>
                    <p className="text-caption">
                      @{conversations?.find(c => c.id === selectedConversation)?.user.username}
                    </p>
                  </div>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-full transition-all duration-300 hover:scale-110 hover-rotate animate-fade-in" style={{ animationDelay: '0.2s' }}>
                  <MoreVertical className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              {/* Mensagens */}
              <div className={`flex-1 overflow-y-auto space-y-4 messages-area ${isMobile ? 'pt-20 pb-24 px-4 h-screen' : 'p-4'}`}>
                {messages.map((message) => {
                  const isNewMessage = newlyAddedMessages.has(message.id);
                  const animationClass = isNewMessage 
                    ? message.isFromMe 
                      ? 'message-sent' 
                      : 'message-received'
                    : '';
                  
                  return (
                    <div
                      key={message.id}
                      className={`flex ${message.isFromMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg message-hover ${animationClass} ${
                          message.isFromMe
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-200 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.isFromMe ? 'text-primary-200' : 'text-gray-500'
                        }`}>
                          {formatTime(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                
                {/* Indicador de digitação */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-200 text-gray-900 max-w-xs px-4 py-2 rounded-lg message-bounce-in">
                      <div className="flex items-center space-x-1 typing-dots">
                        <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
                        <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
                        <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input de mensagem */}
              <div className={`${isMobile ? 'fixed bottom-0 left-0 right-0 z-50 bg-white shadow-up' : ''} p-4 border-t border-gray-200 animate-slide-in-up`} style={{ animationDelay: '0.3s' }}>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value)
                      // Simula indicador de digitação (apenas visual)
                      if (e.target.value.trim() && !isTyping) {
                        setIsTyping(true)
                        setTimeout(() => setIsTyping(false), 3000)
                      }
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        sendMessage()
                      }
                    }}
                    onFocus={() => {
                      if (newMessage.trim()) {
                        setIsTyping(true)
                        setTimeout(() => setIsTyping(false), 3000)
                      }
                    }}
                    placeholder="Digite sua mensagem..."
                    className="flex-1 input-field transition-all duration-300 focus:shadow-lg"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-110 hover:shadow-lg hover-glow"
                  >
                    <Send className="w-4 h-4 transition-transform duration-200 hover:rotate-12" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Selecione uma conversa
                </h3>
                <p className="text-gray-500">
                  Escolha uma conversa para começar a enviar mensagens
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Messages
