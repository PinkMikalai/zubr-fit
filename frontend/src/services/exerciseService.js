import api, { apiList } from './api';
import buildFormData from '../utils/buildFormData';

const exerciseService = {
  async list() {
    return apiList('/exercise/');
  },

  async getById(id) {
    const data = await api(`/exercise/${id}`);
    return data.data;
  },

  async create({ name, description, category, level, illustration, video }) {
    const formData = buildFormData({ name, description, category, level, illustration, video });
    const data = await api('/exercise/new', {
      method: 'POST',
      body: formData,
    });
    return data.data;
  },

  async update(id, { name, description, category, level, illustration, video }) {
    const formData = buildFormData({ name, description, category, level, illustration, video });
    const data = await api(`/exercise/update/${id}`, {
      method: 'POST',
      body: formData,
    });
    return data.data;
  },

  async remove(id) {
    return api(`/exercise/${id}`, { method: 'DELETE' });
  },
};

export default exerciseService;
