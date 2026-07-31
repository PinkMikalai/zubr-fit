import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import userService from '../services/userService';
import userIcon from '../assets/icons/user.svg';
import mailIcon from '../assets/icons/mail.svg';
import phoneIcon from '../assets/icons/phone.svg';

const API_URL = import.meta.env.VITE_API_URL;

function ClientDetailPage() {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    userService
      .getById(id)
      .then(setClient)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <p>Chargement...</p>;
  }

  if (error) {
    return <p className="form-error">{error}</p>;
  }

  if (!client) {
    return null;
  }

  // On prépare l'avatar AVANT le return, avec un if/else classique
  let avatarSrc = userIcon;
  if (client.avatarUrl) {
    avatarSrc = `${API_URL}${client.avatarUrl}`;
  }

  // On prépare le téléphone à afficher AVANT le return, avec un if classique
  let phoneDisplay = client.phoneNumber;
  if (!phoneDisplay) {
    phoneDisplay = 'Non renseigné';
  }

  return (
    <div className="profile-page">
      <Link to="/clients" className="button-secondary client-detail-back">Retour aux clients</Link>

      <div className="card profile-photo-card">
        <img src={avatarSrc} alt="" className="avatar-circle profile-avatar" />
        <h2>{client.firstname} {client.lastname}</h2>
        <p className="profile-role">Client</p>
      </div>

      <div className="card profile-section-card">
        <h3 className="profile-section-title">Coordonnées</h3>

        <div className="profile-detail-row">
          <img src={mailIcon} alt="" />
          <span>{client.email}</span>
        </div>

        <div className="profile-detail-row">
          <img src={phoneIcon} alt="" />
          <span>{phoneDisplay}</span>
        </div>
      </div>
    </div>
  );
}

export default ClientDetailPage;
