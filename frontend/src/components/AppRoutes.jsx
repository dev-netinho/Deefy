import { Navigate, Route, Routes, useLocation } from 'react-router-dom'

import ForgotPass from '../pages/ForgotPass.jsx'
import Home from '../pages/home.jsx'
import Login from '../pages/Login.jsx'
import Preferences from '../pages/Preferences.jsx'
import Registration from '../pages/Registration.jsx'
import ResetPassword from '../pages/ResetPassword.jsx'
import VerifyAccount from '../pages/VerifyAccount.jsx'
import Welcome from '../pages/Welcome.jsx'
import MusicPlayer from './MusicPlayer.jsx'
import { isAuthenticated } from '../utils/auth'

function PlayerController() {
  const location = useLocation()
  const rotasComPlayer = ['/home', '/preferences']

  if (!rotasComPlayer.includes(location.pathname)) {
    return null
  }

  return <MusicPlayer />
}

function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }

  return children
}

function PublicRoute({ children }) {
  if (isAuthenticated()) {
    return <Navigate to="/home" replace />
  }

  return children
}

export default function AppRoutes() {
  return (
    <>
      <Routes>
        <Route path="/" element={<PublicRoute><Welcome /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/registration" element={<PublicRoute><Registration /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPass /></PublicRoute>} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-account" element={<VerifyAccount />} />
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/preferences" element={<ProtectedRoute><Preferences /></ProtectedRoute>} />
      </Routes>

      <PlayerController />
    </>
  )
}
