import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import coachClientService from '../../services/coachClientService';

function AssignSeanceForm({ onAssign, onUnassign }) {
  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [clientId, setClientId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    coachClientService
      .list()
      .then(setClients)
      .catch((err) => setError(err.message))
      .finally(() => setLoadingClients(false));
  }, []);

  const handleAssign = async () => {
    if (!clientId) {
      setError('Choisis un client');
      return;
    }

    setSubmitting(true);
    setError(null);
    setMessage(null);
    try {
      await onAssign(Number(clientId));
      setMessage('Séance assignée.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnassign = async () => {
    if (!clientId) {
      setError('Choisis un client');
      return;
    }

    setSubmitting(true);
    setError(null);
    setMessage(null);
    try {
      await onUnassign(Number(clientId));
      setMessage('Séance désassignée.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  let errorMessage = null;
  if (error) {
    errorMessage = <p className="form-error">{error}</p>;
  }

  let successMessage = null;
  if (message) {
    successMessage = <p className="form-success">{message}</p>;
  }

  if (loadingClients) {
    return <p className="card assign-seance-form">Chargement des clients...</p>;
  }

  if (clients.length === 0) {
    return (
      <div className="card assign-seance-form">
        <p>
          Tu n'as pas encore de client. <Link to="/clients">En ajouter un</Link>.
        </p>
      </div>
    );
  }

  return (
    <div className="card assign-seance-form">
      <p className="assign-seance-title">Ajouter ou retirer un client</p>

      <div className="assign-seance-field">
        <label htmlFor="clientId">Client</label>
        <select id="clientId" value={clientId} onChange={(e) => setClientId(e.target.value)}>
          <option value="">Choisir un client...</option>
          {clients.map((coachClient) => (
            <option key={coachClient.client.id} value={coachClient.client.id}>
              {coachClient.client.firstname} {coachClient.client.lastname}
            </option>
          ))}
        </select>
      </div>

      {errorMessage}
      {successMessage}

      <div className="assign-buttons">
        <button type="button" onClick={handleAssign} disabled={submitting} className="button-primary">
          Assigner
        </button>
        <button type="button" onClick={handleUnassign} disabled={submitting} className="button-secondary">
          Désassigner
        </button>
      </div>
    </div>
  );
}

export default AssignSeanceForm;
