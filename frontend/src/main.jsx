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
import Configuration from './pages/Configuration.jsx'
import Home from './pages/home.jsx'
import EditProfile from './pages/EditProfile.jsx'
import RedefinePass from './pages/RedefinePass.jsx'
import VerifyAccount from './pages/VerifyAccount.jsx'
import CustomProfile from './pages/CustomProfile.jsx'
import AdminPanel from './pages/AdminPanel.jsx'
import UserManagement from './pages/UserManagement.jsx'

import PlaylistDetail from './pages/PlaylistDetail.jsx'
import Playlists from './pages/Playlists.jsx'
import UserPlaylistDetail from './pages/UserPlaylistDetail.jsx'
import FavoritesDetail from './pages/FavoritesDetail.jsx'
import Artists from './pages/Artists.jsx'
import SystemPlaylists from './pages/SystemPlaylists.jsx'
import SharedMusic from './pages/SharedMusic.jsx'

import { PlayerProvider } from './contexts/PlayerContext.jsx'
import ProtectedRoute from './routes/ProtectedRoute.jsx'
import AdminRoute from './routes/AdminRoute.jsx'
import PublicRoute from './routes/PublicRoute.jsx'
import PlayerController from './routes/PlayerController.jsx'
import CreatePlaylist from './pages/CreatePlaylist.jsx'
import AddMusicToPlaylist from './pages/AddMusicToPlaylist.jsx'

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

      <PlayerProvider>
        <Routes>
          <Route path="/" element={<PublicRoute><Welcome /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPass /></PublicRoute>} />
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/preferences" element={<ProtectedRoute><Preferences /></ProtectedRoute>} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/registration" element={<PublicRoute><Registration /></PublicRoute>} />
          <Route path="/edit-profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
          <Route path="/configuration" element={<ProtectedRoute><Configuration /></ProtectedRoute>} />
          <Route path="/redefinepass" element={<RedefinePass />} />
          <Route path="/verify-account" element={<PublicRoute><VerifyAccount /></PublicRoute>} />
          <Route path="/custom-profile" element={<ProtectedRoute><CustomProfile /></ProtectedRoute>} />

          <Route path="/playlists" element={<ProtectedRoute><Playlists /></ProtectedRoute>} />
          <Route path="/artists" element={<ProtectedRoute><Artists /></ProtectedRoute>} />
          <Route path="/system-playlists" element={<ProtectedRoute><SystemPlaylists /></ProtectedRoute>} />
          <Route path="/music/:id" element={<ProtectedRoute><SharedMusic /></ProtectedRoute>} />
          <Route path="/playlist-detail/:id" element={<ProtectedRoute><PlaylistDetail /></ProtectedRoute>} />
          <Route path="/user-playlist-detail/:id" element={<ProtectedRoute><UserPlaylistDetail /></ProtectedRoute>} />
          <Route path="/favorites" element={<ProtectedRoute><FavoritesDetail /></ProtectedRoute>} />
          <Route path="/create-playlist" element={<ProtectedRoute><CreatePlaylist /></ProtectedRoute>} />
          <Route path="/playlist/:id/add-music" element={<ProtectedRoute><AddMusicToPlaylist /></ProtectedRoute>} />
          <Route path="/playlist/:id/edit" element={<ProtectedRoute><CreatePlaylist /></ProtectedRoute>} />

          <Route
            path="/admin"
            element={<AdminRoute><AdminPanel /></AdminRoute>}
          />

          <Route
            path="/admin/users"
            element={<AdminRoute><UserManagement /></AdminRoute>}
          />
        </Routes>

        <PlayerController />
      </PlayerProvider>
    </BrowserRouter>
  </StrictMode>
)
