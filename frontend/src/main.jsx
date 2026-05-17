import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import './index.css'
import Registration from './pages/Registration.jsx'
import Welcome from './pages/Welcome.jsx'
import Login from './pages/Login.jsx'
import ForgotPass from './pages/ForgotPass.jsx'
import Preferences from './pages/Preferences.jsx'
import Home from './pages/home.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Toaster
        position="top-right"
        closeButton
        toastOptions={{
          style: {
            background: 'rgba(20, 20, 22, 0.72)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(57, 240, 208, 0.3)',
            color: '#fff',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
            fontSize: '1rem',
          }
        }}
      />
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/preferences" element={<Preferences />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/registration" element={<Registration />} />
        <Route path="/forgot-password" element={<ForgotPass />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
