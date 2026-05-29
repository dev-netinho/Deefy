import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated, setIntendedRoute } from '../utils/auth';

/**
 * Rota para páginas protegidas (exige login).
 * Redireciona para /login se não houver sessão ativa.
 */
function ProtectedRoute({ children }) {
  const location = useLocation();

  if (!isAuthenticated()) {
    setIntendedRoute(`${location.pathname}${location.search}`);
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default ProtectedRoute;
