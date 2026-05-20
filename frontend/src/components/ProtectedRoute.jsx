import { Navigate } from 'react-router-dom'
import { isAuthenticated } from '../utils/auth.js'

function ProtectedRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/login" replace />
}

export default ProtectedRoute
