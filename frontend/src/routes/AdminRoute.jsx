import { Navigate } from 'react-router-dom';
import { isAuthenticated, isAdmin } from '../utils/auth';
import { showMusicError } from '../utils/musicToast';

/**
 * AdminRoute — requires both authentication AND admin role.
 * Even if someone guesses the URL, they cannot access /admin without ROLE_ADMIN.
 *
 * Shows a toast notification before redirecting so the user understands why
 * they were sent away (instead of a silent redirect to /home).
 *
 * ⚠️ This is a UI guard only. The backend must also protect all admin endpoints
 * with @PreAuthorize("hasRole('ADMIN')") or equivalent.
 */
function AdminRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  if (!isAdmin()) {
    showMusicError('Acesso restrito. Você não tem permissão de administrador.');
    return <Navigate to="/home" replace />;
  }
  return children;
}

export default AdminRoute;
