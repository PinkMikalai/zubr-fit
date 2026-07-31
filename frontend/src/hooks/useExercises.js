import { useState, useEffect, useCallback } from 'react';
import exerciseService from '../services/exerciseService';

export function useExercises() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await exerciseService.list();
      setExercises(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const remove = async (id) => {
    await exerciseService.remove(id);
    setExercises((prev) => prev.filter((exercise) => exercise.id !== id));
  };

  return { exercises, loading, error, reload: load, remove };
}
