// Chave que será usada no localStorage (buscada do .env para organização)
import { getRoleFromToken, isJwtExpired } from './jwt';

const TOKEN_KEY = import.meta.env.VITE_STORAGE_TOKEN_KEY || "@deefy-token";
const ROLE_KEY = "@deefy-role";
const AUTH_KEY = "@deefy-auth";
const INTENDED_ROUTE_KEY = "@deefy-intended-route";

function clearStoredSession() {
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem("@deefy-user");
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Marca o usuário como autenticado e salva o JWT
 * @param {string} token
 */
export const setToken = (token) => {
  if (!token || isJwtExpired(token)) {
    clearStoredSession();
    return;
  }

  localStorage.setItem(AUTH_KEY, "true");
  localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Busca o token JWT salvo
 * @returns {string | null}
 */
export const getToken = () => {
  const token = localStorage.getItem(TOKEN_KEY);

  if (!token || isJwtExpired(token)) {
    clearStoredSession();
    return null;
  }

  return token;
};

/**
 * Remove o token e dados de sessão (Logout)
 */
export const removeToken = () => {
  clearStoredSession();
  localStorage.removeItem(INTENDED_ROUTE_KEY);
};

export const setIntendedRoute = (route) => {
  if (route) localStorage.setItem(INTENDED_ROUTE_KEY, route);
};

export const consumeIntendedRoute = () => {
  const route = localStorage.getItem(INTENDED_ROUTE_KEY);
  localStorage.removeItem(INTENDED_ROUTE_KEY);

  if (!route || !route.startsWith('/') || route.startsWith('//')) {
    return null;
  }

  return route;
};

/**
 * Verifica se o usuário está autenticado
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  return localStorage.getItem(AUTH_KEY) === "true" && Boolean(getToken());
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
  return getRoleFromToken(getToken()) || localStorage.getItem(ROLE_KEY);
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
