import { toast } from 'sonner';
import { MdOutlineErrorOutline, MdOutlineCheckCircle } from 'react-icons/md';

/**
 * Exibe um toast de erro com estilo profissional.
 * @param {string} message
 */
export const showMusicError = (message) => {
  toast.error(message, {
    icon: <MdOutlineErrorOutline size={22} color="#ff5d5d" />,
    style: {
      border: '1px solid rgba(255, 93, 93, 0.5)',
      boxShadow: '0 8px 32px rgba(255, 93, 93, 0.2)',
    }
  });
};

/**
 * Exibe um toast de sucesso com estilo profissional.
 * @param {string} message
 */
export const showMusicSuccess = (message) => {
  toast.success(message, {
    icon: <MdOutlineCheckCircle size={22} color="#39f0d0" />,
    style: {
      border: '1px solid rgba(57, 240, 208, 0.3)',
      boxShadow: '0 8px 32px rgba(57, 240, 208, 0.2)',
    }
  });
};
