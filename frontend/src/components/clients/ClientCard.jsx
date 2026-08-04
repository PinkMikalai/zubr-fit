import { Link } from 'react-router-dom';
import userIcon from '../../assets/icons/user.svg';

const API_URL = import.meta.env.VITE_API_URL;

function ClientCard({ coachClient, onRemove }) {
  const client = coachClient.client;

  let avatarSrc = userIcon;
  if (client.avatarUrl) {
    avatarSrc = `${API_URL}${client.avatarUrl}`;
  }

  return (
    <div className="client-card card">
      <img src={avatarSrc} alt="" className="avatar-circle client-avatar" />
      <div className="client-info">
        <h3>{client.firstname} {client.lastname}</h3>
        <p>{client.email}</p>
      </div>
      <div className="client-card-actions">
        <Link to={`/clients/${client.id}`} className="button-secondary">Voir profil</Link>
        <button onClick={() => onRemove(coachClient.id)} className="button-danger">Retirer</button>
      </div>
    </div>
  );
}

export default ClientCard;
