import api from './api';
import authService from './authService';

const seanceExerciseService = {
  async list(seanceId) {
    const data = await api(`/seance/${seanceId}/exercise`, { token: authService.getToken() });

    if (!data.data) {
      return [];
    }
    return data.data;
  },

  async add(seanceId, { exerciseId, sets, reps, position, comment }) {
    const data = await api(`/seance/${seanceId}/exercise`, {
      method: 'POST',
      body: {
        exercise_id: exerciseId,
        sets: sets,
        reps: reps,
        position: position,
        comment: comment,
      },
      token: authService.getToken(),
    });
    return data.data;
  },

  async update(seanceId, id, { sets, reps, position, comment }) {
    const data = await api(`/seance/${seanceId}/exercise/${id}`, {
      method: 'PUT',
      body: { sets: sets, reps: reps, position: position, comment: comment },
      token: authService.getToken(),
    });
    return data.data;
  },

  async remove(seanceId, id) {
    return api(`/seance/${seanceId}/exercise/${id}`, {
      method: 'DELETE',
      token: authService.getToken(),
    });
  },
};

export default seanceExerciseService;
