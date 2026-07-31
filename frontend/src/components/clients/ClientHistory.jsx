import { useState } from 'react';
import coachClientService from '../../services/coachClientService';
import userIcon from '../../assets/icons/user.svg';

const API_URL = import.meta.env.VITE_API_URL;

// Formatte une date "2026-07-20 10:00:00" en "20/07/2026"
function formatDate(sqlDate) {
  if (!sqlDate) {
    return '—';
  }
  const formatter = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  return formatter.format(new Date(sqlDate.replace(' ', 'T')));
}

function ClientHistory() {
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleToggle = () => {
    if (isOpen) {
      setIsOpen(false);
      return;
    }

    setIsOpen(true);

    if (!loaded) {
      setLoading(true);
      coachClientService
        .history()
        .then((data) => {
          setHistory(data.filter((coachClient) => !coachClient.isActive));
          setLoaded(true);
        })
        .finally(() => setLoading(false));
    }
  };

  let toggleText = "Voir l'historique";
  if (isOpen) {
    toggleText = "Masquer l'historique";
  }

  let content = null;
  if (isOpen) {
    if (loading) {
      content = <p>Chargement...</p>;
    } else if (history.length === 0) {
      content = <p>Aucun ancien client pour l'instant.</p>;
    } else {
      content = (
        <ul className="client-list">
          {history.map((coachClient) => {
            const client = coachClient.client;

            let avatarSrc = userIcon;
            if (client.avatarUrl) {
              avatarSrc = `${API_URL}${client.avatarUrl}`;
            }

            return (
              <li key={coachClient.id} className="card client-card">
                <img src={avatarSrc} alt="" className="avatar-circle client-avatar" />
                <div className="client-info">
                  <h3>{client.firstname} {client.lastname}</h3>
                  <p>Du {formatDate(coachClient.startedAt)} au {formatDate(coachClient.endedAt)}</p>
                </div>
              </li>
            );
          })}
        </ul>
      );
    }
  }

  return (
    <div className="client-history">
      <button type="button" onClick={handleToggle} className="button-secondary">
        {toggleText}
      </button>
      {content}
    </div>
  );
}

export default ClientHistory;
