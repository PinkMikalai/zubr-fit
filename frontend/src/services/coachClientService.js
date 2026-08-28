import api, { apiList } from './api';

const coachClientService = {
  async list() {
    return apiList('/coach/clients');
  },

  async history() {
    return apiList('/coach/clients/history');
  },

  async add(clientId) {
    const data = await api('/coach/clients', {
      method: 'POST',
      body: { client_id: clientId },
    });
    return data.data;
  },

  async remove(id) {
    const data = await api(`/coach/clients/${id}`, { method: 'DELETE' });
    return data.data;
  },
};

export default coachClientService;
