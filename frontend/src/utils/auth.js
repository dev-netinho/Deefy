// Chave que será usada no localStorage (buscada do .env para organização)
const TOKEN_KEY = import.meta.env.VITE_STORAGE_TOKEN_KEY || "@deefy-token";

/**
 * Salva o token JWT no localStorage
 * @param {string} token 
 */
export const setToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Busca o token JWT salvo
 * @returns {string | null}
 */
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Remove o token (Logout)
 */
export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

/**
 * Verifica se o usuário está autenticado (existe um token)
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  return getToken() !== null;
};
