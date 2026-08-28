import api, { apiList } from './api';

const seanceService = {
  async list() {
    return apiList('/seance/');
  },

  async getById(id) {
    const data = await api(`/seance/${id}`);
    return data.data;
  },

  async create({ name, duration, comment, level }) {
    const data = await api('/seance/new', {
      method: 'POST',
      body: { name: name, duration: duration, comment: comment, level: level },
    });
    return data.data;
  },

  async update(id, { name, duration, comment, level }) {
    const data = await api(`/seance/${id}`, {
      method: 'PUT',
      body: { name: name, duration: duration, comment: comment, level: level },
    });
    return data.data;
  },

  async remove(id) {
    return api(`/seance/${id}`, { method: 'DELETE' });
  },

  async complete(id) {
    const data = await api(`/seance/${id}/complete`, { method: 'PUT' });
    return data.data;
  },

  async assign(id, userIds) {
    const data = await api(`/seance/${id}/assign`, {
      method: 'POST',
      body: { user_ids: userIds },
    });
    return data.data;
  },

  async unassign(id, userIds) {
    const data = await api(`/seance/${id}/assign`, {
      method: 'DELETE',
      body: { user_ids: userIds },
    });
    return data.data;
  },

  // La liste des clients à qui cette séance est assignée (réservé aux coachs)
  async getAssignees(id) {
    return apiList(`/seance/${id}/assignees`);
  },

  // Les séances d'un client précis, vues par son coach (page "Voir profil" d'un client)
  async getByClientId(clientId) {
    return apiList(`/seance/client/${clientId}`);
  },
};

export default seanceService;
