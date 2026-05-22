import { Navigate, Route, Routes, useLocation } from 'react-router-dom'

import Configuration from '../pages/Configuration.jsx'
import CustomProfile from '../pages/CustomProfile.jsx'
import EditProfile from '../pages/EditProfile.jsx'
import ForgotPass from '../pages/ForgotPass.jsx'
import Home from '../pages/home.jsx'
import Login from '../pages/Login.jsx'
import Preferences from '../pages/Preferences.jsx'
import RedefinePass from '../pages/RedefinePass.jsx'
import Registration from '../pages/Registration.jsx'
import VerifyAccount from '../pages/VerifyAccount.jsx'
import Welcome from '../pages/Welcome.jsx'
import { isAuthenticated } from '../utils/auth'
import MusicPlayer from './MusicPlayer.jsx'

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
        <Route path="/forgot-password" element={<PublicRoute><ForgotPass /></PublicRoute>} />
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/preferences" element={<ProtectedRoute><Preferences /></ProtectedRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/registration" element={<PublicRoute><Registration /></PublicRoute>} />
        <Route path="/edit-profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
        <Route path="/configuration" element={<ProtectedRoute><Configuration /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Navigate to="/configuration" replace /></ProtectedRoute>} />
        <Route path="/redefinepass" element={<RedefinePass />} />
        <Route path="/reset-password" element={<RedefinePass />} />
        <Route path="/verify-account" element={<PublicRoute><VerifyAccount /></PublicRoute>} />
        <Route path="/custom-profile" element={<ProtectedRoute><CustomProfile /></ProtectedRoute>} />
      </Routes>
      <PlayerController />
    </>
  )
}
