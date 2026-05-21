import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Navigate,
} from 'react-router-dom'
import { Toaster } from 'sonner'
import './index.css'

import Registration from './pages/Registration.jsx'
import Welcome from './pages/Welcome.jsx'
import Login from './pages/Login.jsx'
import ForgotPass from './pages/ForgotPass.jsx'
import Preferences from './pages/Preferences.jsx'
import Home from './pages/home.jsx'

import MusicPlayer from './components/MusicPlayer.jsx'
import { isAuthenticated } from './utils/auth'

function PlayerController() {
  const location = useLocation()

  const rotasComPlayer = ['/home', '/preferences']

  if (!rotasComPlayer.includes(location.pathname)) {
    return null
  }

  return <MusicPlayer />
}

// Rota para páginas protegidas (exige login)
function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }
  return children
}

// Rota para páginas públicas de login/registro (bloqueia se já estiver logado)
function PublicRoute({ children }) {
  if (isAuthenticated()) {
    return <Navigate to="/home" replace />
  }
  return children
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Toaster
        position="top-right"
        closeButton
        theme="dark"
        toastOptions={{
          style: {
            background: "#141417",
            color: "#e4e4e4",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "14px",
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.88rem",
            fontWeight: "500",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(12px)",
          },
        }}
      />

      <Routes>
        <Route path="/" element={<PublicRoute><Welcome /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/registration" element={<PublicRoute><Registration /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPass /></PublicRoute>} />
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/preferences" element={<ProtectedRoute><Preferences /></ProtectedRoute>} />
      </Routes>

      <PlayerController />
    </BrowserRouter>
  </StrictMode>,
)
 