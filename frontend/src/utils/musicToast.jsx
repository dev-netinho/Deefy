import { toast } from 'sonner';
import { MdOutlineErrorOutline, MdOutlineCheckCircle, MdInfoOutline } from 'react-icons/md';

const BASE_STYLE = {
  background: '#141417',
  color: '#e4e4e4',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '14px',
  fontFamily: "'Inter', sans-serif",
  fontSize: '0.88rem',
  fontWeight: '500',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
};

// IDs fixos por tipo: o Sonner substitui o toast existente pelo novo
// quando o mesmo id é reutilizado, impedindo o empilhamento infinito.
const TOAST_IDS = {
  error: 'deefy-error',
  success: 'deefy-success',
  info: 'deefy-info',
};

/**
 * Exibe um toast de erro no estilo Deefy.
 * Chamadas repetidas substituem o toast anterior — sem empilhamento.
 * @param {string} message
 */
export const showMusicError = (message) => {
  toast.error(message, {
    id: TOAST_IDS.error,
    icon: <MdOutlineErrorOutline size={22} color="#ff5d5d" />,
    style: {
      ...BASE_STYLE,
      border: '1px solid rgba(255, 93, 93, 0.35)',
      boxShadow: '0 8px 32px rgba(255, 93, 93, 0.15)',
    },
  });
};

/**
 * Exibe um toast de sucesso no estilo Deefy.
 * Chamadas repetidas substituem o toast anterior — sem empilhamento.
 * @param {string} message
 */
export const showMusicSuccess = (message) => {
  toast.success(message, {
    id: TOAST_IDS.success,
    icon: <MdOutlineCheckCircle size={22} color="#39f0d0" />,
    style: {
      ...BASE_STYLE,
      border: '1px solid rgba(57, 240, 208, 0.3)',
      boxShadow: '0 8px 32px rgba(57, 240, 208, 0.15)',
    },
  });
};

/**
 * Exibe um toast informativo no estilo Deefy.
 * Chamadas repetidas substituem o toast anterior — sem empilhamento.
 * @param {string} message
 */
export const showMusicInfo = (message) => {
  toast(message, {
    id: TOAST_IDS.info,
    icon: <MdInfoOutline size={22} color="#8b8bff" />,
    style: {
      ...BASE_STYLE,
      border: '1px solid rgba(139, 139, 255, 0.3)',
      boxShadow: '0 8px 32px rgba(139, 139, 255, 0.15)',
    },
  });
};
