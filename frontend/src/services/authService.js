import api from './api';

const TOKEN_KEY = 'token';

const authService = {
  async register(userData) {
    // Si une photo de profil a été choisie, il faut envoyer une FormData (pour le fichier).
    // Sinon, un objet JSON classique suffit.
    let body = userData;

    if (userData.avatar) {
      const formData = new FormData();
      formData.append('email', userData.email);
      formData.append('password', userData.password);
      formData.append('firstname', userData.firstname);
      formData.append('lastname', userData.lastname);
      formData.append('role', userData.role);
      if (userData.phoneNumber) {
        formData.append('phoneNumber', userData.phoneNumber);
      }
      formData.append('avatar', userData.avatar);
      body = formData;
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
      localStorage.setItem(TOKEN_KEY, data.token);
    }

    return data;
  },

  async getProfile() {
    const token = this.getToken();

    if (!token) {
      throw new Error('Aucun token trouvé');
    }

    const data = await api('/profile', { token: token });
    return data.data;
  },

  async updateProfile(userData) {
    const token = this.getToken();

    // Si une nouvelle photo de profil a été choisie, il faut envoyer une FormData (pour le fichier).
    // Sinon, un objet JSON classique suffit.
    let body = userData;

    if (userData.avatar) {
      const formData = new FormData();
      formData.append('firstname', userData.firstname);
      formData.append('lastname', userData.lastname);
      formData.append('email', userData.email);
      if (userData.phoneNumber) {
        formData.append('phoneNumber', userData.phoneNumber);
      }
      if (userData.password) {
        formData.append('password', userData.password);
      }
      formData.append('avatar', userData.avatar);
      body = formData;
    }

    const data = await api('/profile/update', { method: 'POST', body: body, token: token });
    return data.data;
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
  },

  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  isAuthenticated() {
    const token = localStorage.getItem(TOKEN_KEY);

    if (token) {
      return true;
    }
    return false;
  },
};

export default authService;
