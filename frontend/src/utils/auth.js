// Chave que será usada no localStorage (buscada do .env para organização)
const TOKEN_KEY = import.meta.env.VITE_STORAGE_TOKEN_KEY || "@deefy-token";
const ROLE_KEY = "@deefy-role";

/**
 * Marca o usuário como autenticado e salva o JWT
 * @param {string} token
 */
export const setToken = (token) => {
  localStorage.setItem("@deefy-auth", "true");
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

/**
 * Busca o token JWT salvo
 * @returns {string | null}
 */
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Remove o token e dados de sessão (Logout)
 */
export const removeToken = () => {
  localStorage.removeItem("@deefy-auth");
  localStorage.removeItem("@deefy-user");
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(TOKEN_KEY);
};

/**
 * Verifica se o usuário está autenticado
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  return localStorage.getItem("@deefy-auth") === "true";
};

/**
 * Salva a role do usuário no localStorage (ex: "ROLE_ADMIN")
 * @param {string} role
 */
export const setUserRole = (role) => {
  if (role) localStorage.setItem(ROLE_KEY, role);
};

/**
 * Busca a role do usuário salva
 * @returns {string | null}
 */
export const getUserRole = () => {
  return localStorage.getItem(ROLE_KEY);
};

/**
 * Verifica se o usuário logado tem role de ADMIN.
 *
 * ⚠️ SECURITY NOTE: This check is ONLY for UI visibility (showing/hiding buttons).
 * All admin operations must be protected server-side. Never trust client-side roles.
 *
 * @returns {boolean}
 */
export const isAdmin = () => {
  const role = getUserRole();
  return role === "ROLE_ADMIN" || role === "ADMIN";
};
