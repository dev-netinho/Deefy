import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import './index.css'

import AppRoutes from './components/AppRoutes.jsx'
import PlayerProvider from './context/PlayerProvider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <PlayerProvider>
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

        <AppRoutes />
      </PlayerProvider>
    </BrowserRouter>
  </StrictMode>
)
