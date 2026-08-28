import api, { apiList } from './api';

const seanceExerciseService = {
  async list(seanceId) {
    return apiList(`/seance/${seanceId}/exercise`);
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
    });
    return data.data;
  },

  async update(seanceId, id, { sets, reps, position, comment }) {
    const data = await api(`/seance/${seanceId}/exercise/${id}`, {
      method: 'PUT',
      body: { sets: sets, reps: reps, position: position, comment: comment },
    });
    return data.data;
  },

  async remove(seanceId, id) {
    return api(`/seance/${seanceId}/exercise/${id}`, { method: 'DELETE' });
  },
};

export default seanceExerciseService;
