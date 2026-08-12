import { useClients } from '../hooks/useClients';
import ClientCard from '../components/clients/ClientCard';
import ClientSearch from '../components/clients/ClientSearch';
import ClientHistory from '../components/clients/ClientHistory';
import PageMeta from '../components/layout/PageMeta';

// L'accès (réservé aux coachs) est déjà vérifié par CoachRoute dans routes/index.jsx
function ClientsPage() {
  const { clients, loading, error, add, remove } = useClients();

  if (loading) {
    return <p>Chargement...</p>;
  }

  let errorMessage = null;
  if (error) {
    errorMessage = <p className="form-error">{error}</p>;
  }

  let clientsList = null;
  if (clients.length === 0) {
    clientsList = <p>Tu n'as pas encore de client.</p>;
  } else {
    clientsList = (
      <ul className="client-list">
        {clients.map((coachClient) => (
          <li key={coachClient.id}>
            <ClientCard coachClient={coachClient} onRemove={remove} />
          </li>
        ))}
      </ul>
    );
  }

  const existingClientIds = clients.map((coachClient) => coachClient.client.id);

  return (
    <div>
      <PageMeta title="Mes clients" />
      <h1>Mes clients</h1>
      <p className="page-subtitle">Développe ta communauté en invitant de nouveaux athlètes.</p>
      {errorMessage}
      {clientsList}

      <ClientSearch existingClientIds={existingClientIds} onAdd={add} />
      <ClientHistory />
    </div>
  );
}

export default ClientsPage;
