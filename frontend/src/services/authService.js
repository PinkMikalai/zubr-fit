import api from './api';
import buildFormData from '../utils/buildFormData';
import { getToken as readToken, setToken, clearToken } from '../utils/tokenStorage';

const authService = {
  async register(userData) {
    // Si une photo de profil a été choisie, il faut envoyer une FormData (pour le fichier).
    // Sinon, un objet JSON classique suffit.
    let body = userData;
    if (userData.avatar) {
      body = buildFormData(userData);
    }

    const data = await api('/auth/register', { method: 'POST', body: body });
    return data.data;
  },

  async login(email, password) {
    // /api/auth/login est intercepté par le firewall json_login de Lexik (security.yaml)
    // avant d'atteindre AuthController::login() : la réponse est { token }, pas { data: { token } }.
    // Si les identifiants sont faux, api.js se charge déjà de traduire le message en français.
    const data = await api('/auth/login', { method: 'POST', body: { email: email, password: password } });

    if (data.token) {
      setToken(data.token);
    }

    return data;
  },

  async getProfile() {
    const token = readToken();

    if (!token) {
      throw new Error('Aucun token trouvé');
    }

    const data = await api('/profile');
    return data.data;
  },

  async updateProfile(userData) {
    // Si une nouvelle photo de profil a été choisie, il faut envoyer une FormData (pour le fichier).
    // Sinon, un objet JSON classique suffit.
    let body = userData;
    if (userData.avatar) {
      body = buildFormData(userData);
    }

    const data = await api('/profile/update', { method: 'POST', body: body });
    return data.data;
  },

  logout() {
    clearToken();
  },

  getToken() {
    return readToken();
  },

  isAuthenticated() {
    const token = readToken();

    if (token) {
      return true;
    }
    return false;
  },
};

export default authService;
