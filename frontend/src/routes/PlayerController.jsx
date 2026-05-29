import { useLocation } from 'react-router-dom';
import MusicPlayer from '../components/MusicPlayer';

const ROTAS_SEM_PLAYER = [
  '/',
  '/login',
  '/registration',
  '/forgot-password',
  '/redefinepass',
  '/verify-account',
];

const ROTAS_PLAYER_OCULTO = [
  '/configuration',
  '/edit-profile',
  '/custom-profile',
];

/**
 * Mantem uma unica instancia do MusicPlayer nas paginas internas.
 */
function PlayerController() {
  const location = useLocation();

  if (ROTAS_SEM_PLAYER.includes(location.pathname)) {
    return null;
  }

  return <MusicPlayer isHidden={ROTAS_PLAYER_OCULTO.includes(location.pathname)} />;
}

export default PlayerController;
