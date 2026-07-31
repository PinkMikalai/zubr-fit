import { useState, useEffect, useCallback } from 'react';
import seanceService from '../services/seanceService';

export function useSeances() {
  const [seances, setSeances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await seanceService.list();
      setSeances(data);
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
    await seanceService.remove(id);
    setSeances((prev) => prev.filter((seance) => seance.id !== id));
  };

  return { seances, loading, error, reload: load, remove };
}
