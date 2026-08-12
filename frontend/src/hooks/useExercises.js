import { useFetchList } from './useFetchList';
import exerciseService from '../services/exerciseService';

export function useExercises() {
  const { items: exercises, setItems: setExercises, loading, error, setError, reload } = useFetchList(exerciseService.list);

  const remove = async (id) => {
    setError(null);
    try {
      await exerciseService.remove(id);
      setExercises((prev) => prev.filter((exercise) => exercise.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  return { exercises, loading, error, reload, remove };
}
