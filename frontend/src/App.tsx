import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { SocketProvider } from './contexts/SocketContext'
import PrivateRoute from './components/PrivateRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Feed from './pages/Feed'
import Profile from './pages/Profile'
import Messages from './pages/Messages'
import Explore from './pages/Explore'

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Routes>
          {/* Rotas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Rotas privadas */}
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Feed />} />
            <Route path="profile/:username" element={<Profile />} />
            <Route path="messages" element={<Messages />} />
            <Route path="explore" element={<Explore />} />
          </Route>
        </Routes>
      </SocketProvider>
    </AuthProvider>
  )
}

export default App
