// Centralise le stockage du token JWT dans le localStorage.
// Utilisé par api.js (pour ajouter le token à chaque requête) et par authService.js.
const TOKEN_KEY = 'token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}
