import { useLocation } from 'react-router-dom';
import MusicPlayer from '../components/MusicPlayer';

const ROTAS_COM_PLAYER = [
  '/home',
  '/preferences',
  '/admin',
  '/playlists',
  '/artists',
  '/system-playlists',
];

const PREFIXOS_COM_PLAYER = [
  '/music/',
  '/playlist-detail/',
  '/user-playlist-detail/',
];

/**
 * Renderiza o MusicPlayer apenas nas rotas que devem exibi-lo.
 */
function PlayerController() {
  const location = useLocation();

  const shouldShowPlayer = ROTAS_COM_PLAYER.includes(location.pathname)
    || PREFIXOS_COM_PLAYER.some((prefix) => location.pathname.startsWith(prefix));

  if (!shouldShowPlayer) {
    return null;
  }

  return <MusicPlayer />;
}

export default PlayerController;
