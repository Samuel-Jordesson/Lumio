import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, User, X } from 'lucide-react'
import { api } from '../services/api'
import { getImageUrl } from '../utils/imageUtils'

interface User {
  id: string
  name: string
  username: string
  avatar?: string
  bio?: string
  followersCount: number
  postsCount: number
  isFollowing: boolean
}

interface SearchBarProps {
  placeholder?: string
  className?: string
  onUserSelect?: (user: User) => void
}

const SearchBar = ({ 
  placeholder = "Pesquisar usuários...", 
  className = "",
  onUserSelect 
}: SearchBarProps) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [suggestions, setSuggestions] = useState<User[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  
  const navigate = useNavigate()
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.length >= 2) {
        searchUsers(searchTerm)
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const searchUsers = async (query: string) => {
    if (!query.trim()) return
    
    setIsLoading(true)
    try {
      const response = await api.get(`/users/search?q=${encodeURIComponent(query)}`)
      setSuggestions(response.data)
      setShowSuggestions(response.data.length > 0)
      setSelectedIndex(-1)
    } catch (error) {
      console.error('Erro ao buscar usuários:', error)
      setSuggestions([])
      setShowSuggestions(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    setSelectedIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') {
        handleSearch()
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          selectUser(suggestions[selectedIndex])
        } else {
          handleSearch()
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  const selectUser = (user: User) => {
    setSearchTerm('')
    setShowSuggestions(false)
    setSelectedIndex(-1)
    
    if (onUserSelect) {
      onUserSelect(user)
    } else {
      navigate(`/profile/${user.username}`)
    }
  }

  const handleSearch = () => {
    if (searchTerm.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchTerm.trim())}&tab=users`)
      setSearchTerm('')
      setShowSuggestions(false)
    }
  }

  const clearSearch = () => {
    setSearchTerm('')
    setSuggestions([])
    setShowSuggestions(false)
    setSelectedIndex(-1)
    inputRef.current?.focus()
  }

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Input Field */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 transition-colors duration-200" />
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => searchTerm.length >= 2 && suggestions.length > 0 && setShowSuggestions(true)}
          className="pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 focus:scale-105 w-full"
        />
        
        {/* Clear button */}
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-primary-500 rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          <div className="py-2">
            {suggestions.map((user, index) => (
              <div
                key={user.id}
                onClick={() => selectUser(user)}
                className={`flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                  index === selectedIndex ? 'bg-primary-50' : ''
                }`}
              >
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <img
                    src={getImageUrl(user.avatar || '/default-avatar.png')}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                </div>
                
                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.name}
                    </p>
                    {user.isFollowing && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                        Seguindo
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    @{user.username}
                  </p>
                  {user.bio && (
                    <p className="text-xs text-gray-400 truncate mt-1">
                      {user.bio}
                    </p>
                  )}
                  <div className="flex items-center space-x-3 mt-1">
                    <span className="text-xs text-gray-400">
                      {user.followersCount} seguidores
                    </span>
                    <span className="text-xs text-gray-400">
                      {user.postsCount} posts
                    </span>
                  </div>
                </div>
                
                {/* User Icon */}
                <div className="flex-shrink-0">
                  <User className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
          
          {/* Footer */}
          <div className="border-t border-gray-200 px-4 py-2 bg-gray-50 rounded-b-lg">
            <p className="text-xs text-gray-500 text-center">
              Pressione Enter para buscar ou use as setas para navegar
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default SearchBar
