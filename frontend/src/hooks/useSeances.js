import { useFetchList } from './useFetchList';
import seanceService from '../services/seanceService';

export function useSeances() {
  const { items: seances, setItems: setSeances, loading, error, reload } = useFetchList(seanceService.list);

  const remove = async (id) => {
    await seanceService.remove(id);
    setSeances((prev) => prev.filter((seance) => seance.id !== id));
  };

  return { seances, loading, error, reload, remove };
}
