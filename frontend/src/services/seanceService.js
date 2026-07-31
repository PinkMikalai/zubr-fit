import api from './api';
import authService from './authService';

const seanceService = {
  async list() {
    const data = await api('/seance/', { token: authService.getToken() });

    // Si le backend n'a pas renvoyé de tableau, on retourne un tableau vide par défaut
    if (!data.data) {
      return [];
    }
    return data.data;
  },

  async getById(id) {
    const data = await api(`/seance/${id}`, { token: authService.getToken() });
    return data.data;
  },

  async create({ name, duration, comment }) {
    const data = await api('/seance/new', {
      method: 'POST',
      body: { name: name, duration: duration, comment: comment },
      token: authService.getToken(),
    });
    return data.data;
  },

  async update(id, { name, duration, comment }) {
    const data = await api(`/seance/${id}`, {
      method: 'PUT',
      body: { name: name, duration: duration, comment: comment },
      token: authService.getToken(),
    });
    return data.data;
  },

  async remove(id) {
    return api(`/seance/${id}`, { method: 'DELETE', token: authService.getToken() });
  },

  async complete(id) {
    const data = await api(`/seance/${id}/complete`, {
      method: 'PUT',
      token: authService.getToken(),
    });
    return data.data;
  },

  async assign(id, userIds) {
    const data = await api(`/seance/${id}/assign`, {
      method: 'POST',
      body: { user_ids: userIds },
      token: authService.getToken(),
    });
    return data.data;
  },

  async unassign(id, userIds) {
    const data = await api(`/seance/${id}/assign`, {
      method: 'DELETE',
      body: { user_ids: userIds },
      token: authService.getToken(),
    });
    return data.data;
  },
};

export default seanceService;
