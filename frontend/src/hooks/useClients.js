import { useFetchList } from './useFetchList';
import coachClientService from '../services/coachClientService';

export function useClients() {
  const { items: clients, setItems: setClients, loading, error, reload } = useFetchList(coachClientService.list);

  const add = async (clientId) => {
    const newCoachClient = await coachClientService.add(clientId);
    setClients((prev) => [...prev, newCoachClient]);
  };

  const remove = async (id) => {
    await coachClientService.remove(id);
    setClients((prev) => prev.filter((coachClient) => coachClient.id !== id));
  };

  return { clients, loading, error, reload, add, remove };
}
