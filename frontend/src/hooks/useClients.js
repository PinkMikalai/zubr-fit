import { useState, useEffect, useCallback } from 'react';
import coachClientService from '../services/coachClientService';

export function useClients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await coachClientService.list();
      setClients(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const add = async (clientId) => {
    const newCoachClient = await coachClientService.add(clientId);
    setClients((prev) => [...prev, newCoachClient]);
  };

  const remove = async (id) => {
    await coachClientService.remove(id);
    setClients((prev) => prev.filter((coachClient) => coachClient.id !== id));
  };

  return { clients, loading, error, reload: load, add, remove };
}
