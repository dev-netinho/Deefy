import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';

/**
 * Rota para páginas públicas de login/registro.
 * Bloqueia o acesso se o usuário já estiver logado, redirecionando para /home.
 */
function PublicRoute({ children }) {
  if (isAuthenticated()) {
    return <Navigate to="/home" replace />;
  }
  return children;
}

export default PublicRoute;
