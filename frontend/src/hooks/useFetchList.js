import { useState, useEffect, useCallback } from 'react';

// Squelette commun à tous les hooks qui chargent une liste au montage (useClients,
// useExercises, useSeances) : charge la liste via fetchFn, garde loading/error à jour,
// et expose setItems pour les mutations locales (ajout/suppression sans tout recharger).
export function useFetchList(fetchFn) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchFn();
      setItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

  useEffect(() => {
    load();
  }, [load]);

  return { items, setItems, loading, error, setError, reload: load };
}
