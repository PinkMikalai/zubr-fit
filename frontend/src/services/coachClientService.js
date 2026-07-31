import api from './api';
import authService from './authService';

const coachClientService = {
  async list() {
    const data = await api('/coach/clients', { token: authService.getToken() });

    if (!data.data) {
      return [];
    }
    return data.data;
  },

  async history() {
    const data = await api('/coach/clients/history', { token: authService.getToken() });

    if (!data.data) {
      return [];
    }
    return data.data;
  },

  async add(clientId) {
    const data = await api('/coach/clients', {
      method: 'POST',
      body: { client_id: clientId },
      token: authService.getToken(),
    });
    return data.data;
  },

  async remove(id) {
    const data = await api(`/coach/clients/${id}`, {
      method: 'DELETE',
      token: authService.getToken(),
    });
    return data.data;
  },
};

export default coachClientService;
