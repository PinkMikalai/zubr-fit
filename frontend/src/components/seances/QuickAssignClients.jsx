import { useState } from 'react';
import coachClientService from '../../services/coachClientService';

// Widget d'assignation rapide pour la page "Voir" (lecture seule) : un clic sur "Assigner"
// affiche la liste des clients pas encore assignés, un clic sur un nom l'assigne directement.
// Pas de formulaire à remplir : c'est pensé pour aller vite. Pour retirer un client
// ou pour une gestion plus complète, c'est la page "Modifier" qu'il faut utiliser.
function QuickAssignClients({ assignees, onAssign }) {
  const [isOpen, setIsOpen] = useState(false);
  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [assigningId, setAssigningId] = useState(null);

  const handleOpen = () => {
    setIsOpen(true);
    setLoadingClients(true);
    coachClientService
      .list()
      .then(setClients)
      .finally(() => setLoadingClients(false));
  };

  const handleAssign = async (clientId) => {
    setAssigningId(clientId);
    try {
      await onAssign(clientId);
    } finally {
      setAssigningId(null);
    }
  };

  // On ne propose que les clients pas encore assignés à cette séance
  const assignedIds = assignees.map((client) => client.id);
  const availableClients = clients.filter((coachClient) => !assignedIds.includes(coachClient.client.id));

  let panel = null;
  if (isOpen) {
    let panelContent;
    if (loadingClients) {
      panelContent = <p className="hint">Chargement des clients...</p>;
    } else if (availableClients.length === 0) {
      panelContent = <p className="hint">Tous tes clients sont déjà assignés.</p>;
    } else {
      panelContent = (
        <ul className="quick-assign-list">
          {availableClients.map((coachClient) => {
            let buttonText = `${coachClient.client.firstname} ${coachClient.client.lastname}`;
            if (assigningId === coachClient.client.id) {
              buttonText = 'Assignation...';
            }

            return (
              <li key={coachClient.client.id}>
                <button
                  type="button"
                  onClick={() => handleAssign(coachClient.client.id)}
                  disabled={assigningId !== null}
                >
                  {buttonText}
                </button>
              </li>
            );
          })}
        </ul>
      );
    }

    panel = <div className="quick-assign-panel">{panelContent}</div>;
  }

  let assignButton = null;
  if (!isOpen) {
    assignButton = (
      <button type="button" onClick={handleOpen} className="button-primary">
        Assigner
      </button>
    );
  }

  return (
    <div>
      {assignButton}
      {panel}
    </div>
  );
}

export default QuickAssignClients;
