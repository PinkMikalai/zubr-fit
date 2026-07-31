import api from './api';
import authService from './authService';

function buildFormData(fields) {
  const formData = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      formData.append(key, value);
    }
  });
  return formData;
}

const exerciseService = {
  async list() {
    const data = await api('/exercise/', { token: authService.getToken() });

    // Si le backend n'a pas renvoyé de tableau, on retourne un tableau vide par défaut
    if (!data.data) {
      return [];
    }
    return data.data;
  },

  async getById(id) {
    const data = await api(`/exercise/${id}`, { token: authService.getToken() });
    return data.data;
  },

  async create({ name, description, category, level, illustration, video }) {
    const formData = buildFormData({ name, description, category, level, illustration, video });
    const data = await api('/exercise/new', {
      method: 'POST',
      body: formData,
      token: authService.getToken(),
    });
    return data.data;
  },

  async update(id, { name, description, category, level, illustration, video }) {
    const formData = buildFormData({ name, description, category, level, illustration, video });
    const data = await api(`/exercise/update/${id}`, {
      method: 'POST',
      body: formData,
      token: authService.getToken(),
    });
    return data.data;
  },

  async remove(id) {
    return api(`/exercise/${id}`, { method: 'DELETE', token: authService.getToken() });
  },
};

export default exerciseService;
