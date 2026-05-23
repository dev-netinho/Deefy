import { useLocation } from 'react-router-dom';
import MusicPlayer from '../components/MusicPlayer';

const ROTAS_COM_PLAYER = ['/home', '/preferences', '/admin'];

/**
 * Renderiza o MusicPlayer apenas nas rotas que devem exibi-lo.
 */
function PlayerController() {
  const location = useLocation();

  if (!ROTAS_COM_PLAYER.includes(location.pathname)) {
    return null;
  }

  return <MusicPlayer />;
}

export default PlayerController;
